<script lang="ts">
	import type { MarkerState } from "./Marker.svelte";
	import { resetEventListener } from "./utils";
	import maplibre from "maplibre-gl";
	import type { Snippet } from "svelte";
	import { getContext, untrack } from "svelte";

	interface Props extends maplibre.PopupOptions {
		// Binds
		popup?: maplibre.Popup;
		// Events
		// https://maplibre.org/maplibre-gl-js/docs/API/classes/Popup/#events
		onopen?: maplibre.Listener;
		onclose?: maplibre.Listener;
		// Popup content
		children?: Snippet;
	}

	let {
		popup = $bindable(),
		// Dynamically settable props
		offset,
		maxWidth,
		subpixelPositioning,

		onopen,
		onclose,

		children,

		// Non-dynamic props
		...restProps
	}: Props = $props();

	const markerState = getContext<MarkerState>(maplibre.Marker);

	let container: HTMLDivElement = $state()!;

	$effect(() => {
		const dynamicProps = untrack(() => ({
			offset,
			maxWidth,
			subpixelPositioning,
		}));

		// Create popup with the slot content
		popup = new maplibre.Popup({ ...dynamicProps, ...restProps }).setDOMContent(container);

		// TODO: add to map if no marker available
		markerState.marker.setPopup(untrack(() => popup));

		return () => {
			popup?.remove();
			popup = undefined!;
		};
	});

	$effect(() => resetEventListener(popup, "open", onopen));
	$effect(() => resetEventListener(popup, "close", onclose));

	$effect(() => {
		popup?.setOffset(offset);
	});

	$effect(() => {
		if (maxWidth === undefined) return;

		popup?.setMaxWidth(maxWidth);
	});

	$effect(() => {
		if (subpixelPositioning === undefined) return;

		popup?.setSubpixelPositioning(subpixelPositioning);
	});
</script>

<!-- Hidden container that holds the slot content -->
<div bind:this={container} class="contents">
	{@render children?.()}
</div>

<style>
	:global(.maplibregl-popup-content) {
		display: contents;
	}
</style>
