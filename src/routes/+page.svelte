<script lang="ts">
	import Map from "$lib/components/map/Map.svelte";
	import type { LngLatLike } from "maplibre-gl";

	const BELLINGHAM_COORDINATES: LngLatLike = [-122.478, 48.754];
</script>

<div class="h-[calc(100vh-4rem)]">
	<Map
		options={{
			style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",

			center: BELLINGHAM_COORDINATES,
			zoom: 13,
			minZoom: 11,
		}}
	></Map>
</div>
