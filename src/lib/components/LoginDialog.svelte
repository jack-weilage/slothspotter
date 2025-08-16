<script lang="ts" module>
	let open = $state(false);

	export function openLoginDialog() {
		open = true;
	}
</script>

<script lang="ts">
	import * as Dialog from "$lib/components/ui/dialog";
	import { Button } from "$lib/components/ui/button";
	import GoogleIcon from "$lib/components/icons/GoogleIcon.svelte";
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Log in to SlothSpotter</Dialog.Title>
			<Dialog.Description>
				By logging in, you gain the ability to report new sloths and spot known ones.
			</Dialog.Description>
		</Dialog.Header>
		<div>
			<Button href="/auth/login/google" class="w-full">
				<GoogleIcon class="h-5 w-5" />
				Log in with Google
			</Button>
		</div>
	</Dialog.Content>
</Dialog.Root>
