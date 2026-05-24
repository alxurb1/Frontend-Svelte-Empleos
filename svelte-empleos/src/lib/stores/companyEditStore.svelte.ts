import { API_URL } from '$lib/config';

// -----------------------------------TYPES---------------------------------

export interface CompanyProfile {
	name: string;
	sector?: string;
	size?: string;
	location?: string;
	website?: string;
	email?: string;
	linkedin_url?: string;
	phone?: string;
	description?: string;
	mission?: string;
	vision?: string;
	logo_url?: string;
}

export interface ProfileForm {
	name: string;
	sector: string;
	size: string;
	location: string;
	website: string;
	email: string;
	linkedin_url: string;
	phone: string;
	description: string;
	mission: string;
	vision: string;
}

export interface VacancyForm {
	title: string;
	contract_type: string;
	location: string;
	experience_level: string;
	salary_min: string;
	salary_max: string;
	description: string;
	requirements: string;
	benefits: string;
}

export interface Vacancy {
	id_vacancy: string;
	title: string;
	contract_type?: string | null;
	location?: string | null;
	experience_level?: string | null;
	salary_min?: number | null;
	salary_max?: number | null;
	description?: string | null;
	requirements?: string | null;
	benefits?: string | null;
	status?: 'active' | 'paused' | 'expired' | 'deleted'; // ← reemplaza is_active
	created_at?: string;
}

export interface Review {
	id_review: string;
	rating: number;
	comment?: string;
	created_at?: string;
	users?: {
		full_name?: string;
		professional_title?: string;
	};
}

export interface Application {
	id_application: string;
	id_user: string;
	applied_at?: string;
	status: string;
	users?: {
		full_name?: string;
		professional_title?: string;
	};
	vacancies?: {
		title?: string;
	};
}

export type ApplicationStatus = 'pending' | 'reviewing' | 'interview' | 'offer' | 'rejected';

export const CONTRACT_MAP: Record<string, string> = {
	'Tiempo Completo': 'full_time',
	'Medio Tiempo': 'part_time',
	Contrato: 'contract',
	Freelance: 'freelance',
	Pasantía: 'internship'
};

export const CONTRACT_LABEL: Record<string, string> = {
	full_time: 'Tiempo Completo',
	part_time: 'Medio Tiempo',
	contract: 'Contrato',
	freelance: 'Freelance',
	internship: 'Pasantía'
};

export const EXPERIENCE_MAP: Record<string, string> = {
	'Junior (0-2 años)': 'junior',
	'Semi-Senior (2-5 años)': 'mid',
	'Senior (5+ años)': 'senior',
	'Lead / Manager': 'executive'
};

export const EXPERIENCE_LABEL: Record<string, string> = {
	junior: 'Junior (0-2 años)',
	mid: 'Semi-Senior (2-5 años)',
	senior: 'Senior (5+ años)',
	executive: 'Lead / Manager'
};

export const STATUS_LABELS: Record<string, { label: string; color: string }> = {
	pending: { label: 'Pendiente', color: 'bg-gray-200 text-gray-700' },
	reviewing: { label: 'En Revisión', color: 'bg-yellow-100 text-yellow-800' },
	interview: { label: 'Entrevista', color: 'bg-blue-600 text-white' },
	offer: { label: 'Oferta', color: 'bg-green-100 text-green-800' },
	rejected: { label: 'Rechazado', color: 'bg-red-100 text-red-700' }
};

export const getInitials = (name?: string) => {
	if (!name) return '?';
	return name
		.split(' ')
		.slice(0, 2)
		.map((n) => n[0].toUpperCase())
		.join('');
};

export const formatDate = (date?: string) => {
	if (!date) return '—';
	return new Date(date).toLocaleDateString('es-SV');
};

// ---------------------------------------------STORES---------------------------------------

const emptyProfileForm = (): ProfileForm => ({
	name: '',
	sector: '',
	size: '',
	location: '',
	website: '',
	email: '',
	linkedin_url: '',
	phone: '',
	description: '',
	mission: '',
	vision: ''
});

const emptyVacancyForm = (): VacancyForm => ({
	title: '',
	contract_type: '',
	location: '',
	experience_level: '',
	salary_min: '',
	salary_max: '',
	description: '',
	requirements: '',
	benefits: ''
});

