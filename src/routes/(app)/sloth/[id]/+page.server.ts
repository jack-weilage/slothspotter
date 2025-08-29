import { ContentType, ReportReason, ReportReasonSchema } from "$lib/client/db/schema";
import { ReportContentSchema } from "$lib/components/dialogs/report-content";
import { SubmitSightingSchema } from "$lib/components/dialogs/submit-sighting";
import { deleteImage, uploadImage } from "$lib/server/cloudflare/images";
import { validateTurnstile } from "$lib/server/cloudflare/turnstile";
import { connect } from "$lib/server/db";
import * as schema from "$lib/server/db/schema";
import type { Actions, PageServerLoad } from "./$types";
import { error, fail, redirect } from "@sveltejs/kit";
import { type } from "arktype";
import { randomUUID } from "crypto";
import { and, desc, eq } from "drizzle-orm";
import { setError, superValidate } from "sveltekit-superforms";
import { arktype } from "sveltekit-superforms/adapters";

export const load: PageServerLoad = async ({ params, platform }) => {
	const db = connect(platform!.env.DB);

	const sloth = await db.query.sloth.findFirst({
		where: eq(schema.sloth.id, params.id),
		with: {
			sightings: {
				orderBy: desc(schema.sighting.createdAt),
				columns: {
					id: true,
					createdAt: true,
					slothStatus: true,
					notes: true,
				},
				with: {
					sightedBy: {
						columns: {
							id: true,
							displayName: true,
							avatarUrl: true,
						},
					},
					photos: {
						columns: {
							cloudflareImageId: true,
							caption: true,
							lqip: true,
						},
					},
				},
			},
		},
	});

	if (!sloth || sloth.sightings.length === 0) {
		throw error(404, "Sloth not found");
	}

	return {
		sloth,
		submitSightingForm: await superValidate(arktype(SubmitSightingSchema)),
		reportContentForm: await superValidate(arktype(ReportContentSchema)),
	};
};

const ReportSlothSchema = type({
	"cf-turnstile-response": "string",

	reason: ReportReasonSchema,
	comment: "string?",
}).narrow(({ reason, comment }, ctx) => {
	if (reason === ReportReason.Other && comment === undefined) {
		return ctx.reject("a description of the reasoning behind the report");
	}

	return true;
});

const DeleteSightingSchema = type({
	sightingId: "string.uuid",
});

export const actions: Actions = {
	submitSighting: async ({ request, locals, getClientAddress, platform, params }) => {
		if (!locals.user) {
			return fail(401, { error: "Authentication required" });
		}

		const form = await superValidate(request, arktype(SubmitSightingSchema));
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

		if (!(await db.query.sloth.findFirst({ where: eq(schema.sloth.id, params.id) }))) {
			return fail(404, { error: "Sloth not found" });
		}

		const sightingId = randomUUID();
		await db.insert(schema.sighting).values({
			id: sightingId,
			slothId: params.id,
			slothStatus: form.data.slothStatus,
			userId: locals.user.id,
			notes: form.data.notes,
		});

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
				db.delete(schema.sloth).where(eq(schema.sloth.id, params.id)),
			]);

			return fail(500, {
				error:
					uploadError instanceof Error
						? `Photo upload failed: ${uploadError.message}`
						: "Failed to upload photos. Please try again.",
			});
		}
	},
	deleteSighting: async ({ locals, request, platform }) => {
		if (!locals.user) {
			return fail(403);
		}

		const data = DeleteSightingSchema(Object.fromEntries(await request.formData()));
		if (data instanceof type.errors) {
			return fail(400, {
				error: "Invalid form data",
				details: data.summary,
			});
		}

		const { sightingId } = data;

		const db = connect(platform!.env.DB);

		const sighting = await db.query.sighting.findFirst({
			where: and(eq(schema.sighting.id, sightingId), eq(schema.sighting.userId, locals.user.id)),
		});
		if (!sighting) {
			return fail(404, {
				error: "Sighting not found",
			});
		}

		const sightings = await db.$count(
			schema.sighting,
			eq(schema.sighting.slothId, sighting.slothId),
		);

		// Delete the sloth if this is the last sighting.
		if (sightings <= 1) {
			await db.delete(schema.sloth).where(eq(schema.sloth.id, sighting.slothId));

			redirect(308, "/");
		} else {
			await db.delete(schema.sighting).where(eq(schema.sighting.id, sightingId));
		}
	},
	reportSloth: async ({ locals, request, getClientAddress, platform, params }) => {
		if (!locals.user) {
			return fail(403);
		}

		const parsedData = ReportSlothSchema(Object.fromEntries(await request.formData()));

		if (parsedData instanceof type.errors) {
			return fail(400, {
				error: "Invalid form data",
				details: parsedData.summary,
			});
		}

		const { "cf-turnstile-response": turnstileToken, reason, comment } = parsedData;

		const turnstileResponse = validateTurnstile(turnstileToken, getClientAddress());
		if (!turnstileResponse) {
			return fail(400, {
				error: "Turnstile validation failed",
			});
		}

		const db = connect(platform!.env.DB);

		// TODO: Users can report the same content multiple times.
		await db.insert(schema.moderationReport).values({
			reason,
			comment,
			reportedBy: locals.user.id,
			contentType: ContentType.Sloth,
			contentId: params.id,
		});
	},
};
