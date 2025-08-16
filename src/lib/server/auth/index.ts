import type { RequestEvent } from "@sveltejs/kit";
import type { Database } from "$lib/server/db";

import { eq } from "drizzle-orm";
import { sha256 } from "@oslojs/crypto/sha2";
import { encodeBase64url, encodeHexLowerCase } from "@oslojs/encoding";
import * as schema from "$lib/server/db/schema";

interface StoredSession {
	userId: string;
	createdAt: Date;
}
interface SessionData extends StoredSession {
	id: string;
}

const DAY_IN_MS = 1000 * 60 * 60 * 24;
export const EXPIRATION_TTL_SECONDS = (DAY_IN_MS * 30) / 1000; // 30 days in seconds
const RENEW_THRESHOLD_MS = DAY_IN_MS * 15; // 15 days in milliseconds

export const sessionCookieName = "auth-session";

export function generateSessionToken() {
	const bytes = crypto.getRandomValues(new Uint8Array(18));
	const token = encodeBase64url(bytes);
	return token;
}

export async function createSession(
	kv: KVNamespace,
	token: string,
	userId: string,
): Promise<SessionData> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: StoredSession = {
		userId,
		createdAt: new Date(),
	};

	await kv.put(`session:${sessionId}`, JSON.stringify(session), {
		expirationTtl: EXPIRATION_TTL_SECONDS,
	});

	return {
		...session,
		id: sessionId,
	};
}

export async function renewSession(
	kv: KVNamespace,
	userId: string,
	sessionId: string,
): Promise<StoredSession> {
	const session: StoredSession = {
		userId,
		createdAt: new Date(),
	};

	await kv.put(`session:${sessionId}`, JSON.stringify(session), {
		expirationTtl: EXPIRATION_TTL_SECONDS,
	});

	return session;
}

export async function retrieveSession(
	kv: KVNamespace,
	sessionId: string,
): Promise<SessionData | null> {
	const sessionDataStr = await kv.get(`session:${sessionId}`);
	if (!sessionDataStr) {
		return null;
	}

	const session: StoredSession = JSON.parse(sessionDataStr);
	session.createdAt = new Date(session.createdAt);

	return {
		...session,
		id: sessionId,
	};
}

export async function validateSessionToken(kv: KVNamespace, db: Database, token: string) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session = await retrieveSession(kv, sessionId);

	if (!session) {
		return { session: null, user: null };
	}

	const shouldRenewSession = Date.now() >= +session.createdAt + RENEW_THRESHOLD_MS;
	if (shouldRenewSession) {
		await renewSession(kv, session.userId, sessionId);
	}

	const user = await db.query.user.findFirst({
		where: eq(schema.user.id, session.userId),
	});

	return { session, user };
}

export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>;

export async function invalidateSession(kv: KVNamespace, sessionId: string) {
	await kv.delete(`session:${sessionId}`);
}

export function setSessionTokenCookie(event: RequestEvent, token: string, session: StoredSession) {
	event.cookies.set(sessionCookieName, token, {
		expires: new Date(+session.createdAt + EXPIRATION_TTL_SECONDS * 1000),
		path: "/",
	});
}

export function deleteSessionTokenCookie(event: RequestEvent) {
	event.cookies.delete(sessionCookieName, {
		path: "/",
	});
}
