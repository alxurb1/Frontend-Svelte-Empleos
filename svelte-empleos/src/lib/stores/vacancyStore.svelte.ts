import { API_URL } from '$lib/config';

export interface Vacancy {
	id_vacancy: string;
	title: string;
	id_company: string;
	location: string;
	modality: string;
	salary_min: number | null;
	salary_max: number | null;
	status: 'active' | 'paused' | 'expired' | 'deleted';
	experience_level?: 'junior' | 'mid' | 'senior' | 'executive';
	category?: string;
	contract_type?: 'full_time' | 'part_time' | 'freelance' | 'contract';
	description?: string;
	published_at?: string;
}

export interface SearchFilters {
	keyword?: string;
	location?: string;
	type?: string;
	salary?: string;
	experience?: string;
}

function createVacancyStore() {
	let vacancies = $state<Vacancy[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);

	return {
		get vacancies() {
			return vacancies;
		},
		get loading() {
			return loading;
		},
		get error() {
			return error;
		},

		async fetchVacancies(filters: SearchFilters = {}) {
			loading = true;
			error = null;

			try {
				const params = new URLSearchParams();
				if (filters.keyword) params.append('keyword', filters.keyword);
				if (filters.location) params.append('location', filters.location);
				if (filters.type) params.append('type', filters.type);
				if (filters.salary) params.append('salary', filters.salary);
				if (filters.experience) params.append('experience', filters.experience);

				const res = await fetch(
					`${API_URL}/vacancy/search${params.toString() ? '?' + params.toString() : ''}`
				);
				const result = await res.json();

				if (res.ok) {
					vacancies = result.data ?? [];
				} else {
					error = result.message ?? 'Error al cargar vacantes';
				}
			} catch {
				error = 'Error de conexión';
			} finally {
				loading = false;
			}
		}
	};
}

export const vacancyStore = createVacancyStore();
