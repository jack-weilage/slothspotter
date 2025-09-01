<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import * as Dialog from "$lib/components/ui/dialog";
	import InfoIcon from "@lucide/svelte/icons/info";
</script>

<Dialog.Root>
	<Dialog.Trigger aria-label="Open about dialog">
		<InfoIcon class="size-full [&_circle]:hidden" />
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>About SlothSpotter</Dialog.Title>
			<Dialog.Description>
				This is a community map for discovering and reporting stuffed sloths around Bellingham,
				Washington. Help track where these cozy creatures hang out!
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-2 text-sm">
			<p class="font-medium">Submission rules</p>
			<ul class="list-disc space-y-1 pl-5">
				<li>Must be a stuffed sloth — not a sticker, sign, or drawing.</li>
				<li>Must be stationary — not in a car or being carried.</li>
				<li>No people in the photo unless they explicitly consented.</li>
			</ul>
			<p class="text-muted-foreground">
				By using SlothSpotter, you agree to our
				<a href="/privacy" class="text-primary underline underline-offset-4 hover:no-underline">
					Privacy Policy
				</a>.
			</p>
		</div>

		<Dialog.Footer>
			<Dialog.Close>
				<Button variant="secondary">Close</Button>
			</Dialog.Close>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
