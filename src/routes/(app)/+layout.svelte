<script lang="ts">
	import { enhance } from "$app/forms";
	import { LoginDialog } from "$lib/components/dialogs/login";
	import * as Avatar from "$lib/components/ui/avatar";
	import { Button } from "$lib/components/ui/button";

	let { children, data } = $props();

	let loginOpen = $state(false);
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
		<LoginDialog bind:open={loginOpen}>
			{#snippet trigger({ props })}
				<Button {...props} onclick={() => (loginOpen = true)} variant="default" size="sm">
					Log in
				</Button>
			{/snippet}
		</LoginDialog>
	{/if}
</header>

{@render children?.()}
