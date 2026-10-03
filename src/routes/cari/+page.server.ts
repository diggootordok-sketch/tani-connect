// Rute "/cari" sebagai alias yang mengarahkan kembali ke beranda, karena
// pencarian & penyaringan sudah terintegrasi penuh di halaman beranda.

import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	throw redirect(307, `/${url.search}`);
};
