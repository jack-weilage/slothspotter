<script lang="ts">
	import { getImageUrl } from "$lib/client/cloudflare/images";
	import type { SlothStatus } from "$lib/client/db/schema";
	import type { ReportContentSchema } from "$lib/components/dialogs/report-content";
	import * as Avatar from "$lib/components/ui/avatar";
	import * as Card from "$lib/components/ui/card";
	import SlothStatusBadge from "./SlothStatusBadge.svelte";
	import SightingActionDropdown from "./dropdown/SightingActionDropdown.svelte";
	import "lquip/css";
	import type { Infer, SuperValidated } from "sveltekit-superforms";

	let {
		sighting,
		reportContentForm,
	}: {
		sighting: {
			id: string;
			slothStatus: SlothStatus;
			createdAt: Date;
			notes: string | null;
			sightedBy: {
				// id: string;
				displayName: string;
				avatarUrl: string | null;
			};
			photos: {
				cloudflareImageId: string;
				caption: string | null;
				lqip: number | null;
			}[];
		};

		reportContentForm: SuperValidated<Infer<typeof ReportContentSchema>>;
	} = $props();

	function getUserInitials(displayName: string): string {
		return displayName
			.split(" ")
			.slice(0, 2)
			.map((name) => name.charAt(0))
			.join("")
			.toUpperCase();
	}
</script>

<Card.Root>
	<Card.Header class="flex items-center gap-3 pb-3">
		<Avatar.Root class="h-10 w-10">
			<Avatar.Image src={sighting.sightedBy.avatarUrl} />
			<Avatar.Fallback>{getUserInitials(sighting.sightedBy.displayName)}</Avatar.Fallback>
		</Avatar.Root>
		<div class="min-w-0 flex-1">
			<div class="flex items-center justify-between gap-2">
				<h3 class="truncate font-semibold text-gray-900 dark:text-gray-100">
					{sighting.sightedBy.displayName}
				</h3>
			</div>

			<time
				class="text-sm text-gray-500 dark:text-gray-400"
				datetime={sighting.createdAt.toISOString()}
			>
				{sighting.createdAt.toLocaleDateString("en-US", {
					year: "numeric",
					month: "short",
					day: "numeric",
					hour: "2-digit",
					minute: "2-digit",
				})}
			</time>
		</div>

		<SlothStatusBadge status={sighting.slothStatus} />
		<SightingActionDropdown sightingId={sighting.id} {reportContentForm} />
	</Card.Header>
	<Card.Content class="space-y-3">
		{#if sighting.photos.length > 0}
			<div>
				{#each sighting.photos as photo (photo.cloudflareImageId)}
					<div>
						<img
							src={getImageUrl(photo.cloudflareImageId)}
							style={photo.lqip ? `--lqip: ${photo.lqip}` : undefined}
							alt={photo.caption || "Sloth sighting photo"}
						/>
						{#if photo.caption}
							<div
								class="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent p-2"
							>
								<p class="text-xs font-medium text-white">{photo.caption}</p>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}

		{#if sighting.notes}
			<p>{sighting.notes}</p>
		{:else}
			<p class="text-sm text-gray-500 italic">No notes provided.</p>
		{/if}
	</Card.Content>
</Card.Root>
