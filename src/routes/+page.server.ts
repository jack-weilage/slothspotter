import type { PageServerLoad, Actions } from "./$types";
import type { SlothMapData } from "$lib/server/db";

import { getSlothsForMap, connect } from "$lib/server/db";
import * as schema from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { SlothStatus } from "$lib";
import { fail } from "@sveltejs/kit";
import { randomUUID } from "crypto";
import { deleteImage, uploadImage } from "$lib/server/cloudflare-images";
import { type } from "arktype";
import { validateTurnstile } from "$lib/utils/turnstile.server";

export const load: PageServerLoad = async ({ locals, platform }) => {
	const db = connect(platform!.env.DB);
	let sloths: SlothMapData[] = [];

	try {
		sloths = await getSlothsForMap(db);
	} catch (error) {
		console.error("Error loading sloths:", error);
	}

	return {
		sloths,
		user: locals.user,
	};
};

const FormSchema = type({
	longitude: "string.numeric.parse",
	latitude: "string.numeric.parse",
	notes: "string < 500",
	photos: "0 < File[] <= 3",
	"cf-turnstile-response": "string",
}).narrow(({ photos }, ctx) => {
	for (const photo of photos) {
		if (photo.size > 10 * 1024 * 1024) {
			return ctx.reject({
				expected: "less than 10MB",
				actual: `${(photo.size / 1024 / 1024).toFixed(2)}MB`,
				path: ["photos"],
			});
		}

		if (photo.type && !photo.type.startsWith("image/")) {
			return ctx.reject({
				expected: "an image file",
				actual: photo.type,
				path: ["photos"],
			});
		}
	}

	return true;
});

export const actions: Actions = {
	reportSloth: async ({ request, locals, platform }) => {
		// Check if user is authenticated
		if (!locals.user) {
			return fail(401, { error: "Authentication required" });
		}

		const formData = Object.fromEntries(await request.formData());
		// HACK: There's no way for Object.fromEntries to know that photos should be an array if there's only one item.
		if (!Array.isArray(formData.photos)) {
			//@ts-expect-error
			formData.photos = [formData.photos];
		}

		const {
			latitude,
			longitude,
			photos,
			notes,
			"cf-turnstile-response": turnstileResponse,
		} = FormSchema.assert(formData);

		if (
			!(await validateTurnstile(turnstileResponse, request.headers.get("CF-Connecting-IP") || ""))
		) {
			return fail(400, {
				error: "Turnstile validation failed. Please try again.",
			});
		}

		// Check for nearby sloths (within 25 meters) TODO: This should display a new step
		// const nearbySloths = await getSlothsNearLocation(latitude, longitude, 25);
		// if (nearbySloths.length > 0) {
		// 	return fail(400, {
		// 		error:
		// 			"A sloth already exists within 25 meters of this location. Please check existing sloths or move the pin to a different location.",
		// 		nearbySloths,
		// 	});
		// }

		const db = connect(platform!.env.DB);

		// Create the sloth
		const [newSloth] = await db
			.insert(schema.sloth)
			.values({
				latitude,
				longitude,
				status: SlothStatus.Active,
				discoveredBy: locals.user.id,
				discoveredAt: new Date(),
			})
			.returning();

		if (!newSloth) {
			return fail(500, { error: "Failed to create sloth" });
		}

		// Create the discovery sighting
		const [newSighting] = await db
			.insert(schema.sighting)
			.values({
				slothId: newSloth.id,
				userId: locals.user.id,
				sightingType: schema.SightingType.Discovery,
				notes,
			})
			.returning();

		if (!newSighting) {
			return fail(500, { error: "Failed to create sighting" });
		}

		// Upload photos to Cloudflare Images and create photo records
		const uploadedPhotos: string[] = [];

		try {
			for (const photo of photos) {
				const photoId = randomUUID();

				// Upload to Cloudflare Images
				const cloudflareImageId = await uploadImage(photo, photoId, locals.user.id);
				uploadedPhotos.push(cloudflareImageId);

				await db.insert(schema.photo).values({
					id: photoId,
					sightingId: newSighting.id,
					cloudflareImageId,
				});
			}
		} catch (uploadError) {
			// Clean up any successfully uploaded images
			for (const photoId of uploadedPhotos) {
				await deleteImage(photoId);
				await db.delete(schema.photo).where(eq(schema.photo.cloudflareImageId, photoId));
			}

			// Clean up database records (sloth and sighting)
			await db.delete(schema.sighting).where(eq(schema.sighting.id, newSighting.id));
			await db.delete(schema.sloth).where(eq(schema.sloth.id, newSloth.id));

			return fail(500, {
				error:
					uploadError instanceof Error
						? `Photo upload failed: ${uploadError.message}`
						: "Failed to upload photos. Please try again.",
			});
		}

		return {
			success: true,
			slothId: newSloth.id,
			message: "Sloth reported successfully!",
		};
	},
};
