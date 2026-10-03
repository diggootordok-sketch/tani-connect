<script lang="ts">
	import type { Session } from '@supabase/supabase-js';

	export let session: Session | null = null;
	export let mobileMenuOpen = false;

	const tautan = [
		{ href: '/', label: 'Beranda', icon: '🏡' },
		{ href: '/cari', label: 'Cari Pertanyaan', icon: '🔍' }
	];
</script>

<!-- Sidebar desktop: tetap (fixed) di sisi kiri, ciri khas desain ini -->
<aside class="hidden w-72 shrink-0 flex-col border-r border-clay-900/10 bg-white px-6 py-8 lg:fixed lg:inset-y-0 lg:flex">
	<a href="/" class="mb-10 flex items-center gap-2">
		<span class="text-2xl" aria-hidden="true">🌻</span>
		<span class="font-display text-xl font-semibold text-clay-700">TaniConnect</span>
	</a>

	<nav class="flex flex-col gap-1">
		{#each tautan as item}
			<a
				href={item.href}
				class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-clay-900/70 transition hover:bg-cream-100 hover:text-clay-700"
			>
				<span aria-hidden="true">{item.icon}</span>
				{item.label}
			</a>
		{/each}
	</nav>

	<div class="mt-auto flex flex-col gap-3">
		{#if session}
			<a href="/questions/new" class="btn-primary w-full">+ Buat Pertanyaan</a>
			<form method="POST" action="/logout">
				<button type="submit" class="btn-secondary w-full">Keluar</button>
			</form>
		{:else}
			<a href="/login" class="btn-primary w-full">Masuk dengan Google</a>
		{/if}
	</div>
</aside>

<!-- Panel mobile -->
{#if mobileMenuOpen}
	<div class="fixed inset-0 z-40 flex lg:hidden">
		<div class="w-72 bg-white px-6 py-8 shadow-xl">
			<nav class="flex flex-col gap-1">
				{#each tautan as item}
					<a
						href={item.href}
						class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-clay-900/70"
						on:click={() => (mobileMenuOpen = false)}
					>
						<span aria-hidden="true">{item.icon}</span>
						{item.label}
					</a>
				{/each}
			</nav>
			<div class="mt-6 flex flex-col gap-3">
				{#if session}
					<a href="/questions/new" class="btn-primary w-full">+ Buat Pertanyaan</a>
					<form method="POST" action="/logout">
						<button type="submit" class="btn-secondary w-full">Keluar</button>
					</form>
				{:else}
					<a href="/login" class="btn-primary w-full">Masuk dengan Google</a>
				{/if}
			</div>
		</div>
		<button
			class="flex-1 bg-clay-900/30"
			aria-label="Tutup menu"
			on:click={() => (mobileMenuOpen = false)}
		></button>
	</div>
{/if}
