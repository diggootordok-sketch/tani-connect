<script lang="ts">
	import { createSupabaseBrowserClient } from '$lib/supabaseClient';

	const supabase = createSupabaseBrowserClient();
	let loading = false;
	let errorMessage = '';

	async function loginDenganGoogle() {
		loading = true;
		errorMessage = '';

		const { error } = await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: `${window.location.origin}/auth/callback`
			}
		});

		if (error) {
			errorMessage = 'Gagal masuk dengan Google. Silakan coba lagi.';
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Masuk — TaniConnect</title>
</svelte:head>

<div class="mx-auto flex max-w-md flex-col items-center gap-6 rounded-3xl bg-white px-8 py-14 text-center shadow-soft">
	<span class="text-5xl" aria-hidden="true">🌻</span>
	<h1 class="font-display text-3xl font-semibold text-clay-900">Selamat Datang di TaniConnect</h1>
	<p class="text-sm text-clay-900/60">
		Masuk menggunakan akun Google Anda untuk membuat pertanyaan, menjawab, dan terhubung dengan
		komunitas pertanian digital.
	</p>

	<button class="btn-primary w-full py-3" on:click={loginDenganGoogle} disabled={loading}>
		{#if loading}
			Menghubungkan…
		{:else}
			Masuk dengan Google
		{/if}
	</button>

	{#if errorMessage}
		<p class="text-sm text-red-600">{errorMessage}</p>
	{/if}
</div>
