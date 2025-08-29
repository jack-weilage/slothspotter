<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import PhotoThumbnail from "./PhotoThumbnail.svelte";
	import CameraIcon from "@lucide/svelte/icons/camera";

	let {
		photos = $bindable([]),
		maxPhotos = 3,
		onaddphoto,
		onremovephoto,
		disabled = false,
	}: {
		photos?: File[];
		maxPhotos?: number;
		onaddphoto?: () => void;
		onremovephoto?: (index: number) => void;
		disabled?: boolean;
	} = $props();
</script>

<div class="space-y-3">
	<div class="flex flex-wrap gap-2">
		<Button
			type="button"
			onclick={onaddphoto}
			variant="outline"
			class="h-20 w-full border-2 border-dashed border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
			disabled={disabled || photos.length >= maxPhotos}
		>
			<div class="text-center">
				<CameraIcon class="mx-auto mb-1 h-6 w-6 text-gray-400" />
				<span class="text-xs text-gray-500">Add Photo</span>
			</div>
		</Button>

		{#each photos as photo, index (photo.name + photo.size + index)}
			<PhotoThumbnail
				source={photo}
				alt="Selected photo {index + 1}"
				onremove={() => {
					onremovephoto?.(index);
					photos.splice(index, 1);
					photos = photos;
				}}
				removable={!disabled}
			/>
		{/each}
	</div>
</div>
