import {
	deleteSessionTokenCookie,
	sessionCookieName,
	setSessionTokenCookie,
	validateSessionToken,
} from "$lib/server/auth";
import { connect } from "$lib/server/db";
import type { Handle } from "@sveltejs/kit";

export const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(sessionCookieName);

	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;

		return resolve(event);
	}

	const db = connect(event.platform!.env.DB);
	const kv = event.platform!.env.USER_SESSIONS;

	const { session, user } = await validateSessionToken(kv, db, sessionToken);

	if (session) {
		setSessionTokenCookie(event, sessionToken, session);
	} else {
		deleteSessionTokenCookie(event);
	}

	event.locals.user = user;
	event.locals.session = session;

	return resolve(event);
};
