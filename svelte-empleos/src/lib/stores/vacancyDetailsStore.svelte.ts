import { API_URL } from '$lib/config';

export interface Company {
	id_company: string;
	name: string;
	location: string;
	size: string;
	sector: string;
	description: string;
	email: string;
	phone: string;
	website: string;
	logo_url?: string;
}

export interface VacancyDetail {
	id_vacancy: string;
	title: string;
	experience_level: string;
	location: string;
	contract_type: string;
	salary_min: number | null;
	salary_max: number | null;
	published_at: string;
	description: string;
	requirements: string;
	benefits: string;
	category?: string;
	companies?: Company;
}

export interface SimilarVacancy {
	id_vacancy: string;
	title: string;
	companies?: { name: string };
}

function createVacancyDetailStore() {
	let vacancy = $state<VacancyDetail | null>(null);
	let similarVacancies = $state<SimilarVacancy[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let applying = $state(false);
	let applyMessage = $state<string | null>(null);
	let applySuccess = $state(false);

	return {
		get vacancy() {
			return vacancy;
		},
		get similarVacancies() {
			return similarVacancies;
		},
		get loading() {
			return loading;
		},
		get error() {
			return error;
		},
		get applying() {
			return applying;
		},
		get applyMessage() {
			return applyMessage;
		},
		get applySuccess() {
			return applySuccess;
		},

		async fetchVacancy(id: string) {
			loading = true;
			error = null;

			try {
				const res = await fetch(`${API_URL}/vacancy/${id}`);
				if (!res.ok) throw new Error('No se pudo cargar el empleo');
				const data: VacancyDetail = await res.json();
				vacancy = data;

				if (data.category) {
					const simRes = await fetch(`${API_URL}/vacancy?category=${data.category}`);
					if (simRes.ok) {
						const list: SimilarVacancy[] = await simRes.json();
						similarVacancies = list.filter((v) => v.id_vacancy !== data.id_vacancy).slice(0, 3);
					}
				}
			} catch (e) {
				error = e instanceof Error ? e.message : 'Error de conexión';
			} finally {
				loading = false;
			}
		},

		async apply(id_vacancy: string) {
			const userId = localStorage.getItem('userId');
			if (!userId) {
				applyMessage = 'Debes iniciar sesión para postularte.';
				applySuccess = false;
				return;
			}

			applying = true;
			applyMessage = null;

			try {
				const res = await fetch(`${API_URL}/vacancy/${id_vacancy}/apply`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ id_user: userId })
				});
				const data = await res.json();
				applyMessage = data.message ?? '¡Postulación enviada correctamente!';
				applySuccess = res.ok;
			} catch {
				applyMessage = 'Error al enviar la postulación.';
				applySuccess = false;
			} finally {
				applying = false;
			}
		},

		clearApplyMessage() {
			applyMessage = null;
		}
	};
}

export const vacancyDetailStore = createVacancyDetailStore();