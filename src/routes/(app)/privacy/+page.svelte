<script lang="ts">
	const updated = new Date().toISOString().slice(0, 10);
</script>

<svelte:head>
	<title>Privacy Policy</title>
	<meta name="description" content="Short and simple privacy policy for Slothspotter" />
</svelte:head>

<section class="mx-auto max-w-3xl p-6">
	<h1 class="mb-2 text-2xl font-semibold">Privacy Policy</h1>
	<p class="mb-6 text-sm text-gray-600">Last updated: {updated}</p>

	<p>
		We keep things simple. We only store the minimum data needed to run SlothSpotter and keep the
		community safe. No data is ever harvested/sold.
	</p>

	<h2 class="mt-6 text-xl font-semibold">What we store</h2>
	<ul class="list-disc pl-6">
		<li>
			<span class="font-semibold">Account basics:</span> display name, optional avatar URL, and your
			sign-in provider and provider ID (e.g., Google).
		</li>
		<li>
			<span class="font-semibold">Sloths and sightings:</span> sloth locations (latitude/longitude),
			sighting records you create (which link your account to a sloth), optional sighting notes, and
			timestamps.
		</li>
		<li>
			<span class="font-semibold">Photos:</span> The photos you submit are stored in Cloudflare Images
			indefinitely. Deleted images are cleaned up periodically.
		</li>
		<li>
			<span class="font-semibold">Moderation:</span> reports you submit (type, reason, optional comment)
			and actions taken by moderators to keep content appropriate.
		</li>
	</ul>

	<h2 class="mt-6 text-xl font-semibold">How we use data</h2>
	<ul class="list-disc pl-6">
		<li>Provide core features (sign-in, sloths, sightings, photos).</li>
		<li>Protect the community (moderation and abuse prevention).</li>
		<li>Lightweight analytics to understand usage and reliability.</li>
	</ul>

	<p class="mt-4">
		We do not sell data. We don’t track you across other sites. We don’t collect more than what’s
		required for functionality and safety.
	</p>

	<h2 class="mt-6 text-xl font-semibold">Data sharing</h2>
	<p>
		We only share data with essential service providers to run the app (e.g., Cloudflare Images for
		photo storage). We do not sell or broker data.
	</p>

	<h2 class="mt-6 text-xl font-semibold">Contact</h2>
	<p>Questions? Open an issue or contact the maintainers. We’ll help.</p>
</section>
