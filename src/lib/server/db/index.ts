import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";
import { env } from "$env/dynamic/private";
import { and, eq, desc, asc, count, sql } from "drizzle-orm";
import { SlothStatus } from "$lib";

if (!env.DATABASE_URL) throw new Error("DATABASE_URL is not set");

const client = createClient({ url: env.DATABASE_URL });

export const db = drizzle(client, { schema });

export async function createUser(user: schema.NewUser): Promise<schema.User | undefined> {
	return (await db.insert(schema.user).values(user).returning()).at(0);
}

export async function getUserByProviderAndId(
	provider: schema.AuthProvider,
	providerId: string,
): Promise<schema.User | undefined> {
	return db.query.user.findFirst({
		where: and(eq(schema.user.provider, provider), eq(schema.user.providerId, providerId)),
	});
}

// =============================================================================
// SLOTH OPERATIONS
// =============================================================================

export async function createSloth(sloth: schema.NewSloth): Promise<schema.Sloth | undefined> {
	return (await db.insert(schema.sloth).values(sloth).returning()).at(0);
}

export async function getSlothById(id: string): Promise<schema.Sloth | undefined> {
	return db.query.sloth.findFirst({
		where: eq(schema.sloth.id, id),
	});
}

export async function updateSlothStatus(
	id: string,
	status: SlothStatus,
): Promise<schema.Sloth | undefined> {
	return (
		await db
			.update(schema.sloth)
			.set({ status, updatedAt: new Date() })
			.where(eq(schema.sloth.id, id))
			.returning()
	).at(0);
}

export async function getAllActiveSloths(): Promise<schema.Sloth[]> {
	return db.query.sloth.findMany({
		where: eq(schema.sloth.status, SlothStatus.Active),
		orderBy: [desc(schema.sloth.createdAt)],
	});
}

export async function getAllSloths(): Promise<schema.Sloth[]> {
	return db.query.sloth.findMany({
		orderBy: [desc(schema.sloth.createdAt)],
	});
}

export async function getSlothsNearLocation(
	latitude: number,
	longitude: number,
	radiusMeters: number = 25,
): Promise<schema.Sloth[]> {
	// Using Haversine formula for distance calculation (SQLite compatible)
	return db.query.sloth.findMany({
		where: sql`(
			6371000 * 2 * asin(sqrt(
				(sin((${latitude} - ${schema.sloth.latitude}) * 0.017453292519943295 / 2) * sin((${latitude} - ${schema.sloth.latitude}) * 0.017453292519943295 / 2)) +
				cos(${latitude} * 0.017453292519943295) * 
				cos(${schema.sloth.latitude} * 0.017453292519943295) * 
				(sin((${longitude} - ${schema.sloth.longitude}) * 0.017453292519943295 / 2) * sin((${longitude} - ${schema.sloth.longitude}) * 0.017453292519943295 / 2))
			))
		) <= ${radiusMeters}`,
	});
}

// =============================================================================
// SIGHTING OPERATIONS
// =============================================================================

export async function createSighting(
	sighting: schema.NewSighting,
): Promise<schema.Sighting | undefined> {
	return (await db.insert(schema.sighting).values(sighting).returning()).at(0);
}

export async function getSightingById(id: string): Promise<schema.Sighting | undefined> {
	return db.query.sighting.findFirst({
		where: eq(schema.sighting.id, id),
	});
}

export async function getSightingsForSloth(slothId: string): Promise<schema.Sighting[]> {
	return db.query.sighting.findMany({
		where: eq(schema.sighting.slothId, slothId),
		orderBy: [desc(schema.sighting.createdAt)],
	});
}

export async function getSightingsByUser(userId: string): Promise<schema.Sighting[]> {
	return db.query.sighting.findMany({
		where: eq(schema.sighting.userId, userId),
		orderBy: [desc(schema.sighting.createdAt)],
	});
}

export async function getDiscoverySighting(slothId: string): Promise<schema.Sighting | undefined> {
	return db.query.sighting.findFirst({
		where: and(
			eq(schema.sighting.slothId, slothId),
			eq(schema.sighting.sightingType, schema.SightingType.Discovery),
		),
	});
}

