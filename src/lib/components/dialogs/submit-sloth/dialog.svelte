<script lang="ts">
	import * as Map from "$lib/components/map";
	import PhotoGrid from "$lib/components/ui/PhotoGrid.svelte";
	import PhotoThumbnail from "$lib/components/ui/PhotoThumbnail.svelte";
	import { Button } from "$lib/components/ui/button";
	import * as Card from "$lib/components/ui/card";
	import * as Dialog from "$lib/components/ui/dialog";
	import * as Form from "$lib/components/ui/form";
	import { Progress } from "$lib/components/ui/progress";
	import { Textarea } from "$lib/components/ui/textarea";
	import { Turnstile } from "$lib/components/ui/turnstile";
	import { SubmitSlothSchema } from ".";
	import CheckIcon from "@lucide/svelte/icons/check";
	import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
	import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
	import LoaderIcon from "@lucide/svelte/icons/loader-2";
	import maplibre from "maplibre-gl";
	import type { Snippet } from "svelte";
	import type { Infer, SuperValidated } from "sveltekit-superforms";
	import { superForm } from "sveltekit-superforms";
	import { arktypeClient } from "sveltekit-superforms/adapters";

	let {
		open = $bindable(),
		submitSlothForm,
		initialLocation = [-122.478, 48.754],
		trigger,
	}: {
		open: boolean;
		submitSlothForm: SuperValidated<Infer<typeof SubmitSlothSchema>>;
		initialLocation?: maplibre.LngLatLike;
		trigger: Snippet<[{ props: Record<string, unknown> }]>;
	} = $props();

	const form = superForm(submitSlothForm, { validators: arktypeClient(SubmitSlothSchema) });
	const { form: formData, enhance, submitting } = form;

	let currentStep = $state(1);
	const totalSteps = 3;
	let fileInput: HTMLInputElement | undefined = $state();

	function handleMapClick(e: maplibre.MapMouseEvent) {
		e.target.panTo(e.lngLat);

		$formData.longitude = e.lngLat.lng;
		$formData.latitude = e.lngLat.lat;
	}

	function nextStep() {
		if (currentStep < totalSteps) {
			currentStep++;
		}
	}

	function prevStep() {
		if (currentStep > 1) {
			currentStep--;
		}
	}

	const canProceedFromStep1 = $derived($formData.photos && $formData.photos.length > 0);
	const canProceedFromStep2 = $derived($formData.latitude && $formData.longitude);
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger child={trigger} />
	<Dialog.Content class="max-h-[100dvh] w-full max-w-2xl overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Report a Sloth - Step {currentStep} of {totalSteps}</Dialog.Title>
			<div class="mt-2">
				<Progress value={(currentStep / totalSteps) * 100} class="w-full" />
			</div>
		</Dialog.Header>

		<form
			method="POST"
			action="/?/submitSloth"
			enctype="multipart/form-data"
			use:enhance={{
				onResult({ result }) {
					if (result.type === "success") {
						currentStep = 1;
						form.reset();
						open = false;
					}
				},
			}}
			class="space-y-6"
		>
			<!-- Step 1: Photo Upload -->
			<div class="space-y-4 {currentStep !== 1 && 'hidden'}">
				<h3 class="mb-2 text-center text-lg font-semibold">Add Photos</h3>

				<Form.Field {form} name="photos">
					<Form.Description class="text-center">
						Add up to 3 photos. At least one photo is required.
					</Form.Description>
					<Form.Control>
						{#snippet children({ props })}
							<input
								{...props}
								type="file"
								accept="image/*"
								capture="environment"
								multiple
								oninput={(e) => {
									$formData.photos = [
										...$formData.photos,
										...Array.from(e.currentTarget?.files || []),
									].slice(0, 3);
								}}
								bind:this={fileInput}
								class="sr-only"
							/>
						{/snippet}
					</Form.Control>

					<PhotoGrid
						maxPhotos={3}
						bind:photos={$formData.photos}
						onaddphoto={() => fileInput?.click()}
					/>

					<Form.FieldErrors />
				</Form.Field>
			</div>

			<!-- Step 2: Location and Details -->
			<div class="space-y-4 {currentStep !== 2 && 'hidden'}">
				<div class="text-center">
					<h3 class="mb-2 text-lg font-semibold">Set Location</h3>
					<p class="text-sm text-gray-600">Click on the map to mark where you spotted the sloth</p>
				</div>

				<div class="h-64 overflow-hidden rounded-lg border">
					<Map.Root
						style="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
						validateStyle={false}
						attributionControl={false}
						center={initialLocation}
						zoom={16}
						onclick={handleMapClick}
					>
						<Map.Control position="top-right" control={new maplibre.NavigationControl()} />
						<Map.Control
							position="top-right"
							control={new maplibre.GeolocateControl({ trackUserLocation: true })}
						/>
						{#if $formData.longitude && $formData.latitude}
							<Map.Marker lngLat={[$formData.longitude, $formData.latitude]} color="#D97706" />
						{/if}
					</Map.Root>
				</div>

				{#if $formData.longitude && $formData.latitude}
					<div class="text-center text-sm text-green-600">
						<CheckIcon class="mr-1 inline h-4 w-4" />
						Location selected
					</div>
				{:else}
					<div class="text-center text-sm text-gray-500">Click on the map to set the location</div>
				{/if}

				<Form.Field {form} name="notes">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Additional Notes (optional)</Form.Label>
							<Textarea
								{...props}
								bind:value={$formData.notes}
								placeholder="Describe what you observed about the sloth..."
								rows={3}
								maxlength={500}
							/>
						{/snippet}
					</Form.Control>
					<Form.Description>
						Optional details about the sloth's size, surroundings, or appearance (max 500
						characters)
					</Form.Description>

					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="latitude">
					<Form.Control>
						{#snippet children({ props })}
							<input {...props} type="hidden" bind:value={$formData.latitude} />
						{/snippet}
					</Form.Control>

					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="longitude">
					<Form.Control>
						{#snippet children({ props })}
							<input {...props} type="hidden" bind:value={$formData.longitude} />
						{/snippet}
					</Form.Control>

					<Form.FieldErrors />
				</Form.Field>
			</div>

			<!-- Step 3: Confirmation -->
			<div class="space-y-6 {currentStep !== 3 && 'hidden'}">
				<div class="text-center">
					<h3 class="mb-2 text-lg font-semibold">Confirm Your Report</h3>
					<p class="text-sm text-gray-600">Review your sloth sighting before submitting</p>
				</div>

				<Card.Root>
					<Card.Header>
						<Card.Title class="text-base">Sighting Summary</Card.Title>
					</Card.Header>
					<Card.Content class="space-y-4">
						<div>
							<h4 class="mb-2 text-sm font-medium text-gray-700">
								Photos ({$formData.photos.length})
							</h4>
							{#each $formData.photos as photo, index (index)}
								<PhotoThumbnail source={photo} alt="Selected photo {index + 1}" removable={false} />
							{/each}
						</div>

						{#if $formData.latitude && $formData.longitude}
							<div>
								<h4 class="mb-2 text-sm font-medium text-gray-700">Location</h4>
								<div class="h-32 overflow-hidden rounded border">
									<Map.Root
										style="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
										validateStyle={false}
										attributionControl={false}
										center={[$formData.longitude, $formData.latitude]}
										zoom={16}
										interactive={false}
									>
										<Map.Marker
											lngLat={[$formData.longitude, $formData.latitude]}
											color="#D97706"
										/>
									</Map.Root>
								</div>
							</div>
						{/if}

						{#if $formData.notes && $formData.notes.trim()}
							<div>
								<h4 class="mb-2 text-sm font-medium text-gray-700">Notes</h4>
								<p class="rounded bg-gray-50 p-3 text-sm text-gray-600">{$formData.notes}</p>
							</div>
						{/if}
					</Card.Content>
				</Card.Root>

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

			<Dialog.Footer>
				{#if currentStep > 1}
					<Button type="button" variant="ghost" onclick={prevStep}>
						<ChevronLeftIcon class="mr-2 h-4 w-4" />
						Back
					</Button>
				{/if}

				{#if currentStep < totalSteps}
					<Button
						type="button"
						onclick={nextStep}
						disabled={(currentStep === 1 && !canProceedFromStep1) ||
							(currentStep === 2 && !canProceedFromStep2)}
					>
						Next
						<ChevronRightIcon class="ml-2 h-4 w-4" />
					</Button>
				{:else}
					<Form.Button type="submit" disabled={$submitting}>
						{#if $submitting}
							<LoaderIcon class="mr-2 h-4 w-4 animate-spin" />
							Submitting...
						{:else}
							Submit Report
						{/if}
					</Form.Button>
				{/if}
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
