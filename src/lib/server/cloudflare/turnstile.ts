import { CLOUDFLARE_TURNSTILE_SECRET_KEY } from "$env/static/private";

export interface TurnstileResponse {
	success: boolean;
	action?: string; // Action name if specified in the Turnstile widget
}

export async function validateTurnstile(token: string, ip: string): Promise<boolean> {
	const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			response: token,
			secret: CLOUDFLARE_TURNSTILE_SECRET_KEY,
			remoteip: ip,
		}),
	});

	const data: TurnstileResponse = await response.json();

	return data.success;
}
