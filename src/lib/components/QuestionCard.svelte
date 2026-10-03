<script lang="ts">
	import type { QuestionWithRelations } from '$lib/database.types';

	export let question: QuestionWithRelations;

	function formatTanggal(tanggal: string) {
		return new Date(tanggal).toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	function cuplikan(teks: string, panjang = 140) {
		return teks.length > panjang ? teks.slice(0, panjang).trim() + '…' : teks;
	}
</script>

<a href={`/questions/${question.id}`} class="card flex flex-col gap-4 sm:flex-row">
	<div class="aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-cream-100 sm:aspect-square sm:w-36">
		{#if question.image_url}
			<img src={question.image_url} alt={question.title} class="h-full w-full object-cover" loading="lazy" />
		{:else}
			<div class="flex h-full w-full items-center justify-center text-3xl">🌱</div>
		{/if}
	</div>

	<div class="flex flex-1 flex-col gap-2">
		<div class="flex flex-wrap items-center gap-2">
			<span class="chip">{question.categories?.name ?? 'Lainnya'}</span>
			<span class="text-xs text-clay-900/40">{formatTanggal(question.created_at)}</span>
		</div>

		<h3 class="font-display text-lg font-semibold leading-snug text-clay-900">{question.title}</h3>
		<p class="text-sm text-clay-900/60">{cuplikan(question.body)}</p>

		<div class="mt-1 flex items-center gap-2 text-xs text-clay-900/50">
			{#if question.profiles?.avatar_url}
				<img src={question.profiles.avatar_url} alt="" class="h-6 w-6 rounded-full ring-2 ring-cream-100" />
			{/if}
			<span class="font-medium">{question.profiles?.full_name ?? 'Pengguna'}</span>
			{#if question.answers}
				<span>· {question.answers[0]?.count ?? 0} jawaban</span>
			{/if}
		</div>
	</div>
</a>
