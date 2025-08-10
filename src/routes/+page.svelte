<script lang="ts">
	import type { PageData } from "./$types";
	import type { LngLatLike, MarkerOptions } from "maplibre-gl";

	import Map from "$lib/components/map/Map.svelte";
	import Marker from "$lib/components/map/Marker.svelte";
	import Popup from "$lib/components/map/Popup.svelte";
	import Control from "$lib/components/map/Control.svelte";
	import ReportSlothDialog from "$lib/components/ReportSlothDialog.svelte";
	import LoginDialog from "$lib/components/LoginDialog.svelte";
	import SlothPreviewPopup from "$lib/components/SlothPreviewPopup.svelte";
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

	function handleReportClick() {
		if (!data.user) {
			showLoginDialog = true;
			return;
		}
		reportLocation = undefined;
		showReportDialog = true;
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
					<SlothPreviewPopup {sloth} />
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
<ReportSlothDialog bind:open={showReportDialog} initialLocation={reportLocation} />

<LoginDialog bind:open={showLoginDialog} />
