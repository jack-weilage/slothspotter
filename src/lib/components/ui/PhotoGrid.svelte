<script lang="ts">
	import PhotoThumbnail from "./PhotoThumbnail.svelte";
	import CameraIcon from "@lucide/svelte/icons/camera";

	let {
		photos = $bindable([]),
		maxPhotos = 3,
		onAddPhoto,
		onRemovePhoto,
		onPhotoClick,
		disabled = false,
		class: className = "",
	}: {
		photos?: File[];
		maxPhotos?: number;
		onAddPhoto?: () => void;
		onRemovePhoto?: (index: number) => void;
		onPhotoClick?: (photo: File, index: number) => void;
		disabled?: boolean;
		class?: string;
	} = $props();


	function removePhoto(index: number) {
		if (onRemovePhoto) {
			onRemovePhoto(index);
		} else {
			photos.splice(index, 1);
			photos = [...photos];
		}
	}

	function handlePhotoClick(photo: File, index: number) {
		onPhotoClick?.(photo, index);
	}
</script>

<div class="space-y-3 {className}">
	<div class="flex flex-wrap gap-2">
		{#if photos.length < maxPhotos && !disabled}
			<button
				type="button"
				onclick={onAddPhoto}
				class="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-gray-400 hover:bg-gray-100 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:outline-none"
				aria-label="Add photo"
			>
				<div class="text-center">
					<CameraIcon class="mx-auto mb-1 h-6 w-6 text-gray-400" />
					<span class="text-xs text-gray-500">Add Photo</span>
				</div>
			</button>
		{/if}
		{#each photos as photo, index (photo.name + photo.size + index)}
			<PhotoThumbnail
				source={photo}
				alt="Selected photo {index + 1}"
				onRemove={() => removePhoto(index)}
				onClick={() => handlePhotoClick(photo, index)}
				removable={!disabled}
			/>
		{/each}
	</div>

	{#if photos.length >= maxPhotos}
		<p class="text-xs text-gray-500">
			Maximum {maxPhotos} photos allowed
		</p>
	{/if}

	{#if photos.length === 0}
		<p class="text-sm text-gray-600">
			Take or upload photos of the sloth (up to {maxPhotos} photos)
		</p>
	{/if}
</div>
