<script lang="ts">
	import { Button, type ButtonProps } from "$lib/components/ui/button";
	import type { Snippet } from "svelte";

	let {
		icon,
		label,
		class: className,
		...props
	}: ButtonProps & {
		icon: Snippet;
		label: string;
	} = $props();
</script>

<Button variant="ghost" class="h-auto flex-col gap-1 py-2 {className}" {...props}>
	{@render icon()}
	<span class="text-[10px] leading-tight">{label}</span>
</Button>
