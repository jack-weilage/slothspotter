<script lang="ts">
	import type { PageData } from "./$types";
	import type { LngLatLike, MarkerOptions } from "maplibre-gl";

	import Map from "$lib/components/map/Map.svelte";
	import Marker from "$lib/components/map/Marker.svelte";
	import Popup from "$lib/components/map/Popup.svelte";
	import Control from "$lib/components/map/Control.svelte";
	import ReportSlothDialog from "$lib/components/ReportSlothDialog.svelte";
	import LoginDialog from "$lib/components/LoginDialog.svelte";
	import { SlothStatus } from "$lib";
	import maplibre from "maplibre-gl";
	import PlusIcon from "@lucide/svelte/icons/plus";

	let { data } = $props();

	const BELLINGHAM_COORDINATES: LngLatLike = [-122.478, 48.754];

	let showReportDialog = $state(false);
	let showLoginDialog = $state(false);
	let reportLocation: LngLatLike | undefined = $state(undefined);

	function getMarkerOptions(sloth: PageData["sloths"][0]): MarkerOptions {
		return {
			color: sloth.status === SlothStatus.Active ? "#8B5A2B" : "#6B7280",
		};
	}

	function formatDate(date: Date): string {
		return new Intl.DateTimeFormat("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		}).format(date);
	}

	function handleReportClick() {
		if (!data.user) {
			showLoginDialog = true;
			return;
		}
		reportLocation = undefined;
		showReportDialog = true;
	}

	function handleReportSuccess() {
		// Refresh the page to show the new sloth
		window.location.reload();
	}
</script>

<div class="relative h-[calc(100vh-4rem)]">
	<Map
		options={{
			style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
			center: BELLINGHAM_COORDINATES,
			zoom: 13,
			minZoom: 11,
		}}
	>
		<Control position="top-right" control={new maplibre.NavigationControl()} />
		<Control
			position="top-right"
			control={new maplibre.GeolocateControl({ trackUserLocation: true })}
		/>

		{#each data.sloths as sloth (sloth.id)}
			<Marker lngLat={[sloth.longitude, sloth.latitude]} options={getMarkerOptions(sloth)}>
				<Popup>
					<div class="max-w-xs rounded bg-white p-4 shadow-lg">
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
							class="mt-3 w-full rounded bg-amber-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700"
							onclick={() => {
								// TODO: Navigate to individual sloth page
								console.log("View sloth details:", sloth.id);
							}}
						>
							View Details
						</button>
					</div>
				</Popup>
			</Marker>
		{/each}
	</Map>

	<!-- Floating Action Button for Report Sloth -->
	<button
		type="button"
		onclick={handleReportClick}
		class="absolute right-6 bottom-6 flex h-14 w-14 items-center justify-center rounded-full bg-amber-600 text-white shadow-lg transition-all hover:scale-105 hover:bg-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:outline-none md:h-12 md:w-12"
		aria-label="Report a new sloth"
	>
		<PlusIcon class="h-6 w-6 md:h-5 md:w-5" />
	</button>
</div>

<!-- Dialogs -->
<ReportSlothDialog
	bind:open={showReportDialog}
	initialLocation={reportLocation}
	onSubmitSuccess={handleReportSuccess}
/>

<LoginDialog bind:open={showLoginDialog} />
