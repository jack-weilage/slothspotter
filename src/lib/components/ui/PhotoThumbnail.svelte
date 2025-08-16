<script lang="ts">
	import XIcon from "@lucide/svelte/icons/x";
	import { getDisplayUrl } from "$lib/utils/image-urls";
	import { Button } from "$lib/components/ui/button";

	let {
		src,
		source,
		alt = "Photo thumbnail",
		onRemove,
		onClick,
		class: className = "",
		removable = true,
		variant = "thumbnail",
	}: {
		src?: string;
		source?: File | string;
		alt?: string;
		onRemove?: () => void;
		onClick?: () => void;
		class?: string;
		removable?: boolean;
		variant?: string;
	} = $props();

	// Determine the actual image source URL
	const imageUrl = $derived(src || (source ? getDisplayUrl(source, variant) : ""));
</script>

<div class="relative inline-block {className}">
	{#if onClick}
		<Button type="button" onclick={onClick} variant="ghost" class="h-auto w-auto p-0">
			<img
				src={imageUrl}
				{alt}
				class="h-20 w-20 cursor-pointer rounded-lg border-2 border-gray-200 object-cover transition-colors hover:border-gray-300"
				loading="lazy"
			/>
		</Button>
	{:else}
		<img
			src={imageUrl}
			{alt}
			class="h-20 w-20 rounded-lg border-2 border-gray-200 object-cover"
			loading="lazy"
		/>
	{/if}

	{#if removable && onRemove}
		<Button
			type="button"
			onclick={onRemove}
			variant="destructive"
			size="icon"
			class="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-lg"
			aria-label="Remove photo"
		>
			<XIcon class="h-3 w-3" />
		</Button>
	{/if}
</div>
