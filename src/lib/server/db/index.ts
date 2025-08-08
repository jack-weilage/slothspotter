import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";
import { env } from "$env/dynamic/private";
import { and, eq } from "drizzle-orm";

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
