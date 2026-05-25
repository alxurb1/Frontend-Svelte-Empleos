import { API_URL } from '$lib/config';

// ----------------------------------------TYPES--------------------------------------------

export interface Skill {
	id_skill: string;
	name: string;
}

export interface WorkExperience {
	id_experience: string;
	job_title: string;
	company_name: string;
	start_year: number;
	end_year: number | null;
	description?: string;
}

export interface CV {
	id_cv: string;
	file_name: string;
	file_url: string;
	uploaded_at: string;
}

export interface CandidateProfile {
	full_name?: string;
	email?: string;
	phone?: string;
	location?: string;
	linkedin_url?: string;
	bio?: string;
	professional_title?: string;
	avatar_url?: string;
	skills?: Skill[];
	work_experiences?: WorkExperience[];
	cvs?: CV[];
}

export interface ProfileForm {
	full_name: string;
	email: string;
	phone: string;
	location: string;
	linkedin_url: string;
	professional_title: string;
	bio: string;
}

export interface ExperienceForm {
	job_title: string;
	company_name: string;
	start_year: string;
	end_year: string;
	description: string;
}

export interface AlertForm {
	name: string;
	keywords: string;
	location: string;
	frequency: string;
}

export interface Alert {
	id_alert: string;
	name: string;
	keywords?: string;
	frequency: string;
	is_active: boolean;
}

export interface Application {
	id_application: string;
	status: ApplicationStatus;
	applied_at: string;
	vacancies?: {
		title?: string;
		companies?: { name?: string };
	};
}

export type ApplicationStatus = 'pending' | 'reviewing' | 'interview' | 'offer' | 'rejected';

export interface ProfileView {
	id_view: string;
	viewer_name?: string;
	viewer_title?: string;
	viewer_avatar?: string;
	viewed_at: string;
}

export const STATUS_LABELS: Record<ApplicationStatus, { label: string; color: string }> = {
	pending: { label: 'Pendiente', color: 'bg-gray-100 text-gray-600' },
	reviewing: { label: 'En Revisión', color: 'bg-yellow-100 text-yellow-700' },
	interview: { label: 'Entrevista Programada', color: 'bg-blue-100 text-blue-700' },
	offer: { label: 'Oferta', color: 'bg-green-100 text-green-700' },
	rejected: { label: 'Rechazado', color: 'bg-red-100 text-red-600' }
};

export const getInitials = (name?: string): string => {
	if (!name) return '?';
	return name
		.split(' ')
		.slice(0, 2)
		.map((n) => n[0].toUpperCase())
		.join('');
};

export const formatDate = (date?: string): string => {
	if (!date) return '—';
	return new Date(date).toLocaleDateString('es-SV');
};

export const calculateProgress = (profile: CandidateProfile): number => {
	const fields = [
		profile.full_name,
		profile.email,
		profile.phone,
		profile.location,
		profile.linkedin_url,
		profile.bio,
		profile.professional_title
	];
	const completed = fields.filter(Boolean).length;
	const hasSkills = (profile.skills?.length ?? 0) > 0 ? 1 : 0;
	const hasExp = (profile.work_experiences?.length ?? 0) > 0 ? 1 : 0;
	const hasCv = (profile.cvs?.length ?? 0) > 0 ? 1 : 0;
	return Math.round(((completed + hasSkills + hasExp + hasCv) / (fields.length + 3)) * 100);
};

const emptyProfileForm = (): ProfileForm => ({
	full_name: '',
	email: '',
	phone: '',
	location: '',
	linkedin_url: '',
	professional_title: '',
	bio: ''
});

const emptyExperienceForm = (): ExperienceForm => ({
	job_title: '',
	company_name: '',
	start_year: '',
	end_year: '',
	description: ''
});

const emptyAlertForm = (): AlertForm => ({
	name: '',
	keywords: '',
	location: '',
	frequency: 'daily'
});

// -----------------------------------------------STORES---------------------------------

