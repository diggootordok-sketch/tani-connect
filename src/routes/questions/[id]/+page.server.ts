// Memuat detail satu pertanyaan beserta seluruh jawabannya, dan menangani
// pengiriman jawaban baru melalui Form Action.

import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { QuestionWithRelations, Answer } from '$lib/database.types';

export const load: PageServerLoad = async ({ params, locals: { supabase } }) => {
	const { data: question, error: questionError } = await supabase
		.from('questions')
		.select(
			`
			id, user_id, category_id, title, body, image_url, created_at, updated_at,
			profiles ( full_name, avatar_url ),
			categories ( name )
		`
		)
		.eq('id', params.id)
		.single();

	if (questionError || !question) {
		throw error(404, 'Pertanyaan tidak ditemukan.');
	}

	const { data: answers, error: answersError } = await supabase
		.from('answers')
		.select('id, question_id, user_id, body, created_at, profiles ( full_name, avatar_url )')
		.eq('question_id', params.id)
		.order('created_at', { ascending: true });

	if (answersError) {
		console.error('Gagal memuat jawaban:', answersError.message);
	}

	return {
		question: question as unknown as QuestionWithRelations,
		answers: (answers ?? []) as unknown as (Answer & {
			profiles: { full_name: string | null; avatar_url: string | null } | null;
		})[]
	};
};

export const actions: Actions = {
	jawab: async ({ request, params, locals: { supabase, safeGetSession } }) => {
		const { user } = await safeGetSession();
		if (!user) {
			return fail(401, { message: 'Anda harus masuk untuk menjawab.' });
		}

		const formData = await request.formData();
		const body = (formData.get('body') as string)?.trim();

		if (!body || body.length < 5) {
			return fail(400, { message: 'Jawaban tidak boleh kosong.' });
		}

		const { error: insertError } = await supabase.from('answers').insert({
			question_id: params.id,
			user_id: user.id,
			body
		});

		if (insertError) {
			console.error('Gagal menyimpan jawaban:', insertError.message);
			return fail(500, { message: 'Gagal menyimpan jawaban.' });
		}

		return { success: true };
	}
};
