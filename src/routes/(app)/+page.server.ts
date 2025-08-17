import type { PageServerLoad, Actions } from "./$types";

import { connect } from "$lib/server/db";
import * as schema from "$lib/server/db/schema";
import { asc, eq, sql } from "drizzle-orm";
import { fail } from "@sveltejs/kit";
import { randomUUID } from "crypto";
import { type } from "arktype";
import { deleteImage, uploadImage } from "$lib/server/cloudflare/images";
import { validateTurnstile } from "$lib/server/cloudflare/turnstile";
import { SlothStatus } from "$lib/client/db/schema";

export const load: PageServerLoad = async ({ locals, platform }) => {
	const db = connect(platform!.env.DB);

	const sloths = await db.query.sloth.findMany({
		columns: {
			id: true,
			latitude: true,
			longitude: true,
			status: true,
			discoveredAt: true,
		},
		with: {
			discoveredBy: {
				columns: {
					id: true,
					displayName: true,
					avatarUrl: true,
				},
			},
			sightings: {
				limit: 1,
				columns: {},
				where: eq(schema.sighting.sightingType, schema.SightingType.Discovery),
				orderBy: asc(schema.sighting.createdAt),
				with: {
					photos: {
						limit: 1,
						columns: {
							id: true,
							cloudflareImageId: true,
							lqip: true,
						},
					},
				},
			},
		},
		extras: {
			totalSpots:
				sql<number>`(SELECT count(*) FROM "spot" WHERE "spot"."sloth_id" = "sloth"."id")`.as(
					"totalSpots",
				),
		},
		orderBy: asc(schema.sloth.createdAt),
	});

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

		const db = connect(platform!.env.DB);

		const slothId = randomUUID();
		const sightingId = randomUUID();

		await db.batch([
			db.insert(schema.sloth).values({
				id: slothId,
				latitude,
				longitude,
				status: SlothStatus.Active,
				discoveredBy: locals.user.id,
			}),
			db.insert(schema.sighting).values({
				id: sightingId,
				slothId: slothId,
				userId: locals.user.id,
				sightingType: schema.SightingType.Discovery,
				notes,
			}),
		]);

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
					sightingId: sightingId,
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
			await db.batch([
				db.delete(schema.sighting).where(eq(schema.sighting.id, sightingId)),
				db.delete(schema.sloth).where(eq(schema.sloth.id, slothId)),
			]);

			return fail(500, {
				error:
					uploadError instanceof Error
						? `Photo upload failed: ${uploadError.message}`
						: "Failed to upload photos. Please try again.",
			});
		}

		return {
			success: true,
			message: "Sloth reported successfully!",
		};
	},
};
