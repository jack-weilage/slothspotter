import { CLOUDFLARE_TURNSTILE_SECRET_KEY } from "$env/static/private";

export interface TurnstileResponse {
	success: boolean;
	"error-codes"?: string[];
	challenge_ts?: string;
	hostname?: string;
}

/**
 * Validates a Turnstile token with Cloudflare
 */
export async function validateTurnstile(
	token: string,
	remoteip: string | null = null,
): Promise<boolean> {
	try {
		const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: new URLSearchParams({
				secret: CLOUDFLARE_TURNSTILE_SECRET_KEY,
				response: token,
				remoteip: remoteip || "",
			}),
		});

		if (!response.ok) {
			console.error("Turnstile validation failed with response:", await response.text());
			return false;
		}

		const result: TurnstileResponse = await response.json();

		if (!result.success && result["error-codes"]) {
			console.error("Turnstile validation failed with errors:", result["error-codes"]);
		}

		return result.success === true;
	} catch (error) {
		console.error("Turnstile validation error:", error);
		return false;
	}
}
