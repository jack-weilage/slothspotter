import type { RequestHandler } from "./$types";

import { generateSessionToken, createSession, setSessionTokenCookie } from "$lib/server/auth";
import { createUser, getUserByProviderAndId } from "$lib/server/db";
import { AuthProvider } from "$lib/server/db/schema";
import { google } from "$lib/server/auth/oauth";

import type { OAuth2Tokens } from "arctic";
import { decodeIdToken } from "arctic";
import { error, redirect } from "@sveltejs/kit";
import { randomUUID } from "crypto";

export const GET: RequestHandler = async function (event) {
	const code = event.url.searchParams.get("code");
	const state = event.url.searchParams.get("state");
	const storedState = event.cookies.get("google_oauth_state") ?? null;
	const codeVerifier = event.cookies.get("google_code_verifier") ?? null;
	if (code === null || state === null || storedState === null || codeVerifier === null) {
		error(400);
	}
	if (state !== storedState) {
		error(400);
	}

	let tokens: OAuth2Tokens;
	try {
		tokens = await google.validateAuthorizationCode(code, codeVerifier);
	} catch (e) {
		// Invalid code or client credentials
		error(400);
	}
	const claims = decodeIdToken(tokens.idToken());

	const googleUserId = claims.sub;
	const displayName = claims.name;
	const avatarUrl = claims.picture;

	const existingUser = await getUserByProviderAndId(AuthProvider.Google, googleUserId);

	if (existingUser) {
		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, existingUser.id);
		setSessionTokenCookie(event, sessionToken, session.expiresAt);

		redirect(302, "/");
	}

	// TODO: Replace this with your own DB query.
	const user = await createUser({
		id: randomUUID(),
		displayName,
		provider: AuthProvider.Google,
		providerId: googleUserId,
		avatarUrl,
	});

	if (!user) {
		error(500, "Failed to create user");
	}

	const sessionToken = generateSessionToken();
	const session = await createSession(sessionToken, user.id);
	setSessionTokenCookie(event, sessionToken, session.expiresAt);

	redirect(302, "/");
};
