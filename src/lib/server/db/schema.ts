import { sqliteTable, integer, text, real, primaryKey } from "drizzle-orm/sqlite-core";

/**
 * Authentication provider types
 */
export enum AuthProvider {
	Google = "google",
}

/**
 * User authentication and profile data
 */
export const user = sqliteTable("user", {
	id: text("id").primaryKey(), // UUID
	displayName: text("display_name").notNull(),
	avatarUrl: text("avatar_url"),
	provider: text("provider").$type<AuthProvider>().notNull(),
	providerId: text("provider_id").notNull(),
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
	id: text("id").primaryKey(), // UUID
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
	id: text("id").primaryKey(), // UUID
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
	id: text("id").primaryKey(), // UUID
	sightingId: text("sighting_id")
		.notNull()
		.references(() => sighting.id),
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
 * Content types that can be flagged for moderation
 */
export enum ContentType {
	Sloth = "sloth",
	Sighting = "sighting",
	Photo = "photo",
}

/**
 * Reasons for flagging content
 */
export enum FlagReason {
	Inappropriate = "inappropriate",
	NotASloth = "not_a_sloth",
	Duplicate = "duplicate",
	PrivacyConcern = "privacy_concern",
}

/**
 * Community-driven content moderation system
 * Allows users to flag inappropriate or problematic content
 */
export const moderationFlag = sqliteTable("moderation_flag", {
	id: text("id").primaryKey(), // UUID
	contentType: text("content_type").$type<ContentType>().notNull(),
	contentId: text("content_id").notNull(), // ID of the flagged content
	flaggedByUserId: text("flagged_by_user_id")
		.notNull()
		.references(() => user.id),
	reason: text("reason").$type<FlagReason>().notNull(),
	notes: text("notes"), // Optional additional details
	resolved: integer("resolved", { mode: "boolean" }).notNull().default(false),
	resolvedBy: text("resolved_by").references(() => user.id),
	resolvedAt: integer("resolved_at", { mode: "timestamp" }),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
});

export type NewModerationFlag = typeof moderationFlag.$inferInsert;
export type ModerationFlag = typeof moderationFlag.$inferSelect;
