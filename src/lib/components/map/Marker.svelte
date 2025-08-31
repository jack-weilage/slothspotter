<script lang="ts" module>
	export interface MarkerState {
		marker: maplibre.Marker;
	}
</script>

<script lang="ts">
	import type { MapState } from "./Map.svelte";
	import { resetEventListener } from "./utils";
	import maplibre from "maplibre-gl";
	import type { Snippet } from "svelte";
	import { getContext, setContext, untrack } from "svelte";

	interface Props extends maplibre.MarkerOptions {
		// Binds
		marker?: maplibre.Marker;
		lngLat: maplibre.LngLatLike;
		// Events
		// https://maplibre.org/maplibre-gl-js/docs/API/classes/Marker/#events
		ondrag?: maplibre.Listener;
		ondragstart?: maplibre.Listener;
		ondragend?: maplibre.Listener;
		onclick?: (e: MouseEvent) => void;

		children?: Snippet;
	}

	const mapState = getContext<MapState>(maplibre.Map);
	let {
		marker = $bindable(),
		lngLat = $bindable(),
		// Dynamically settable props
		offset,
		draggable,
		rotation,
		rotationAlignment,
		pitchAlignment,
		opacity,
		opacityWhenCovered,
		subpixelPositioning,

		ondragstart,
		ondrag,
		ondragend,
		onclick,

		children,

		// Non-dynamic props
		...restProps
	}: Props = $props();

	let markerState: MarkerState = $state({ marker: undefined! });
	setContext<MarkerState>(maplibre.Marker, markerState);
	$effect(() => {
		markerState.marker = marker!;
	});

	$effect(() => {
		const dynamicProps = untrack(() => ({
			offset,
			draggable,
			rotation,
			rotationAlignment,
			pitchAlignment,
			opacity,
			opacityWhenCovered,
			subpixelPositioning,
		}));

		marker = new maplibre.Marker({ ...dynamicProps, ...restProps })
			.setLngLat(untrack(() => lngLat))
			.addTo(mapState.map);

		const dragListener = untrack(() => () => {
			if (!marker) return;

			lngLat = marker.getLngLat();
		});

		untrack(() => marker?.on("drag", dragListener));

		return () => {
			marker?.off("drag", dragListener);

			marker?.remove();
			marker = undefined!;
		};
	});

	$effect(() => resetEventListener(marker, "dragstart", ondragstart));
	$effect(() => resetEventListener(marker, "drag", ondrag));
	$effect(() => resetEventListener(marker, "dragend", ondragend));
	$effect(() => {
		if (onclick) {
			marker?.getElement().addEventListener("click", onclick);
		}

		const prevListener = onclick;

		return () => {
			if (prevListener) {
				marker?.getElement().removeEventListener("click", prevListener);
			}
		};
	});

	$effect(() => {
		marker?.setLngLat(lngLat);
	});

	$effect(() => {
		// className
	});

	$effect(() => {
		if (offset === undefined) return;

		marker?.setOffset(offset);
	});

	$effect(() => {
		// anchor
	});

	$effect(() => {
		// color
	});

	$effect(() => {
		// scale
	});

	$effect(() => {
		marker?.setDraggable(draggable);
	});

	$effect(() => {
		// clickTolerance
	});

	$effect(() => {
		marker?.setRotation(rotation);
	});

	$effect(() => {
		marker?.setRotationAlignment(rotationAlignment);
	});

	$effect(() => {
		marker?.setPitchAlignment(pitchAlignment);
	});

	$effect(() => {
		marker?.setOpacity(opacity, opacityWhenCovered);
	});

	$effect(() => {
		if (subpixelPositioning === undefined) return;

		marker?.setSubpixelPositioning(subpixelPositioning);
	});
</script>

{#if markerState.marker}
	{@render children?.()}
{/if}
