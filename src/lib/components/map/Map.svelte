<script lang="ts" module>
	export interface MapState {
		map: maplibre.Map;
	}
</script>

<script lang="ts">
	import "maplibre-gl/dist/maplibre-gl.css";

	import maplibre from "maplibre-gl";
	import { onMount, setContext, type Snippet } from "svelte";

	let mapContainer: HTMLDivElement;

	let mapState: MapState = $state({ map: undefined! });
	setContext(maplibre.Map, mapState);

	let {
		options,
		onclick,
		children,
	}: {
		options: Omit<maplibre.MapOptions, "container">;
		onclick?: (event: CustomEvent<{ lngLat: maplibre.LngLatLike }>) => void;
		children?: Snippet;
	} = $props();

	onMount(() => {
		mapState.map = new maplibre.Map({
			...options,
			container: mapContainer,
		});

		// Add click event listener if onclick is provided
		if (onclick) {
			mapState.map.on("click", (e) => {
				const customEvent = new CustomEvent("click", {
					detail: { lngLat: e.lngLat },
				}) as CustomEvent<{ lngLat: maplibre.LngLatLike }>;
				onclick(customEvent);
			});
		}
	});
</script>

<div bind:this={mapContainer} class="h-full w-full">
	{#if mapState.map}
		{@render children?.()}
	{/if}
</div>