function createProfileStore() {
	// Auth — leídos en cada llamada para reflejar la sesión actual
	const getUserId = () =>
		typeof localStorage !== 'undefined' ? localStorage.getItem('userId') : null;
	const getAuthHeaders = () => {
		const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
		return {
			'Content-Type': 'application/json',
			...(token ? { Authorization: `Bearer ${token}` } : {})
		};
	};

	// Profile
	let profile = $state<CandidateProfile | null>(null);
	let profileForm = $state<ProfileForm>(emptyProfileForm());
	let profileLoading = $state(false);
	let profileSaving = $state(false);
	let profileMessage = $state<{ text: string; ok: boolean } | null>(null);

	// Photo
	let photoUploading = $state(false);

	// Skills
	let skillAdding = $state(false);

	// Experiences
	let experienceForm = $state<ExperienceForm>(emptyExperienceForm());
	let experienceAdding = $state(false);

	// CV
	let cvUploading = $state(false);

	// Applications
	let applications = $state<Application[]>([]);
	let applicationsLoading = $state(false);
	let applicationsError = $state<string | null>(null);

	// Views
	let views = $state<ProfileView[]>([]);
	let viewsLoading = $state(false);
	let viewsError = $state<string | null>(null);

	// Alerts
	let alerts = $state<Alert[]>([]);
	let alertForm = $state<AlertForm>(emptyAlertForm());
	let alertCreating = $state(false);
	let alertsLoading = $state(false);

	return {
		get userId() {
			return getUserId();
		},
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
		get photoUploading() {
			return photoUploading;
		},
		get skillAdding() {
			return skillAdding;
		},
		get experienceForm() {
			return experienceForm;
		},
		get experienceAdding() {
			return experienceAdding;
		},
		get cvUploading() {
			return cvUploading;
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
		get views() {
			return views;
		},
		get viewsLoading() {
			return viewsLoading;
		},
		get viewsError() {
			return viewsError;
		},
		get alerts() {
			return alerts;
		},
		get alertForm() {
			return alertForm;
		},
		get alertCreating() {
			return alertCreating;
		},
		get alertsLoading() {
			return alertsLoading;
		},

		// ------------------------------------------PROFILE-----------------------------------------s

		async loadProfile() {
			if (!getUserId()) return;
			profileLoading = true;
			try {
				const res = await fetch(`${API_URL}/me/${getUserId()}/profile`);
				const data: CandidateProfile = await res.json();
				profile = data;
				profileForm = {
					full_name: data.full_name ?? '',
					email: data.email ?? '',
					phone: data.phone ?? '',
					location: data.location ?? '',
					linkedin_url: data.linkedin_url ?? '',
					professional_title: data.professional_title ?? '',
					bio: data.bio ?? ''
				};
			} catch {
				profileMessage = { text: 'Error al cargar el perfil.', ok: false };
			} finally {
				profileLoading = false;
			}
		},

		async saveProfile() {
			if (!getUserId()) return;
			profileSaving = true;
			profileMessage = null;

			const { email, ...rest } = profileForm;
			const body = Object.fromEntries(
				Object.entries(rest).map(([k, v]) => [k, (v as string).trim() || null])
			);

			try {
				const res = await fetch(`${API_URL}/me/${getUserId()}/profile`, {
					method: 'PUT',
					headers: getAuthHeaders(),
					body: JSON.stringify(body)
				});
				if (!res.ok) {
					const err = await res.json();
					throw new Error(err.message ?? 'Error en el servidor');
				}
				if (profile) profile = { ...profile, ...body } as CandidateProfile;
				profileMessage = { text: 'Perfil actualizado correctamente.', ok: true };
			} catch (e) {
				profileMessage = { text: e instanceof Error ? e.message : 'Error al guardar.', ok: false };
			} finally {
				profileSaving = false;
			}
		},

		async uploadPhoto(file: File) {
			if (!getUserId()) return;
			if (!file.type.startsWith('image/')) {
				profileMessage = { text: 'Por favor selecciona una imagen válida.', ok: false };
				return;
			}
			if (file.size > 5 * 1024 * 1024) {
				profileMessage = { text: 'La imagen no puede superar los 5MB.', ok: false };
				return;
			}

			photoUploading = true;
			const formData = new FormData();
			formData.append('photo', file);

			try {
				const res = await fetch(`${API_URL}/me/${getUserId()}/photo`, {
					method: 'POST',
					body: formData
				});
				const data = await res.json();
				if (data.avatar_url && profile) {
					profile = { ...profile, avatar_url: data.avatar_url };
				} else {
					await this.loadProfile();
				}
				profileMessage = { text: 'Foto actualizada correctamente.', ok: true };
			} catch {
				profileMessage = { text: 'Error al subir la foto.', ok: false };
			} finally {
				photoUploading = false;
			}
		},

		// ------------------------------SKILLS-------------------------------------------

		async addSkill(name: string) {
			const trimmed = name.trim();
			if (!trimmed || !getUserId()) return;
			skillAdding = true;
			try {
				await fetch(`${API_URL}/me/${getUserId()}/skills`, {
					method: 'POST',
					headers: getAuthHeaders(),
					body: JSON.stringify({ name: trimmed })
				});
				await this.loadProfile();
			} finally {
				skillAdding = false;
			}
		},

		async deleteSkill(skillId: string) {
			await fetch(`${API_URL}/me/skills/${skillId}`, { method: 'DELETE', headers: getAuthHeaders() });
			await this.loadProfile();
		},

		// +--------------------------------------EXPERIENCIAS+---------------------------------------

		async addExperience() {
			if (!getUserId()) return;
			const body = {
				job_title: experienceForm.job_title.trim(),
				company_name: experienceForm.company_name.trim(),
				start_year: parseInt(experienceForm.start_year),
				end_year: experienceForm.end_year ? parseInt(experienceForm.end_year) : null,
				description: experienceForm.description.trim() || null
			};
			if (!body.job_title || !body.company_name || !body.start_year) {
				profileMessage = { text: 'Cargo, empresa y año de inicio son obligatorios.', ok: false };
				return;
			}
			experienceAdding = true;
			try {
				await fetch(`${API_URL}/me/${getUserId()}/experience`, {
					method: 'POST',
					headers: getAuthHeaders(),
					body: JSON.stringify(body)
				});
				experienceForm = emptyExperienceForm();
				await this.loadProfile();
			} finally {
				experienceAdding = false;
			}
		},

		async deleteExperience(experienceId: string) {
			await fetch(`${API_URL}/me/experience/${experienceId}`, {
				method: 'DELETE',
				headers: getAuthHeaders()
			});
			await this.loadProfile();
		},

		// ---------------------------------------------CV-------------------------------------s

		async uploadCV(file: File) {
			if (!getUserId()) return;
			cvUploading = true;
			const formData = new FormData();
			formData.append('cv', file);
			try {
				await fetch(`${API_URL}/me/${getUserId()}/cv`, { method: 'POST', body: formData });
				profileMessage = { text: 'CV subido correctamente.', ok: true };
				await this.loadProfile();
			} catch {
				profileMessage = { text: 'Error al subir el CV.', ok: false };
			} finally {
				cvUploading = false;
			}
		},

		async deleteCV(cvId: string) {
			await fetch(`${API_URL}/me/cv/${cvId}`, { method: 'DELETE', headers: getAuthHeaders() });
			await this.loadProfile();
		},

		// ----------------------------------------APLICACIONES VACANTES-----------------------------------

		async loadApplications() {
			if (!getUserId()) return;
			applicationsLoading = true;
			applicationsError = null;
			try {
				const res = await fetch(`${API_URL}/me/${getUserId()}/applications`, {
					headers: getAuthHeaders()
				});
				const data = await res.json();
				applications = Array.isArray(data) ? data : [];
			} catch {
				applicationsError = 'Error al cargar las postulaciones.';
			} finally {
				applicationsLoading = false;
			}
		},

		// ----------------------------------------VISTAS DE PERFIL-----------------------------------

		async loadViews() {
			if (!getUserId()) return;
			viewsLoading = true;
			viewsError = null;
			try {
				const res = await fetch(`${API_URL}/me/${getUserId()}/views`, { headers: getAuthHeaders() });
				const data = await res.json();
				views = Array.isArray(data) ? data : [];
			} catch {
				viewsError = 'Error al cargar las vistas.';
			} finally {
				viewsLoading = false;
			}
		},

		//------------------------------------------ALERTAS--------------------------------------------s

		async loadAlerts() {
			if (!getUserId()) return;
			alertsLoading = true;
			try {
				const res = await fetch(`${API_URL}/me/${getUserId()}/alerts`, { headers: getAuthHeaders() });
				const data = await res.json();
				alerts = Array.isArray(data) ? data : [];
			} catch {
				// silent
			} finally {
				alertsLoading = false;
			}
		},

		async createAlert() {
			if (!alertForm.name.trim() || !getUserId()) {
				profileMessage = { text: 'El nombre de la alerta es obligatorio.', ok: false };
				return;
			}
			alertCreating = true;
			try {
				await fetch(`${API_URL}/me/${getUserId()}/alerts`, {
					method: 'POST',
					headers: getAuthHeaders(),
					body: JSON.stringify(alertForm)
				});
				alertForm = emptyAlertForm();
				await this.loadAlerts();
			} finally {
				alertCreating = false;
			}
		},

		async toggleAlert(alertId: string, isActive: boolean) {
			await fetch(`${API_URL}/me/alerts/${alertId}`, {
				method: 'PUT',
				headers: getAuthHeaders(),
				body: JSON.stringify({ is_active: isActive })
			});
			alerts = alerts.map((a) => (a.id_alert === alertId ? { ...a, is_active: isActive } : a));
		},

		async deleteAlert(alertId: string) {
			await fetch(`${API_URL}/me/alerts/${alertId}`, {
				method: 'DELETE',
				headers: getAuthHeaders()
			});
			await this.loadAlerts();
		}
	};
}

export const profileStore = createProfileStore();