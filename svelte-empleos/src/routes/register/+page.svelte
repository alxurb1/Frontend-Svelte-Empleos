<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/authStore.svelte';
	import { API_URL } from '$lib/config';
	import { User, Building2 } from 'lucide-svelte';

	type Role = 'candidate' | 'company';

	const roleOptions = [
		{ value: 'candidate' as Role, label: 'Busco Empleo', icon: User },
		{ value: 'company' as Role, label: 'Soy Empresa', icon: Building2 }
	];

	let selectedRole = $state<Role>('candidate');
	let errorMsg = $state('');
	let loading = $state(false);

	let fullName = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');

	let contactName = $state('');
	let contactEmail = $state('');
	let companyName = $state('');
	let companyPassword = $state('');
	let companyConfirmPassword = $state('');

	function validatePasswords(prev: string, confirmed: string): string | null {
		if (prev !== confirmed) return 'Las contraseñas tienen que ser iguales';
		if (prev.length < 8) return 'La contraseña debe tener más de 8 caracteres';
		return null;
	}

	async function handleRegisterCandidate() {
		if (!fullName || !email || !password || !confirmPassword) {
			errorMsg = 'Por favor ingresa todos los campos';
			return;
		}

		const validationError = validatePasswords(password, confirmPassword);
		if (validationError) {
			errorMsg = validationError;
			return;
		}

		loading = true;
		errorMsg = '';

		try {
			const response = await fetch(`${API_URL}/auth/registerCandidate`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ full_name: fullName, email, password, role: 'candidate' })
			});

			if (response.ok) {
				const result = await response.json();
				authStore.login(result.token, result.userData.id_user, 'candidate');
				goto('/');
			} else {
				const error = await response.json();
				errorMsg = error.message ?? 'Error al registrarse';
			}
		} catch {
			errorMsg = 'Error del servidor';
		} finally {
			loading = false;
		}
	}

	async function handleRegisterCompany() {
		if (
			!contactName ||
			!contactEmail ||
			!companyName ||
			!companyPassword ||
			!companyConfirmPassword
		) {
			errorMsg = 'Por favor ingresa los datos requeridos';
			return;
		}

		const validationError = validatePasswords(companyPassword, companyConfirmPassword);
		if (validationError) {
			errorMsg = validationError;
			return;
		}

		loading = true;
		errorMsg = '';

		try {
			const response = await fetch(`${API_URL}/auth/registerCompany`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					full_name: contactName,
					email: contactEmail,
					password: companyPassword,
					name: companyName
				})
			});

			if (response.ok) {
				const result = await response.json();
				authStore.login(result.token, result.userData.id_user, 'company');
				const companyId = result.company?.id_company ?? result.userData?.id_company;
				if (companyId) localStorage.setItem('companyId', companyId);
				goto('/');
			} else {
				const error = await response.json();
				errorMsg = error.message ?? 'Error al registrar empresa';
			}
		} catch {
			errorMsg = 'Error del servidor';
		} finally {
			loading = false;
		}
	}

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		errorMsg = '';
		if (selectedRole === 'candidate') handleRegisterCandidate();
		else handleRegisterCompany();
	}
</script>

