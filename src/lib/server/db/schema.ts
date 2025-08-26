import {
	SlothStatus,
	ContentType,
	ReportReason,
	UserRole,
	ModerationReportStatus,
} from "../../client/db/schema";
import { randomUUID } from "crypto";
import { relations } from "drizzle-orm";
import { sqliteTable, integer, text, real, uniqueIndex, index } from "drizzle-orm/sqlite-core";

const createdAt = integer("created_at", { mode: "timestamp" })
	.notNull()
	.$defaultFn(() => new Date());

const updatedAt = integer("updated_at", { mode: "timestamp" })
	.notNull()
	.$onUpdateFn(() => new Date());

/**
 * Authentication provider types
 */
export enum AuthProvider {
	Google = "google",
}

/**
 * User authentication and profile data
 */
export const user = sqliteTable(
	"user",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => randomUUID()),
		displayName: text("display_name").notNull(),
		avatarUrl: text("avatar_url"),
		role: text("role").notNull().$type<UserRole>().default(UserRole.User),
		provider: text("provider").notNull().$type<AuthProvider>(),
		providerId: text("provider_id").notNull(),
		bannedUntil: integer("banned_until", { mode: "timestamp" }),
		createdAt,
		updatedAt,
	},
	(t) => [
		// Optimizes login lookups
		uniqueIndex("user_provider_provider_id_idx").on(t.provider, t.providerId),
	],
);

export const userRelations = relations(user, ({ many }) => ({
	sightings: many(sighting),
	reportsSubmitted: many(moderationReport, { relationName: "reportedBy" }),
	reportsAssigned: many(moderationReport, { relationName: "assignedTo" }),
}));

export type NewUser = typeof user.$inferInsert;
export type User = typeof user.$inferSelect;

/**
 * Core sloth entity - represents each unique physical stuffed sloth in Bellingham
 * Each sloth gets exactly ONE record, with multiple sightings linked to it
 */
export const sloth = sqliteTable("sloth", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => randomUUID()),
	latitude: real("latitude").notNull(),
	longitude: real("longitude").notNull(),
	status: text("status").notNull().$type<SlothStatus>().default(SlothStatus.Active),
	createdAt,
	updatedAt,
});

export const slothRelations = relations(sloth, ({ many }) => ({
	sightings: many(sighting),
}));

export type NewSloth = typeof sloth.$inferInsert;
export type Sloth = typeof sloth.$inferSelect;

/**
 * Individual sighting records - multiple sightings can exist per sloth
 * Each sighting represents one user's interaction with a specific sloth
 */
export const sighting = sqliteTable(
	"sighting",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => randomUUID()),
		slothId: text("sloth_id")
			.notNull()
			.references(() => sloth.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		slothStatus: text("sloth_status").notNull().$type<SlothStatus>(),
		notes: text("notes"), // Optional description or comments
		createdAt,
		updatedAt,
	},
	(t) => [
		// Optimizes finding sightings on sloth details
		index("sighting_sloth_id_idx").on(t.slothId),
		// Optimizes finding sightings on user profile
		index("sighting_user_id_idx").on(t.userId),
	],
);

export const sightingRelations = relations(sighting, ({ many, one }) => ({
	photos: many(photo),
	sloth: one(sloth, {
		fields: [sighting.slothId],
		references: [sloth.id],
	}),
	sightedBy: one(user, {
		fields: [sighting.userId],
		references: [user.id],
	}),
}));

export type NewSighting = typeof sighting.$inferInsert;
export type Sighting = typeof sighting.$inferSelect;

/**
 * Photo storage linked to sightings
 * Photos are stored via Cloudflare Images API
 */
export const photo = sqliteTable(
	"photo",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => randomUUID()),
		sightingId: text("sighting_id")
			.notNull()
			.references(() => sighting.id, { onDelete: "cascade" }),
		lqip: integer("lqip"), // Optional low-quality image placeholder
		cloudflareImageId: text("cloudflare_image_id").unique().notNull(), // Cloudflare Images ID
		caption: text("caption"),
		createdAt,
		updatedAt,
	},
	(t) => [
		// Optimizes finding photos from a sighting
		index("photo_sighting_id_idx").on(t.sightingId),
	],
);

export const photoRelations = relations(photo, ({ one }) => ({
	sighting: one(sighting, {
		fields: [photo.sightingId],
		references: [sighting.id],
	}),
}));

export type NewPhoto = typeof photo.$inferInsert;
export type Photo = typeof photo.$inferSelect;

export const moderationReport = sqliteTable(
	"moderation_report",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => randomUUID()),
		contentId: text("content_id").notNull(),
		contentType: text("content_type").notNull().$type<ContentType>(),
		reportedBy: text("reported_by")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		reason: text("reason").notNull().$type<ReportReason>(),
		comment: text("comment"),
		status: text("status")
			.notNull()
			.$type<ModerationReportStatus>()
			.default(ModerationReportStatus.Open),
		createdAt,
		updatedAt,
	},
	(t) => [
		// Optimizes finding reports by status
		index("moderation_report_status_idx").on(t.status),
	],
);

export const moderationReportRelations = relations(moderationReport, ({ one }) => ({
	// TODO: Polymorphic relations for contentId based on contentType
	reportedBy: one(user, {
		fields: [moderationReport.reportedBy],
		references: [user.id],
	}),
}));

export type NewModerationReport = typeof moderationReport.$inferInsert;
export type ModerationReport = typeof moderationReport.$inferSelect;

export const moderationAction = sqliteTable("moderation_action", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => randomUUID()),
	reportId: text("report_id")
		.notNull()
		.references(() => moderationReport.id, { onDelete: "cascade" }),
	actionedBy: text("actioned_by")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	actionType: text("action_type").notNull().$type<ModerationActionType>(),
	comment: text("note").notNull(),
	createdAt,
});

export const moderationActionRelations = relations(moderationAction, ({ one }) => ({
	report: one(moderationReport, {
		fields: [moderationAction.reportId],
		references: [moderationReport.id],
	}),
	actionedBy: one(user, {
		fields: [moderationAction.actionedBy],
		references: [user.id],
	}),
}));

export type NewModerationAction = typeof moderationAction.$inferInsert;
export type ModerationAction = typeof moderationAction.$inferSelect;
