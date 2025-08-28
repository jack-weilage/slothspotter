<script lang="ts">
	import { ReportReason, type ContentType } from "$lib/client/db/schema";
	import * as Dialog from "$lib/components/ui/dialog";
	import * as Form from "$lib/components/ui/form";
	import { Textarea } from "$lib/components/ui/textarea";
	import Turnstile from "$lib/components/ui/turnstile/turnstile.svelte";
	import { ReportContentSchema } from ".";
	import LoaderIcon from "@lucide/svelte/icons/loader-2";
	import type { Snippet } from "svelte";
	import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
	import { arktypeClient } from "sveltekit-superforms/adapters";

	let {
		open = $bindable(),
		contentType,
		contentId,
		reportContentForm,
		trigger,
	}: {
		open: boolean;
		contentType: ContentType;
		contentId: string;
		reportContentForm: SuperValidated<Infer<typeof ReportContentSchema>>;
		trigger?: Snippet<[{ props: Record<string, unknown> }]>;
	} = $props();

	const form = superForm(reportContentForm, { validators: arktypeClient(ReportContentSchema) });
	const { form: formData, enhance, submitting } = form;

	$formData.contentType = contentType;
	$formData.contentId = contentId;

	const reportReasons = [
		{
			type: ReportReason.Duplicate,
			label: "Duplicate",
			description: "This content is an exact copy of other content",
		},
		{
			type: ReportReason.NotASloth,
			label: "Not A Sloth",
			description: "This content doesn't accurately represent a stuffed sloth",
		},
		{
			type: ReportReason.Spam,
			label: "Spam",
			description: "This content is ",
		},
		{
			type: ReportReason.Other,
			label: "Other",
			description: "This content breaks the rules, but doesnt fit into any of the categories above",
		},
	];
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger child={trigger} />

	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Report Content</Dialog.Title>
		</Dialog.Header>

		<form
			method="POST"
			action="/?/reportContent"
			use:enhance={{
				onResult({ result }) {
					console.log(result);
					if (result.type === "success") {
						form.reset();
						open = false;
					}
				},
			}}
			class="space-y-4"
		>
			<Form.Fieldset {form} name="reason">
				{#each reportReasons as reason (reason.type)}
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label
								class="flex items-center rounded-xl border-2 p-4 transition-colors has-checked:border-primary has-checked:bg-primary/10"
							>
								<input
									type="radio"
									{...props}
									value={reason.type}
									bind:group={$formData.reason}
									class="sr-only"
									required
								/>
								<div class="flex flex-col">
									<p>{reason.label}</p>
									<p class="text-sm opacity-50">{reason.description}</p>
								</div>
							</Form.Label>
						{/snippet}
					</Form.Control>
				{/each}

				<Form.FieldErrors />
			</Form.Fieldset>

			<Form.Field {form} name="comment">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>
							Describe the infringing content and why you reported it
							{#if $formData.reason !== ReportReason.Other}
								(optional)
							{/if}
						</Form.Label>
						<Textarea
							{...props}
							bind:value={$formData.comment}
							maxlength={500}
							rows={3}
							placeholder="This content..."
							class="resize-none"
							required={$formData.reason === ReportReason.Other}
						/>
					{/snippet}
				</Form.Control>

				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="contentType">
				<Form.Control>
					{#snippet children({ props })}
						<input type="hidden" bind:value={$formData.contentType} {...props} />
					{/snippet}
				</Form.Control>

				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="contentId">
				<Form.Control>
					{#snippet children({ props })}
						<input type="hidden" bind:value={$formData.contentId} {...props} />
					{/snippet}
				</Form.Control>

				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="cf-turnstile-response">
				<Form.Control>
					<Turnstile
						size="flexible"
						theme="light"
						oncallback={(token) => ($formData["cf-turnstile-response"] = token)}
					/>
				</Form.Control>

				<Form.FieldErrors />
			</Form.Field>

			<Dialog.Footer class="flex gap-3">
				<Form.Button
					type="button"
					variant="outline"
					onclick={() => (open = false)}
					disabled={$submitting}
				>
					Cancel
				</Form.Button>
				<Form.Button
					type="submit"
					variant="destructive"
					disabled={$submitting}
					class="bg-amber-600 hover:bg-amber-700"
				>
					{#if $submitting}
						<LoaderIcon class="mr-2 h-4 w-4 animate-spin" />
						Submitting...
					{:else}
						Submit Report
					{/if}
				</Form.Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
