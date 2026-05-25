import { API_URL } from '$lib/config';

export interface WorkExperience {
	job_title: string;
	company_name: string;
	start_year: string | number;
	end_year?: string | number | null;
	description?: string;
}

export interface Skill {
	name: string;
}

export interface CV {
	file_url: string;
}

export interface UserProfile {
	full_name?: string;
	professional_title?: string;
	email?: string;
	phone?: string;
	bio?: string;
	avatar_url?: string;
	linkedin_url?: string;
	cvs?: CV[];
	work_experiences?: WorkExperience[];
	skills?: Skill[];
}

export const getInitials = (name?: string) => {
	if (!name) return '?';
	return name
		.split(' ')
		.slice(0, 2)
		.map((n) => n[0].toUpperCase())
		.join('');
};

function createProfileStore() {
	let profile = $state<UserProfile | null>(null);
	let loading = $state(true);
  let error = $state<string | null>(null);
  let viewCount = $state<number | null>(null)
	let recordingView = $state(false)

	return {
		get profile() {
			return profile;
		},
		get loading() {
			return loading;
		},
		get error() {
			return error;
		},
    get viewCount() {
      return viewCount;
		},

    async recordingView(profileId: string) {
      const viewerId = localStorage.getItem("userId");
      if (!viewerId || viewerId === profileId) return;

      recordingView = true;
       try {
         const res = await fetch(`${API_URL}/me/${profileId}/view`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ id_viewer: viewerId })
         });
         const data = await res.json();
         viewCount = data.view_count ?? null;
       } catch {

       } finally {
         recordingView = false;
       }
    },

    async fetchProfile(id: string | null) {
			const resolvedId =
				id ?? (typeof localStorage !== 'undefined' ? localStorage.getItem('userId') : null);

			if (!resolvedId) {
				error = 'No se especificó un usuario o debes iniciar sesión.';
				loading = false;
				return;
			}

			try {
				const res = await fetch(`${API_URL}/me/${resolvedId}/profile`);
				if (!res.ok) throw new Error('Error al cargar el perfil');
				profile = await res.json();
			} catch (e) {
				error = e instanceof Error ? e.message : 'No se pudo cargar el perfil.';
			} finally {
				loading = false;
			}
		}
	};
}

export const profileStore = createProfileStore();
