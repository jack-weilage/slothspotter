import type { RequestHandler } from "./$types";
import { connect } from "$lib/server/db";
import * as schema from "$lib/server/db/schema";
import { ne } from "drizzle-orm";
import { PUBLIC_ORIGIN } from "$env/static/public";

export const GET: RequestHandler = async ({ platform }) => {
	const db = connect(platform!.env.DB);

	// Get all active sloths for dynamic routes
	const sloths = await db
		.select({
			id: schema.sloth.id,
			discoveredAt: schema.sloth.discoveredAt,
		})
		.from(schema.sloth)
		.where(ne(schema.sloth.status, schema.SlothStatus.Removed));

	const staticRoutes = [
		{
			url: `${PUBLIC_ORIGIN}/`,
			lastmod: new Date().toISOString().split("T")[0],
			changefreq: "daily",
			priority: "1.0",
		},
	];

	const dynamicRoutes = sloths.map((sloth) => ({
		url: `${PUBLIC_ORIGIN}/sloth/${sloth.id}`,
		lastmod:
			sloth.discoveredAt?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
		changefreq: "weekly",
		priority: "0.8",
	}));

	const allRoutes = [...staticRoutes, ...dynamicRoutes];

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
	.map(
		(route) => `	<url>
		<loc>${route.url}</loc>
		<lastmod>${route.lastmod}</lastmod>
		<changefreq>${route.changefreq}</changefreq>
		<priority>${route.priority}</priority>
	</url>`,
	)
	.join("\n")}
</urlset>`;

	return new Response(sitemap, {
		headers: {
			"Content-Type": "application/xml",
			"Cache-Control": "public, max-age=3600",
		},
	});
};
