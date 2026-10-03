// Memuat data pertanyaan terbaru beserta kategori, dengan dukungan
// pencarian (?q=), penyaringan kategori (?kategori=), dan pengurutan
// (?urutan=terbaru|terlama) melalui query string.

import type { PageServerLoad } from './$types';
import type { QuestionWithRelations, Category } from '$lib/database.types';

export const load: PageServerLoad = async ({ locals: { supabase }, url }) => {
	const q = url.searchParams.get('q')?.trim() ?? '';
	const kategori = url.searchParams.get('kategori');
	const urutan = url.searchParams.get('urutan') === 'terlama' ? 'terlama' : 'terbaru';

	let query = supabase
		.from('questions')
		.select(
			`
			id, user_id, category_id, title, body, image_url, created_at, updated_at,
			profiles ( full_name, avatar_url ),
			categories ( name ),
			answers ( count )
		`
		)
		.order('created_at', { ascending: urutan === 'terlama' });

	if (q) {
		query = query.or(`title.ilike.%${q}%,body.ilike.%${q}%`);
	}

	if (kategori) {
		query = query.eq('category_id', Number(kategori));
	}

	const [{ data: questions, error, count }, { data: categories }, { count: totalSemua }] =
		await Promise.all([
			query.limit(20),
			supabase.from('categories').select('*').order('name'),
			supabase.from('questions').select('*', { count: 'exact', head: true })
		]);

	if (error) {
		console.error('Gagal memuat pertanyaan:', error.message);
	}

	return {
		questions: (questions ?? []) as unknown as QuestionWithRelations[],
		categories: (categories ?? []) as Category[],
		totalPertanyaan: totalSemua ?? 0,
		filter: { q, kategori, urutan }
	};
};
