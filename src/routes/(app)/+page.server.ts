import { ContentType, SlothStatus } from "$lib/client/db/schema";
import { ReportContentSchema } from "$lib/components/dialogs/report-content";
import { SubmitSlothSchema } from "$lib/components/dialogs/submit-sloth";
import { deleteImage, uploadImage } from "$lib/server/cloudflare/images";
import { validateTurnstile } from "$lib/server/cloudflare/turnstile";
import { connect } from "$lib/server/db";
import * as schema from "$lib/server/db/schema";
import type { PageServerLoad, Actions } from "./$types";
import { fail } from "@sveltejs/kit";
import { randomUUID } from "crypto";
import { asc, eq, sql } from "drizzle-orm";
import { setError, superValidate } from "sveltekit-superforms";
import { arktype } from "sveltekit-superforms/adapters";

export const load: PageServerLoad = async ({ locals, platform }) => {
	const db = connect(platform!.env.DB);

	const sloths = await db.query.sloth.findMany({
		columns: {
			id: true,
			latitude: true,
			longitude: true,
			status: true,
		},
		with: {
			sightings: {
				limit: 1,
				columns: {},
				orderBy: asc(schema.sighting.createdAt),
				with: {
					photos: {
						limit: 1,
						columns: {
							id: true,
							cloudflareImageId: true,
							lqip: true,
						},
						orderBy: asc(schema.photo.createdAt),
					},
				},
			},
		},
		extras: {
			uniqueSightings: sql<number>`(
				SELECT count(DISTINCT ${schema.sighting.userId}) 
				FROM ${schema.sighting} WHERE ${schema.sighting.slothId} = ${schema.sloth.id}
			)`.as("unique_sightings"),
		},
		orderBy: asc(schema.sloth.createdAt),
	});

	return {
		sloths,
		user: locals.user,
		submitSlothForm: await superValidate(arktype(SubmitSlothSchema)),
	};
};

export const actions: Actions = {
	submitSloth: async ({ request, locals, getClientAddress, platform }) => {
		// Check if user is authenticated
		if (!locals.user) {
			return fail(401, { error: "Authentication required" });
		}

		const form = await superValidate(request, arktype(SubmitSlothSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		if (!(await validateTurnstile(form.data["cf-turnstile-response"], getClientAddress()))) {
			return setError(
				form,
				"cf-turnstile-response",
				"Turnstile validation failed. Please try again.",
			);
		}

		const db = connect(platform!.env.DB);

		const slothId = randomUUID();
		const sightingId = randomUUID();

		await db.batch([
			db.insert(schema.sloth).values({
				id: slothId,
				latitude: form.data.latitude,
				longitude: form.data.longitude,
				status: SlothStatus.Active,
			}),
			db.insert(schema.sighting).values({
				id: sightingId,
				slothId: slothId,
				slothStatus: SlothStatus.Active,
				userId: locals.user.id,
				notes: form.data.notes,
			}),
		]);

		// Upload photos to Cloudflare Images and create photo records
		const uploadedPhotos: string[] = [];

		try {
			for (const photo of form.data.photos) {
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
	},
	reportContent: async ({ request, locals, getClientAddress, platform }) => {
		if (!locals.user) {
			return fail(401, { error: "Authentication required" });
		}

		const form = await superValidate(request, arktype(ReportContentSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		if (!(await validateTurnstile(form.data["cf-turnstile-response"], getClientAddress()))) {
			return setError(
				form,
				"cf-turnstile-response",
				"Turnstile validation failed. Please try again.",
			);
		}

		const db = connect(platform!.env.DB);

		const table = {
			[ContentType.Sloth]: schema.sloth,
			[ContentType.Sighting]: schema.sighting,
			[ContentType.Photo]: schema.photo,
		}[form.data.contentType];

		const [content] = await db
			.select()
			.from(table)
			.where(eq(table.id, form.data.contentId))
			.limit(1);

		if (!content) {
			return setError(form, "contentId", "Content not found");
		}

		await db.insert(schema.moderationReport).values({
			reportedBy: locals.user.id,

			contentId: form.data.contentId,
			contentType: form.data.contentType,

			reason: form.data.reason,
			comment: form.data.comment,
		});
	},
};
