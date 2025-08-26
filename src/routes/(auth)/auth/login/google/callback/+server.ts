import { generateSessionToken, createSession, setSessionTokenCookie } from "$lib/server/auth";
import { google } from "$lib/server/auth/oauth";
import { connect } from "$lib/server/db";
import { createUser, getUserByProviderAndId, updateUser } from "$lib/server/db/queries/user";
import { AuthProvider } from "$lib/server/db/schema";
import type { RequestHandler } from "./$types";
import { error, redirect } from "@sveltejs/kit";
import type { OAuth2Tokens } from "arctic";
import { decodeIdToken } from "arctic";

interface GoogleIdTokenClaims {
	iss: string;
	azp: string;
	aud: string;
	sub: string;
	at_hash: string;
	name: string;
	picture: string;
	given_name: string;
	family_name: string;
	iat: number;
	exp: number;
}

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
	} catch {
		// Invalid code or client credentials
		error(400);
	}
	const claims = decodeIdToken(tokens.idToken()) as GoogleIdTokenClaims;

	const googleUserId = claims.sub;
	const displayName = claims.name;
	const avatarUrl = claims.picture;

	const db = connect(event.platform!.env.DB);
	const kv = event.platform!.env.USER_SESSIONS;

	const existingUser = await getUserByProviderAndId(db, AuthProvider.Google, googleUserId);

	if (existingUser) {
		await updateUser(db, existingUser.id, { displayName, avatarUrl });

		const sessionToken = generateSessionToken();
		const session = await createSession(kv, sessionToken, existingUser.id);
		setSessionTokenCookie(event, sessionToken, session);

		redirect(302, "/");
	}

	const user = await createUser(db, {
		displayName,
		provider: AuthProvider.Google,
		providerId: googleUserId,
		avatarUrl,
	});

	if (!user) {
		error(500, "Failed to create user");
	}

	const sessionToken = generateSessionToken();
	const session = await createSession(kv, sessionToken, user.id);
	setSessionTokenCookie(event, sessionToken, session);

	redirect(302, "/");
};
