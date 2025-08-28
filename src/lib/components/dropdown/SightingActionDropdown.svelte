<script lang="ts">
	import { ContentType } from "$lib/client/db/schema";
	import { ReportContentDialog, ReportContentSchema } from "$lib/components/dialogs/report-content";
	import { Button } from "$lib/components/ui/button";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import ElipsisVertical from "@lucide/svelte/icons/ellipsis-vertical";
	import type { Infer, SuperValidated } from "sveltekit-superforms";

	let {
		sightingId,
		reportContentForm,
	}: {
		sightingId: string;
		reportContentForm: SuperValidated<Infer<typeof ReportContentSchema>>;
	} = $props();

	let reportContentDialogOpen = $state(false);
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
</DropdownMenu.Root>

<ReportContentDialog
	bind:open={reportContentDialogOpen}
	{reportContentForm}
	contentType={ContentType.Sighting}
	contentId={sightingId}
/>
