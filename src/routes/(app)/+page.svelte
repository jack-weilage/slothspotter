<script lang="ts">
	import { goto, invalidate } from "$app/navigation";
	import { page } from "$app/state";
	import { SlothStatus } from "$lib/client/db/schema";
	import SEO from "$lib/components/SEO.svelte";
	import SelectedSlothPanel from "$lib/components/SelectedSlothPanel.svelte";
	import { AboutDialog } from "$lib/components/dialogs/about";
	import { LoginDialog } from "$lib/components/dialogs/login";
	import { SubmitSlothDialog } from "$lib/components/dialogs/submit-sloth";
	import * as Map from "$lib/components/map";
	import { Button } from "$lib/components/ui/button";
	import * as Drawer from "$lib/components/ui/drawer";
	import PlusIcon from "@lucide/svelte/icons/plus";
	import maplibre from "maplibre-gl";
	import { MediaQuery } from "svelte/reactivity";
	import { fly } from "svelte/transition";

	let { data } = $props();

	const BELLINGHAM_COORDINATES: maplibre.LngLatLike = [-122.478, 48.754];

	let submitSlothDialogOpen = $state(false);
	let selectedSloth = $derived(
		data.sloths.find((s) => s.id === page.url.searchParams.get("selected")) ?? null,
	);

	function setSelected(id: string | null) {
		if (id) {
			page.url.searchParams.set("selected", id);
		} else {
			page.url.searchParams.delete("selected");
		}

		goto(page.url, { replaceState: true, keepFocus: true, noScroll: true });
	}
	const isDesktop = new MediaQuery("(min-width: 768px)");
</script>

<SEO
	title="SlothSpotter"
	description="Discover and report stuffed sloth sightings around Bellingham, Washington. Join the community tracking these delightful creatures across the city."
/>

<div class="relative flex h-[calc(100dvh-4rem)] flex-row">
	{#if !!selectedSloth}
		{#if isDesktop.current}
			<div
				transition:fly|global={{ x: -300, duration: 300 }}
				class="absolute top-0 bottom-0 left-0 z-10 h-full w-full max-w-100"
			>
				<SelectedSlothPanel
					sloth={selectedSloth}
					submitSightingForm={data.submitSightingForm}
					isLoggedIn={!!data.user}
				/>
			</div>
		{:else}
			<Drawer.Root open onClose={() => setSelected(null)}>
				<Drawer.Content>
					<SelectedSlothPanel
						sloth={selectedSloth}
						submitSightingForm={data.submitSightingForm}
						isLoggedIn={!!data.user}
					/>
				</Drawer.Content>
			</Drawer.Root>
		{/if}
	{/if}
	<Map.Root
		onclick={() => setSelected(null)}
		style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
		attributionControl={false}
		center={BELLINGHAM_COORDINATES}
		zoom={13}
		minZoom={11}
	>
		<Map.Control position="top-right">
			<AboutDialog />
		</Map.Control>

		<Map.Control position="top-right" control={new maplibre.NavigationControl()} />
		<Map.Control
			position="top-right"
			control={new maplibre.GeolocateControl({ trackUserLocation: true })}
		/>

		{#each data.sloths as sloth (sloth.id)}
			<Map.Marker
				lngLat={[sloth.longitude, sloth.latitude]}
				color={selectedSloth?.id === sloth.id
					? "#F59E0B"
					: sloth.status === SlothStatus.Active
						? "#8B5A2B"
						: "#6B7280"}
				onclick={(e) => {
					e.stopPropagation();
					setSelected(sloth.id);
				}}
			/>
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

	{#if data.user}
		<SubmitSlothDialog
			submitSlothForm={data.submitSlothForm}
			bind:open={submitSlothDialogOpen}
			oncomplete={(id) => {
				setSelected(id);
				invalidate("data:sloths");
			}}
			{trigger}
		/>
	{:else}
		<LoginDialog bind:open={submitSlothDialogOpen} {trigger} />
	{/if}
</div>
