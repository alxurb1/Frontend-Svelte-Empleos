import { API_URL } from '$lib/config';

export interface Metrics {
	total_users?: number;
	total_companies?: number;
	active_vacancies?: number;
	total_forum_posts?: number;
	total_applications?: number;
	pending_reviews?: number;
}

export interface AdminUser {
	id_user: string;
	full_name?: string;
	email?: string;
	role?: string;
	created_at?: string;
	is_active: boolean;
	location?: string;
}

export interface AdminCompany {
	id_company: string;
	name?: string;
	sector?: string;
	location?: string;
	is_active: boolean;
}

export interface AdminVacancy {
	id_vacancy: string;
	title?: string;
	published_at?: string;
	status?: string;
	category?: string;
	companies?: { name?: string };
}

export interface AdminReview {
	id: string;
	comment?: string;
	created_at?: string;
	status?: string;
	users?: { full_name?: string };
	companies?: { name?: string };
}

export type VacancyStatus = 'active' | 'paused' | 'expired' | 'deleted';

export const getInitials = (name?: string) => {
	if (!name?.trim()) return '?';
	return name
		.trim()
		.split(' ')
		.filter(Boolean)
		.slice(0, 2)
		.map((n) => n[0].toUpperCase())
		.join('');
};

export const formatDate = (date?: string) => {
	if (!date) return '—';
	return new Date(date).toLocaleDateString('es-SV');
};

export const VACANCY_STATUS: Record<string, { label: string; color: string }> = {
	active: { label: 'Activo', color: 'bg-blue-600 text-white' },
	paused: { label: 'Pausado', color: 'bg-gray-400 text-white' },
	expired: { label: 'Vencido', color: 'bg-orange-400 text-white' },
	deleted: { label: 'Eliminado', color: 'bg-red-500 text-white' }
};

export const buildBarChartData = (users: AdminUser[]) => {
	const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
	const counts = Array(7).fill(0);
	const today = new Date();
	for (const u of users) {
		const d = new Date(u.created_at ?? '');
		const diff = Math.floor((today.getTime() - d.getTime()) / 86_400_000);
		if (diff < 7) counts[d.getDay()]++;
	}
	return days.map((label, i) => ({ label, value: counts[i] }));
};

export const buildSectorData = (vacancies: AdminVacancy[]) => {
	const counts: Record<string, number> = {};
	for (const v of vacancies) {
		const cat = v.category ?? 'Sin categoría';
		counts[cat] = (counts[cat] ?? 0) + 1;
	}
	return Object.entries(counts)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 5);
};

export const buildLocationData = (users: AdminUser[]) => {
	const counts: Record<string, number> = {};
	for (const u of users) {
		const loc = u.location ?? 'Sin ubicación';
		counts[loc] = (counts[loc] ?? 0) + 1;
	}
	return Object.entries(counts)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 5);
};

export const countToday = (items: { date?: string }[], dateKey: string) => {
	const hoy = new Date().toLocaleDateString('es-SV');
	return items.filter((i) => {
		const d = (i as Record<string, string>)[dateKey];
		return d ? new Date(d).toLocaleDateString('es-SV') === hoy : false;
	}).length;
};

function getAuthHeaders() {
	const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
	return {
		'Content-Type': 'application/json',
		Authorization: `Bearer ${token}`
	};
}

// STORE

