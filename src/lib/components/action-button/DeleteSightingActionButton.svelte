<script lang="ts">
	import { enhance } from "$app/forms";
	import { Button } from "$lib/components/ui/button";
	import * as Dialog from "$lib/components/ui/dialog";
	import SlothActionButton from "./SlothActionButton.svelte";
	import TrashIcon from "@lucide/svelte/icons/trash-2";

	let { sightingId, class: className }: { sightingId: string; class?: string } = $props();

	let deleteSightingDialogOpen = $state(false);
</script>

<SlothActionButton
	onclick={() => (deleteSightingDialogOpen = true)}
	aria-label="Delete sighting"
	title="Delete sighting"
	label="Delete"
	class={className}
>
	{#snippet icon()}
		<TrashIcon />
	{/snippet}
</SlothActionButton>

<Dialog.Root bind:open={deleteSightingDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Confirm Deletion</Dialog.Title>
			<Dialog.Description>Are you sure you want to delete this sighting?</Dialog.Description>
		</Dialog.Header>

		<Dialog.Footer>
			<Dialog.Close>Cancel</Dialog.Close>
			<form method="POST" action="?/deleteSighting" use:enhance>
				<input type="hidden" name="sightingId" id="sightingId" value={sightingId} />

				<Button type="submit" variant="destructive">Confirm</Button>
			</form>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
