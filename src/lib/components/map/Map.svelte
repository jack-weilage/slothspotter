<script lang="ts" module>
	export interface MapState {
		map: maplibre.Map;
	}
</script>

<script lang="ts">
	import { resetEventListener } from "./utils";
	import maplibre from "maplibre-gl";
	import "maplibre-gl/dist/maplibre-gl.css";
	import type { Snippet } from "svelte";
	import { setContext, untrack } from "svelte";

	interface Props extends Omit<maplibre.MapOptions, "container"> {
		// Binds
		map?: maplibre.Map;
		// Events
		onclick?: (e: maplibre.MapMouseEvent) => void;

		children?: Snippet;
	}

	let mapContainer: HTMLDivElement;

	let {
		map = $bindable(),
		// Dynamically settable props
		maxBounds,
		minZoom,
		maxZoom,
		minPitch,
		maxPitch,
		center,
		// TODO: Add more dynamic props

		onclick,

		children,
		// Non-dynamic props
		...restProps
	}: Props = $props();

	let mapState: MapState = $state({ map: undefined! });
	setContext(maplibre.Map, mapState);
	$effect(() => {
		mapState.map = map!;
	});

	$effect(() => {
		const dynamicProps = untrack(() => ({
			maxBounds,
			minZoom,
			maxZoom,
			minPitch,
			maxPitch,
			center,
		}));

		map = new maplibre.Map({
			...dynamicProps,
			...restProps,
			container: mapContainer,
		});

		return () => {
			map?.remove();
			map = undefined!;
		};
	});

	$effect(() => resetEventListener(map, "click", onclick));

	$effect(() => {
		map?.setMaxBounds(maxBounds);
	});

	$effect(() => {
		map?.setMinZoom(minZoom);
	});

	$effect(() => {
		map?.setMaxZoom(maxZoom);
	});

	$effect(() => {
		map?.setMinPitch(minPitch);
	});

	$effect(() => {
		map?.setMinPitch(maxPitch);
	});

	$effect(() => {
		if (!center) return;

		map?.setCenter(center);
	});
</script>

<div bind:this={mapContainer} class="h-full w-full">
	{#if mapState.map}
		{@render children?.()}
	{/if}
</div>
