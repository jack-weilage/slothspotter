<script lang="ts">
	import "lquip/css";

	import type { SlothMapData } from "$lib/server/db";
	import { SlothStatus } from "$lib";
	import { getImageUrl } from "$lib/client/cloudflare/images";
	import { Button } from "$lib/components/ui/button";
	import { Badge } from "$lib/components/ui/badge";
	import * as Avatar from "$lib/components/ui/avatar";

	let { sloth }: { sloth: SlothMapData } = $props();

	function formatDate(date: Date): string {
		return new Intl.DateTimeFormat("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		}).format(date);
	}
</script>

<div class="max-w-sm rounded bg-white shadow-lg">
	{#if sloth.primaryPhoto}
		<div class="aspect-video w-full overflow-hidden rounded-t bg-gray-100">
			<img
				src={getImageUrl(sloth.primaryPhoto.url)}
				alt="Sloth #{sloth.id.slice(-6)}"
				class="h-full w-full object-cover"
				style={sloth.primaryPhoto.lqip !== undefined ? `--lqip: ${sloth.primaryPhoto.lqip};` : ""}
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
			<Badge variant={sloth.status === SlothStatus.Active ? "active" : "inactive"}>
				{sloth.status === SlothStatus.Active ? "Active" : "Removed"}
			</Badge>
		</div>

		{#if sloth.discoverer}
			<div class="mb-3 flex items-center gap-2 text-sm text-gray-600">
				<Avatar.Root class="size-6">
					<Avatar.Image
						src={sloth.discoverer.avatarUrl}
						alt="{sloth.discoverer.displayName}'s avatar"
					/>
					<Avatar.Fallback class="text-xs">
						{sloth.discoverer.displayName
							.split(" ")
							.slice(0, 2)
							.map((s) => s[0].toLocaleUpperCase())
							.join("")}
					</Avatar.Fallback>
				</Avatar.Root>
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

		<Button class="mt-3 w-full bg-amber-600 hover:bg-amber-700" href="/sloth/{sloth.id}" size="sm">
			View Full Details
		</Button>
	</div>
</div>
