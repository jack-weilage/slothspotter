<script lang="ts">
	import ReportDetail from "./ReportDetail.svelte";
	import ReportList from "./ReportList.svelte";

	let { data } = $props();

	let selectedReport = $state(null);
</script>

<div class="flex h-full min-h-[100dvh] bg-gray-50">
	<div class="flex w-1/3 min-w-[400px] flex-col border-r border-gray-200 bg-white">
		<div class="border-b border-gray-200 p-4">
			<h2 class="text-lg font-semibold text-gray-900">Moderation Queue</h2>
		</div>

		<div class="flex-1 overflow-hidden">
			<ReportList reports={data.reports} bind:selectedReport />
		</div>
	</div>

	<div class="flex flex-1 flex-col bg-white">
		{#if selectedReport}
			<ReportDetail report={selectedReport} />
		{:else}
			<div class="flex flex-1 items-center justify-center text-gray-500">
				<div class="text-center">
					<div class="mb-4 text-6xl">🔍</div>
					<p class="mb-2 text-lg">No report selected</p>
					<p class="text-sm">Select a report from the list to review it</p>
				</div>
			</div>
		{/if}
	</div>
</div>
