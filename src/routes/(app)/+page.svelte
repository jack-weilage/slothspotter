<script lang="ts">
	import { SlothStatus } from "$lib/client/db/schema";
	import SEO from "$lib/components/SEO.svelte";
	import SlothPreviewPopup from "$lib/components/SlothPreviewPopup.svelte";
	import { LoginDialog } from "$lib/components/dialogs/login";
	import { SubmitSlothDialog } from "$lib/components/dialogs/submit-sloth";
	import * as Map from "$lib/components/map";
	import { Button } from "$lib/components/ui/button";
	import PlusIcon from "@lucide/svelte/icons/plus";
	import maplibre from "maplibre-gl";

	let { data } = $props();

	const BELLINGHAM_COORDINATES: maplibre.LngLatLike = [-122.478, 48.754];

	let submitSlothDialogOpen = $state(false);
</script>

<SEO
	title="SlothSpotter"
	description="Discover and report stuffed sloth sightings around Bellingham, Washington. Join the community tracking these delightful creatures across the city."
/>

<div class="relative h-[calc(100dvh-4rem)]">
	<Map.Root
		style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
		attributionControl={false}
		center={BELLINGHAM_COORDINATES}
		zoom={13}
		minZoom={11}
	>
		<Map.Control position="top-right" control={new maplibre.NavigationControl()} />
		<Map.Control
			position="top-right"
			control={new maplibre.GeolocateControl({ trackUserLocation: true })}
		/>

		{#each data.sloths as sloth (sloth.id)}
			<Map.Marker
				lngLat={[sloth.longitude, sloth.latitude]}
				color={sloth.status === SlothStatus.Active ? "#8B5A2B" : "#6B7280"}
			>
				<Map.Popup closeButton={false}>
					<SlothPreviewPopup {sloth} />
				</Map.Popup>
			</Map.Marker>
		{/each}
	</Map.Root>

	{#snippet trigger({ props }: { props: Record<string, unknown> })}
		<Button
			onclick={() => (submitSlothDialogOpen = true)}
			size="icon"
			class="absolute right-6 bottom-6 h-14 w-14 rounded-full text-white shadow-lg transition-all hover:scale-105 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 md:h-12 md:w-12"
			aria-label="Report a new sloth"
			{...props}
		>
			<PlusIcon class="h-6 w-6 md:h-5 md:w-5" />
		</Button>
	{/snippet}

	<!-- Floating Action Button for Report Sloth -->
	{#if data.user}
		<SubmitSlothDialog
			submitSlothForm={data.submitSlothForm}
			bind:open={submitSlothDialogOpen}
			{trigger}
		/>
	{:else}
		<LoginDialog bind:open={submitSlothDialogOpen} {trigger} />
	{/if}
</div>
