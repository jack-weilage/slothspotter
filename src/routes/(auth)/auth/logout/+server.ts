import { deleteSessionTokenCookie, invalidateSession } from "$lib/server/auth";
import type { RequestHandler } from "./$types";
import { redirect } from "@sveltejs/kit";

export const GET: RequestHandler = async (event) => {
	const { locals, platform } = event;

	if (locals.session === null) {
		redirect(301, "/");
	}

	const kv = platform!.env.USER_SESSIONS;

	await invalidateSession(kv, locals.session.id);
	deleteSessionTokenCookie(event);

	redirect(301, "/");
};
