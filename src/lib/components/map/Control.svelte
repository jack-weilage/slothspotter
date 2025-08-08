<script lang="ts">
	import maplibre from "maplibre-gl";
	import { getContext, onMount, type Snippet } from "svelte";
	import type { MapState } from "./Map.svelte";

	class SvelteControl implements maplibre.IControl {
		onAdd() {
			return container;
		}

		onRemove() {}
	}

	let {
		position = "top-right",
		control = new SvelteControl(),
		children,
	}: {
		position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
		control?: maplibre.IControl;
		children?: Snippet;
	} = $props();

	const mapState = getContext<MapState>(maplibre.Map);
	let container: HTMLDivElement;

	onMount(() => {
		mapState.map.addControl(control, position);

		return () => {
			mapState.map.removeControl(control);
		};
	});
</script>

<div bind:this={container} class="contents">
	{@render children?.()}
</div>

<style>
	/* Hide default styling */
	:global(.maplibregl-popup-content) {
		display: contents;
	}
	:global(.maplibregl-popup-close-button) {
		display: none;
	}
</style>
