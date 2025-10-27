<script lang="ts">
	import type { ContentType } from "$lib/client/db/schema";
	import { LoginDialog } from "$lib/components/dialogs/login";
	import { ReportContentDialog, ReportContentSchema } from "$lib/components/dialogs/report-content";
	import SlothActionButton from "./SlothActionButton.svelte";
	import FlagIcon from "@lucide/svelte/icons/flag";
	import type { Infer, SuperValidated } from "sveltekit-superforms";

	let {
		isLoggedIn,
		contentType,
		contentId,
		reportContentForm,
		class: className,
	}: {
		isLoggedIn: boolean;
		contentType: ContentType;
		contentId: string;
		reportContentForm: SuperValidated<Infer<typeof ReportContentSchema>>;
		class?: string;
	} = $props();

	let reportContentDialogOpen = $state(false);
</script>

<SlothActionButton
	onclick={() => (reportContentDialogOpen = true)}
	aria-label="Report content"
	title="Report content"
	label="Report"
	class={className}
>
	{#snippet icon()}
		<FlagIcon />
	{/snippet}
</SlothActionButton>

{#if isLoggedIn}
	<ReportContentDialog
		bind:open={reportContentDialogOpen}
		{reportContentForm}
		{contentType}
		{contentId}
	/>
{:else}
	<LoginDialog bind:open={reportContentDialogOpen} />
{/if}
