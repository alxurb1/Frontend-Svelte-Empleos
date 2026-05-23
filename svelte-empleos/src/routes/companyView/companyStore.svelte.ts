import { API_URL } from '$lib/config';

export interface Company {
	id_company: string;
	name: string;
	sector?: string;
	industry?: string;
	founded_year?: string;
	size?: string;
	employees_range?: string;
	location?: string;
	email?: string;
	phone?: string;
	website?: string;
	linkedin_url?: string;
	logo_url?: string;
	profile_views?: number;
	description?: string;
	mission?: string;
	vision?: string;
	total_applicants?: number;
	total_hired?: number;
}

export interface Benefit {
	benefit: string;
}

export interface CompanyValue {
	value_name: string;
}

export interface RatingData {
	average_rating?: number;
	total_reviews?: number;
}

export interface Vacancy {
	id_vacancy: string;
	title: string;
	location?: string;
	modality?: string;
	contract_type?: string;
	published_at?: string;
}

export interface Review {
	rating?: number;
	comment?: string;
	reviewer_name?: string;
	position?: string;
	period?: string;
	users?: { full_name: string };
}

export interface ParsedReview {
	name: string;
	position: string;
	period: string;
	comment: string;
	rating: number;
}

export const parseReview = (r: Review): ParsedReview => {
	let name = r.reviewer_name ?? r.users?.full_name ?? 'Anónimo';
	let position = r.position ?? '';
	let period = r.period ?? '';
	let comment = r.comment ?? '';

	if (comment.startsWith('[')) {
		const close = comment.indexOf(']');
		if (close !== -1) {
			const details = comment.substring(1, close).split(' - ');
			if (details[0]) name = details[0];
			if (details[1]) position = details[1];
			if (details[2]) period = details[2];
			comment = comment.substring(close + 1).trim();
		}
	}

	return { name, position, period, comment, rating: r.rating ?? 0 };
};

export interface NewReviewForm {
	name: string;
	position: string;
	period: string;
	rating: number | '';
	comment: string;
}

function createCompanyStore() {
	let company = $state<Company | null>(null);
	let benefits = $state<Benefit[]>([]);
	let values = $state<CompanyValue[]>([]);
	let rating = $state<RatingData>({});
	let vacancies = $state<Vacancy[]>([]);
	let reviews = $state<Review[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	let showReviewForm = $state(false);
	let submittingReview = $state(false);
	let reviewError = $state<string | null>(null);

	return {
		get company() {
			return company;
		},
		get benefits() {
			return benefits;
		},
		get values() {
			return values;
		},
		get rating() {
			return rating;
		},
		get vacancies() {
			return vacancies;
		},
		get reviews() {
			return reviews;
		},
		get loading() {
			return loading;
		},
		get error() {
			return error;
		},
		get showReviewForm() {
			return showReviewForm;
		},
		get submittingReview() {
			return submittingReview;
		},
		get reviewError() {
			return reviewError;
		},

		toggleReviewForm() {
			showReviewForm = !showReviewForm;
			reviewError = null;
		},

		async fetchCompany(id: string) {
			loading = true;
			error = null;

			try {
				const [empresaRes, benefitsRes, valuesRes, ratingRes, vacantesRes, reviewsRes] =
					await Promise.all([
						fetch(`${API_URL}/companies/companiaId/${id}`),
						fetch(`${API_URL}/companies/${id}/benefits`),
						fetch(`${API_URL}/companies/${id}/values`),
						fetch(`${API_URL}/companies/${id}/rating`),
						fetch(`${API_URL}/vacancy/company/${id}`),
						fetch(`${API_URL}/reviews/company/${id}`)
					]);

				const empresaData = await empresaRes.json();
				company = Array.isArray(empresaData) ? empresaData[0] : empresaData;
				if (!company) throw new Error('Empresa no encontrada');

				benefits = await benefitsRes.json();
				values = await valuesRes.json();
				rating = await ratingRes.json();
				vacancies = await vacantesRes.json();
				reviews = await reviewsRes.json();

				// Incrementa el número de vistas del perfil
				fetch(`${API_URL}/companies/${id}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ profile_views: (company.profile_views ?? 0) + 1 })
				}).catch(() => {});
			} catch (e) {
				error = e instanceof Error ? e.message : 'Error al cargar el perfil';
			} finally {
				loading = false;
			}
		},

		async submitReview(id: string, form: NewReviewForm) {
			submittingReview = true;
			reviewError = null;

			const details = [form.name, form.position, form.period].filter(Boolean).join(' - ');
			const finalComment = details ? `[${details}] ${form.comment}` : form.comment;

			try {
				const res = await fetch(`${API_URL}/reviews/company/${id}`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${localStorage.getItem('token')}`
					},
					body: JSON.stringify({
						rating: Number(form.rating),
						comment: finalComment,
						user_id: localStorage.getItem('userId')
					})
				});

				if (!res.ok) {
					const err = await res.json();
					reviewError = err.message ?? 'Error al enviar la reseña';
					return false;
				}

				const nueva = await res.json();

				reviews = [
					{
						rating: nueva.rating,
						comment: finalComment,
						reviewer_name: form.name || 'Anónimo',
						position: form.position,
						period: form.period
					},
					...reviews
				];
				showReviewForm = false;
				return true;
			} catch {
				reviewError = 'Error al conectar con el servidor.';
				return false;
			} finally {
				submittingReview = false;
			}
		}
	};
}

export const companyStore = createCompanyStore();
