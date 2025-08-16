import { randomUUID } from "crypto";
import { sqliteTable, integer, text, real, primaryKey } from "drizzle-orm/sqlite-core";

/**
 * Authentication provider types
 */
export enum AuthProvider {
	Google = "google",
}

/**
 * User roles for access control
 */
export enum UserRole {
	User = "user",
	Moderator = "moderator",
	Admin = "admin",
}

/**
 * User authentication and profile data
 */
export const user = sqliteTable("user", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => randomUUID()),
	displayName: text("display_name").notNull(),
	avatarUrl: text("avatar_url"),
	provider: text("provider").$type<AuthProvider>().notNull(),
	providerId: text("provider_id").notNull(),
	role: text("role").$type<UserRole>().notNull().default(UserRole.User),
	bannedUntil: integer("banned_until", { mode: "timestamp" }),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
});

export type NewUser = typeof user.$inferInsert;
export type User = typeof user.$inferSelect;

/**
 * Status of a sloth in the wild
 */
export enum SlothStatus {
	Active = "active",
	Removed = "removed",
}

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
	status: text("status").$type<SlothStatus>().notNull().default(SlothStatus.Active),
	discoveredBy: text("discovered_by")
		.notNull()
		.references(() => user.id),
	discoveredAt: integer("discovered_at", { mode: "timestamp" }).notNull(),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
});

export type NewSloth = typeof sloth.$inferInsert;
export type Sloth = typeof sloth.$inferSelect;

/**
 * Types of sighting interactions with sloths
 */
export enum SightingType {
	Discovery = "discovery", // First report of a new sloth
	Confirmation = "confirmation", // New photo/sighting of existing sloth
	Removal = "removal", // Photo evidence that sloth is gone
}

/**
 * Individual sighting records - multiple sightings can exist per sloth
 * Each sighting represents one user's interaction with a specific sloth
 */
export const sighting = sqliteTable("sighting", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => randomUUID()),
	slothId: text("sloth_id")
		.notNull()
		.references(() => sloth.id),
	userId: text("user_id")
		.notNull()
		.references(() => user.id),
	sightingType: text("sighting_type").$type<SightingType>().notNull(),
	notes: text("notes"), // Optional description or comments
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
});

export type NewSighting = typeof sighting.$inferInsert;
export type Sighting = typeof sighting.$inferSelect;

/**
 * Photo storage linked to sightings
 * Photos are stored via Cloudflare Images API
 */
export const photo = sqliteTable("photo", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => randomUUID()),
	sightingId: text("sighting_id")
		.notNull()
		.references(() => sighting.id),
	lqip: integer("lqip"), // Optional low-quality image placeholder
	cloudflareImageId: text("cloudflare_image_id").notNull(), // Cloudflare Images ID
	caption: text("caption"),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
});

export type NewPhoto = typeof photo.$inferInsert;
export type Photo = typeof photo.$inferSelect;

/**
 * Simple "spot" interactions - users can mark that they've seen a sloth
 * Separate from sightings to allow quick, lightweight interactions
 * Composite primary key prevents duplicate spots from same user
 */
export const spot = sqliteTable(
	"spot",
	{
		slothId: text("sloth_id")
			.notNull()
			.references(() => sloth.id),
		userId: text("user_id")
			.notNull()
			.references(() => user.id),
		spottedAt: integer("spotted_at", { mode: "timestamp" })
			.notNull()
			.$defaultFn(() => new Date()),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.slothId, table.userId] }),
	}),
);

export type NewSpot = typeof spot.$inferInsert;
export type Spot = typeof spot.$inferSelect;

/**
 * Types of user-submitted content
 */
export enum ContentType {
	Sloth = "sloth",
	Sighting = "sighting",
	Photo = "photo",
}

/**
 * Status of user-submitted content
 */
export enum ContentStatusType {
	Pending = "pending",
	Approved = "approved",
	Hidden = "hidden",
	Removed = "removed",
}

/**
 * User-submitted content status tracking
 */
export const contentStatus = sqliteTable("content_status", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => randomUUID()),
	contentType: text("content_type").$type<ContentType>().notNull(),
	contentId: text("content_id").notNull(),
	status: text("status").$type<ContentStatusType>().notNull().default(ContentStatusType.Approved),
	submittedBy: text("submitted_by")
		.notNull()
		.references(() => user.id),
	reviewedBy: text("reviewed_by").references(() => user.id),
	reviewReason: text("review_reason"),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
});

/**
 * Types of moderation report reasons
 */
export enum ModerationReportReason {
	Spam = "spam",
	Inappropriate = "inappropriate",
	NotSlothRelated = "not_sloth_related",
	Duplicate = "duplicate",
	Privacy = "privacy",
	Other = "other",
}

/**
 * Status of moderation reports
 */
export enum ModerationReportStatus {
	Pending = "pending",
	Reviewed = "reviewed",
	Resolved = "resolved",
	Dismissed = "dismissed",
}

/**
 * Verdict options for moderation reports
 */
export enum ModerationReportVerdict {
	ContentRemoved = "content_removed",
	ContentHidden = "content_hidden",
	UserWarned = "user_warned",
	UserBanned = "user_banned",
	NoAction = "no_action",
}

/**
 * Log of user-submitted content that has been reported for moderation
 */
export const moderationReport = sqliteTable("moderation_report", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => randomUUID()),
	contentType: text("content_type").$type<ContentType>().notNull(),
	contentId: text("content_id").notNull(),
	reportedBy: text("reported_by")
		.notNull()
		.references(() => user.id),
	reason: text("reason").$type<ModerationReportReason>().notNull(),
	details: text("details"),
	status: text("status")
		.$type<ModerationReportStatus>()
		.notNull()
		.default(ModerationReportStatus.Pending),
	verdict: text("verdict").$type<ModerationReportVerdict>().notNull(),
	moderatedBy: text("moderated_by").references(() => user.id),
	moderationNotes: text("moderation_notes"),
	resolvedAt: integer("resolved_at", { mode: "timestamp" }),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
});

/**
 * Types of moderation actions that can be taken by moderators
 */
export enum ModerationActionType {
	AssignRole = "assign_role",
	BanUser = "ban_user",
	UnbanUser = "unban_user",
	RemoveContent = "remove_content",
	RestoreContent = "restore_content",
}

/**
 * Log of moderation actions taken by moderators
 */
export const moderationActionLog = sqliteTable("moderation_action_log", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => randomUUID()),
	actorId: text("actor_id")
		.notNull()
		.references(() => user.id),
	action: text("action").$type<ModerationActionType>().notNull(),
	targetType: text("target_type").$type<ContentType>().notNull(),
	targetId: text("target_id").notNull(),
	reason: text("reason"),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
});
