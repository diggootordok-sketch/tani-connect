// Tipe data yang merepresentasikan skema basis data Supabase.

export interface Profile {
	id: string;
	full_name: string | null;
	email: string | null;
	avatar_url: string | null;
	created_at: string;
}

export interface Category {
	id: number;
	name: string;
	created_at: string;
}

export interface Question {
	id: string;
	user_id: string;
	category_id: number;
	title: string;
	body: string;
	image_url: string | null;
	created_at: string;
	updated_at: string;
}

export interface Answer {
	id: string;
	question_id: string;
	user_id: string;
	body: string;
	created_at: string;
}

export interface Bookmark {
	id: string;
	user_id: string;
	question_id: string;
	created_at: string;
}

export interface QuestionWithRelations extends Question {
	profiles: Pick<Profile, 'full_name' | 'avatar_url'> | null;
	categories: Pick<Category, 'name'> | null;
	answers?: { count: number }[];
}
