<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import * as Dialog from "$lib/components/ui/dialog";
	import MapPinIcon from "@lucide/svelte/icons/map-pin";
	import MousePointerClickIcon from "@lucide/svelte/icons/mouse-pointer-click";
	import PlusIcon from "@lucide/svelte/icons/plus";
	import SearchIcon from "@lucide/svelte/icons/search";

	let { open = $bindable() }: { open: boolean } = $props();

	function handleComplete() {
		document.cookie = "tutorial-complete=true; path=/; max-age=31536000; SameSite=Lax";
		open = false;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content
		class="max-w-2xl"
		escapeKeydownBehavior="ignore"
		interactOutsideBehavior="ignore"
		showCloseButton={false}
	>
		<Dialog.Header>
			<Dialog.Title>Welcome to SlothSpotter! 🦥</Dialog.Title>
			<Dialog.Description>
				Discover and track stuffed sloths around Bellingham, Washington. Here's how to get started.
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4">
			<!-- How it works -->
			<div class="space-y-3">
				<h3 class="text-base font-semibold">How it works</h3>
				<div class="space-y-3">
					<div class="flex gap-3">
						<div
							class="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10"
						>
							<SearchIcon class="size-4 text-primary" />
						</div>
						<div class="flex-1">
							<p class="text-sm font-medium">Explore the map</p>
							<p class="text-sm text-muted-foreground">
								Brown markers show active sloths, gray markers show removed sloths.
							</p>
						</div>
					</div>

					<div class="flex gap-3">
						<div
							class="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10"
						>
							<MousePointerClickIcon class="size-4 text-primary" />
						</div>
						<div class="flex-1">
							<p class="text-sm font-medium">Click a marker</p>
							<p class="text-sm text-muted-foreground">
								View sloth details, photos, and sighting history.
							</p>
						</div>
					</div>

					<div class="flex gap-3">
						<div
							class="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10"
						>
							<PlusIcon class="size-4 text-primary" />
						</div>
						<div class="flex-1">
							<p class="text-sm font-medium">Add Sightings</p>
							<p class="text-sm text-muted-foreground">
								Log in to report new sloths or add sightings to existing ones.
							</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Submission rules -->
			<div class="rounded-lg border bg-muted/50 p-4">
				<div class="mb-2 flex items-center gap-2">
					<MapPinIcon class="size-4 text-primary" />
					<p class="text-sm font-semibold">Submission Rules</p>
				</div>
				<ul class="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
					<li>Must be a stuffed sloth — not a sticker, sign, or drawing.</li>
					<li>Must be stationary — not in a car or being carried.</li>
					<li>No people in the photo unless they explicitly consented.</li>
				</ul>
			</div>
		</div>

		<Dialog.Footer>
			<Button onclick={handleComplete} class="w-full sm:w-auto">Got it, let's go!</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
