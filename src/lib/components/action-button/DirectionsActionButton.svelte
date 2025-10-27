<script lang="ts">
	import SlothActionButton from "./SlothActionButton.svelte";
	import NavigationIcon from "@lucide/svelte/icons/navigation";

	let { latitude, longitude, class: className }: { latitude: number; longitude: number; class?: string } = $props();
</script>

<SlothActionButton
	href="https://www.google.com/maps/dir/?api=1&destination={latitude},{longitude}"
	target="_blank"
	rel="noopener noreferrer"
	aria-label="Directions"
	title="Directions"
	label="Directions"
	class={className}
>
	{#snippet icon()}
		<NavigationIcon />
	{/snippet}
</SlothActionButton>
