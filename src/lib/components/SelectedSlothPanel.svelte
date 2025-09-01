<script lang="ts">
	import { getImageUrl } from "$lib/client/cloudflare/images";
	import { SlothStatus } from "$lib/client/db/schema";
	import SlothStatusBadge from "$lib/components/SlothStatusBadge.svelte";
	import { LoginDialog } from "$lib/components/dialogs/login";
	import {
		SubmitSightingDialog,
		SubmitSightingSchema,
	} from "$lib/components/dialogs/submit-sighting";
	import { Button } from "$lib/components/ui/button";
	import CameraIcon from "@lucide/svelte/icons/camera";
	import ExternalLinkIcon from "@lucide/svelte/icons/external-link";
	import NavigationIcon from "@lucide/svelte/icons/navigation";
	import ShareIcon from "@lucide/svelte/icons/share-2";
	import "lquip/css";
	import type { Infer, SuperValidated } from "sveltekit-superforms";

	let {
		sloth,
		submitSightingForm,
		isLoggedIn,
	}: {
		sloth: {
			id: string;
			latitude: number;
			longitude: number;
			uniqueSightings: number;
			sightings: {
				createdAt: Date | string;
				photos: {
					id: string;
					cloudflareImageId: string;
					lqip: number | null;
				}[];
			}[];
			status: SlothStatus;
		};
		submitSightingForm: SuperValidated<Infer<typeof SubmitSightingSchema>>;
		isLoggedIn: boolean;
	} = $props();

	const primaryPhoto = $derived(
		sloth.sightings.find(({ photos }) => photos.length !== 0)?.photos?.[0],
	);
	const firstSpotted = $derived(formatFirstSpotted(sloth.sightings[0]?.createdAt));
	let submitSightingDialogOpen = $state(false);
	let justCopied = $state(false);

	function formatFirstSpotted(createdAt: Date | string | undefined): string | undefined {
		if (!createdAt) return undefined;
		const date = createdAt instanceof Date ? createdAt : new Date(createdAt);
		if (isNaN(date.getTime())) return undefined;
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	}
</script>

<div class="relative flex h-full w-full flex-col overflow-hidden bg-white shadow-lg">
	<div class="flex-1 overflow-y-auto">
		{#if primaryPhoto}
			<div class="overflow-hidden">
				<img
					src={getImageUrl(primaryPhoto.cloudflareImageId)}
					alt="Sloth #{sloth.id.slice(-6)}"
					class="aspect-video w-full object-cover"
					style={primaryPhoto.lqip !== null ? `--lqip: ${primaryPhoto.lqip};` : ""}
					loading="lazy"
				/>
			</div>
		{/if}

		<div class="flex items-center justify-between bg-green-800 px-4 py-3">
			<h3 class="font-semibold text-gray-100">Sloth #{sloth.id.slice(-6)}</h3>
			<SlothStatusBadge status={sloth.status} />
		</div>

		<div class="space-y-3 p-4 text-sm text-gray-700">
			<div class="grid grid-cols-4 place-items-center gap-2">
				<Button
					variant="ghost"
					class="h-auto flex-col gap-1 py-2"
					href="https://www.google.com/maps/dir/?api=1&destination={sloth.latitude},{sloth.longitude}"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="Directions"
					title="Directions"
				>
					<NavigationIcon />
					<span class="text-[10px] leading-tight">Directions</span>
				</Button>

				<Button
					variant="ghost"
					class="h-auto flex-col gap-1 py-2"
					onclick={async () => {
						const url = `${window.location.origin}/sloth/${sloth.id}`;
						if (navigator.share) {
							try {
								await navigator.share({ url, title: `Sloth #${sloth.id.slice(-6)}` });
								return;
							} catch {
								// fallthrough to copy
							}
						}

						await navigator.clipboard.writeText(url);
						justCopied = true;
						setTimeout(() => (justCopied = false), 1500);
					}}
					aria-label={justCopied ? "Link copied" : "Share"}
					title={justCopied ? "Link copied" : "Share"}
				>
					<ShareIcon />
					<span class="text-[10px] leading-tight">Share</span>
				</Button>

				<Button
					variant="ghost"
					class="h-auto flex-col gap-1 py-2"
					href="/sloth/{sloth.id}"
					aria-label="View details"
					title="View details"
				>
					<ExternalLinkIcon />
					<span class="text-[10px] leading-tight">Details</span>
				</Button>

				{#snippet trigger({ props }: { props: Record<string, unknown> })}
					<Button
						variant="ghost"
						class="h-auto flex-col gap-1 py-2"
						{...props}
						onclick={() => (submitSightingDialogOpen = true)}
						aria-label="Report sighting"
						title="Report sighting"
					>
						<CameraIcon />
						<span class="text-[10px] leading-tight">Report</span>
					</Button>
				{/snippet}

				{#if isLoggedIn}
					<SubmitSightingDialog
						bind:open={submitSightingDialogOpen}
						{submitSightingForm}
						slothId={sloth.id}
						{trigger}
					/>
				{:else}
					<LoginDialog bind:open={submitSightingDialogOpen} {trigger} />
				{/if}
			</div>

			<div class="grid grid-cols-2 gap-3">
				<div class="rounded-lg border p-3">
					<p class="text-xs text-gray-500">Spotted by</p>
					<p class="mt-1 text-base font-semibold">
						{sloth.uniqueSightings}
						{sloth.uniqueSightings === 1 ? "person" : "people"}
					</p>
				</div>
				<div class="rounded-lg border p-3">
					<p class="text-xs text-gray-500">First spotted</p>
					<p class="mt-1 text-base font-semibold">{firstSpotted || "—"}</p>
				</div>
			</div>
		</div>
	</div>
</div>
