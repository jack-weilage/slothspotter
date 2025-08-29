import {
	ContentType,
	ModerationActionTypeSchema,
	ModerationReportStatus,
	ReportReason,
	UserRole,
} from "$lib/client/db/schema";
import { connect } from "$lib/server/db";
import * as schema from "$lib/server/db/schema";
import type { Actions, PageServerLoad } from "./$types";
import { fail, redirect } from "@sveltejs/kit";
import { type } from "arktype";
import { desc, eq, sql } from "drizzle-orm";

export interface BaseParsedContent {
	id: string;
	type: ContentType;

	createdAt: Date;
	updatedAt: Date;
}

export interface ParsedSighting extends BaseParsedContent {
	type: ContentType.Sighting;
	notes: string;
	slothId: string;
	userId: string;
}

export interface ParsedSloth extends BaseParsedContent {
	type: ContentType.Sloth;
	latitude: number;
	longitude: number;
	status: string;
}

export interface ParsedPhoto extends BaseParsedContent {
	type: ContentType.Photo;
	cloudflareImageId: string;
	sightingId: string;
	caption: string | null;
}

export type ParsedContent = ParsedSighting | ParsedSloth | ParsedPhoto;

export interface ParsedReport {
	id: string;
	reason: ReportReason;
	comment: string | null;
	createdAt: Date;
	reportedBy: {
		id: string;
		avatarUrl: string | null;
		displayName: string;
	};
	content: ParsedContent | null;
}

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (!locals.user) {
		throw redirect(302, "/auth/login");
	}

	if (locals.user.role !== UserRole.Moderator && locals.user.role !== UserRole.Admin) {
		throw redirect(302, "/");
	}

	const db = connect(platform!.env.DB);
	const reports = await db.query.moderationReport.findMany({
		columns: {
			id: true,
			contentType: true,
			contentId: true,
			reason: true,
			comment: true,
			createdAt: true,
		},
		with: {
			reportedBy: {
				columns: {
					id: true,
					avatarUrl: true,
					displayName: true,
				},
			},
		},

		extras: {
			content: sql`
				CASE
					WHEN ${schema.moderationReport.contentType} = ${ContentType.Sighting} THEN (
						SELECT json_object(
							'type', ${ContentType.Sighting},
							'id', ${schema.sighting.id},
							'notes', ${schema.sighting.notes},
							'slothId', ${schema.sighting.slothId},
							'userId', ${schema.sighting.userId},
							'createdAt', ${schema.sighting.createdAt},
							'updatedAt', ${schema.sighting.updatedAt}
						)
						FROM ${schema.sighting}
						WHERE ${schema.sighting.id} = ${schema.moderationReport.contentId}
					)
					WHEN ${schema.moderationReport.contentType} = ${ContentType.Sloth} THEN (
						SELECT json_object(
							'type', ${ContentType.Sloth},
							'id', ${schema.sloth.id},
							'latitude', ${schema.sloth.latitude},
							'longitude', ${schema.sloth.longitude},
							'status', ${schema.sloth.status},
							'createdAt', ${schema.sloth.createdAt},
							'updatedAt', ${schema.sloth.updatedAt}
						)
						FROM ${schema.sloth}
						WHERE ${schema.sloth.id} = ${schema.moderationReport.contentId}
					)
					WHEN ${schema.moderationReport.contentType} = ${ContentType.Photo} THEN (
						SELECT json_object(
							'type', ${ContentType.Photo},
							'id', ${schema.photo.id},
							'cloudflareImageId', ${schema.photo.cloudflareImageId},
							'sightingId', ${schema.photo.sightingId},
							'caption', ${schema.photo.caption},
							'createdAt', ${schema.photo.createdAt},
							'updatedAt', ${schema.photo.updatedAt}
						)
						FROM ${schema.photo}
						WHERE ${schema.photo.id} = ${schema.moderationReport.contentId}
					)
					ELSE NULL
				END
			`.as("content"),
		},

		where: eq(schema.moderationReport.status, ModerationReportStatus.Open),
		orderBy: desc(schema.moderationReport.createdAt),
	});

	const parsedReports = reports.map(({ id, reason, comment, createdAt, content, reportedBy }) => ({
		id,
		reason,
		comment,
		createdAt,
		reportedBy,
		content: content ? JSON.parse(content as unknown as string) : null,
	}));

	return {
		user: locals.user,
		reports: parsedReports,
	};
};

const ExecuteActionSchema = type({
	reportId: "string.uuid",
	actionType: ModerationActionTypeSchema,
	comment: "string < 500",
});

const ResolveReportSchema = type({
	reportId: "string.uuid",
});

export const actions: Actions = {
	executeAction: async ({ locals, platform, request }) => {
		if (!locals.user) {
			return fail(401, "Unauthorized");
		}

		if (locals.user.role !== UserRole.Moderator && locals.user.role !== UserRole.Admin) {
			return fail(403, "Forbidden");
		}

		const db = connect(platform!.env.DB);

		const data = ExecuteActionSchema(Object.fromEntries(await request.formData()));
		if (data instanceof type.errors) {
			console.log("form data errors", data.summary);
			return fail(400, {
				error: "Invalid form data",
				details: data.summary,
			});
		}

		const report = await db.query.moderationReport.findFirst({
			where: eq(schema.moderationReport.id, data.reportId),
		});

		if (!report) {
			return fail(400, { reportId: "Report not found" });
		}

		const table = {
			[ContentType.Sighting]: schema.sighting,
			[ContentType.Sloth]: schema.sloth,
			[ContentType.Photo]: schema.photo,
		}[report.contentType];

		await db.batch([
			db.delete(table).where(eq(table.id, report.contentId)),
			// TODO: This will leave hanging images in Cloudflare. We need a task to clean them up.
			db.insert(schema.moderationAction).values({
				reportId: data.reportId,
				actionedBy: locals.user!.id,
				actionType: data.actionType,
				comment: data.comment,
			}),
			db
				.update(schema.moderationReport)
				.set({ status: ModerationReportStatus.Resolved })
				.where(eq(schema.moderationReport.id, report.id)),
		]);
	},
	resolveReport: async ({ locals, platform, request }) => {
		if (!locals.user) {
			return fail(401, "Unauthorized");
		}

		if (locals.user.role !== UserRole.Moderator && locals.user.role !== UserRole.Admin) {
			return fail(403, "Forbidden");
		}

		const db = connect(platform!.env.DB);

		const data = ResolveReportSchema(Object.fromEntries(await request.formData()));
		if (data instanceof type.errors) {
			return fail(400, {
				error: "Invalid form data",
				details: data.summary,
			});
		}

		const report = await db.query.moderationReport.findFirst({
			where: eq(schema.moderationReport.id, data.reportId),
		});

		if (!report) {
			return fail(400, { reportId: "Report not found" });
		}

		await db
			.update(schema.moderationReport)
			.set({ status: ModerationReportStatus.Resolved })
			.where(eq(schema.moderationReport.id, data.reportId));
	},
};