export async function deleteSighting(id: string): Promise<void> {
	await db.delete(schema.sighting).where(eq(schema.sighting.id, id));
}

// =============================================================================
// PHOTO OPERATIONS
// =============================================================================

export async function createPhoto(photo: schema.NewPhoto): Promise<schema.Photo | undefined> {
	return (await db.insert(schema.photo).values(photo).returning()).at(0);
}

export async function getPhotosForSighting(sightingId: string): Promise<schema.Photo[]> {
	return db.query.photo.findMany({
		where: eq(schema.photo.sightingId, sightingId),
		orderBy: [asc(schema.photo.createdAt)],
	});
}

export async function deletePhoto(id: string): Promise<void> {
	await db.delete(schema.photo).where(eq(schema.photo.id, id));
}

// =============================================================================
// SPOT OPERATIONS
// =============================================================================

export async function createSpot(spot: schema.NewSpot): Promise<schema.Spot | undefined> {
	return (await db.insert(schema.spot).values(spot).returning().onConflictDoNothing()).at(0);
}

export async function removeSpot(slothId: string, userId: string): Promise<void> {
	await db
		.delete(schema.spot)
		.where(and(eq(schema.spot.slothId, slothId), eq(schema.spot.userId, userId)));
}

export async function getSpotCountForSloth(slothId: string): Promise<number> {
	const result = await db
		.select({ count: count() })
		.from(schema.spot)
		.where(eq(schema.spot.slothId, slothId));
	return result[0]?.count ?? 0;
}

export async function hasUserSpottedSloth(slothId: string, userId: string): Promise<boolean> {
	const spot = await db.query.spot.findFirst({
		where: and(eq(schema.spot.slothId, slothId), eq(schema.spot.userId, userId)),
	});
	return !!spot;
}

export async function getSpotsForUser(userId: string): Promise<schema.Spot[]> {
	return db.query.spot.findMany({
		where: eq(schema.spot.userId, userId),
		orderBy: [desc(schema.spot.spottedAt)],
	});
}

// =============================================================================
// MODERATION FLAG OPERATIONS
// =============================================================================

export async function createModerationFlag(
	flag: schema.NewModerationFlag,
): Promise<schema.ModerationFlag | undefined> {
	return (await db.insert(schema.moderationFlag).values(flag).returning()).at(0);
}

export async function getUnresolvedFlags(): Promise<schema.ModerationFlag[]> {
	return db.query.moderationFlag.findMany({
		where: eq(schema.moderationFlag.resolved, false),
		orderBy: [desc(schema.moderationFlag.createdAt)],
	});
}

export async function resolveModerationFlag(
	id: string,
	resolvedBy: string,
): Promise<schema.ModerationFlag | undefined> {
	return (
		await db
			.update(schema.moderationFlag)
			.set({
				resolved: true,
				resolvedBy,
				resolvedAt: new Date(),
			})
			.where(eq(schema.moderationFlag.id, id))
			.returning()
	).at(0);
}

// =============================================================================
// COMPLEX QUERIES FOR WEBSITE FEATURES
// =============================================================================

export type SlothWithDetails = schema.Sloth & {
	discoveredByUser: schema.User;
	totalSpots: number;
	recentSightings: (schema.Sighting & { user: schema.User })[];
	recentPhotos: schema.Photo[];
};

export async function getSlothWithDetails(slothId: string): Promise<SlothWithDetails | undefined> {
	const sloth = await db.query.sloth.findFirst({
		where: eq(schema.sloth.id, slothId),
		with: {
			discoveredBy: true,
		},
	});

	if (!sloth) return undefined;

	const [totalSpots, recentSightings, recentPhotos] = await Promise.all([
		getSpotCountForSloth(slothId),
		db.query.sighting.findMany({
			where: eq(schema.sighting.slothId, slothId),
			orderBy: [desc(schema.sighting.createdAt)],
			limit: 10,
			with: {
				user: true,
			},
		}),
		db.query.photo.findMany({
			where: eq(
				schema.photo.sightingId,
				sql`(
				SELECT id FROM sighting 
				WHERE sloth_id = ${slothId} 
				ORDER BY created_at DESC 
				LIMIT 5
			)`,
			),
			orderBy: [desc(schema.photo.createdAt)],
			limit: 10,
		}),
	]);

	return {
		...sloth,
		discoveredByUser: sloth.discoveredBy,
		totalSpots,
		recentSightings,
		recentPhotos,
	};
}

