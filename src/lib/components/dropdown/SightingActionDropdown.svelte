<script lang="ts">
	import { enhance } from "$app/forms";
	import { ContentType, UserRole } from "$lib/client/db/schema";
	import { LoginDialog } from "$lib/components/dialogs/login";
	import { ReportContentDialog, ReportContentSchema } from "$lib/components/dialogs/report-content";
	import { Button } from "$lib/components/ui/button";
	import * as Dialog from "$lib/components/ui/dialog";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import ElipsisVertical from "@lucide/svelte/icons/ellipsis-vertical";
	import type { Infer, SuperValidated } from "sveltekit-superforms";

	let {
		isLoggedIn,
		sightingId,
		isOwned,
		reportContentForm,
	}: {
		isLoggedIn: boolean;
		sightingId: string;
		isOwned: boolean;
		reportContentForm: SuperValidated<Infer<typeof ReportContentSchema>>;
	} = $props();

	let reportContentDialogOpen = $state(false);
	let deleteSightingDialogOpen = $state(false);
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button variant="secondary" {...props} size="icon">
				<ElipsisVertical />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Item onclick={() => (reportContentDialogOpen = true)}>Report</DropdownMenu.Item>
	</DropdownMenu.Content>
	{#if isOwned}
		<DropdownMenu.Content>
			<DropdownMenu.Item variant="destructive" onclick={() => (deleteSightingDialogOpen = true)}>
				Delete
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	{/if}
</DropdownMenu.Root>

{#if isLoggedIn}
	<ReportContentDialog
		bind:open={reportContentDialogOpen}
		{reportContentForm}
		contentType={ContentType.Sighting}
		contentId={sightingId}
	/>
{:else}
	<LoginDialog bind:open={reportContentDialogOpen} />
{/if}

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