function createAdminStore() {
	let metrics = $state<Metrics>({});

	// Users
	let allUsers = $state<AdminUser[]>([]);
	let userSearch = $state('');
	let usersLoading = $state(false);

	// Companies
	let allCompanies = $state<AdminCompany[]>([]);
	let companySearch = $state('');
	let companiesLoading = $state(false);

	// Vacancies
	let allVacancies = $state<AdminVacancy[]>([]);
	let vacancySearch = $state('');
	let vacanciesLoading = $state(false);

	// Reviews
	let reviews = $state<AdminReview[]>([]);
	let reviewsLoading = $state(false);

	// Actions
	let togglingUser = $state<string | null>(null);
	let togglingCompany = $state<string | null>(null);
	let changingVacancy = $state<string | null>(null);
	let moderatingReview = $state<string | null>(null);

	return {
		get metrics() {
			return metrics;
		},
		get allUsers() {
			return allUsers;
		},
		get userSearch() {
			return userSearch;
		},
		set userSearch(v: string) {
			userSearch = v;
		},
		get filteredUsers() {
			const t = userSearch.toLowerCase();
			return t
				? allUsers.filter(
						(u) => u.full_name?.toLowerCase().includes(t) || u.email?.toLowerCase().includes(t)
					)
				: allUsers;
		},
		get allCompanies() {
			return allCompanies;
		},
		get companySearch() {
			return companySearch;
		},
		set companySearch(v: string) {
			companySearch = v;
		},
		get filteredCompanies() {
			const t = companySearch.toLowerCase();
			return t ? allCompanies.filter((c) => c.name?.toLowerCase().includes(t)) : allCompanies;
		},
		get allVacancies() {
			return allVacancies;
		},
		get vacancySearch() {
			return vacancySearch;
		},
		set vacancySearch(v: string) {
			vacancySearch = v;
		},
		get filteredVacancies() {
			const t = vacancySearch.toLowerCase();
			return t ? allVacancies.filter((v) => v.title?.toLowerCase().includes(t)) : allVacancies;
		},
		get reviews() {
			return reviews;
		},
		get usersLoading() {
			return usersLoading;
		},
		get companiesLoading() {
			return companiesLoading;
		},
		get vacanciesLoading() {
			return vacanciesLoading;
		},
		get reviewsLoading() {
			return reviewsLoading;
		},
		get togglingUser() {
			return togglingUser;
		},
		get togglingCompany() {
			return togglingCompany;
		},
		get changingVacancy() {
			return changingVacancy;
		},
		get moderatingReview() {
			return moderatingReview;
		},

		get barChartData() {
			return buildBarChartData(allUsers);
		},
		get sectorData() {
			return buildSectorData(allVacancies);
		},
		get locationData() {
			return buildLocationData(allUsers);
		},
		get registrosHoy() {
			return countToday(
				allUsers.map((u) => ({ date: u.created_at })),
				'date'
			);
		},
		get vacantesHoy() {
			return countToday(
				allVacancies.map((v) => ({ date: v.published_at })),
				'date'
			);
		},

		// METRICS
		async loadMetrics() {
			try {
				const res = await fetch(`${API_URL}/admin/metrics`, { headers: getAuthHeaders() });
				metrics = await res.json();
			} catch {}
		},

		// USERS
		async loadUsers() {
			usersLoading = true;
			try {
				const res = await fetch(`${API_URL}/admin/users`, { headers: getAuthHeaders() });
				allUsers = await res.json();
			} catch {
			} finally {
				usersLoading = false;
			}
		},

		async toggleUser(id: string, currentlyActive: boolean) {
			togglingUser = id;
			allUsers = allUsers.map((u) =>
				u.id_user === id ? { ...u, is_active: !currentlyActive } : u
			);
			try {
				await fetch(`${API_URL}/admin/users/${id}/status`, {
					method: 'PUT',
					headers: getAuthHeaders(),
					body: JSON.stringify({ is_active: !currentlyActive })
				});
			} catch {
				allUsers = allUsers.map((u) =>
					u.id_user === id ? { ...u, is_active: currentlyActive } : u
				);
			} finally {
				togglingUser = null;
			}
		},

		async deleteUser(id: string) {
			if (!confirm('¿Desactivar este usuario?')) return;
			togglingUser = id;
			try {
				await fetch(`${API_URL}/admin/users/${id}`, {
					method: 'DELETE',
					headers: getAuthHeaders()
				});
				allUsers = allUsers.filter((u) => u.id_user !== id);
			} catch {
			} finally {
				togglingUser = null;
			}
		},

		// COMPANIES
		async loadCompanies() {
			companiesLoading = true;
			try {
				const res = await fetch(`${API_URL}/admin/companies`, { headers: getAuthHeaders() });
				allCompanies = await res.json();
			} catch {
			} finally {
				companiesLoading = false;
			}
		},

		async toggleCompany(id: string, currentlyActive: boolean) {
			togglingCompany = id;
			allCompanies = allCompanies.map((c) =>
				c.id_company === id ? { ...c, is_active: !currentlyActive } : c
			);
			try {
				await fetch(`${API_URL}/admin/companies/${id}/status`, {
					method: 'PUT',
					headers: getAuthHeaders(),
					body: JSON.stringify({ is_active: !currentlyActive })
				});
			} catch {
				allCompanies = allCompanies.map((c) =>
					c.id_company === id ? { ...c, is_active: currentlyActive } : c
				);
			} finally {
				togglingCompany = null;
			}
		},

		async deleteCompany(id: string) {
			if (!confirm('¿Desactivar esta empresa?')) return;
			togglingCompany = id;
			try {
				await fetch(`${API_URL}/admin/companies/${id}`, {
					method: 'DELETE',
					headers: getAuthHeaders()
				});
				allCompanies = allCompanies.filter((c) => c.id_company !== id);
			} catch {
			} finally {
				togglingCompany = null;
			}
		},

		// VACANCIES
		async loadVacancies() {
			vacanciesLoading = true;
			try {
				const res = await fetch(`${API_URL}/admin/jobs`, { headers: getAuthHeaders() });
				allVacancies = await res.json();
			} catch {
			} finally {
				vacanciesLoading = false;
			}
		},

		async changeVacancyStatus(id: string, status: VacancyStatus) {
			changingVacancy = id;
			allVacancies = allVacancies.map((v) => (v.id_vacancy === id ? { ...v, status } : v));
			try {
				await fetch(`${API_URL}/admin/jobs/${id}/status`, {
					method: 'PUT',
					headers: getAuthHeaders(),
					body: JSON.stringify({ status })
				});
			} catch {
			} finally {
				changingVacancy = null;
			}
		},

		// REVIEWS
		async loadReviews() {
			reviewsLoading = true;
			try {
				const res = await fetch(`${API_URL}/admin/reviews`, { headers: getAuthHeaders() });
				reviews = await res.json();
			} catch {
			} finally {
				reviewsLoading = false;
			}
		},

		async moderateReview(id: string, status: 'Aprobado' | 'Rechazado') {
			moderatingReview = id;
			reviews = reviews.map((r) => (r.id === id ? { ...r, status } : r));
			try {
				await fetch(`${API_URL}/admin/reviews/${id}/status`, {
					method: 'PUT',
					headers: getAuthHeaders(),
					body: JSON.stringify({ status })
				});
			} catch {
			} finally {
				moderatingReview = null;
			}
		}
	};
}

export const adminStore = createAdminStore();
