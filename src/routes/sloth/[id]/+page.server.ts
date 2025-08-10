import type { PageServerLoad } from "./$types";
import { connect } from "$lib/server/db";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ params, platform }) => {
	const db = connect(platform!.env.DB);

	try {
		const sloth = await db.query.sloth.findFirst({
			where: (table, { eq }) => eq(table.id, params.id),
		});

		if (!sloth) {
			throw error(404, "Sloth not found");
		}

		// TODO: Add additional data like sightings, photos, etc.
		return {
			sloth,
		};
	} catch (err) {
		console.error("Error loading sloth:", err);
		throw error(500, "Failed to load sloth details");
	}
};
