// Memuat daftar kategori, dan menangani penyimpanan pertanyaan baru
// (termasuk unggah gambar ke Supabase Storage) melalui Form Action.

import { error, redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { Category } from '$lib/database.types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const { data: categories, error: dbError } = await supabase
		.from('categories')
		.select('*')
		.order('name');

	if (dbError) {
		throw error(500, 'Gagal memuat kategori.');
	}

	return { categories: (categories ?? []) as Category[] };
};

export const actions: Actions = {
	default: async ({ request, locals: { supabase, safeGetSession } }) => {
		const { user } = await safeGetSession();
		if (!user) {
			throw error(401, 'Anda harus masuk terlebih dahulu.');
		}

		const formData = await request.formData();
		const title = (formData.get('title') as string)?.trim();
		const body = (formData.get('body') as string)?.trim();
		const categoryId = formData.get('category_id');
		const imageFile = formData.get('image') as File | null;

		if (!title || title.length < 8) {
			return fail(400, { message: 'Judul pertanyaan minimal 8 karakter.' });
		}
		if (!body || body.length < 20) {
			return fail(400, { message: 'Isi pertanyaan minimal 20 karakter.' });
		}
		if (!categoryId) {
			return fail(400, { message: 'Kategori wajib dipilih.' });
		}

		let imageUrl: string | null = null;

		if (imageFile && imageFile.size > 0) {
			if (imageFile.size > 5 * 1024 * 1024) {
				return fail(400, { message: 'Ukuran gambar maksimal 5 MB.' });
			}

			const extension = imageFile.name.split('.').pop();
			const path = `${user.id}/${crypto.randomUUID()}.${extension}`;

			const { error: uploadError } = await supabase.storage
				.from('question-images')
				.upload(path, imageFile, { upsert: false });

			if (uploadError) {
				console.error('Gagal mengunggah gambar:', uploadError.message);
				return fail(500, { message: 'Gagal mengunggah gambar. Silakan coba lagi.' });
			}

			const { data: publicUrlData } = supabase.storage
				.from('question-images')
				.getPublicUrl(path);

			imageUrl = publicUrlData.publicUrl;
		}

		const { data: newQuestion, error: insertError } = await supabase
			.from('questions')
			.insert({
				user_id: user.id,
				category_id: Number(categoryId),
				title,
				body,
				image_url: imageUrl
			})
			.select('id')
			.single();

		if (insertError) {
			console.error('Gagal menyimpan pertanyaan:', insertError.message);
			return fail(500, { message: 'Gagal menyimpan pertanyaan. Silakan coba lagi.' });
		}

		throw redirect(303, `/questions/${newQuestion.id}`);
	}
};
