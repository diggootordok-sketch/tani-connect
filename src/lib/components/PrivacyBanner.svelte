<script lang="ts">
	import { onMount } from 'svelte';

	const STORAGE_KEY = 'privacy-consent-accepted';
	let visible = false;

	onMount(() => {
		const accepted = localStorage.getItem(STORAGE_KEY);
		visible = !accepted;
	});

	function terima() {
		localStorage.setItem(STORAGE_KEY, 'true');
		visible = false;
	}
</script>

{#if visible}
	<div class="fixed inset-x-0 bottom-0 z-50 border-t border-clay-900/10 bg-white p-4 shadow-xl lg:left-72">
		<div class="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<p class="text-sm text-clay-900/70">
				Kami mengumpulkan data profil dasar (nama, surel, foto) melalui akun Google Anda serta
				konten yang Anda unggah (pertanyaan, jawaban, gambar) untuk mengoperasikan forum ini.
				Data disimpan pada basis data Supabase dan tidak dibagikan kepada pihak ketiga tanpa
				persetujuan Anda. Dengan menekan tombol "Saya Mengerti", Anda menyetujui pengumpulan dan
				penggunaan data sebagaimana dijelaskan di atas.
			</p>
			<button class="btn-primary shrink-0" on:click={terima}>Saya Mengerti</button>
		</div>
	</div>
{/if}
