<script lang="ts">
	import '../app.css';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import PrivacyBanner from '$lib/components/PrivacyBanner.svelte';
	import type { LayoutData } from './$types';

	export let data: LayoutData;

	$: session = data.session;
	let mobileMenuOpen = false;
</script>

<div class="flex min-h-screen flex-col bg-cream-50 lg:flex-row">
	<Sidebar {session} bind:mobileMenuOpen />

	<div class="flex min-h-screen flex-1 flex-col lg:ml-72">
		<!-- Bilah atas khusus mobile -->
		<header class="sticky top-0 z-30 flex items-center justify-between border-b border-clay-900/10 bg-cream-50/90 px-4 py-3 backdrop-blur lg:hidden">
			<a href="/" class="font-display text-lg font-semibold text-clay-700">TaniConnect</a>
			<button
				class="rounded-full border border-clay-900/15 p-2 text-clay-700"
				on:click={() => (mobileMenuOpen = !mobileMenuOpen)}
				aria-label="Buka menu"
			>
				☰
			</button>
		</header>

		<main class="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-10">
			<slot />
		</main>

		<Footer />
	</div>

	<PrivacyBanner />
</div>
