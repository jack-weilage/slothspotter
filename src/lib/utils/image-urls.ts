/**
 * Client-safe utilities for generating image URLs
 * Handles both File objects and Cloudflare image IDs
 */

/**
 * Generate a Cloudflare Images delivery URL
 */
export function getImageUrl(
	imageId: string,
	variant: string = "public",
	accountHash?: string
): string {
	// Use provided account hash or fallback - this should be configurable via env
	const hash = accountHash || "default-hash-placeholder";
	
	return `https://imagedelivery.net/${hash}/${imageId}/${variant}`;
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
export function getDisplayUrl(
	source: File | string,
	variant: string = "thumbnail",
	accountHash?: string
): string {
	if (source instanceof File) {
		// For File objects, create a temporary object URL
		return URL.createObjectURL(source);
	}

	// For Cloudflare image IDs
	if (typeof source === "string" && isValidImageId(source)) {
		return getImageUrl(source, variant, accountHash);
	}

	// Fallback for invalid/placeholder IDs
	return "";
}