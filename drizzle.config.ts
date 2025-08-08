import { defineConfig } from "drizzle-kit";

export default defineConfig({
	driver: "d1-http",
	schema: "./src/lib/server/db/schema.ts",
	dialect: "sqlite",
	verbose: true,
	strict: true,
});
