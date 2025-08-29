<script lang="ts">
	import faviconDark from "$lib/assets/favicon-dark.svg";
	import faviconLight from "$lib/assets/favicon-light.svg";
	import "../app.css";

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={faviconLight} media="(prefers-color-scheme: light)" />
	<link rel="icon" href={faviconDark} media="(prefers-color-scheme: dark)" />
</svelte:head>

{@render children()}
