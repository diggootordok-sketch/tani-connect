<script lang="ts">
	import QuestionCard from '$lib/components/QuestionCard.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let q = data.filter.q;
	let urutan = data.filter.urutan;

	function urlKategori(id: number | null) {
		const params = new URLSearchParams();
		if (q) params.set('q', q);
		if (id !== null) params.set('kategori', String(id));
		if (urutan !== 'terbaru') params.set('urutan', urutan);
		const qs = params.toString();
		return qs ? `/?${qs}` : '/';
	}
</script>

<svelte:head>
	<title>TaniConnect — Forum Tanya Jawab Pertanian</title>
</svelte:head>

<!-- Hero bergaya editorial, berbeda dari versi sebelumnya -->
<section class="mb-8 overflow-hidden rounded-3xl bg-clay-700 px-8 py-12 text-cream-50 sm:px-12">
	<p class="mb-2 text-sm font-medium uppercase tracking-wide text-clay-200">Komunitas Pertanian Digital</p>
	<h1 class="max-w-xl font-display text-3xl font-semibold leading-tight sm:text-4xl">
		Bertanya, berdiskusi, dan tumbuh bersama petani di seluruh negeri.
	</h1>
</section>

<!-- Kartu statistik ala bento, elemen khas desain ini -->
<section class="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
	<div class="card !p-4 text-center">
		<p class="font-display text-2xl font-semibold text-clay-700">{data.totalPertanyaan}</p>
		<p class="text-xs text-clay-900/50">Total Pertanyaan</p>
	</div>
	<div class="card !p-4 text-center">
		<p class="font-display text-2xl font-semibold text-clay-700">{data.categories.length}</p>
		<p class="text-xs text-clay-900/50">Kategori</p>
	</div>
	<div class="card !p-4 text-center">
		<p class="font-display text-2xl font-semibold text-clay-700">🌾</p>
		<p class="text-xs text-clay-900/50">Penyuluhan Digital</p>
	</div>
	<div class="card !p-4 text-center">
		<p class="font-display text-2xl font-semibold text-clay-700">🤝</p>
		<p class="text-xs text-clay-900/50">Penghubung Pasar</p>
	</div>
</section>

<form method="GET" class="mb-4 flex flex-col gap-3 sm:flex-row">
	<input
		type="search"
		name="q"
		bind:value={q}
		placeholder="Cari pertanyaan…"
		class="input-field flex-1"
	/>
	<select name="urutan" bind:value={urutan} class="input-field sm:w-44">
		<option value="terbaru">Terbaru</option>
		<option value="terlama">Terlama</option>
	</select>
	<button type="submit" class="btn-primary sm:w-auto">Cari</button>
</form>

<!-- Filter kategori sebagai chip pil, bukan dropdown -->
<div class="mb-6 flex flex-wrap gap-2">
	<a href={urlKategori(null)} class="chip" class:chip-active={!data.filter.kategori}>Semua</a>
	{#each data.categories as kat}
		<a
			href={urlKategori(kat.id)}
			class="chip"
			class:chip-active={data.filter.kategori === String(kat.id)}
		>
			{kat.name}
		</a>
	{/each}
</div>

{#if data.questions.length === 0}
	<div class="card text-center text-clay-900/50">
		Belum ada pertanyaan yang cocok. Jadilah yang pertama bertanya!
	</div>
{:else}
	<div class="flex flex-col gap-4">
		{#each data.questions as question (question.id)}
			<QuestionCard {question} />
		{/each}
	</div>
{/if}
