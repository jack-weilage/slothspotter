<script lang="ts">
	import SlothActionButton from "./SlothActionButton.svelte";
	import CameraIcon from "@lucide/svelte/icons/camera";

	let { onclick, class: className }: { onclick: () => void; class?: string } = $props();
</script>

<SlothActionButton
	{onclick}
	aria-label="Add sighting"
	title="Add sighting"
	label="Report"
	class={className}
>
	{#snippet icon()}
		<CameraIcon />
	{/snippet}
</SlothActionButton>
