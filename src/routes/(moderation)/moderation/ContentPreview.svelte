<script lang="ts">
	import { getImageUrl } from "$lib/client/cloudflare/images";
	import { ContentType } from "$lib/client/db/schema";
	import { Badge } from "$lib/components/ui/badge";
	import type { ParsedContent } from "./+page.server";

	let { content }: { content: ParsedContent | null } = $props();

	// Format coordinates for display
	function formatCoordinate(coord: number): string {
		return coord.toFixed(6);
	}

	// Format date for display
	function formatDate(date: Date | number | string | null): string {
		if (!date) return "Unknown";
		const d = new Date(typeof date === "number" ? date * 1000 : date);
		return d.toLocaleDateString();
	}

	// Get status color
	function getStatusColor(status: string): string {
		switch (status) {
			case "active":
				return "bg-green-100 text-green-800";
			case "inactive":
				return "bg-red-100 text-red-800";
			case "removed":
				return "bg-gray-100 text-gray-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	}
</script>

<div class="rounded-lg border border-gray-200 bg-white p-4">
	{#if !content}
		<div class="py-8 text-center text-gray-500">
			<div class="mb-2 text-2xl">❌</div>
			<p class="text-sm">Content not found or has been deleted</p>
		</div>
	{:else if content.type === ContentType.Sloth}
		<div class="space-y-3">
			<div class="flex items-center justify-between">
				<h4 class="font-medium text-gray-900">Sloth Details</h4>
				<Badge class={getStatusColor(content.status as string)}>
					{content.status}
				</Badge>
			</div>

			<div class="grid grid-cols-2 gap-4 text-sm">
				<div>
					<span class="text-gray-600">Location:</span>
					<p class="font-mono">
						{formatCoordinate(content.latitude as number)},
						{formatCoordinate(content.longitude as number)}
					</p>
				</div>
				<div>
					<span class="text-gray-600">Discovered:</span>
					<p>{formatDate(content.createdAt)}</p>
				</div>
			</div>

			<div class="text-xs text-gray-500">
				<p>Sloth ID: {content.id}</p>
			</div>
		</div>
	{:else if content.type === ContentType.Sighting}
		<div class="space-y-3">
			<div class="flex items-center justify-between">
				<h4 class="font-medium text-gray-900">Sighting Details</h4>
			</div>

			<div class="space-y-1 text-sm">
				<span class="text-gray-600">Notes:</span>
				<p class="rounded border bg-gray-50 p-2">
					{#if content.notes}
						{content.notes}
					{:else}
						<span class="text-gray-600 italic">No notes attached</span>
					{/if}
				</p>
			</div>

			<div class="grid grid-cols-2 gap-4 text-sm">
				<div>
					<span class="text-gray-600">Sloth ID:</span>
					<p class="font-mono text-xs">{content.slothId}</p>
				</div>
				<div>
					<span class="text-gray-600">Reported:</span>
					<p>{formatDate(content.createdAt)}</p>
				</div>
			</div>

			<div class="text-xs text-gray-500">
				<p>Sighting ID: {content.id}</p>
				<p>User ID: {content.userId}</p>
			</div>
		</div>
	{:else if content.type === ContentType.Photo}
		<div class="space-y-3">
			<div class="flex items-center justify-between">
				<h4 class="font-medium text-gray-900">Photo Details</h4>
				<Badge class="bg-purple-100 text-purple-800">Photo</Badge>
			</div>

			{#if content.cloudflareImageId}
				<div class="flex justify-center">
					<img src={getImageUrl(content.cloudflareImageId)} alt="" />
				</div>
			{/if}

			{#if content.caption}
				<div>
					<span class="text-sm text-gray-600">Caption:</span>
					<p class="mt-1 rounded border bg-gray-50 p-2 text-sm">
						{content.caption}
					</p>
				</div>
			{/if}

			<div class="text-sm">
				<span class="text-gray-600">Uploaded:</span>
				<p>{formatDate(content.createdAt)}</p>
			</div>

			<div class="text-xs text-gray-500">
				<p>Photo ID: {content.id}</p>
				<p>Sighting ID: {content.sightingId}</p>
				<p>Cloudflare ID: {content.cloudflareImageId}</p>
			</div>
		</div>
	{/if}
</div>
