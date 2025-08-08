<script lang="ts" module>
	export interface MarkerState {
		marker: maplibre.Marker;
	}
</script>

<script lang="ts">
	import type { MapState } from "./Map.svelte";
	import type { Snippet } from "svelte";

	import maplibre from "maplibre-gl";
	import { getContext, setContext, onMount } from "svelte";

	const mapState = getContext<MapState>(maplibre.Map);
	let {
		lngLat,
		options,
		ondragend,
		children,
	}: {
		lngLat: maplibre.LngLatLike;
		options?: maplibre.MarkerOptions;
		ondragend?: (event: CustomEvent<{ lngLat: maplibre.LngLatLike }>) => void;
		children?: Snippet;
	} = $props();

	let markerState: MarkerState = $state({ marker: undefined! });
	setContext<MarkerState>(maplibre.Marker, markerState);

	onMount(() => {
		markerState.marker = new maplibre.Marker(options).setLngLat(lngLat).addTo(mapState.map);

		// Add dragend event listener if ondragend is provided
		if (ondragend && options?.draggable) {
			markerState.marker.on("dragend", () => {
				const customEvent = new CustomEvent("dragend", {
					detail: { lngLat: markerState.marker.getLngLat() },
				}) as CustomEvent<{ lngLat: maplibre.LngLatLike }>;
				ondragend(customEvent);
			});
		}

		return () => {
			markerState.marker.remove();
		};
	});

	$effect(() => {
		markerState.marker?.setLngLat(lngLat);
	});
</script>

{#if markerState.marker}
	{@render children?.()}
{/if}
