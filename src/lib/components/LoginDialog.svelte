<script lang="ts">
	import Dialog from "$lib/components/ui/Dialog.svelte";
	import GoogleIcon from "$lib/components/icons/GoogleIcon.svelte";

	let { open = $bindable(false) } = $props();
</script>

<Dialog bind:open title="Log in to SlothSpotter">
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
</Dialog>
