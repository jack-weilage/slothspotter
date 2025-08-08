<script lang="ts">
	import XIcon from "@lucide/svelte/icons/x";
	import GoogleIcon from "$lib/components/icons/GoogleIcon.svelte";

	let { open = $bindable(false) } = $props();
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
	}

	function handleDialogClose() {
		open = false;
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
	class="backdrop:bg-opacity-50 mx-auto my-auto rounded-lg p-0 shadow-xl backdrop:bg-black"
>
	<div class="w-full max-w-md p-6">
		<div class="mb-4 flex items-center justify-between">
			<h2 class="text-xl font-semibold text-gray-900">Log in to SlothSpotter</h2>
			<button
				onclick={closeDialog}
				class="text-gray-400 transition-colors hover:text-gray-600"
				aria-label="Close dialog"
			>
				<XIcon class="h-6 w-6" />
			</button>
		</div>

		<div class="space-y-4">
			<p class="text-sm text-gray-600">
				By logging in, you gain the ability to report new sloths and spot known ones.
			</p>

			<a
				href="/auth/login/google"
				class="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
			>
				<GoogleIcon class="h-5 w-5" />
				Log in with Google
			</a>
		</div>
	</div>
</dialog>
