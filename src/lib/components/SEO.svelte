<script lang="ts">
	import { page } from "$app/state";
	import { PUBLIC_ORIGIN } from "$env/static/public";

	let {
		title,
		description,
		noIndex = false,
		canonical = page.url.pathname,
	}: {
		title: string;
		description: string;
		noIndex?: boolean;
		canonical?: string;
	} = $props();
</script>

<svelte:head>
	<title>{page.url.pathname === "/" ? title : `${title} | SlothSpotter`}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href="{PUBLIC_ORIGIN}{canonical}" />

	{#if noIndex}
		<meta name="robots" content="noindex, nofollow" />
	{/if}
</svelte:head>
