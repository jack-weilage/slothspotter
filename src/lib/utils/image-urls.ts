/**
 * Client-safe utilities for generating image URLs
 * Handles both File objects and Cloudflare image IDs
 */

import { PUBLIC_CLOUDFLARE_ACCOUNT_HASH } from "$env/static/public";

/**
 * Generate a Cloudflare Images delivery URL
 */
export function getImageUrl(imageId: string, variant: string = "public"): string {
	return `https://imagedelivery.net/${PUBLIC_CLOUDFLARE_ACCOUNT_HASH}/${imageId}/${variant}`;
}

/**
 * Check if an image ID is valid (not a placeholder)
 */
export function isValidImageId(imageId: string): boolean {
	return Boolean(imageId && !imageId.startsWith("placeholder_"));
}

/**
 * Get the appropriate image URL, handling both File objects and Cloudflare image IDs
 */
export function getDisplayUrl(source: File | string, variant: string = "thumbnail"): string {
	if (source instanceof File) {
		// For File objects, create a temporary object URL
		return URL.createObjectURL(source);
	}

	// For Cloudflare image IDs
	if (typeof source === "string" && isValidImageId(source)) {
		return getImageUrl(source, variant);
	}

	// Fallback for invalid/placeholder IDs
	return "";
}
