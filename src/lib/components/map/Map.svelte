<script lang="ts">
	import "maplibre-gl/dist/maplibre-gl.css";

	import maplibre from "maplibre-gl";
	import { onMount, setContext } from "svelte";

	let mapContainer: HTMLDivElement;
	let map: maplibre.Map | undefined = $state();

	let { options }: { options: Omit<maplibre.MapOptions, "container"> } = $props();

	onMount(() => {
		map = new maplibre.Map({
			...options,
			container: mapContainer,
		});
	});
</script>

<div bind:this={mapContainer} class="h-full w-full"></div>
