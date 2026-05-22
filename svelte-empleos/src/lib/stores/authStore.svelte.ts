import { derived } from 'svelte/store';

export type UserRole = 'candidate' | 'company' | 'admin' | null;

interface AuthState {
	token: string | null;
	userId: string | null;
	userRole: UserRole;
}

function createAuthStore() {
	let state = $state<AuthState>({
		token: typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null,
		userId: typeof localStorage !== 'undefined' ? localStorage.getItem('userId') : null,
		userRole: (typeof localStorage !== 'undefined'
			? localStorage.getItem('userRole')
			: null) as UserRole
	});

	return {
		get token() {
			return state.token;
		},
		get userId() {
			return state.userId;
		},
		get userRole() {
			return state.userRole;
		},
		get isAuthenticated() {
			return !!state.token;
		},

		login(token: string, userId: string, userRole: UserRole) {
			localStorage.setItem('token', token);
			localStorage.setItem('userId', userId);
			localStorage.setItem('userRole', userRole ?? '');
			state.token = token;
			state.userId = userId;
			state.userRole = userRole;
		},

		logout() {
			localStorage.removeItem('token');
			localStorage.removeItem('userId');
			localStorage.removeItem('userRole');
			state.token = null;
			state.userId = null;
			state.userRole = null;
		}
	};
}

export const authStore = createAuthStore();
