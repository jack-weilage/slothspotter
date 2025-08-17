import type { Database } from "..";

import * as schema from "../schema";
import { and, eq } from "drizzle-orm";

export async function createUser(
	db: Database,
	user: schema.NewUser,
): Promise<schema.User | undefined> {
	const [result] = await db.insert(schema.user).values(user).returning();

	return result;
}

export async function getUserById(db: Database, id: string): Promise<schema.User | undefined> {
	const [user] = await db.select().from(schema.user).where(eq(schema.user.id, id));

	return user;
}

export async function getUserByProviderAndId(
	db: Database,
	provider: schema.AuthProvider,
	providerId: string,
): Promise<schema.User | undefined> {
	const [user] = await db
		.select()
		.from(schema.user)
		.where(and(eq(schema.user.provider, provider), eq(schema.user.providerId, providerId)));

	return user;
}

export async function updateUser(
	db: Database,
	id: string,
	updates: Partial<Omit<schema.User, "id" | "provider" | "providerId" | "createdAt">>,
): Promise<schema.User | undefined> {
	const [user] = await db
		.update(schema.user)
		.set({ ...updates, updatedAt: new Date() })
		.where(eq(schema.user.id, id))
		.returning();

	return user;
}
