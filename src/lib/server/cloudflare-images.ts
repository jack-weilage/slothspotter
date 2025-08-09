/**
 * Cloudflare Images API integration
 * Handles image uploads, URL generation, and management
 */

import { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_IMAGES_TOKEN } from "$env/static/private";

export interface CloudflareImageUploadResponse {
	result: {
		id: string;
		filename: string;
		uploaded: string;
		requireSignedURLs: boolean;
		variants: string[];
	};
	success: boolean;
	errors: Array<{ code: number; message: string }>;
	messages: string[];
}

export interface CloudflareImageDeleteResponse {
	result: {};
	success: boolean;
	errors: Array<{ code: number; message: string }>;
	messages: string[];
}

/**
 * Upload an image file to Cloudflare Images
 */
export async function uploadImage(
	file: File,
	imageId: string,
	uploaderId: string,
): Promise<string> {
	// Validate file type
	if (!file.type.startsWith("image/")) {
		throw new Error("File must be an image");
	}

	// Validate file size (10MB limit)
	const maxSize = 10 * 1024 * 1024; // 10MB
	if (file.size > maxSize) {
		throw new Error("Image file must be under 10MB");
	}

	const formData = new FormData();
	formData.append("file", file);
	formData.append("metadata", JSON.stringify({ imageId, uploaderId }));

	const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1`;

	try {
		const response = await fetch(url, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${CLOUDFLARE_IMAGES_TOKEN}`,
			},
			body: formData,
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Cloudflare Images API error: ${response.status} ${errorText}`);
		}

		const result: CloudflareImageUploadResponse = await response.json();

		if (!result.success) {
			const errorMessage = result.errors?.map((e) => e.message).join(", ") || "Upload failed";
			throw new Error(`Image upload failed: ${errorMessage}`);
		}

		return result.result.id;
	} catch (error) {
		throw new Error(
			error instanceof Error ? error.message : "Failed to upload image to Cloudflare Images",
		);
	}
}

/**
 * Generate a Cloudflare Images delivery URL
 */
export function getImageUrl(
	imageId: string,
	variant: string = "public",
	accountHash?: string,
): string {
	// If no account hash provided, use the default delivery URL format
	if (!accountHash) {
		return `https://imagedelivery.net/${accountHash || "default"}/${imageId}/${variant}`;
	}

	return `https://imagedelivery.net/${accountHash}/${imageId}/${variant}`;
}

/**
 * Get multiple image variant URLs
 */
export function getImageVariants(
	imageId: string,
	accountHash?: string,
): {
	thumbnail: string;
	medium: string;
	large: string;
	public: string;
} {
	return {
		thumbnail: getImageUrl(imageId, "thumbnail", accountHash),
		medium: getImageUrl(imageId, "medium", accountHash),
		large: getImageUrl(imageId, "large", accountHash),
		public: getImageUrl(imageId, "public", accountHash),
	};
}

/**
 * Delete an image from Cloudflare Images
 */
export async function deleteImage(imageId: string): Promise<void> {
	const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1/${imageId}`;

	try {
		const response = await fetch(url, {
			method: "DELETE",
			headers: {
				Authorization: `Bearer ${CLOUDFLARE_IMAGES_TOKEN}`,
			},
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Cloudflare Images API error: ${response.status} ${errorText}`);
		}

		const result: CloudflareImageDeleteResponse = await response.json();

		if (!result.success) {
			const errorMessage = result.errors?.map((e) => e.message).join(", ") || "Deletion failed";
			throw new Error(`Image deletion failed: ${errorMessage}`);
		}
	} catch (error) {
		throw new Error(
			error instanceof Error ? error.message : "Failed to delete image from Cloudflare Images",
		);
	}
}

/**
 * Upload multiple images with progress tracking
 */
export async function uploadMultipleImages(
	uploaderId: string,
	files: { id: string; file: File }[],
	onProgress?: (completed: number, total: number) => void,
): Promise<string[]> {
	const uploadPromises = files.map(async ({ id, file }, index) => {
		try {
			const imageId = await uploadImage(file, id, uploaderId);
			onProgress?.(index + 1, files.length);
			return imageId;
		} catch (error) {
			throw error;
		}
	});

	return Promise.all(uploadPromises);
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
	accountHash?: string,
): string {
	if (source instanceof File) {
		// For File objects, create a temporary object URL
		return URL.createObjectURL(source);
	}

	// For Cloudflare image IDs
	if (isValidImageId(source)) {
		return getImageUrl(source, variant, accountHash);
	}

	// Fallback for invalid/placeholder IDs
	return "";
}
