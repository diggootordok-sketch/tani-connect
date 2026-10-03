<script lang="ts">
	import type { Category } from '$lib/database.types';

	export let categories: Category[] = [];
	export let value: number | null = null;
	export let name = 'category_id';
	export let required = false;
</script>

<select {name} bind:value class="input-field" {required}>
	<option value={null} disabled selected={value === null}>Pilih kategori…</option>
	{#each categories as category}
		<option value={category.id}>{category.name}</option>
	{/each}
</select>
