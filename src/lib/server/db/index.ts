import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";
import { and, eq, desc, asc, exists, sql } from "drizzle-orm";
import { SlothStatus } from "$lib";
import { SightingType } from "./schema";

export const connect = (db: D1Database) => drizzle(db, { schema });
export type Database = ReturnType<typeof connect>;

export async function createUser(
	db: Database,
	user: schema.NewUser,
): Promise<schema.User | undefined> {
	return (await db.insert(schema.user).values(user).returning()).at(0);
}

export async function getUserByProviderAndId(
	db: Database,
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

export async function getSlothsNearLocation(
	db: Database,
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
// SPOT OPERATIONS
// =============================================================================

export async function getSpotCountForSloth(db: Database, slothId: string): Promise<number> {
	return await db.$count(schema.spot, eq(schema.spot.slothId, slothId));
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

export async function getSlothWithDetails(
	db: Database,
	slothId: string,
): Promise<SlothWithDetails | undefined> {
	const sloth = await db.query.sloth.findFirst({
		where: eq(schema.sloth.id, slothId),
		with: {
			discoveredBy: true,
		},
	});

	if (!sloth) return undefined;

	const [totalSpots, recentSightings, recentPhotos] = await Promise.all([
		getSpotCountForSloth(db, slothId),
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
	discoverer: {
		displayName: string;
		avatarUrl: string | null;
	} | null;
	primaryPhoto?: {
		url: string;
		lqip: number | null;
	};
};

export async function getSlothsForMap(db: Database): Promise<SlothMapData[]> {
	const sloths = await db.query.sloth.findMany({
		orderBy: [desc(schema.sloth.createdAt)],
	});

	const slothsWithSpots = await Promise.all(
		sloths.map(async (sloth) => {
			const [totalSpots, lastSighting, discoverer, primaryPhoto] = await Promise.all([
				getSpotCountForSloth(db, sloth.id),
				db.query.sighting.findFirst({
					where: eq(schema.sighting.slothId, sloth.id),
					orderBy: [desc(schema.sighting.createdAt)],
				}),
				// Get discoverer info
				db.query.user.findFirst({
					where: eq(schema.user.id, sloth.discoveredBy),
					columns: {
						displayName: true,
						avatarUrl: true,
					},
				}),
				// Get the first photo from the discovery sighting
				db.query.photo.findFirst({
					where: exists(
						db
							.select()
							.from(schema.sighting)
							.where(
								and(
									eq(schema.sighting.slothId, sloth.id),
									eq(schema.sighting.sightingType, SightingType.Discovery),
									eq(schema.sighting.id, schema.photo.sightingId),
								),
							),
					),
					orderBy: [asc(schema.photo.createdAt)],
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
				discoverer: discoverer
					? {
							displayName: discoverer.displayName,
							avatarUrl: discoverer.avatarUrl,
						}
					: null,
				primaryPhoto: primaryPhoto
					? {
							url: primaryPhoto.cloudflareImageId,
							lqip: primaryPhoto.lqip,
						}
					: undefined,
			};
		}),
	);

	return slothsWithSpots;
}
