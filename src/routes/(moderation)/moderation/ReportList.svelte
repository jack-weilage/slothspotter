<script lang="ts">
	import { ContentType } from "$lib/client/db/schema";
	import * as Avatar from "$lib/components/ui/avatar";
	import { Badge } from "$lib/components/ui/badge";
	import type { ParsedReport } from "./+page.server";

	let {
		reports,
		selectedReport = $bindable(),
	}: {
		reports: ParsedReport[];
		selectedReport: ParsedReport | null;
	} = $props();

	// Format date for display
	function formatDate(date: Date | string): string {
		const d = new Date(date);
		const now = new Date();
		const diffMs = now.getTime() - d.getTime();
		const diffMins = Math.floor(diffMs / (1000 * 60));
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffMins < 1) return "Just now";
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;

		return d.toLocaleDateString();
	}

	// Get content type display info
	function getContentTypeInfo(contentType: ContentType) {
		switch (contentType) {
			case ContentType.Sloth:
				return { label: "Sloth", color: "bg-green-100 text-green-800" };
			case ContentType.Sighting:
				return { label: "Sighting", color: "bg-blue-100 text-blue-800" };
			case ContentType.Photo:
				return { label: "Photo", color: "bg-purple-100 text-purple-800" };
			default:
				return { label: contentType, color: "bg-gray-100 text-gray-800" };
		}
	}
</script>

<div class="h-full divide-y divide-gray-100 overflow-y-auto">
	{#each reports as report (report.id)}
		<button
			onclick={() => (selectedReport = report)}
			class="w-full p-4 text-left transition-colors hover:bg-gray-50 focus:bg-blue-50 focus:outline-none {selectedReport?.id ===
			report.id
				? 'border-r-2 border-blue-500 bg-blue-50'
				: ''} "
		>
			<div class="flex gap-3">
				<!-- Reporter Avatar -->
				<Avatar.Root class="size-8">
					<Avatar.Image
						src={report.reportedBy?.avatarUrl}
						alt="{report.reportedBy?.displayName}'s avatar'"
					/>
					<Avatar.Fallback class="text-xs">
						{report.reportedBy?.displayName
							?.split(" ")
							.slice(0, 2)
							.map((s) => s[0]?.toUpperCase())
							.join("") || "?"}
					</Avatar.Fallback>
				</Avatar.Root>

				<div class="w-full">
					<!-- Header with content type and time -->
					<div class="mb-1 flex items-center gap-2">
						{#if report.content}
							<Badge class="text-xs {getContentTypeInfo(report.content.type).color}">
								{getContentTypeInfo(report.content.type).label}
							</Badge>
						{/if}
						<span class="text-xs text-gray-500">{formatDate(report.createdAt)}</span>
					</div>

					<!-- Reporter name and reason -->
					<div class="mb-1 text-sm">
						<span class="font-medium text-gray-900">
							{report.reportedBy?.displayName || "Unknown User"}
						</span>
						<span class="text-gray-600">reported for</span>
						<span> {report.reason} </span>
					</div>

					<!-- Comment preview if available -->
					{#if report.comment}
						<p class="line-clamp-2 text-xs text-gray-600">
							{report.comment}
						</p>
					{/if}
				</div>
			</div>
		</button>
	{:else}
		<div class="flex h-full flex-col items-center justify-center p-8 text-gray-500">
			<div class="mb-4 text-4xl">📋</div>
			<p class="mb-2 text-lg font-medium">No reports found</p>
			<p class="text-center text-sm">All caught up! No pending moderation reports.</p>
		</div>
	{/each}
</div>
