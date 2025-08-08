<script lang="ts">
	import maplibre from "maplibre-gl";
	import { getContext, onMount, type Snippet } from "svelte";
	import type { MarkerState } from "./Marker.svelte";

	let {
		open = $bindable(false),
		options = {},
		onClose,
		onOpen,
		children,
	}: {
		open?: boolean;
		options?: maplibre.PopupOptions;
		onClose?: () => void;
		onOpen?: () => void;
		children?: Snippet;
	} = $props();

	const markerState = getContext<MarkerState>(maplibre.Marker);

	let popup: maplibre.Popup | undefined = $state();
	let container: HTMLDivElement = $state()!;

	onMount(() => {
		// Create popup with the slot content
		popup = new maplibre.Popup(options).setDOMContent(container);

		markerState.marker.setPopup(popup);

		// Handle popup events
		popup.on("open", () => {
			open = true;
			onOpen?.();
		});

		popup.on("close", () => {
			open = false;
			onClose?.();
		});

		return () => {
			if (open) {
				popup?.remove();
				popup = undefined;
			}
		};
	});
</script>

<!-- Hidden container that holds the slot content -->
<div bind:this={container} class="contents">
	{@render children?.()}
</div>
