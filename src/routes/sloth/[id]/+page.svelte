<script lang="ts">
	import type { PageData } from "./$types";
	import { SlothStatus } from "$lib";
	import SEO from "$lib/components/SEO.svelte";
	import { Button } from "$lib/components/ui/button";

	let { data }: { data: PageData } = $props();

	function formatDate(date: Date): string {
		return new Intl.DateTimeFormat("en-US", {
			month: "long",
			day: "numeric",
			year: "numeric",
			hour: "numeric",
			minute: "2-digit",
		}).format(date);
	}
</script>

<SEO
	title="Sloth #{data.sloth.id.slice(-6)}"
	description="View details and location of sloth #{data.sloth.id.slice(
		-6,
	)} discovered on {formatDate(data.sloth.discoveredAt)} in Bellingham, WA. Status: {data.sloth
		.status === SlothStatus.Active
		? 'Active'
		: 'Removed'}."
/>

<div class="min-h-screen bg-gray-50">
	<div class="mx-auto max-w-4xl px-4 py-8">
		<!-- Header -->
		<div class="mb-6 flex items-center justify-between">
			<Button href="/" variant="secondary" size="default">← Back to Map</Button>

			<span
				class="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium {data.sloth
					.status === SlothStatus.Active
					? 'bg-green-100 text-green-800'
					: 'bg-gray-100 text-gray-800'}"
			>
				{data.sloth.status === SlothStatus.Active ? "Active" : "Removed"}
			</span>
		</div>

		<!-- Main Content -->
		<div class="rounded-lg bg-white p-6 shadow">
			<div class="mb-6">
				<h1 class="mb-2 text-3xl font-bold text-gray-900">
					Sloth #{data.sloth.id.slice(-6)}
				</h1>
				<p class="text-gray-600">
					Discovered on {formatDate(data.sloth.discoveredAt)}
				</p>
			</div>

			<!-- Location Map Placeholder -->
			<div class="mb-6 flex h-64 items-center justify-center rounded bg-gray-200">
				<p class="text-gray-500">Mini-map coming soon</p>
				<p class="ml-2 text-sm text-gray-400">
					({data.sloth.latitude.toFixed(6)}, {data.sloth.longitude.toFixed(6)})
				</p>
			</div>

			<!-- Placeholder for future content -->
			<div class="space-y-4">
				<h2 class="text-xl font-semibold text-gray-900">Sighting Timeline</h2>
				<p class="text-gray-500">Sighting history coming soon...</p>
			</div>
		</div>
	</div>
</div>
