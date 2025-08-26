import { deleteSessionTokenCookie, invalidateSession } from "$lib/server/auth";
import type { Actions } from "./$types";
import { fail } from "@sveltejs/kit";

export const actions: Actions = {
	default: async (event) => {
		if (event.locals.session === null) {
			return fail(401);
		}

		const kv = event.platform!.env.USER_SESSIONS;

		await invalidateSession(kv, event.locals.session.id);
		deleteSessionTokenCookie(event);
	},
};
