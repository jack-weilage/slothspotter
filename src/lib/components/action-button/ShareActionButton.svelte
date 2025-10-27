<script lang="ts">
	import SlothActionButton from "./SlothActionButton.svelte";
	import ShareIcon from "@lucide/svelte/icons/share-2";

	let { slothId, class: className }: { slothId: string; class?: string } = $props();

	let justCopied = $state(false);

	async function handleShare() {
		const url = `${window.location.origin}/sloth/${slothId}`;
		if (navigator.share) {
			try {
				await navigator.share({ url, title: `Sloth #${slothId.slice(-6)}` });
				return;
			} catch {
				// fallthrough to copy
			}
		}

		await navigator.clipboard.writeText(url);
		justCopied = true;
		setTimeout(() => (justCopied = false), 1500);
	}
</script>

<SlothActionButton
	onclick={handleShare}
	aria-label={justCopied ? "Link copied" : "Share"}
	title={justCopied ? "Link copied" : "Share"}
	label={justCopied ? "Copied" : "Share"}
	class={className}
>
	{#snippet icon()}
		<ShareIcon />
	{/snippet}
</SlothActionButton>
