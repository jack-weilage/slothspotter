<script lang="ts">
	import { enhance } from "$app/forms";
	import * as Avatar from "$lib/components/ui/avatar";
	import { Badge } from "$lib/components/ui/badge";
	import { Button } from "$lib/components/ui/button";
	import type { ParsedReport } from "./+page.server";
	import ContentPreview from "./ContentPreview.svelte";
	import ModerationActions from "./ModerationActions.svelte";

	let { report }: { report: ParsedReport } = $props();

	// Format date for display
	function formatDateTime(date: Date | string): string {
		const d = typeof date === "string" ? new Date(date) : date;
		return d.toLocaleString();
	}

	// Get content type display info
	function getContentTypeInfo(contentType?: string) {
		switch (contentType) {
			case "sloth":
				return {
					label: "Sloth",
					color: "bg-green-100 text-green-800",
					icon: "🦥",
				};
			case "sighting":
				return {
					label: "Sighting",
					color: "bg-blue-100 text-blue-800",
					icon: "👁️",
				};
			case "photo":
				return {
					label: "Photo",
					color: "bg-purple-100 text-purple-800",
					icon: "📷",
				};
			default:
				return {
					label: contentType,
					color: "bg-gray-100 text-gray-800",
					icon: "📄",
				};
		}
	}

	const contentInfo = $derived(getContentTypeInfo(report.content?.type));
</script>

<div class="flex h-full flex-col">
	<!-- Header -->
	<div class="border-b border-gray-200 bg-white p-6">
		<div class="mb-4 flex items-start justify-between">
			<div class="flex items-center gap-3">
				<div class="text-2xl">{contentInfo.icon}</div>
				<div>
					<h1 class="text-xl font-semibold text-gray-900">
						{contentInfo.label} Report
					</h1>
					<p class="text-sm text-gray-500">
						Reported {formatDateTime(report.createdAt)}
					</p>
				</div>
			</div>

			<Badge class="text-sm {contentInfo.color}">
				{contentInfo.label}
			</Badge>
		</div>

		<div class="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
			<Avatar.Root class="size-10">
				<Avatar.Image
					src={report.reportedBy?.avatarUrl}
					alt="{report.reportedBy?.displayName}'s avatar'"
				/>
				<Avatar.Fallback>
					{report.reportedBy?.displayName
						?.split(" ")
						.slice(0, 2)
						.map((s) => s[0]?.toUpperCase())
						.join("") || "?"}
				</Avatar.Fallback>
			</Avatar.Root>
			<div>
				<p class="text-sm font-medium text-gray-900">
					Reported by {report.reportedBy?.displayName || "Unknown User"}
				</p>
				<p class="text-xs text-gray-600">
					User ID: {report.reportedBy?.id || "Unknown"}
				</p>
			</div>
		</div>
	</div>

	<!-- Content -->
	<div class="flex-1 space-y-6 overflow-y-auto p-6">
		<!-- Report Details -->
		<div class="space-y-4">
			<div>
				<h3 class="mb-2 text-sm font-semibold text-gray-900">Reason for Report</h3>
				<p class="rounded-md border border-red-100 bg-red-50 p-3 text-sm text-gray-800">
					{report.reason}
				</p>
			</div>

			{#if report.comment}
				<div>
					<h3 class="mb-2 text-sm font-semibold text-gray-900">Additional Comments</h3>
					<p class="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
						{report.comment}
					</p>
				</div>
			{/if}
		</div>

		<!-- Content Preview -->
		<div>
			<h3 class="mb-3 text-sm font-semibold text-gray-900">Reported Content</h3>
			<ContentPreview content={report.content} />
		</div>

		<!-- Moderation Actions -->
		<div class="border-t border-gray-200 pt-6">
			<h3 class="mb-4 text-sm font-semibold text-gray-900">Moderation Actions</h3>

			<ModerationActions {report} />
		</div>

		<!-- Status Actions -->
		<div class="border-t border-gray-200 pt-6">
			<h3 class="mb-4 text-sm font-semibold text-gray-900">Report Status</h3>
			<div class="flex gap-2">
				<form method="POST" action="?/resolveReport" use:enhance>
					<input type="hidden" name="reportId" id="reportId" value={report.id} />
					<Button type="submit" variant="secondary" size="sm">Mark as Resolved</Button>
				</form>
			</div>
		</div>
	</div>
</div>
