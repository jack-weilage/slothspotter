import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "$env/static/private";
import { dev } from "$app/environment";
import { resolve } from "$app/paths";

import { Google } from "arctic";

export const google = new Google(
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET,
	(dev ? "http://localhost:5173" : "https://slothspotter.com") +
		resolve("/auth/login/google/callback"),
);
