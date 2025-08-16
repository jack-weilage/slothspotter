<script lang="ts">
	import LoginDialog, { openLoginDialog } from "$lib/components/LoginDialog.svelte";
	import { enhance } from "$app/forms";
	import { Button } from "$lib/components/ui/button";
	import * as Avatar from "$lib/components/ui/avatar";

	let { children, data } = $props();
</script>

<header class="flex items-center justify-between bg-white p-4 shadow-sm">
	<h1 class="text-xl font-bold text-gray-900">SlothSpotter</h1>

	{#if data.user}
		<div class="flex items-center gap-3">
			<div class="flex items-center gap-2">
				<Avatar.Root>
					<Avatar.Image src={data.user.avatarUrl} alt="{data.user.displayName}'s avatar'" />
					<Avatar.Fallback>
						{data.user.displayName
							.split(" ")
							.slice(0, 2)
							.map((s) => s[0].toLocaleUpperCase())
							.join("")}
					</Avatar.Fallback>
				</Avatar.Root>

				<span class="text-sm font-medium text-gray-700">{data.user.displayName}</span>
			</div>
			<form use:enhance method="POST" action="/auth/logout">
				<Button variant="ghost" size="sm" type="submit">Log out</Button>
			</form>
		</div>
	{:else}
		<Button onclick={openLoginDialog} variant="default" size="sm">Log in</Button>
	{/if}
</header>

{@render children?.()}

<LoginDialog />
