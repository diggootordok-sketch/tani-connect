-- =====================================================================
-- SKEMA BASIS DATA — TANICONNECT
-- Jalankan skrip ini secara utuh pada Supabase SQL Editor (Project > SQL Editor).
-- Aman dijalankan ulang (idempoten) berkat IF NOT EXISTS dan DROP POLICY IF EXISTS.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 1. TABEL profiles
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
	id uuid primary key references auth.users (id) on delete cascade,
	full_name text,
	email text,
	avatar_url text,
	created_at timestamptz not null default now()
);

comment on table public.profiles is 'Data profil pengguna, disinkronkan dari auth.users.';

-- ---------------------------------------------------------------------
-- 2. TABEL categories
-- ---------------------------------------------------------------------
create table if not exists public.categories (
	id bigint generated always as identity primary key,
	name text not null unique,
	created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3. TABEL questions
-- ---------------------------------------------------------------------
create table if not exists public.questions (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references public.profiles (id) on delete cascade,
	category_id bigint not null references public.categories (id) on delete restrict,
	title text not null check (char_length(title) between 8 and 200),
	body text not null check (char_length(body) >= 20),
	image_url text,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create index if not exists questions_category_id_idx on public.questions (category_id);
create index if not exists questions_user_id_idx on public.questions (user_id);
create index if not exists questions_created_at_idx on public.questions (created_at desc);
create index if not exists questions_search_idx on public.questions
	using gin (to_tsvector('indonesian', title || ' ' || body));

-- ---------------------------------------------------------------------
-- 4. TABEL answers
-- ---------------------------------------------------------------------
create table if not exists public.answers (
	id uuid primary key default gen_random_uuid(),
	question_id uuid not null references public.questions (id) on delete cascade,
	user_id uuid not null references public.profiles (id) on delete cascade,
	body text not null check (char_length(body) >= 5),
	created_at timestamptz not null default now()
);

create index if not exists answers_question_id_idx on public.answers (question_id);

-- ---------------------------------------------------------------------
-- 5. TABEL bookmarks
-- ---------------------------------------------------------------------
create table if not exists public.bookmarks (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references public.profiles (id) on delete cascade,
	question_id uuid not null references public.questions (id) on delete cascade,
	created_at timestamptz not null default now(),
	unique (user_id, question_id)
);

-- ---------------------------------------------------------------------
-- 6. TRIGGER: auto-update `updated_at` pada tabel questions
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
	new.updated_at = now();
	return new;
end;
$$;

drop trigger if exists trg_questions_updated_at on public.questions;
create trigger trg_questions_updated_at
	before update on public.questions
	for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 7. TRIGGER: auto-membuat baris `profiles` setelah pengguna mendaftar
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
	insert into public.profiles (id, full_name, email, avatar_url)
	values (
		new.id,
		coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
		new.email,
		new.raw_user_meta_data ->> 'avatar_url'
	)
	on conflict (id) do nothing;
	return new;
end;
$$;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
	after insert on auth.users
	for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- 8. DATA AWAL — Kategori
-- ---------------------------------------------------------------------
insert into public.categories (name) values
	('Hama dan Penyakit'),
	('Budidaya Tanaman'),
	('Budidaya Ternak'),
	('Teknologi Pertanian'),
	('Jual Beli Panen'),
	('Informasi Harga'),
	('Pupuk dan Nutrisi'),
	('Irigasi'),
	('Pascapanen'),
	('Lainnya')
on conflict (name) do nothing;

-- =====================================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================================

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.questions enable row level security;
alter table public.answers enable row level security;
alter table public.bookmarks enable row level security;

-- --- profiles ---------------------------------------------------------
drop policy if exists "Profil dapat dibaca oleh siapa saja" on public.profiles;
create policy "Profil dapat dibaca oleh siapa saja"
	on public.profiles for select
	using (true);

drop policy if exists "Pengguna hanya dapat mengubah profil miliknya sendiri" on public.profiles;
create policy "Pengguna hanya dapat mengubah profil miliknya sendiri"
	on public.profiles for update
	using (auth.uid() = id);

-- --- categories ---------------------------------------------------------
drop policy if exists "Kategori dapat dibaca oleh siapa saja" on public.categories;
create policy "Kategori dapat dibaca oleh siapa saja"
	on public.categories for select
	using (true);

-- --- questions ---------------------------------------------------------
drop policy if exists "Semua pengguna dapat membaca pertanyaan" on public.questions;
create policy "Semua pengguna dapat membaca pertanyaan"
	on public.questions for select
	using (true);

drop policy if exists "Hanya pengguna terautentikasi yang dapat membuat pertanyaan" on public.questions;
create policy "Hanya pengguna terautentikasi yang dapat membuat pertanyaan"
	on public.questions for insert
	with check (auth.uid() = user_id);

drop policy if exists "Pengguna hanya dapat mengubah pertanyaan miliknya sendiri" on public.questions;
create policy "Pengguna hanya dapat mengubah pertanyaan miliknya sendiri"
	on public.questions for update
	using (auth.uid() = user_id)
	with check (auth.uid() = user_id);

drop policy if exists "Pengguna hanya dapat menghapus pertanyaan miliknya sendiri" on public.questions;
create policy "Pengguna hanya dapat menghapus pertanyaan miliknya sendiri"
	on public.questions for delete
	using (auth.uid() = user_id);

-- --- answers ---------------------------------------------------------
drop policy if exists "Semua pengguna dapat membaca jawaban" on public.answers;
create policy "Semua pengguna dapat membaca jawaban"
	on public.answers for select
	using (true);

drop policy if exists "Hanya pengguna terautentikasi yang dapat membuat jawaban" on public.answers;
create policy "Hanya pengguna terautentikasi yang dapat membuat jawaban"
	on public.answers for insert
	with check (auth.uid() = user_id);

drop policy if exists "Pengguna hanya dapat mengubah jawaban miliknya sendiri" on public.answers;
create policy "Pengguna hanya dapat mengubah jawaban miliknya sendiri"
	on public.answers for update
	using (auth.uid() = user_id)
	with check (auth.uid() = user_id);

drop policy if exists "Pengguna hanya dapat menghapus jawaban miliknya sendiri" on public.answers;
create policy "Pengguna hanya dapat menghapus jawaban miliknya sendiri"
	on public.answers for delete
	using (auth.uid() = user_id);

-- --- bookmarks ---------------------------------------------------------
drop policy if exists "Pengguna hanya dapat melihat bookmark miliknya sendiri" on public.bookmarks;
create policy "Pengguna hanya dapat melihat bookmark miliknya sendiri"
	on public.bookmarks for select
	using (auth.uid() = user_id);

drop policy if exists "Pengguna hanya dapat membuat bookmark untuk dirinya sendiri" on public.bookmarks;
create policy "Pengguna hanya dapat membuat bookmark untuk dirinya sendiri"
	on public.bookmarks for insert
	with check (auth.uid() = user_id);

drop policy if exists "Pengguna hanya dapat menghapus bookmark miliknya sendiri" on public.bookmarks;
create policy "Pengguna hanya dapat menghapus bookmark miliknya sendiri"
	on public.bookmarks for delete
	using (auth.uid() = user_id);

-- =====================================================================
-- SUPABASE STORAGE — Bucket untuk gambar pertanyaan
-- =====================================================================

insert into storage.buckets (id, name, public)
values ('question-images', 'question-images', true)
on conflict (id) do nothing;

drop policy if exists "Gambar pertanyaan dapat dibaca oleh siapa saja" on storage.objects;
create policy "Gambar pertanyaan dapat dibaca oleh siapa saja"
	on storage.objects for select
	using (bucket_id = 'question-images');

drop policy if exists "Pengguna terautentikasi dapat mengunggah gambar miliknya" on storage.objects;
create policy "Pengguna terautentikasi dapat mengunggah gambar miliknya"
	on storage.objects for insert
	with check (
		bucket_id = 'question-images'
		and auth.uid()::text = (storage.foldername(name))[1]
	);

drop policy if exists "Pengguna hanya dapat menghapus gambar miliknya sendiri" on storage.objects;
create policy "Pengguna hanya dapat menghapus gambar miliknya sendiri"
	on storage.objects for delete
	using (
		bucket_id = 'question-images'
		and auth.uid()::text = (storage.foldername(name))[1]
	);
