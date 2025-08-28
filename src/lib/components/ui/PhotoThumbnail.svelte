<script lang="ts">
	import { getDisplayUrl } from "$lib/client/cloudflare/images";
	import { Button } from "$lib/components/ui/button";
	import XIcon from "@lucide/svelte/icons/x";

	let {
		source,
		alt = "Photo thumbnail",
		onremove,
		class: className = "",
		removable = true,
		variant = "thumbnail",
	}: {
		source?: File | string;
		alt?: string;
		onremove?: () => void;
		class?: string;
		removable?: boolean;
		variant?: string;
	} = $props();

	// Determine the actual image source URL
	const imageUrl = $derived(source ? getDisplayUrl(source, variant) : "");
</script>

<div class="relative inline-block {className}">
	<img
		src={imageUrl}
		{alt}
		class="h-20 w-20 rounded-lg border-2 border-gray-200 object-cover"
		loading="lazy"
	/>

	{#if removable}
		<Button
			type="button"
			onclick={onremove}
			variant="destructive"
			size="icon"
			class="absolute -top-2 -right-2 h-6 w-6 cursor-pointer rounded-full shadow-lg"
			aria-label="Remove photo"
		>
			<XIcon class="h-3 w-3" />
		</Button>
	{/if}
</div>
