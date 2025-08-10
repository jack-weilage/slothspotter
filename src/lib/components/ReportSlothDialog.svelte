<script lang="ts">
	import type { LngLatLike } from "maplibre-gl";

	import maplibre from "maplibre-gl";
	import Dialog from "./ui/Dialog.svelte";
	import PhotoGrid from "./ui/PhotoGrid.svelte";
	import PhotoThumbnail from "./ui/PhotoThumbnail.svelte";
	import Map from "./map/Map.svelte";
	import Marker from "./map/Marker.svelte";
	import { enhance } from "$app/forms";
	import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
	import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
	import CheckIcon from "@lucide/svelte/icons/check";
	import LoaderIcon from "@lucide/svelte/icons/loader-2";
	import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";
	import Control from "./map/Control.svelte";

	let {
		open = $bindable(false),
		initialLocation,
		onClose,
		onSubmitSuccess,
	}: {
		open?: boolean;
		initialLocation?: LngLatLike;
		onClose?: () => void;
		onSubmitSuccess?: () => void;
	} = $props();

	let step = $state(1);
	let photos: File[] = $state([]);
	let location: LngLatLike = $state(initialLocation || [-122.478, 48.754]);
	let notes = $state("");
	let isSubmitting = $state(false);
	let errorMessage = $state("");
	let uploadProgress = $state({ current: 0, total: 0, message: "" });
	let fileInput: HTMLInputElement = $state()!;

	const MAX_PHOTOS = 3;

	function resetDialog() {
		step = 1;
		photos = [];
		notes = "";
		isSubmitting = false;
		errorMessage = "";
		uploadProgress = { current: 0, total: 0, message: "" };
		if (initialLocation) {
			location = initialLocation;
		}
	}

	function handleClose() {
		resetDialog();
		open = false;
		onClose?.();
	}

	function nextStep() {
		if (step < 3) step++;
	}

	function prevStep() {
		if (step > 1) step--;
	}

	function openFileInput() {
		fileInput.click();
	}

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const files = target.files;

		if (files) {
			const newFiles = Array.from(files).slice(0, MAX_PHOTOS - photos.length);
			photos = [...photos, ...newFiles];
		}

		// Reset input so the same file can be selected again
		target.value = "";
	}

	function removePhoto(index: number) {
		photos.splice(index, 1);
		photos = [...photos];
	}

	function canProceed() {
		switch (step) {
			case 1:
				return photos.length > 0 && photos.length <= MAX_PHOTOS;
			case 2:
				return location && photos.length > 0;
			case 3:
				return photos.length > 0 && !isSubmitting;
			default:
				return false;
		}
	}

	function handleMapClick(event: CustomEvent<{ lngLat: LngLatLike }>) {
		location = event.detail.lngLat;
	}

	// Reset when dialog opens
	$effect(() => {
		if (open && initialLocation) {
			location = initialLocation;
		}
	});
</script>

