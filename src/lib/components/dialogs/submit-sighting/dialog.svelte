<script lang="ts">
	import { SlothStatus } from "$lib/client/db/schema";
	import PhotoGrid from "$lib/components/ui/PhotoGrid.svelte";
	import { Button } from "$lib/components/ui/button";
	import * as Dialog from "$lib/components/ui/dialog";
	import * as Form from "$lib/components/ui/form";
	import { Textarea } from "$lib/components/ui/textarea";
	import Turnstile from "$lib/components/ui/turnstile/turnstile.svelte";
	import { SubmitSightingSchema } from ".";
	import LoaderIcon from "@lucide/svelte/icons/loader-2";
	import type { Snippet } from "svelte";
	import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
	import { arktypeClient } from "sveltekit-superforms/adapters";

	let {
		open = $bindable(),
		submitSightingForm,
		trigger,
	}: {
		open: boolean;
		submitSightingForm: SuperValidated<Infer<typeof SubmitSightingSchema>>;
		trigger: Snippet<[{ props: Record<string, unknown> }]>;
	} = $props();

	const form = superForm(submitSightingForm, { validators: arktypeClient(SubmitSightingSchema) });
	const { form: formData, enhance, submitting } = form;

	let fileInput: HTMLInputElement = $state()!;

	const MAX_PHOTOS = 3;

	const slothStatusOptions = [
		{
			status: SlothStatus.Active,
			label: "Confirmation",
			description: "I spotted an existing sloth (with new photos)",
		},
		{
			status: SlothStatus.Removed,
			label: "Sloth Removed",
			description: "This sloth is no longer at this location",
		},
	];
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger child={trigger} />
	<Dialog.Content class="max-w-lg">
		<form
			method="POST"
			action="?/submitSighting"
			enctype="multipart/form-data"
			use:enhance={{
				onResult({ result }) {
					if (result.type === "success") {
						form.reset();
						open = false;
					}
				},
			}}
			class="space-y-4"
		>
			<Dialog.Header>
				<Dialog.Title>Submit Sloth Sighting</Dialog.Title>
				<Dialog.Description>Share your sloth discovery with the community!</Dialog.Description>
			</Dialog.Header>

			<div class="space-y-4">
				<Form.Fieldset {form} name="slothStatus">
					{#each slothStatusOptions as option (option.status)}
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label
									class="flex items-center rounded-xl border-2 p-4 transition-colors has-checked:border-primary has-checked:bg-primary/10"
								>
									<input
										type="radio"
										{...props}
										value={option.status}
										bind:group={$formData.slothStatus}
										class="sr-only"
									/>
									<div class="flex flex-col">
										<p>{option.label}</p>
										<p class="text-sm opacity-50">{option.description}</p>
									</div>
								</Form.Label>
							{/snippet}
						</Form.Control>
					{/each}

					<Form.FieldErrors />
				</Form.Fieldset>

				<Form.Field {form} name="photos">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Add up to 3 photos.</Form.Label>

							<input
								{...props}
								type="file"
								accept="image/*"
								capture="environment"
								multiple
								oninput={({ currentTarget }) => {
									$formData.photos = [
										...$formData.photos,
										...Array.from(currentTarget?.files || []),
									].slice(0, MAX_PHOTOS);
								}}
								bind:this={fileInput}
								class="sr-only"
							/>
						{/snippet}
					</Form.Control>

					<PhotoGrid
						maxPhotos={MAX_PHOTOS}
						bind:photos={$formData.photos}
						onaddphoto={() => fileInput.click()}
					/>

					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="notes">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Notes (optional)</Form.Label>
							<Textarea
								{...props}
								bind:value={$formData.notes}
								rows={3}
								maxlength={500}
								placeholder="Any additional details about this sighting..."
								class="resize-none"
							/>
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
			</div>

			<Dialog.Footer class="flex gap-3">
				<Button
					type="button"
					variant="outline"
					onclick={() => (open = false)}
					disabled={$submitting}
				>
					Cancel
				</Button>
				<Form.Button type="submit" disabled={$submitting}>
					{#if $submitting}
						<LoaderIcon class="mr-2 h-4 w-4 animate-spin" />
						Submitting...
					{:else}
						Submit Sighting
					{/if}
				</Form.Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