export type SlothMapData = {
	id: string;
	latitude: number;
	longitude: number;
	status: SlothStatus;
	totalSpots: number;
	discoveredAt: Date;
	lastSightingAt: Date | null;
};

export async function getSlothsForMap(): Promise<SlothMapData[]> {
	const sloths = await db.query.sloth.findMany({
		orderBy: [desc(schema.sloth.createdAt)],
	});

	const slothsWithSpots = await Promise.all(
		sloths.map(async (sloth) => {
			const [totalSpots, lastSighting] = await Promise.all([
				getSpotCountForSloth(sloth.id),
				db.query.sighting.findFirst({
					where: eq(schema.sighting.slothId, sloth.id),
					orderBy: [desc(schema.sighting.createdAt)],
				}),
			]);

			return {
				id: sloth.id,
				latitude: sloth.latitude,
				longitude: sloth.longitude,
				status: sloth.status,
				totalSpots,
				discoveredAt: sloth.discoveredAt,
				lastSightingAt: lastSighting?.createdAt || null,
			};
		}),
	);

	return slothsWithSpots;
}

export type UserStats = {
	totalSightings: number;
	totalSpots: number;
	slothsDiscovered: number;
	favoriteSlothId?: string;
};

export async function getUserStats(userId: string): Promise<UserStats> {
	const [sightings, spots, discoveries] = await Promise.all([
		db.select({ count: count() }).from(schema.sighting).where(eq(schema.sighting.userId, userId)),
		db.select({ count: count() }).from(schema.spot).where(eq(schema.spot.userId, userId)),
		db.select({ count: count() }).from(schema.sloth).where(eq(schema.sloth.discoveredBy, userId)),
	]);

	// Find user's most spotted sloth (favorite)
	const favoriteSloth = await db
		.select({ slothId: schema.spot.slothId, count: count() })
		.from(schema.spot)
		.where(eq(schema.spot.userId, userId))
		.groupBy(schema.spot.slothId)
		.orderBy(desc(count()))
		.limit(1);

	return {
		totalSightings: sightings[0]?.count ?? 0,
		totalSpots: spots[0]?.count ?? 0,
		slothsDiscovered: discoveries[0]?.count ?? 0,
		favoriteSlothId: favoriteSloth[0]?.slothId,
	};
}

export async function getRecentActivity(limit: number = 10): Promise<
	Array<{
		type: "discovery" | "sighting" | "spot";
		slothId: string;
		userId: string;
		userName: string;
		userAvatar?: string;
		createdAt: Date;
		details?: string;
	}>
> {
	const [recentSightings, recentSpots] = await Promise.all([
		db.query.sighting.findMany({
			orderBy: [desc(schema.sighting.createdAt)],
			limit: limit * 2,
			with: {
				user: true,
			},
		}),
		db.query.spot.findMany({
			orderBy: [desc(schema.spot.spottedAt)],
			limit: limit * 2,
			with: {
				user: true,
			},
		}),
	]);

	const activities = [
		...recentSightings.map((sighting) => ({
			type:
				sighting.sightingType === schema.SightingType.Discovery
					? "discovery"
					: ("sighting" as const),
			slothId: sighting.slothId,
			userId: sighting.userId,
			userName: sighting.user.displayName,
			userAvatar: sighting.user.avatarUrl,
			createdAt: sighting.createdAt,
			details: sighting.notes,
		})),
		...recentSpots.map((spot) => ({
			type: "spot" as const,
			slothId: spot.slothId,
			userId: spot.userId,
			userName: spot.user.displayName,
			userAvatar: spot.user.avatarUrl,
			createdAt: spot.spottedAt,
		})),
	];

	return activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, limit);
}