<Dialog bind:open title="Report a Sloth" onclose={handleClose} class="w-full max-w-lg">
	<div class="min-h-[400px]">
		<!-- Progress indicator -->
		<div class="mb-6">
			<div class="flex items-center justify-between">
				{#each [1, 2, 3] as stepNum}
					<div class="flex items-center {stepNum < 3 ? 'flex-1' : ''}">
						<div
							class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium {step >=
							stepNum
								? 'bg-amber-600 text-white'
								: 'bg-gray-200 text-gray-600'}"
						>
							{#if step > stepNum}
								<CheckIcon class="h-4 w-4" />
							{:else}
								{stepNum}
							{/if}
						</div>
						{#if stepNum < 3}
							<div class="mx-2 h-0.5 flex-1 bg-gray-200">
								<div
									class="h-full bg-amber-600 transition-all duration-300 {step > stepNum
										? 'w-full'
										: 'w-0'}"
								></div>
							</div>
						{/if}
					</div>
				{/each}
			</div>
			<div class="mt-2 text-center">
				<span class="text-sm text-gray-600">
					{step === 1 ? "Add Photos" : step === 2 ? "Set Location" : "Submit Report"}
				</span>
			</div>
		</div>

		<!-- Step 1: Photo Upload -->
		{#if step === 1}
			<div class="space-y-4">
				<h3 class="text-lg font-medium">Take or Upload Photos</h3>
				<p class="text-sm text-gray-600">
					Add up to {MAX_PHOTOS} photos of the sloth. At least one photo is required.
				</p>

				<input
					bind:this={fileInput}
					type="file"
					accept="image/*"
					capture="environment"
					multiple
					onchange={handleFileSelect}
					class="hidden"
				/>
				<PhotoGrid
					bind:photos
					maxPhotos={MAX_PHOTOS}
					onAddPhoto={openFileInput}
					onRemovePhoto={removePhoto}
				/>
			</div>
		{/if}

		<!-- Step 2: Location and Details -->
		{#if step === 2}
			<div class="space-y-4">
				<h3 class="text-lg font-medium">Set Location & Add Details</h3>

				<!-- Photo thumbnails (compact view) -->
				<div class="flex flex-wrap gap-2">
					{#each photos as photo, index}
						<PhotoThumbnail
							source={photo}
							alt="Photo {index + 1}"
							onRemove={() => removePhoto(index)}
							class="h-16 w-16"
						/>
					{/each}
				</div>

				<!-- Map for location selection -->
				<div class="space-y-2">
					<p class="block text-sm font-medium text-gray-700">Drag the pin to the exact location</p>
					<div class="h-48 overflow-hidden rounded-lg border border-gray-300">
						<Map
							options={{
								style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
								center: location,
								zoom: 16,
							}}
							onclick={handleMapClick}
						>
							<Control
								position="top-right"
								control={new maplibre.GeolocateControl({ trackUserLocation: true })}
							/>
							<Marker
								lngLat={location}
								options={{ color: "#D97706", draggable: true }}
								ondragend={(event) => (location = event.detail.lngLat)}
							/>
						</Map>
					</div>
				</div>

				<!-- Notes -->
				<div class="space-y-2">
					<label for="notes" class="block text-sm font-medium text-gray-700">
						Notes (optional)
					</label>
					<textarea
						id="notes"
						bind:value={notes}
						rows="3"
						maxlength="500"
						class="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
						placeholder="Any additional details about this sloth..."
					></textarea>
				</div>
			</div>
		{/if}

		<!-- Step 3: Submit -->
		{#if step === 3}
			<div class="space-y-4">
				<h3 class="text-lg font-medium">Submit Your Report</h3>

				<div class="space-y-3 rounded-lg bg-gray-50 p-4">
					<div>
						<span class="text-sm font-medium text-gray-700">Photos:</span>
						<div class="mt-2 flex flex-wrap gap-2">
							{#each photos as photo, index}
								<PhotoThumbnail
									source={photo}
									alt="Photo {index + 1}"
									removable={false}
									class="h-16 w-16"
								/>
							{/each}
						</div>
					</div>

					<div>
						<span class="text-sm font-medium text-gray-700">Location:</span>
						<p class="text-sm text-gray-600">
							{Array.isArray(location)
								? `${location[1].toFixed(6)}, ${location[0].toFixed(6)}`
								: `${location.lat.toFixed(6)}, ${(location as any).lng?.toFixed(6) || (location as any).lon?.toFixed(6)}`}
						</p>
					</div>

					{#if notes}
						<div>
							<span class="text-sm font-medium text-gray-700">Notes:</span>
							<p class="text-sm text-gray-600">{notes}</p>
						</div>
					{/if}
				</div>

				{#if errorMessage}
					<div class="mb-4 rounded-md bg-red-50 p-4">
						<div class="flex">
							<AlertCircleIcon class="h-5 w-5 text-red-400" />
							<div class="ml-3">
								<p class="text-sm text-red-800">{errorMessage}</p>
							</div>
						</div>
					</div>
				{/if}

				<form
					method="POST"
					action="?/reportSloth"
					enctype="multipart/form-data"
					use:enhance={({ formData }) => {
						isSubmitting = true;
						errorMessage = "";
						uploadProgress = { current: 0, total: photos.length, message: "Uploading photos..." };

						// Add photos to form data
						photos.forEach((photo, index) => {
							formData.append(`photos`, photo, index.toString());
						});

						// Add location
						const coords = Array.isArray(location)
							? location
							: [(location as any).lng || (location as any).lon, location.lat];
						formData.append("longitude", coords[0].toString());
						formData.append("latitude", coords[1].toString());

						// Add notes
						formData.append("notes", notes);

						return async ({ result, update }) => {
							isSubmitting = false;
							uploadProgress = { current: 0, total: 0, message: "" };

							if (result.type === "success") {
								handleClose();
								onSubmitSuccess?.();
							} else if (result.type === "failure") {
								errorMessage =
									(result.data as any)?.error || "An error occurred while submitting your report";
							}

							await update();
						};
					}}
				>
					<!-- Hidden inputs are handled by enhance function -->
					{#if isSubmitting && uploadProgress.total > 0}
						<div class="mb-4 space-y-2">
							<p class="text-sm text-gray-600">{uploadProgress.message}</p>
							<div class="h-2 w-full rounded-full bg-gray-200">
								<div
									class="h-2 rounded-full bg-amber-600 transition-all duration-300"
									style="width: {(uploadProgress.current / uploadProgress.total) * 100}%"
								></div>
							</div>
							<p class="text-xs text-gray-500">
								{uploadProgress.current} of {uploadProgress.total} photos uploaded
							</p>
						</div>
					{/if}

					<button
						type="submit"
						disabled={isSubmitting}
						class="flex w-full items-center justify-center rounded-md border border-transparent bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
					>
						{#if isSubmitting}
							<LoaderIcon class="mr-2 h-4 w-4 animate-spin" />
							{uploadProgress.message || "Submitting..."}
						{:else}
							Submit Report
						{/if}
					</button>
				</form>
			</div>
		{/if}

		<!-- Navigation buttons -->
		<div class="mt-6 flex justify-between">
			<button
				type="button"
				onclick={prevStep}
				disabled={step === 1}
				class="flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
			>
				<ChevronLeftIcon class="mr-1 h-4 w-4" />
				Back
			</button>

			{#if step < 3}
				<button
					type="button"
					onclick={nextStep}
					disabled={!canProceed()}
					class="flex items-center rounded-md border border-transparent bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
				>
					Next
					<ChevronRightIcon class="ml-1 h-4 w-4" />
				</button>
			{/if}
		</div>
	</div>
</Dialog>
