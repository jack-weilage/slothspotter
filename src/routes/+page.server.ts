import type { PageServerLoad, Actions } from "./$types";
import type { SlothMapData } from "$lib/server/db";

import { getSlothsForMap, connect } from "$lib/server/db";
import * as schema from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { SlothStatus } from "$lib";
import { fail } from "@sveltejs/kit";
import { randomUUID } from "crypto";
import { deleteImage, uploadImage } from "$lib/server/cloudflare-images";

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

export const actions: Actions = {
	reportSloth: async ({ request, locals, platform }) => {
		// Check if user is authenticated
		if (!locals.user) {
			return fail(401, { error: "Authentication required" });
		}

		try {
			const formData = await request.formData();

			// Extract location data
			const longitude = Number(formData.get("longitude"));
			const latitude = Number(formData.get("latitude"));
			const notes = formData.get("notes")?.toString() || "";

			// Validate location
			if (isNaN(longitude) || isNaN(latitude)) {
				return fail(400, { error: "Invalid location coordinates" });
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

			// Extract photos (up to 3)
			const photoFiles: File[] = [];
			for (let i = 0; i < 3; i++) {
				const photoFile = formData.get(`photo_${i}`) as File;
				if (photoFile && photoFile.size > 0) {
					photoFiles.push(photoFile);
				}
			}

			// Validate that at least one photo is provided
			if (photoFiles.length === 0) {
				return fail(400, { error: "At least one photo is required" });
			}

			// Validate photo sizes (5MB max each)
			for (const photo of photoFiles) {
				if (photo.size > 5 * 1024 * 1024) {
					return fail(400, { error: "Each photo must be under 5MB" });
				}
			}

			const slothId = randomUUID();
			const sightingId = randomUUID();

			const db = connect(platform!.env.DB);

			// Create the sloth
			const [newSloth] = await db
				.insert(schema.sloth)
				.values({
					id: slothId,
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
					id: sightingId,
					slothId,
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
				for (const photo of photoFiles) {
					const photoId = randomUUID();

					// Upload to Cloudflare Images
					const cloudflareImageId = await uploadImage(photo, photoId, locals.user.id);
					uploadedPhotos.push(cloudflareImageId);

					await db.insert(schema.photo).values({
						id: photoId,
						sightingId,
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
				await db.delete(schema.sighting).where(eq(schema.sighting.id, sightingId));
				await db.delete(schema.sloth).where(eq(schema.sloth.id, slothId));

				return fail(500, {
					error:
						uploadError instanceof Error
							? `Photo upload failed: ${uploadError.message}`
							: "Failed to upload photos. Please try again.",
				});
			}

			return {
				success: true,
				slothId,
				message: "Sloth reported successfully!",
			};
		} catch (error) {
			console.error("Error reporting sloth:", error);
			return fail(500, { error: "An unexpected error occurred" });
		}
	},
};
