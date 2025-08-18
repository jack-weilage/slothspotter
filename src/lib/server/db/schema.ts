import { SlothStatus } from "../../client/db/schema";
import { randomUUID } from "crypto";
import { relations, sql } from "drizzle-orm";
import { sqliteTable, integer, text, real, primaryKey } from "drizzle-orm/sqlite-core";

/**
 * Authentication provider types
 */
export enum AuthProvider {
	Google = "google",
}

/**
 * User roles within the application
 */
export enum UserRole {
	Admin = "admin", // Full access to all features
	Moderator = "moderator", // Can manage sloths and sightings, but not users
	User = "user",
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
	role: text("role", { enum: Object.values(UserRole) as [string, ...string[]] })
		.notNull()
		.default(UserRole.User),
	provider: text("provider", { enum: Object.values(AuthProvider) as [string, ...string[]] })
		.notNull()
		.$type<AuthProvider>(),
	providerId: text("provider_id").notNull(),
	bannedUntil: integer("banned_until", { mode: "timestamp" }),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
});

export const userRelations = relations(user, ({ many }) => ({
	sightings: many(sighting),
	spots: many(spot),
	discoveredSloths: many(sloth),
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
	status: text("status", { enum: Object.values(SlothStatus) as [string, ...string[]] })
		.notNull()
		.default(SlothStatus.Active),
	discoveredBy: text("discovered_by")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	discoveredAt: integer("discovered_at", { mode: "timestamp" })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
});

export const slothRelations = relations(sloth, ({ one, many }) => ({
	sightings: many(sighting),
	spots: many(spot),
	discoveredBy: one(user, {
		fields: [sloth.discoveredBy],
		references: [user.id],
	}),
}));

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
		.references(() => sloth.id, { onDelete: "cascade" }),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	sightingType: text("sighting_type", {
		enum: Object.values(SightingType) as [string, ...string[]],
	})
		.notNull()
		.$type<SightingType>(),
	notes: text("notes"), // Optional description or comments
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
});

export const sightingRelations = relations(sighting, ({ many, one }) => ({
	photos: many(photo),
	sloth: one(sloth, {
		fields: [sighting.slothId],
		references: [sloth.id],
	}),
	user: one(user, {
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
export const photo = sqliteTable("photo", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => randomUUID()),
	sightingId: text("sighting_id")
		.notNull()
		.references(() => sighting.id, { onDelete: "cascade" }),
	lqip: integer("lqip"), // Optional low-quality image placeholder
	cloudflareImageId: text("cloudflare_image_id").notNull(), // Cloudflare Images ID
	caption: text("caption"),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
});

export const photoRelations = relations(photo, ({ one }) => ({
	sighting: one(sighting, {
		fields: [photo.sightingId],
		references: [sighting.id],
	}),
}));

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
			.references(() => sloth.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		spottedAt: integer("spotted_at", { mode: "timestamp" })
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.slothId, table.userId] }),
	}),
);

export const spotRelations = relations(spot, ({ one }) => ({
	sloth: one(sloth, {
		fields: [spot.slothId],
		references: [sloth.id],
	}),
	user: one(user, {
		fields: [spot.userId],
		references: [user.id],
	}),
}));

export type NewSpot = typeof spot.$inferInsert;
export type Spot = typeof spot.$inferSelect;

export enum ContentType {
	Sloth = "sloth",
	Sighting = "sighting",
	Photo = "photo",
}

export enum ModerationReportStatus {
	Open = "open",
	Resolved = "resolved",
}

export const moderationReport = sqliteTable("moderation_report", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => randomUUID()),
	contentId: text("content_id").notNull(),
	contentType: text("content_type", { enum: Object.values(ContentType) as [string, ...string[]] })
		.notNull()
		.$type<ContentType>(),
	reportedBy: text("reported_by")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	reason: text("reason").notNull(),
	comment: text("comment"),
	status: text("status", { enum: Object.values(ModerationReportStatus) as [string, ...string[]] })
		.notNull()
		.default(ModerationReportStatus.Open),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
});

export const moderationReportRelations = relations(moderationReport, ({ one }) => ({
	// TODO: Polymorphic relations for contentId based on contentType
	reportedBy: one(user, {
		fields: [moderationReport.reportedBy],
		references: [user.id],
	}),
}));

export type NewModerationReport = typeof moderationReport.$inferInsert;
export type ModerationReport = typeof moderationReport.$inferSelect;

export enum ModerationActionType {
	RemoveContent = "remove_content",
	RestoreContent = "restore_content",
	WarnUser = "warn_user",
	BanUser = "ban_user",
	UnbanUser = "unban_user",
	MergeContent = "merge_content",
}

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
	actionType: text("action_type", {
		enum: Object.values(ModerationActionType) as [string, ...string[]],
	})
		.notNull()
		.$type<ModerationActionType>(),
	comment: text("comment"),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
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
