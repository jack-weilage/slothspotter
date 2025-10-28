import { dev } from "$app/environment";
import { google } from "$lib/server/auth/oauth";
import type { RequestHandler } from "./$types";
import { redirect } from "@sveltejs/kit";
import { generateState, generateCodeVerifier } from "arctic";

export const GET: RequestHandler = async ({ url, cookies }) => {
	const state = generateState();
	const codeVerifier = generateCodeVerifier();
	const authUrl = google.createAuthorizationURL(state, codeVerifier, ["openid", "profile"]);

	cookies.set("google_oauth_state", state, {
		path: "/",
		httpOnly: true,
		maxAge: 60 * 10, // 10 minutes
		sameSite: "lax",
		secure: !dev || url.protocol === "https",
	});
	cookies.set("google_code_verifier", codeVerifier, {
		path: "/",
		httpOnly: true,
		maxAge: 60 * 10, // 10 minutes
		sameSite: "lax",
		secure: !dev || url.protocol === "https",
	});

	redirect(302, authUrl);
};