function createCompanyDashboardStore() {
	// Profile
	let profile = $state<CompanyProfile | null>(null);
	let profileForm = $state<ProfileForm>(emptyProfileForm());
	let profileLoading = $state(true);
	let profileSaving = $state(false);
	let profileMessage = $state<{ text: string; ok: boolean } | null>(null);

	// Logo
	let logoUploading = $state(false);

	// Vacante (publicar)
	let vacancyForm = $state<VacancyForm>(emptyVacancyForm());
	let vacancyPublishing = $state(false);
	let vacancyMessage = $state<{ text: string; ok: boolean } | null>(null);

	// Gestión de vacantes
	let vacancies = $state<Vacancy[]>([]);
	let vacanciesLoading = $state(false);
	let vacanciesError = $state<string | null>(null);
	let togglingVacancy = $state<string | null>(null);
	let deletingVacancy = $state<string | null>(null);
	let editingVacancy = $state<Vacancy | null>(null);
	let editVacancyForm = $state<VacancyForm>(emptyVacancyForm());
	let editVacancySaving = $state(false);
	let editVacancyMessage = $state<{ text: string; ok: boolean } | null>(null);

	// Reseñas
	let reviews = $state<Review[]>([]);
	let reviewsLoading = $state(false);
	let reviewsError = $state<string | null>(null);

	// Aplicaciones
	let applications = $state<Application[]>([]);
	let applicationsLoading = $state(false);
	let applicationsError = $state<string | null>(null);
	let updatingStatus = $state<string | null>(null);

	const companyId = typeof localStorage !== 'undefined' ? localStorage.getItem('companyId') : null;
	const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
	const authHeaders = {
		'Content-Type': 'application/json',
		Authorization: `Bearer ${token}`
	};

	return {
		get profile() {
			return profile;
		},
		get profileForm() {
			return profileForm;
		},
		get profileLoading() {
			return profileLoading;
		},
		get profileSaving() {
			return profileSaving;
		},
		get profileMessage() {
			return profileMessage;
		},
		get logoUploading() {
			return logoUploading;
		},
		get vacancyForm() {
			return vacancyForm;
		},
		get vacancyPublishing() {
			return vacancyPublishing;
		},
		get vacancyMessage() {
			return vacancyMessage;
		},
		get vacancies() {
			return vacancies;
		},
		get vacanciesLoading() {
			return vacanciesLoading;
		},
		get vacanciesError() {
			return vacanciesError;
		},
		get togglingVacancy() {
			return togglingVacancy;
		},
		get deletingVacancy() {
			return deletingVacancy;
		},
		get editingVacancy() {
			return editingVacancy;
		},
		get editVacancyForm() {
			return editVacancyForm;
		},
		get editVacancySaving() {
			return editVacancySaving;
		},
		get editVacancyMessage() {
			return editVacancyMessage;
		},
		get reviews() {
			return reviews;
		},
		get reviewsLoading() {
			return reviewsLoading;
		},
		get reviewsError() {
			return reviewsError;
		},
		get applications() {
			return applications;
		},
		get applicationsLoading() {
			return applicationsLoading;
		},
		get applicationsError() {
			return applicationsError;
		},
		get updatingStatus() {
			return updatingStatus;
		},
		get companyId() {
			return companyId;
		},

		// ------------------------------------------PERFIL------------------------------------------

		async loadProfile() {
			if (!companyId) return;
			profileLoading = true;
			try {
				const res = await fetch(`${API_URL}/companies/companiaId/${companyId}`);
				const data: CompanyProfile = await res.json();
				profile = data;
				profileForm = {
					name: data.name ?? '',
					sector: data.sector ?? '',
					size: data.size ?? '',
					location: data.location ?? '',
					website: data.website ?? '',
					email: data.email ?? '',
					linkedin_url: data.linkedin_url ?? '',
					phone: data.phone ?? '',
					description: data.description ?? '',
					mission: data.mission ?? '',
					vision: data.vision ?? ''
				};
			} catch {
				profileMessage = { text: 'Error al cargar el perfil.', ok: false };
			} finally {
				profileLoading = false;
			}
		},

		async saveProfile() {
			if (!companyId) return;
			profileSaving = true;
			profileMessage = null;
			const body = Object.fromEntries(
				Object.entries(profileForm).map(([k, v]) => [k, (v as string).trim() || null])
			);
			try {
				const res = await fetch(`${API_URL}/companies/${companyId}`, {
					method: 'PUT',
					headers: authHeaders,
					body: JSON.stringify(body)
				});
				if (!res.ok) {
					const err = await res.json();
					throw new Error(err.message ?? 'Error en el servidor');
				}
				if (profile) profile = { ...profile, ...body } as CompanyProfile;
				profileMessage = { text: 'Perfil actualizado correctamente.', ok: true };
			} catch (e) {
				profileMessage = { text: e instanceof Error ? e.message : 'Error al guardar.', ok: false };
			} finally {
				profileSaving = false;
			}
		},

		async uploadLogo(file: File) {
			if (!companyId) return;
			if (!file.type.startsWith('image/')) {
				profileMessage = { text: 'Por favor selecciona una imagen válida.', ok: false };
				return;
			}
			if (file.size > 5 * 1024 * 1024) {
				profileMessage = { text: 'La imagen no puede superar los 5MB.', ok: false };
				return;
			}
			logoUploading = true;
			const formData = new FormData();
			formData.append('logo', file);
			try {
				const res = await fetch(`${API_URL}/companies/${companyId}/logo`, {
					method: 'POST',
					body: formData
				});
				const data = await res.json();
				if (data.logo_url) {
					if (profile) profile = { ...profile, logo_url: data.logo_url };
				}
				profileMessage = { text: 'Logo actualizado.', ok: true };
			} catch {
				profileMessage = { text: 'Error al subir el logo.', ok: false };
			} finally {
				logoUploading = false;
			}
		},

		// ----------------------------------VACANTES (publicar) --------------------------------------

		async publishVacancy() {
			if (!companyId) return;
			if (!vacancyForm.title.trim()) {
				vacancyMessage = { text: 'El título del puesto es obligatorio.', ok: false };
				return;
			}
			vacancyPublishing = true;
			vacancyMessage = null;
			const body = {
				id_company: companyId,
				title: vacancyForm.title.trim(),
				contract_type: CONTRACT_MAP[vacancyForm.contract_type] ?? null,
				location: vacancyForm.location.trim() || null,
				experience_level: EXPERIENCE_MAP[vacancyForm.experience_level] ?? null,
				salary_min: parseInt(vacancyForm.salary_min) || null,
				salary_max: parseInt(vacancyForm.salary_max) || null,
				description: vacancyForm.description.trim() || null,
				requirements: vacancyForm.requirements.trim() || null,
				benefits: vacancyForm.benefits.trim() || null
			};
			try {
				const res = await fetch(`${API_URL}/vacancy`, {
					method: 'POST',
					headers: authHeaders,
					body: JSON.stringify(body)
				});
				const data = await res.json();
				if (data.id_vacancy) {
					vacancyMessage = { text: 'Vacante publicada correctamente.', ok: true };
					vacancyForm = emptyVacancyForm();
					// Refresh the vacancies list if it's already loaded
					if (vacancies.length > 0) vacancies = [data, ...vacancies];
				} else {
					vacancyMessage = { text: data.message ?? 'Error al publicar la vacante.', ok: false };
				}
			} catch {
				vacancyMessage = { text: 'Error al conectar con el servidor.', ok: false };
			} finally {
				vacancyPublishing = false;
			}
		},

		// ----------------------------------GESTIÓN DE VACANTES--------------------------------------

		async loadVacancies() {
			if (!companyId) return;
			vacanciesLoading = true;
			vacanciesError = null;
			try {
				const res = await fetch(`${API_URL}/vacancy/company/${companyId}`, {
					headers: authHeaders
				});
				const data = await res.json();
				vacancies = Array.isArray(data) ? data : [];
			} catch {
				vacanciesError = 'Error al cargar las vacantes.';
			} finally {
				vacanciesLoading = false;
			}
		},

		async toggleVacancyStatus(vacancyId: string, currentActive: boolean) {
			togglingVacancy = vacancyId;
			const newStatus = currentActive ? 'paused' : 'active';
			try {
				await fetch(`${API_URL}/vacancy/${vacancyId}/status`, {
					// ← /status
					method: 'PUT',
					headers: authHeaders,
					body: JSON.stringify({ status: newStatus }) // ← status, no is_active
				});
				vacancies = vacancies.map((v) =>
					v.id_vacancy === vacancyId ? { ...v, status: newStatus } : v
				);
			} catch {
			} finally {
				togglingVacancy = null;
			}
		},

		async deleteVacancy(vacancyId: string) {
			deletingVacancy = vacancyId;
			try {
				await fetch(`${API_URL}/vacancy/${vacancyId}`, {
					method: 'DELETE',
					headers: authHeaders
				});
				vacancies = vacancies.filter((v) => v.id_vacancy !== vacancyId);
			} catch {
			} finally {
				deletingVacancy = null;
			}
		},

		openEditVacancy(vacancy: Vacancy) {
			editingVacancy = vacancy;
			editVacancyMessage = null;
			const contractLabel =
				Object.entries(CONTRACT_MAP).find(([, v]) => v === vacancy.contract_type)?.[0] ?? '';
			const experienceLabel =
				Object.entries(EXPERIENCE_MAP).find(([, v]) => v === vacancy.experience_level)?.[0] ?? '';
			editVacancyForm = {
				title: vacancy.title ?? '',
				contract_type: contractLabel,
				location: vacancy.location ?? '',
				experience_level: experienceLabel,
				salary_min: vacancy.salary_min?.toString() ?? '',
				salary_max: vacancy.salary_max?.toString() ?? '',
				description: vacancy.description ?? '',
				requirements: vacancy.requirements ?? '',
				benefits: vacancy.benefits ?? ''
			};
		},

		closeEditVacancy() {
			editingVacancy = null;
			editVacancyMessage = null;
		},

		async saveEditVacancy() {
			if (!editingVacancy) return;
			editVacancySaving = true;
			editVacancyMessage = null;
			const body = {
				title: editVacancyForm.title.trim(),
				contract_type: CONTRACT_MAP[editVacancyForm.contract_type] ?? null,
				location: editVacancyForm.location.trim() || null,
				experience_level: EXPERIENCE_MAP[editVacancyForm.experience_level] ?? null,
				salary_min: parseInt(editVacancyForm.salary_min) || null,
				salary_max: parseInt(editVacancyForm.salary_max) || null,
				description: editVacancyForm.description.trim() || null,
				requirements: editVacancyForm.requirements.trim() || null,
				benefits: editVacancyForm.benefits.trim() || null
			};
			try {
				const res = await fetch(`${API_URL}/vacancy/${editingVacancy.id_vacancy}`, {
					method: 'PUT',
					headers: authHeaders,
					body: JSON.stringify(body)
				});
				if (!res.ok) throw new Error('Error al guardar');
				vacancies = vacancies.map((v) =>
					v.id_vacancy === editingVacancy!.id_vacancy ? { ...v, ...body } : v
				);
				editVacancyMessage = { text: 'Vacante actualizada correctamente.', ok: true };
				editingVacancy = null;
			} catch {
				editVacancyMessage = { text: 'Error al guardar los cambios.', ok: false };
			} finally {
				editVacancySaving = false;
			}
		},

		// ----------------------------------RESEÑAS--------------------------------------------------

		async loadReviews() {
			if (!companyId) return;
			reviewsLoading = true;
			reviewsError = null;
			try {
				const res = await fetch(`${API_URL}/reviews/company/${companyId}`, {
					headers: authHeaders
				});
				const data = await res.json();
				reviews = Array.isArray(data) ? data : [];
			} catch {
				reviewsError = 'Error al cargar las reseñas.';
			} finally {
				reviewsLoading = false;
			}
		},

		// ----------------------------APLICACIONES--------------------------------------

		async loadApplications() {
			if (!companyId) return;
			applicationsLoading = true;
			applicationsError = null;
			try {
				const res = await fetch(`${API_URL}/companies/${companyId}/applications`, {
					headers: authHeaders
				});
				const data = await res.json();
				applications = Array.isArray(data) ? data : [];
			} catch {
				applicationsError = 'Error al cargar postulaciones.';
			} finally {
				applicationsLoading = false;
			}
		},

		async updateStatus(applicationId: string, status: ApplicationStatus) {
			updatingStatus = applicationId;
			try {
				await fetch(`${API_URL}/applications/${applicationId}/status`, {
					method: 'PUT',
					headers: authHeaders,
					body: JSON.stringify({ status })
				});
				applications = applications.map((a) =>
					a.id_application === applicationId ? { ...a, status } : a
				);
			} catch {
			} finally {
				updatingStatus = null;
			}
		}
	};
}

export const companyDashboardStore = createCompanyDashboardStore();
