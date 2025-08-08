import type { Actions } from "./$types";

import { fail } from "@sveltejs/kit";
import { deleteSessionTokenCookie, invalidateSession } from "$lib/server/auth";
import { connect } from "$lib/server/db";

export const actions: Actions = {
	default: async (event) => {
		if (event.locals.session === null) {
			return fail(401);
		}

		const db = connect(event.platform!.env.DB);

		await invalidateSession(db, event.locals.session.id);
		deleteSessionTokenCookie(event);
	},
};
