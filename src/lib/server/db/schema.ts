import type { AnySQLiteColumn } from "drizzle-orm/sqlite-core";
import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";

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
export enum AuthProvider {
	Google = "google",
}
export type NewUser = typeof user.$inferInsert;
export type User = typeof user.$inferSelect;

export const session = sqliteTable("session", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id),
	expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});
export type Session = typeof session.$inferSelect;

export const sighting = sqliteTable("sighting", {
	id: text("id").primaryKey(), // UUID
	reporter: text("reporter_id")
		.notNull()
		.references(() => user.id),
	description: text("description").notNull(),
	latitude: real("latitude").notNull(),
	longitude: real("longitude").notNull(),
	discoveredAt: integer("discovered_at", { mode: "timestamp" }).notNull(),
	originalSightingId: text("original_sighting_id").references((): AnySQLiteColumn => sighting.id),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
});
export type Sighting = typeof session.$inferSelect;

export const sightingImage = sqliteTable("sighting_image", {
	id: text("id").primaryKey(), // UUID
	sightingId: text("sighting_id")
		.notNull()
		.references(() => sighting.id),
	photoId: text("photo_id").notNull(), // Cloudflare Images ID
	isPrimary: integer("is_primary", { mode: "boolean" }).notNull().default(false),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
});
export type SightingImage = typeof session.$inferSelect;
