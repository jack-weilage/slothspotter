<script lang="ts">
	import GoogleIcon from "$lib/components/icons/GoogleIcon.svelte";
	import { Button } from "$lib/components/ui/button";
	import * as Dialog from "$lib/components/ui/dialog";
	import type { Snippet } from "svelte";

	let {
		open = $bindable(),
		trigger,
	}: {
		open: boolean;
		trigger?: Snippet<[{ props: Record<string, unknown> }]>;
	} = $props();
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger child={trigger} />
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Log in to SlothSpotter</Dialog.Title>
			<Dialog.Description>
				Logging in allows you to report new sloth sightings and manage your existing reports.
			</Dialog.Description>
		</Dialog.Header>

		<div>
			<Button variant="outline" href="/auth/login/google" class="w-full">
				<GoogleIcon class="size-5" />
				Log in with Google
			</Button>
		</div>

		<p class="text-sm text-muted-foreground">
			By using SlothSpotter, you agree to our
			<a href="/privacy" class="text-primary underline underline-offset-4 hover:no-underline">
				Privacy Policy
			</a>.
		</p>
	</Dialog.Content>
</Dialog.Root>
