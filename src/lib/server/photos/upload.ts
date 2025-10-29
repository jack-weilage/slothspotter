import { deleteImage, uploadImage } from "$lib/server/cloudflare/images";
import type { Database } from "$lib/server/db";
import * as schema from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export async function uploadPhotosForSighting(
	db: Database,
	photos: File[],
	sightingId: string,
	userId: string,
): Promise<string[]> {
	const uploadedPhotos: string[] = [];
	const photoIds: string[] = [];

	try {
		for (const photo of photos) {
			const photoId = crypto.randomUUID();

			const cloudflareImageId = await uploadImage(photo, photoId, userId);
			uploadedPhotos.push(cloudflareImageId);

			await db.insert(schema.photo).values({
				id: photoId,
				sightingId,
				cloudflareImageId,
			});

			photoIds.push(photoId);
		}

		return photoIds;
	} catch (uploadError) {
		for (const cloudflareImageId of uploadedPhotos) {
			await deleteImage(cloudflareImageId);
			await db.delete(schema.photo).where(eq(schema.photo.cloudflareImageId, cloudflareImageId));
		}

		throw uploadError;
	}
}
