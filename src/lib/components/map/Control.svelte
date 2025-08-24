<script lang="ts">
	import type { MapState } from "./Map.svelte";
	import maplibre from "maplibre-gl";
	import type { Snippet } from "svelte";
	import { getContext } from "svelte";

	class SvelteControl implements maplibre.IControl {
		onAdd() {
			return container;
		}

		onRemove() {}
	}

	let {
		control = $bindable(new SvelteControl()),

		position = "top-right",

		children,
	}: {
		// Binds
		control?: maplibre.IControl;

		position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";

		// Control content
		children?: Snippet;
	} = $props();

	const mapState = getContext<MapState>(maplibre.Map);
	let container: HTMLDivElement;

	$effect(() => {
		mapState.map.addControl(control, position);

		return () => {
			mapState.map.removeControl(control);
		};
	});
</script>

<div bind:this={container} class="contents">
	{@render children?.()}
</div>
