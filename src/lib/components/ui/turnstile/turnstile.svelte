<script lang="ts">
	import { browser } from "$app/environment";
	import { PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY } from "$env/static/public";

	let {
		class: className = "",
		sitekey = PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY,
		appearance = "always",
		size = "normal",
		theme = "auto",
		oncallback,
	}: {
		class?: string;
		/**
		 * Every widget has a sitekey. This sitekey is associated with the corresponding
		 * widget configuration and is created upon the widget creation.
		 */
		sitekey?: string;
		/**
		 * Controls when the widget is visible:
		 * - `"always"` - The widget is visible at all times.
		 * - `"execute"` - The widget is visible only after the challenge begins.
		 * - `"interaction-only"` - The widget is visible only when an interaction is required.
		 *
		 * If a widget is visible, its appearance can be controlled via the `appearance` parameter.
		 * @see [appearance-modes](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/#appearance-modes)
		 */
		appearance?: "always" | "execute" | "interaction-only";
		/**
		 * The widget size. Can be 'normal', 'flexible', 'invisible', or 'compact'.
		 * @default "normal"
		 */
		size?: Turnstile.WidgetSize;
		/**
		 * The widget theme. Can be `"light"`, `"dark"`, or `"auto"`.
		 */
		theme?: "light" | "dark" | "auto";
		oncallback?: (token: string) => void;
	} = $props();

	const params = $derived({
		sitekey,
		appearance,
		size,
		theme,
		callback: oncallback,
	});

	let loaded = $state(browser && "turnstile" in window);

	let container: HTMLDivElement = $state()!;
	$effect(() => {
		if (!loaded) {
			return;
		}

		let id = window.turnstile.render(container, params);

		return () => {
			if (!id) return;

			window.turnstile.remove(id);
		};
	});
</script>

<svelte:head>
	{#if !loaded}
		<script
			src="https://challenges.cloudflare.com/turnstile/v0/api.js"
			async
			defer
			onload={() => (loaded = true)}
		></script>
	{/if}
</svelte:head>

{#if loaded}
	<div class="{className} {size === 'flexible' && 'w-full'}" bind:this={container}></div>
{/if}
