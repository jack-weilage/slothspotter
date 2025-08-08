import type { PageServerLoad, Actions } from "./$types";
import type { SlothMapData } from "$lib/server/db";

import { getSlothsForMap, connect } from "$lib/server/db";
import * as schema from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { SlothStatus } from "$lib";
import { fail } from "@sveltejs/kit";
import { randomUUID } from "crypto";
import { uploadImage } from "$lib/server/cloudflare-images";

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
				for (let i = 0; i < photoFiles.length; i++) {
					const photo = photoFiles[i];
					const photoId = randomUUID();

					console.log(
						`Uploading photo ${i + 1} of ${photoFiles.length}: ${photo.name} (${photo.size} bytes)`,
					);

					// Upload to Cloudflare Images
					const cloudflareImageId = await uploadImage(photo, photoId, locals.user.id);
					uploadedPhotos.push(cloudflareImageId);

					console.log(`Successfully uploaded photo ${i + 1}, Cloudflare ID: ${cloudflareImageId}`);
				}

				// Create photo records in database
				for (let i = 0; i < uploadedPhotos.length; i++) {
					const photoId = randomUUID();
					const cloudflareImageId = uploadedPhotos[i];

					await db.insert(schema.photo).values({
						id: photoId,
						sightingId,
						cloudflareImageId,
						caption: `Photo ${i + 1}`,
					});
				}
			} catch (uploadError) {
				console.error("Photo upload failed:", uploadError);

				// Clean up any successfully uploaded images
				for (const imageId of uploadedPhotos) {
					try {
						// Note: We could implement deleteImage here, but for now just log
						console.log(`Should clean up uploaded image: ${imageId}`);
					} catch (cleanupError) {
						console.error("Failed to clean up uploaded image:", cleanupError);
					}
				}

				// Clean up database records (sloth and sighting)
				try {
					await db.delete(schema.sighting).where(eq(schema.sighting.id, sightingId));
					await db.delete(schema.sloth).where(eq(schema.sloth.id, slothId));
				} catch (cleanupError) {
					console.error("Failed to clean up database records:", cleanupError);
				}

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
