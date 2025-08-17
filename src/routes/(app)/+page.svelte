<script lang="ts">
	import type { PageData } from "./$types";
	import type { LngLatLike, MarkerOptions } from "maplibre-gl";

	import Map from "$lib/components/map/Map.svelte";
	import Marker from "$lib/components/map/Marker.svelte";
	import Popup from "$lib/components/map/Popup.svelte";
	import Control from "$lib/components/map/Control.svelte";
	import ReportSlothDialog, {
		openReportSlothDialog,
	} from "$lib/components/ReportSlothDialog.svelte";
	import SlothPreviewPopup from "$lib/components/SlothPreviewPopup.svelte";
	import SEO from "$lib/components/SEO.svelte";
	import maplibre from "maplibre-gl";
	import PlusIcon from "@lucide/svelte/icons/plus";
	import { Button } from "$lib/components/ui/button";
	import { openLoginDialog } from "$lib/components/LoginDialog.svelte";
	import { SlothStatus } from "$lib/client/db/schema";

	let { data } = $props();

	const BELLINGHAM_COORDINATES: LngLatLike = [-122.478, 48.754];

	let reportLocation: LngLatLike | undefined = $state(undefined);

	function getMarkerOptions(sloth: PageData["sloths"][0]): MarkerOptions {
		return {
			color: sloth.status === SlothStatus.Active ? "#8B5A2B" : "#6B7280",
		};
	}

	function handleReportClick() {
		if (!data.user) {
			openLoginDialog();
			return;
		}

		reportLocation = undefined;
		openReportSlothDialog();
	}
</script>

<SEO
	title="SlothSpotter"
	description="Discover and report stuffed sloth sightings around Bellingham, Washington. Join the community tracking these delightful creatures across the city."
/>

<div class="relative h-[calc(100dvh-4rem)]">
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
	<Button
		onclick={handleReportClick}
		size="icon"
		class="absolute right-6 bottom-6 h-14 w-14 rounded-full bg-amber-600 text-white shadow-lg transition-all hover:scale-105 hover:bg-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 md:h-12 md:w-12"
		aria-label="Report a new sloth"
	>
		<PlusIcon class="h-6 w-6 md:h-5 md:w-5" />
	</Button>
</div>

<!-- Dialogs -->
<ReportSlothDialog initialLocation={reportLocation} />
