import { google } from "$lib/server/auth/oauth";
import type { RequestHandler } from "./$types";
import { redirect } from "@sveltejs/kit";
import { generateState, generateCodeVerifier } from "arctic";

export const GET: RequestHandler = async function GET({ cookies }) {
	const state = generateState();
	const codeVerifier = generateCodeVerifier();
	const url = google.createAuthorizationURL(state, codeVerifier, ["openid", "profile"]);

	cookies.set("google_oauth_state", state, {
		path: "/",
		httpOnly: true,
		maxAge: 60 * 10, // 10 minutes
		sameSite: "lax",
	});
	cookies.set("google_code_verifier", codeVerifier, {
		path: "/",
		httpOnly: true,
		maxAge: 60 * 10, // 10 minutes
		sameSite: "lax",
	});

	redirect(302, url);
};
