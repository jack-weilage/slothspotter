<script lang="ts">
	import { enhance } from "$app/forms";
	import { ModerationActionType } from "$lib/client/db/schema";
	import { Button } from "$lib/components/ui/button";
	import * as Dialog from "$lib/components/ui/dialog";
	import { Input } from "$lib/components/ui/input";
	import { Textarea } from "$lib/components/ui/textarea";
	import type { ParsedReport } from "./+page.server";

	let {
		report,
	}: {
		report: ParsedReport;
	} = $props();

	let confirmAction = $state<ModerationActionType | null>(null);
	let showConfirmDialog = $state(false);

	// Get available actions based on report type
	function getAvailableActions(type?: string) {
		const baseActions = [
			{
				type: ModerationActionType.RemoveContent,
				label: "Remove Content",
				description: "Delete the reported content",
				variant: "destructive" as const,
				icon: "🗑️",
			},
			{
				type: ModerationActionType.RestoreContent,
				label: "Restore Content",
				description: "Restore previously removed content",
				variant: "secondary" as const,
				icon: "↩️",
			},
			{
				type: ModerationActionType.WarnUser,
				label: "Warn User",
				description: "Send a warning to the content creator",
				variant: "outline" as const,
				icon: "⚠️",
			},
			{
				type: ModerationActionType.BanUser,
				label: "Ban User",
				description: "Temporarily ban the content creator",
				variant: "destructive" as const,
				icon: "🚫",
			},
		];

		// Filter actions based on content type
		switch (type) {
			case "sloth":
				return baseActions.filter((action) =>
					[
						ModerationActionType.RemoveContent,
						ModerationActionType.RestoreContent,
						ModerationActionType.WarnUser,
						ModerationActionType.BanUser,
					].includes(action.type),
				);
			case "sighting":
				return baseActions.filter((action) =>
					[
						ModerationActionType.RemoveContent,
						ModerationActionType.WarnUser,
						ModerationActionType.BanUser,
					].includes(action.type),
				);
			case "photo":
				return baseActions.filter((action) =>
					[
						ModerationActionType.RemoveContent,
						ModerationActionType.WarnUser,
						ModerationActionType.BanUser,
					].includes(action.type),
				);
			default:
				return baseActions;
		}
	}

	// Handle action confirmation
	function handleActionClick(actionType: ModerationActionType) {
		confirmAction = actionType;
		showConfirmDialog = true;
	}

	// Get action details for confirmation
	function getActionDetails(actionType: string) {
		const action = getAvailableActions(report.content?.type).find((a) => a.type === actionType);
		return action || { label: actionType, description: "", icon: "❓" };
	}

	const availableActions = $derived(getAvailableActions(report.content?.type));
</script>

<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
	{#each availableActions as action (action.type)}
		<Button
			onclick={() => handleActionClick(action.type)}
			variant={action.variant}
			size="sm"
			class="flex h-auto items-center gap-2 p-3"
		>
			<span class="text-lg">{action.icon}</span>
			<div class="flex flex-col items-start">
				<span class="font-medium">{action.label}</span>
				<span class="text-xs opacity-80">{action.description}</span>
			</div>
		</Button>
	{/each}
</div>

<!-- Confirmation Dialog -->
<Dialog.Root bind:open={showConfirmDialog}>
	<Dialog.Content class="sm:max-w-md">
		<form method="POST" action="?/executeAction" use:enhance class="contents">
			<Dialog.Header>
				<Dialog.Title class="flex items-center gap-2">
					<span class="text-2xl">{getActionDetails(confirmAction || "").icon}</span>
					Confirm Action
				</Dialog.Title>
				<Dialog.Description>
					Are you sure you want to execute this moderation action?
				</Dialog.Description>
			</Dialog.Header>

			<Textarea
				name="comment"
				id="comment"
				placeholder="Add a comment about this action..."
				required
				class="mt-4"
			/>

			{#if confirmAction}
				<div class="py-4">
					<div class="rounded-lg bg-gray-50 p-4">
						<h4 class="mb-1 font-medium text-gray-900">
							{getActionDetails(confirmAction).label}
						</h4>
						<p class="text-sm text-gray-600">
							{getActionDetails(confirmAction).description}
						</p>
					</div>

					{#if confirmAction === ModerationActionType.BanUser}
						<div class="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
							<p class="text-sm text-red-800">
								⚠️ This will ban the user for 30 days. They will not be able to create new content
								during this time.
							</p>
						</div>
					{:else if confirmAction === ModerationActionType.RemoveContent}
						<div class="mt-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
							<p class="text-sm text-yellow-800">
								⚠️ This action cannot be undone for sightings and photos. Sloths can be restored
								later.
							</p>
						</div>
					{/if}
				</div>
			{/if}

			<Dialog.Footer>
				<Input type="hidden" name="reportId" id="reportId" value={report.id} />
				<Input type="hidden" name="actionType" id="actionType" value={confirmAction} />
				<Button
					onclick={() => {
						showConfirmDialog = false;
						confirmAction = null;
					}}
					variant="ghost"
				>
					Cancel
				</Button>
				<Button
					type="submit"
					variant={confirmAction === ModerationActionType.BanUser ||
					confirmAction === ModerationActionType.RemoveContent
						? "destructive"
						: "default"}
				>
					Confirm
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
