<script lang="ts">
	import { page } from "$app/state";
	import { getImageUrl } from "$lib/client/cloudflare/images";
	import { ContentType, SlothStatus, UserRole } from "$lib/client/db/schema";
	import SEO from "$lib/components/SEO.svelte";
	import SlothSighting from "$lib/components/SlothSighting.svelte";
	import SlothStatusBadge from "$lib/components/SlothStatusBadge.svelte";
	import {
		DirectionsActionButton,
		ReportContentActionButton,
		ShareActionButton,
	} from "$lib/components/action-button";
	import { LoginDialog } from "$lib/components/dialogs/login/index.js";
	import { SubmitSightingDialog } from "$lib/components/dialogs/submit-sighting";
	import * as Map from "$lib/components/map";
	import { Button } from "$lib/components/ui/button";
	import CameraIcon from "@lucide/svelte/icons/camera";
	import PlusIcon from "@lucide/svelte/icons/plus";

	let { data } = $props();

	function formatDate(date: Date): string {
		return new Intl.DateTimeFormat("en-US", {
			month: "long",
			day: "numeric",
			year: "numeric",
			hour: "numeric",
			minute: "2-digit",
		}).format(date);
	}

	function formatCompactDate(date: Date): string {
		return new Intl.DateTimeFormat("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		}).format(date);
	}

	let submitSightingDialogOpen = $state(false);

	const latestSighting = $derived(data.sloth.sightings[0]);
	const discovery = $derived(data.sloth.sightings[data.sloth.sightings.length - 1]);
	const heroPhoto = $derived(data.sloth.sightings.findLast((s) => s.photos.length > 0)?.photos[0]);
	const numSightings = $derived(data.sloth.sightings.length);
	const numSpotters = $derived(new Set(data.sloth.sightings.map((s) => s.sightedBy.id)).size);
</script>

<SEO
	title="Sloth #{data.sloth.id.slice(-6)}"
	description="View details and location of sloth #{data.sloth.id.slice(
		-6,
	)} discovered on {formatDate(discovery.createdAt)} in Bellingham, WA. Status: {data.sloth
		.status === SlothStatus.Active
		? 'Active'
		: 'Removed'}."
/>

<div class="min-h-screen bg-gray-50 dark:bg-gray-950">
	<div class="mx-auto max-w-4xl px-4 py-8">
		<!-- Header -->
		<div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<Button href="/" variant="secondary" size="default">← Back to Map</Button>

			<div class="hidden items-center gap-2 sm:flex">
				<DirectionsActionButton latitude={data.sloth.latitude} longitude={data.sloth.longitude} />
				<ShareActionButton slothId={data.sloth.id} />
				<ReportContentActionButton
					contentType={ContentType.Sloth}
					contentId={data.sloth.id}
					reportContentForm={data.reportContentForm}
					isLoggedIn={!!data.user}
				/>
			</div>
		</div>

		<div class="space-y-6">
			{#if heroPhoto}
				<div class="relative overflow-hidden rounded-lg shadow">
					<img
						src={getImageUrl(heroPhoto.cloudflareImageId)}
						alt={`Sloth #${data.sloth.id.slice(-6)} hero photo`}
						class="aspect-video w-full object-cover"
						style={heroPhoto.lqip !== null ? `--lqip: ${heroPhoto.lqip};` : ""}
						loading="eager"
						fetchpriority="high"
					/>
					<div class="absolute top-3 right-3">
						<SlothStatusBadge status={data.sloth.status} />
					</div>
					<div
						class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4"
					>
						<h1 class="mb-1 text-2xl font-bold text-white">Sloth #{data.sloth.id.slice(-6)}</h1>
						<p class="text-sm text-white/90">
							Last seen {formatDate(latestSighting.createdAt)} by {latestSighting.sightedBy
								.displayName}
						</p>
					</div>
				</div>
			{/if}
			<div class="rounded-lg bg-white p-6 shadow">
				<div class="mb-6">
					<h2 class="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">Details</h2>
				</div>

				<div class="space-y-4">
					<div class="grid grid-cols-3 gap-4">
						<div>
							<div class="text-sm text-gray-500">Total Sightings</div>
							<div class="text-2xl font-semibold text-gray-900 dark:text-gray-100">
								{numSightings}
							</div>
						</div>
						<div>
							<div class="text-sm text-gray-500">Unique Spotters</div>
							<div class="text-2xl font-semibold text-gray-900 dark:text-gray-100">
								{numSpotters}
							</div>
						</div>
						<div>
							<div class="text-sm text-gray-500">First Spotted</div>
							<div class="text-base font-semibold text-gray-900 dark:text-gray-100">
								{formatCompactDate(discovery.createdAt)}
							</div>
						</div>
					</div>

					<div>
						<div class="text-sm text-gray-500">Location</div>
						<div class="mt-2 aspect-video overflow-hidden rounded-lg border dark:border-gray-800">
							<Map.Root
								style="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
								validateStyle={false}
								attributionControl={false}
								center={[data.sloth.longitude, data.sloth.latitude]}
								zoom={16}
								interactive={false}
							>
								<Map.Marker lngLat={[data.sloth.longitude, data.sloth.latitude]} color="#D97706" />
							</Map.Root>
						</div>
					</div>
				</div>
			</div>

			<div class="rounded-lg bg-white p-6 shadow">
				<div class="mb-6 flex items-center justify-between">
					<h2 id="sighting-timeline" class="text-xl font-semibold text-gray-900 dark:text-gray-100">
						Sighting Timeline
					</h2>

					{#snippet trigger({ props }: { props: Record<string, unknown> })}
						<Button
							onclick={() => (submitSightingDialogOpen = true)}
							variant="outline"
							size="sm"
							{...props}
						>
							<PlusIcon class="mr-2 h-4 w-4" />
							Add Sighting
						</Button>
					{/snippet}

					{#if data.user}
						<SubmitSightingDialog
							bind:open={submitSightingDialogOpen}
							slothId={page.params.id!}
							submitSightingForm={data.submitSightingForm}
							{trigger}
						/>
					{:else}
						<LoginDialog bind:open={submitSightingDialogOpen} {trigger} />
					{/if}
				</div>

				<section class="space-y-6" aria-labelledby="sighting-timeline">
					{#each data.sloth.sightings as sighting (sighting.id)}
						<SlothSighting
							{sighting}
							reportContentForm={data.reportContentForm}
							isOwned={sighting.sightedBy.id === data.user?.id}
							isLoggedIn={!!data.user}
						/>
					{:else}
						<div class="py-12 text-center">
							<CameraIcon class="mx-auto mb-4 h-12 w-12 text-gray-400" />
							<h3 class="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
								No sightings yet
							</h3>
							<p class="mb-4 text-gray-500">Be the first to add a sighting of this sloth!</p>
							<Button variant="default" size="sm" onclick={() => (submitSightingDialogOpen = true)}>
								<PlusIcon class="mr-2 h-4 w-4" /> Add First Sighting
							</Button>
						</div>
					{/each}
				</section>
			</div>
		</div>
	</div>
</div>
