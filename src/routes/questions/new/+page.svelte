<script lang="ts">
	import { enhance } from '$app/forms';
	import CategorySelector from '$lib/components/CategorySelector.svelte';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	let submitting = false;
	let previewUrl: string | null = null;

	function tampilkanPratinjau(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		previewUrl = file ? URL.createObjectURL(file) : null;
	}
</script>

<svelte:head>
	<title>Buat Pertanyaan — TaniConnect</title>
</svelte:head>

<div class="mx-auto max-w-2xl">
	<h1 class="mb-6 font-display text-2xl font-semibold text-clay-900">Buat Pertanyaan Baru</h1>

	<form
		method="POST"
		enctype="multipart/form-data"
		class="card flex flex-col gap-4"
		use:enhance={() => {
			submitting = true;
			return async ({ update }) => {
				await update();
				submitting = false;
			};
		}}
	>
		{#if form?.message}
			<p class="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{form.message}</p>
		{/if}

		<div>
			<label for="title" class="mb-1 block text-sm font-medium text-clay-900/70">Judul Pertanyaan</label>
			<input
				id="title"
				name="title"
				type="text"
				required
				minlength="8"
				class="input-field"
				placeholder="Contoh: Bagaimana cara mengatasi hama wereng pada padi?"
			/>
		</div>

		<div>
			<label for="category_id" class="mb-1 block text-sm font-medium text-clay-900/70">Kategori</label>
			<CategorySelector categories={data.categories} name="category_id" required />
		</div>

		<div>
			<label for="body" class="mb-1 block text-sm font-medium text-clay-900/70">Isi Pertanyaan</label>
			<textarea
				id="body"
				name="body"
				rows="6"
				required
				minlength="20"
				class="input-field"
				placeholder="Jelaskan pertanyaan Anda secara rinci…"
			></textarea>
		</div>

		<div>
			<label for="image" class="mb-1 block text-sm font-medium text-clay-900/70">
				Gambar (opsional, maks. 5 MB)
			</label>
			<input
				id="image"
				name="image"
				type="file"
				accept="image/*"
				class="input-field"
				on:change={tampilkanPratinjau}
			/>
			{#if previewUrl}
				<img src={previewUrl} alt="Pratinjau" class="mt-3 h-40 rounded-xl object-cover" />
			{/if}
		</div>

		<button type="submit" class="btn-primary" disabled={submitting}>
			{submitting ? 'Menyimpan…' : 'Publikasikan Pertanyaan'}
		</button>
	</form>
</div>
