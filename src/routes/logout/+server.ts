// Endpoint keluar (logout) — menggunakan POST agar tidak terpicu tanpa sengaja.

import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals: { supabase } }) => {
	await supabase.auth.signOut();
	throw redirect(303, '/');
};
