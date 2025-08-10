<script lang="ts">
	import "lquip/css";

	import type { SlothMapData } from "$lib/server/db";
	import { SlothStatus } from "$lib";
	import { goto } from "$app/navigation";
	import { getImageUrl } from "$lib/utils/image-urls";

	let { sloth }: { sloth: SlothMapData } = $props();

	function formatDate(date: Date): string {
		return new Intl.DateTimeFormat("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		}).format(date);
	}

	function viewSlothDetails() {
		goto(`/sloth/${sloth.id}`);
	}
</script>

<div class="max-w-sm rounded bg-white shadow-lg">
	{#if sloth.primaryPhoto}
		<div class="aspect-video w-full overflow-hidden rounded-t bg-gray-100">
			<img
				src={getImageUrl(sloth.primaryPhoto.url)}
				alt="Sloth #{sloth.id.slice(-6)}"
				class="h-full w-full object-cover"
				style="--lqip: {sloth.primaryPhoto.lqip};"
				loading="lazy"
			/>
		</div>
	{/if}

	<div class="p-4">
		{#if !sloth.primaryPhoto}
			<div class="mb-2 flex h-24 w-full items-center justify-center rounded bg-gray-100">
				<span class="text-4xl">🦥</span>
			</div>
		{/if}

		<div class="mb-2 flex items-center justify-between">
			<h3 class="font-semibold text-gray-900">
				Sloth #{sloth.id.slice(-6)}
			</h3>
			<span
				class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {sloth.status ===
				SlothStatus.Active
					? 'bg-green-100 text-green-800'
					: 'bg-gray-100 text-gray-800'}"
			>
				{sloth.status === SlothStatus.Active ? "Active" : "Removed"}
			</span>
		</div>

		{#if sloth.discoverer}
			<div class="mb-3 flex items-center gap-2 text-sm text-gray-600">
				{#if sloth.discoverer.avatarUrl}
					<img
						src={sloth.discoverer.avatarUrl}
						alt="{sloth.discoverer.displayName}'s avatar"
						class="h-6 w-6 rounded-full"
					/>
				{:else}
					<div class="flex h-6 w-6 items-center justify-center rounded-full bg-gray-300 text-xs">
						{sloth.discoverer.displayName.charAt(0).toUpperCase()}
					</div>
				{/if}
				<span>
					<span class="font-medium">Discovered by</span>
					{sloth.discoverer.displayName}
				</span>
			</div>
		{/if}

		<div class="space-y-2 text-sm text-gray-600">
			<p>
				<span class="font-medium">Discovered:</span>
				{formatDate(sloth.discoveredAt)}
			</p>

			<p>
				<span class="font-medium">Spotted by:</span>
				{sloth.totalSpots}
				{sloth.totalSpots === 1 ? "person" : "people"}
			</p>

			{#if sloth.lastSightingAt}
				<p>
					<span class="font-medium">Last seen:</span>
					{formatDate(sloth.lastSightingAt)}
				</p>
			{/if}
		</div>

		<button
			class="mt-3 w-full rounded bg-amber-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:outline-none"
			onclick={viewSlothDetails}
		>
			View Full Details
		</button>
	</div>
</div>
