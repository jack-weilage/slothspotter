<script lang="ts">
	import UserAvatar from "$lib/components/UserAvatar.svelte";
	import { LoginDialog } from "$lib/components/dialogs/login";
	import { Button } from "$lib/components/ui/button";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import LogoutIcon from "@lucide/svelte/icons/log-out";

	let { children, data } = $props();

	let loginOpen = $state(false);
</script>

<a
	href="#main-content"
	class="absolute left-0 top-0 -translate-y-full bg-gray-900 px-4 py-2 text-white focus:translate-y-0"
>
	Skip to main content
</a>

<header class="flex h-[4rem] items-center justify-between bg-white p-4 shadow-sm">
	<h1 class="text-xl font-bold text-gray-900">
		<a href="/" class="hover:text-gray-700 transition-colors">SlothSpotter</a>
	</h1>

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

<main id="main-content">
	{@render children?.()}
</main>
