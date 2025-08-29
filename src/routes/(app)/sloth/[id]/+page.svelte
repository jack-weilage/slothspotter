<script lang="ts">
	import { SlothStatus } from "$lib/client/db/schema";
	import SEO from "$lib/components/SEO.svelte";
	import SlothSighting from "$lib/components/SlothSighting.svelte";
	import SlothStatusBadge from "$lib/components/SlothStatusBadge.svelte";
	import { LoginDialog } from "$lib/components/dialogs/login/index.js";
	import { SubmitSightingDialog } from "$lib/components/dialogs/submit-sighting";
	import SlothActionDropdown from "$lib/components/dropdown/SlothActionDropdown.svelte";
	import { Button } from "$lib/components/ui/button";
	import CalendarIcon from "@lucide/svelte/icons/calendar";
	import CameraIcon from "@lucide/svelte/icons/camera";
	import MapPinIcon from "@lucide/svelte/icons/map-pin";
	import PlusIcon from "@lucide/svelte/icons/plus";
	import UsersIcon from "@lucide/svelte/icons/users";

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

	// Calculate updated stats from current sightings
	const currentStats = $derived({
		totalSightings: data.sloth.sightings.length,
		totalPhotos: data.sloth.sightings.reduce((sum, sighting) => sum + sighting.photos.length, 0),
		uniqueSpotters: new Set(data.sloth.sightings.map((s) => s.sightedBy.id)).size,
		lastSighting: data.sloth.sightings.length > 0 ? data.sloth.sightings[0].createdAt : null,
	});
	const discovery = $derived(data.sloth.sightings[0]);
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

<div class="min-h-screen bg-gray-50">
	<div class="mx-auto max-w-4xl px-4 py-8">
		<!-- Header -->
		<div class="mb-6 flex items-center justify-between">
			<Button href="/" variant="secondary" size="default">← Back to Map</Button>

			<div class="flex items-center gap-3">
				<SlothStatusBadge status={data.sloth.status} />

				<SlothActionDropdown
					slothId={data.sloth.id}
					userRole={data.user?.role}
					reportContentForm={data.reportContentForm}
				/>
			</div>
		</div>

		<div class="space-y-6">
			<div class="rounded-lg bg-white p-6 shadow">
				<div class="mb-6">
					<h1 class="mb-2 text-3xl font-bold text-gray-900">
						Sloth #{data.sloth.id.slice(-6)}
					</h1>
					<p class="text-gray-600">
						Discovered by {discovery.sightedBy.displayName} on {formatDate(discovery.createdAt)}
					</p>
				</div>

				<div class="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
					<div class="rounded-lg bg-gray-50 p-4 text-center">
						<div class="mb-2 flex items-center justify-center">
							<CameraIcon class="h-5 w-5 text-gray-600" />
						</div>
						<div class="text-2xl font-semibold text-gray-900">{currentStats.totalSightings}</div>
						<div class="text-sm text-gray-600">Sightings</div>
					</div>

					<div class="rounded-lg bg-gray-50 p-4 text-center">
						<div class="mb-2 flex items-center justify-center">
							<CameraIcon class="h-5 w-5 text-gray-600" />
						</div>
						<div class="text-2xl font-semibold text-gray-900">{currentStats.totalPhotos}</div>
						<div class="text-sm text-gray-600">Photos</div>
					</div>

					<div class="rounded-lg bg-gray-50 p-4 text-center">
						<div class="mb-2 flex items-center justify-center">
							<UsersIcon class="h-5 w-5 text-gray-600" />
						</div>
						<div class="text-2xl font-semibold text-gray-900">{currentStats.uniqueSpotters}</div>
						<div class="text-sm text-gray-600">Spotters</div>
					</div>

					<div class="rounded-lg bg-gray-50 p-4 text-center">
						<div class="mb-2 flex items-center justify-center">
							<CalendarIcon class="h-5 w-5 text-gray-600" />
						</div>
						{#if currentStats.lastSighting}
							<div class="text-2xl font-semibold text-gray-900">
								{formatCompactDate(new Date(currentStats.lastSighting))}
							</div>
							<div class="text-sm text-gray-600">Last Seen</div>
						{:else}
							<div class="text-lg font-semibold text-gray-500">—</div>
							<div class="text-sm text-gray-600">No sightings</div>
						{/if}
					</div>
				</div>

				<div class="flex items-center gap-2 rounded-lg bg-blue-50 p-4">
					<MapPinIcon class="h-5 w-5 text-blue-600" />
					<div>
						<div class="font-medium text-blue-900">Location</div>
						<div class="text-sm text-blue-700">
							{data.sloth.latitude.toFixed(6)}, {data.sloth.longitude.toFixed(6)}
						</div>
					</div>
				</div>
			</div>

			<div class="rounded-lg bg-white p-6 shadow">
				<div class="mb-6 flex items-center justify-between">
					<h2 class="text-xl font-semibold text-gray-900">Sighting Timeline</h2>

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
							submitSightingForm={data.submitSightingForm}
							{trigger}
						/>
					{:else}
						<LoginDialog bind:open={submitSightingDialogOpen} {trigger} />
					{/if}
				</div>

				<div class="space-y-6">
					{#each data.sloth.sightings as sighting (sighting.id)}
						<SlothSighting
							{sighting}
							reportContentForm={data.reportContentForm}
							isOwned={sighting.sightedBy.id === data.user?.id}
						/>
					{:else}
						<div class="py-12 text-center">
							<CameraIcon class="mx-auto mb-4 h-12 w-12 text-gray-400" />
							<h3 class="mb-2 text-lg font-medium text-gray-900">No sightings yet</h3>
							<p class="text-gray-500">Be the first to report a sighting of this sloth!</p>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>
