<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore, type UserRole } from '$lib/stores/authStore.svelte';

	import { API_URL } from '../../lib/config';

	import { User, Building2, ShieldCheck } from 'lucide-svelte';

	type Role = 'candidate' | 'company' | 'admin';

	const ROLES = {
		candidate: 'candidate' as Role,
		company: 'company' as Role,
		admin: 'admin' as Role
	};

	let selectedRole = $state<Role>('candidate');
	let email = $state('');
	let password = $state('');
	let errorMsg = $state('');
	let loading = $state(false);

	const roleOptions = [
		{ value: 'candidate' as Role, label: 'Candidato', icon: User },
		{ value: 'company' as Role, label: 'Empresa', icon: Building2 },
		{ value: 'admin' as Role, label: 'Admin', icon: ShieldCheck }
	];

	const urlMap: Record<Role, string> = {
		candidate: `${API_URL}/auth/loginCandidate`,
		company: `${API_URL}/auth/loginCompany`,
		admin: `${API_URL}/auth/loginAdmin`
	};

	async function handleLogin() {
		errorMsg = '';

		if (!email || !password) {
			errorMsg = 'Por favor rellena los campos requeridos';
			return;
		}

		if (password.length < 8) {
			errorMsg = 'La contraseña debe tener más de 8 caracteres';
			return;
		}

		loading = true;

		try {
			const response = await fetch(urlMap[selectedRole], {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});

			if (response.ok) {
				const result = await response.json();
				const companyId: string | undefined = result.userData?.id_company;

				authStore.login(result.token, result.userData.id_user, selectedRole as UserRole);

				if (selectedRole === ROLES.company && companyId) {
					localStorage.setItem('companyId', companyId);
				}

				goto(selectedRole === ROLES.admin ? '/admin' : '/');
			} else {
				const error = await response.json();
				errorMsg = error.message ?? 'Error al iniciar sesión';
			}
		} catch {
			errorMsg = 'Error del servidor';
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
	<!-- Header -->
	<div class="mb-8 text-center">
		<h2 class="text-3xl font-bold text-gray-900">Bienvenido de nuevo</h2>
		<p class="mt-2 text-gray-500">Inicia sesión en tu cuenta de empresasPro</p>
	</div>

	<!-- Role selector -->
	<div class="mb-8 flex flex-wrap justify-center gap-3">
		{#each roleOptions as { value, label, icon: Icon }}
			<label class="cursor-pointer">
				<input
					type="radio"
					name="tipo-usuario"
					class="peer sr-only"
					bind:group={selectedRole}
					{value}
				/>
				<div
					class="
          flex w-28 flex-col items-center justify-center
          gap-1 rounded-xl border border-gray-200 bg-white p-4
          transition-all duration-150
          peer-checked:border-blue-600 peer-checked:ring-2 peer-checked:ring-blue-600
          hover:border-blue-300
        "
				>
					<Icon size={24} class="transition-colors" />
					<span class="text-sm font-semibold text-gray-700">{label}</span>
				</div>
			</label>
		{/each}
	</div>

	<!-- Card -->
	<div class="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
		{#if errorMsg}
			<div class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
				{errorMsg}
			</div>
		{/if}

		<div class="mb-5">
			<label for="loginEmail" class="mb-1.5 block text-sm font-semibold text-gray-700">
				Correo electrónico
			</label>
			<input
				id="loginEmail"
				type="email"
				placeholder="tu@email.com"
				bind:value={email}
				required
				class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900
               placeholder-gray-400 transition focus:border-transparent focus:ring-2
               focus:ring-blue-500 focus:outline-none"
			/>
		</div>

		<div class="mb-6">
			<label for="loginPassword" class="mb-1.5 block text-sm font-semibold text-gray-700">
				Contraseña
			</label>
			<input
				id="loginPassword"
				type="password"
				placeholder="••••••••••"
				bind:value={password}
				required
				class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900
               placeholder-gray-400 transition focus:border-transparent focus:ring-2
               focus:ring-blue-500 focus:outline-none"
			/>
		</div>

		<button
			onclick={handleLogin}
			disabled={loading}
			class="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white
             transition-all hover:bg-blue-700 active:scale-[0.98]
             disabled:cursor-not-allowed disabled:opacity-60"
		>
			{loading ? 'Iniciando sesión' : 'Iniciar sesión'}
		</button>
	</div>
	<p class="mt-4 text-sm text-gray-500">
		¿No tienes cuenta?
		<a href="/register" class="font-semibold text-blue-600 hover:underline">Registrate</a>
	</p>
</div>
