<script lang="ts" module>
	export interface MapState {
		map: maplibre.Map;
	}
</script>

<script lang="ts">
	import maplibre from "maplibre-gl";
	import "maplibre-gl/dist/maplibre-gl.css";
	import { onMount, setContext, untrack, type Snippet } from "svelte";

	interface Props extends Omit<maplibre.MapOptions, "container"> {
		// Binds
		map?: maplibre.Map;
		// Events

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
		// TODO: Add more dynamic props

		children,
		// Non-dynamic props
		...restProps
	}: Props = $props();

	let mapState: MapState = $state({ map: undefined! });
	setContext(maplibre.Map, mapState);
	$effect(() => {
		mapState.map = map!;
	});

	onMount(() => {
		const dynamicProps = untrack(() => ({
			maxBounds,
			minZoom,
			maxZoom,
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
</script>

<div bind:this={mapContainer} class="h-full w-full">
	{#if mapState.map}
		{@render children?.()}
	{/if}
</div>
