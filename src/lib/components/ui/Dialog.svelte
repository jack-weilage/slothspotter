<script lang="ts">
	import type { Snippet } from "svelte";
	import XIcon from "@lucide/svelte/icons/x";
	import { Button } from "$lib/components/ui/button";

	let {
		open = $bindable(false),
		title,
		showCloseButton = true,
		onclose,
		class: className = "",
		children,
	}: {
		open?: boolean;
		title?: string;
		showCloseButton?: boolean;
		onclose?: () => void;
		class?: string;
		children?: Snippet;
	} = $props();

	let dialog: HTMLDialogElement;

	$effect(() => {
		if (open) {
			dialog?.showModal();
		} else {
			dialog?.close();
		}
	});

	function closeDialog() {
		open = false;
		onclose?.();
	}

	function handleDialogClose() {
		open = false;
		onclose?.();
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === dialog) {
			closeDialog();
		}
	}
</script>

<dialog
	bind:this={dialog}
	onclose={handleDialogClose}
	onclick={handleBackdropClick}
	class="backdrop:bg-opacity-50 mx-auto my-auto rounded-lg p-0 shadow-xl backdrop:bg-black {className}"
>
	<div class="w-full">
		{#if title || showCloseButton}
			<div class="flex items-center justify-between border-b border-gray-200 p-4">
				{#if title}
					<h2 class="text-lg font-semibold text-gray-900">{title}</h2>
				{:else}
					<div></div>
				{/if}

				{#if showCloseButton}
					<Button
						type="button"
						onclick={closeDialog}
						variant="ghost"
						size="icon"
						class="h-8 w-8 text-gray-400 hover:text-gray-600"
						aria-label="Close dialog"
					>
						<XIcon class="h-6 w-6" />
					</Button>
				{/if}
			</div>
		{/if}

		<div class="p-4">
			{@render children?.()}
		</div>
	</div>
</dialog>
