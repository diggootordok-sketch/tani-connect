<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	$: session = data.session;

	function formatTanggal(tanggal: string) {
		return new Date(tanggal).toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>{data.question.title} — TaniConnect</title>
</svelte:head>

<article class="card mb-6">
	<div class="mb-3 flex flex-wrap items-center gap-2">
		<span class="chip chip-active">{data.question.categories?.name ?? 'Lainnya'}</span>
		<span class="text-xs text-clay-900/40">{formatTanggal(data.question.created_at)}</span>
	</div>

	<h1 class="mb-2 font-display text-2xl font-semibold leading-snug text-clay-900">{data.question.title}</h1>

	<div class="mb-4 flex items-center gap-2 text-sm text-clay-900/60">
		{#if data.question.profiles?.avatar_url}
			<img src={data.question.profiles.avatar_url} alt="" class="h-6 w-6 rounded-full" />
		{/if}
		<span>Ditanyakan oleh {data.question.profiles?.full_name ?? 'Pengguna'}</span>
	</div>

	{#if data.question.image_url}
		<img
			src={data.question.image_url}
			alt={data.question.title}
			class="mb-4 max-h-96 w-full rounded-xl object-cover"
		/>
	{/if}

	<p class="whitespace-pre-line text-clay-900/80">{data.question.body}</p>
</article>

<section>
	<h2 class="mb-4 font-display text-lg font-semibold text-clay-900">{data.answers.length} Jawaban</h2>

	<div class="flex flex-col gap-4">
		{#each data.answers as jawaban (jawaban.id)}
			<div class="card">
				<div class="mb-2 flex items-center gap-2 text-sm text-clay-900/60">
					{#if jawaban.profiles?.avatar_url}
						<img src={jawaban.profiles.avatar_url} alt="" class="h-6 w-6 rounded-full" />
					{/if}
					<span class="font-medium">{jawaban.profiles?.full_name ?? 'Pengguna'}</span>
					<span>· {formatTanggal(jawaban.created_at)}</span>
				</div>
				<p class="whitespace-pre-line text-clay-900/80">{jawaban.body}</p>
			</div>
		{:else}
			<p class="text-sm text-clay-900/50">Belum ada jawaban. Jadilah yang pertama menjawab!</p>
		{/each}
	</div>

	<div class="card mt-6">
		{#if session}
			<h3 class="mb-3 font-display font-semibold text-clay-900">Tulis Jawaban Anda</h3>
			{#if form?.message}
				<p class="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{form.message}</p>
			{/if}
			<form method="POST" action="?/jawab" use:enhance class="flex flex-col gap-3">
				<textarea
					name="body"
					rows="4"
					required
					minlength="5"
					class="input-field"
					placeholder="Bagikan pengetahuan atau pengalaman Anda…"
				></textarea>
				<button type="submit" class="btn-primary self-start">Kirim Jawaban</button>
			</form>
		{:else}
			<p class="text-sm text-clay-900/60">
				<a href="/login" class="font-medium text-clay-700 underline">Masuk</a> terlebih dahulu untuk
				menjawab pertanyaan ini.
			</p>
		{/if}
	</div>
</section>
