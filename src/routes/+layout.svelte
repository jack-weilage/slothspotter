<script lang="ts">
	import "../app.css";
	import favicon from "$lib/assets/favicon.svg";
	import LoginDialog from "$lib/components/LoginDialog.svelte";
	import { enhance } from "$app/forms";

	let { children, data } = $props();
	let showLoginDialog = $state(false);

	function openLoginDialog() {
		showLoginDialog = true;
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="flex items-center justify-between bg-white p-4 shadow-sm">
	<h1 class="text-xl font-bold text-gray-900">SlothSpotter</h1>

	{#if data.user}
		<div class="flex items-center gap-3">
			<div class="flex items-center gap-2">
				{#if data.user.avatarUrl}
					<img src={data.user.avatarUrl} alt={data.user.displayName} class="h-8 w-8 rounded-full" />
				{/if}
				<span class="text-sm font-medium text-gray-700">{data.user.displayName}</span>
			</div>
			<form use:enhance method="POST" action="/auth/logout">
				<button class="text-sm text-gray-500 transition-colors hover:text-gray-700">
					Log out
				</button>
			</form>
		</div>
	{:else}
		<button
			onclick={openLoginDialog}
			class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
		>
			Log in
		</button>
	{/if}
</header>

{@render children?.()}

<LoginDialog bind:open={showLoginDialog} />