<div class="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
	<!-- Header -->
	<div class="mb-8 text-center">
		<h2 class="text-3xl font-bold text-gray-900">Crea tu cuenta</h2>
		<p class="mt-2 text-gray-500">Únete a EmpleosPro y comienza tu búsqueda de empleo</p>
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
					class="flex w-36 flex-col items-center justify-center gap-1 rounded-xl border
					       border-gray-200 bg-white p-4 transition-all duration-150
					       peer-checked:border-blue-600 peer-checked:ring-2 peer-checked:ring-blue-600
					       hover:border-blue-300"
				>
					<Icon size={24} />
					<span class="text-sm font-semibold text-gray-700">{label}</span>
				</div>
			</label>
		{/each}
	</div>

	<!-- Card -->
	<div class=" max-w-lg rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
		{#if errorMsg}
			<div class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
				{errorMsg}
			</div>
		{/if}

		<form onsubmit={handleSubmit}>
			{#if selectedRole === 'candidate'}
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div>
						<label for="fullName" class="mb-1.5 block text-sm font-semibold text-gray-700">
							Nombre Completo
						</label>
						<input
							id="fullName"
							type="text"
							placeholder="Ejemplo"
							bind:value={fullName}
							required
							class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900
							       placeholder-gray-400 transition focus:border-transparent focus:ring-2
							       focus:ring-blue-500 focus:outline-none"
						/>
					</div>
					<div>
						<label for="email" class="mb-1.5 block text-sm font-semibold text-gray-700">
							Correo electrónico
						</label>
						<input
							id="email"
							type="email"
							placeholder="tu@email.com"
							bind:value={email}
							required
							class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900
							       placeholder-gray-400 transition focus:border-transparent focus:ring-2
							       focus:ring-blue-500 focus:outline-none"
						/>
					</div>
					<div>
						<label for="password" class="mb-1.5 block text-sm font-semibold text-gray-700">
							Contraseña
						</label>
						<input
							id="password"
							type="password"
							placeholder="Mínimo 8 caracteres"
							bind:value={password}
							required
							class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900
							       placeholder-gray-400 transition focus:border-transparent focus:ring-2
							       focus:ring-blue-500 focus:outline-none"
						/>
					</div>
					<div>
						<label for="confirmPassword" class="mb-1.5 block text-sm font-semibold text-gray-700">
							Confirmar contraseña
						</label>
						<input
							id="confirmPassword"
							type="password"
							placeholder="Repite tu contraseña"
							bind:value={confirmPassword}
							required
							class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900
							       placeholder-gray-400 transition focus:border-transparent focus:ring-2
							       focus:ring-blue-500 focus:outline-none"
						/>
					</div>
				</div>
			{:else}
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div>
						<label for="contactName" class="mb-1.5 block text-sm font-semibold text-gray-700">
							Nombre de Contacto
						</label>
						<input
							id="contactName"
							type="text"
							placeholder="Ejemplo"
							bind:value={contactName}
							required
							class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900
							       placeholder-gray-400 transition focus:border-transparent focus:ring-2
							       focus:ring-blue-500 focus:outline-none"
						/>
					</div>
					<div>
						<label for="contactEmail" class="mb-1.5 block text-sm font-semibold text-gray-700">
							Correo electrónico del Contacto
						</label>
						<input
							id="contactEmail"
							type="email"
							placeholder="tu@email.com"
							bind:value={contactEmail}
							required
							class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900
							       placeholder-gray-400 transition focus:border-transparent focus:ring-2
							       focus:ring-blue-500 focus:outline-none"
						/>
					</div>
					<div class="sm:col-span-2">
						<label for="companyName" class="mb-1.5 block text-sm font-semibold text-gray-700">
							Nombre de la Empresa
						</label>
						<input
							id="companyName"
							type="text"
							placeholder="Ejemplo SV"
							bind:value={companyName}
							required
							class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900
							       placeholder-gray-400 transition focus:border-transparent focus:ring-2
							       focus:ring-blue-500 focus:outline-none"
						/>
					</div>
					<div>
						<label for="companyPassword" class="mb-1.5 block text-sm font-semibold text-gray-700">
							Contraseña
						</label>
						<input
							id="companyPassword"
							type="password"
							placeholder="Mínimo 8 caracteres"
							bind:value={companyPassword}
							required
							class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900
							       placeholder-gray-400 transition focus:border-transparent focus:ring-2
							       focus:ring-blue-500 focus:outline-none"
						/>
					</div>
					<div>
						<label
							for="companyConfirmPassword"
							class="mb-1.5 block text-sm font-semibold text-gray-700"
						>
							Confirmar contraseña
						</label>
						<input
							id="companyConfirmPassword"
							type="password"
							placeholder="Repite tu contraseña"
							bind:value={companyConfirmPassword}
							required
							class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900
							       placeholder-gray-400 transition focus:border-transparent focus:ring-2
							       focus:ring-blue-500 focus:outline-none"
						/>
					</div>
				</div>
			{/if}

			<button
				type="submit"
				disabled={loading}
				class="mt-6 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white
				       transition-all hover:bg-blue-700 active:scale-[0.98]
				       disabled:cursor-not-allowed disabled:opacity-60"
			>
				{loading ? 'Creando cuenta...' : 'Crear cuenta'}
			</button>
		</form>
	</div>

	<p class="mt-4 text-sm text-gray-500">
		¿Ya tienes cuenta?
		<a href="/login" class="font-semibold text-blue-600 hover:underline">Inicia sesión</a>
	</p>
</div>
