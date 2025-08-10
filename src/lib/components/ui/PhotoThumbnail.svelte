<script lang="ts">
	import XIcon from "@lucide/svelte/icons/x";
	import { getDisplayUrl } from "$lib/utils/image-urls";

	let {
		src,
		source,
		alt = "Photo thumbnail",
		onRemove,
		onClick,
		class: className = "",
		removable = true,
		variant = "thumbnail",
		accountHash,
	}: {
		src?: string;
		source?: File | string;
		alt?: string;
		onRemove?: () => void;
		onClick?: () => void;
		class?: string;
		removable?: boolean;
		variant?: string;
		accountHash?: string;
	} = $props();

	// Determine the actual image source URL
	const imageUrl = $derived(src || (source ? getDisplayUrl(source, variant, accountHash) : ""));
</script>

<div class="relative inline-block {className}">
	{#if onClick}
		<button type="button" onclick={onClick} class="block">
			<img
				src={imageUrl}
				{alt}
				class="h-20 w-20 cursor-pointer rounded-lg border-2 border-gray-200 object-cover transition-colors hover:border-gray-300"
				loading="lazy"
			/>
		</button>
	{:else}
		<img
			src={imageUrl}
			{alt}
			class="h-20 w-20 rounded-lg border-2 border-gray-200 object-cover"
			loading="lazy"
		/>
	{/if}

	{#if removable && onRemove}
		<button
			type="button"
			onclick={onRemove}
			class="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-colors hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
			aria-label="Remove photo"
		>
			<XIcon class="h-3 w-3" />
		</button>
	{/if}
</div>
