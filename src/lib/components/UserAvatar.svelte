<script lang="ts">
	import * as Avatar from "$lib/components/ui/avatar";

	type UserLike = {
		displayName: string;
		avatarUrl: string | null;
	};

	let { user, class: className }: { user: UserLike; class?: string } = $props();

	function getUserInitials(displayName: string): string {
		return displayName
			.split(" ")
			.slice(0, 2)
			.map((s) => s.charAt(0))
			.join("")
			.toUpperCase();
	}
</script>

<Avatar.Root class={className}>
	<Avatar.Image src={user.avatarUrl} alt="{user.displayName}'s avatar" />
	<Avatar.Fallback>{getUserInitials(user.displayName)}</Avatar.Fallback>
</Avatar.Root>
