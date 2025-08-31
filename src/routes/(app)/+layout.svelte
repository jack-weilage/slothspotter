<script lang="ts">
	import UserAvatar from "$lib/components/UserAvatar.svelte";
	import { LoginDialog } from "$lib/components/dialogs/login";
	import { Button } from "$lib/components/ui/button";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import LogoutIcon from "@lucide/svelte/icons/log-out";

	let { children, data } = $props();

	let loginOpen = $state(false);
</script>

<header class="flex items-center justify-between bg-white p-4 shadow-sm">
	<h1 class="text-xl font-bold text-gray-900">SlothSpotter</h1>

	{#if data.user}
		<DropdownMenu.DropdownMenu>
			<DropdownMenu.Trigger aria-label="Open user menu">
				<UserAvatar user={data.user} class="size-9 border" />
			</DropdownMenu.Trigger>
			<DropdownMenu.Content>
				<DropdownMenu.Item class="justify-between">
					{#snippet child({ props })}
						<a href="/auth/logout" {...props}>
							Log out
							<LogoutIcon />
						</a>
					{/snippet}
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.DropdownMenu>
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
