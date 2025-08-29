<script lang="ts">
	import { getImageUrl } from "$lib/client/cloudflare/images";
	import { SlothStatus } from "$lib/client/db/schema";
	import { LoginDialog } from "$lib/components/dialogs/login";
	import {
		SubmitSightingDialog,
		SubmitSightingSchema,
	} from "$lib/components/dialogs/submit-sighting";
	import { Button } from "$lib/components/ui/button";
	import SlothStatusBadge from "./SlothStatusBadge.svelte";
	import "lquip/css";
	import type { Infer, SuperValidated } from "sveltekit-superforms";

	let {
		sloth,
		submitSightingForm,
		isLoggedIn,
	}: {
		sloth: {
			id: string;
			uniqueSightings: number;
			sightings: {
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

	const primaryPhoto = $derived(sloth.sightings[0]?.photos[0]);
	let submitSightingDialogOpen = $state(false);
</script>

<div class="w-full max-w-sm overflow-hidden rounded-xl bg-white shadow-lg">
	<div class="mb-2 flex items-center justify-between bg-green-800 p-4">
		<h3 class="font-semibold text-gray-100">
			Sloth #{sloth.id.slice(-6)}
		</h3>
		<SlothStatusBadge status={sloth.status} />
	</div>

	{#if primaryPhoto}
		<div class="mx-4 overflow-hidden">
			<img
				src={getImageUrl(primaryPhoto.cloudflareImageId)}
				alt="Sloth #{sloth.id.slice(-6)}"
				class="aspect-video h-full w-full rounded-2xl object-cover"
				style={primaryPhoto.lqip !== null ? `--lqip: ${primaryPhoto.lqip};` : ""}
				loading="lazy"
			/>
		</div>
	{/if}

	<div class="p-4">
		<div class="space-y-2 text-sm text-gray-600">
			<p>
				Spotted by {sloth.uniqueSightings}
				{sloth.uniqueSightings === 1 ? "person" : "people"}
			</p>
		</div>

		<div class="mt-3 grid w-full grid-cols-2 gap-x-2">
			{#snippet trigger({ props }: { props: Record<string, unknown> })}
				<Button
					variant="secondary"
					size="sm"
					{...props}
					onclick={() => (submitSightingDialogOpen = true)}>Spot It</Button
				>
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

			<Button href="/sloth/{sloth.id}" size="sm">View Details</Button>
		</div>
	</div>
</div>
