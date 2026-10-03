// Klien Supabase untuk digunakan di sisi BROWSER.
// Untuk sisi server, gunakan `event.locals.supabase` dari hooks.server.ts.

import { createBrowserClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const createSupabaseBrowserClient = () =>
	createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
