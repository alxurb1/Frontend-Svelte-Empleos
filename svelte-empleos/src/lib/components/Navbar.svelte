<script lang="ts">
	import { authStore } from '$lib/stores/authStore.svelte';
	import { API_URL } from '$lib/config';
	import { goto } from '$app/navigation';

	import { Briefcase, Menu, User, Search, FolderOpen, Star, LayoutDashboard } from 'lucide-svelte';

	let menuOpen = $state(false);

	let profileHref = $derived(
		authStore.userId ? `/profileView?id=${authStore.userId}` : '/profileView'
	);

	function miPerfilHref() {
		if (authStore.userRole === 'candidate') return '/profileEdit';
		if (authStore.userRole === 'company') return '/companyEdit';
		if (authStore.userRole === 'admin') return '/admin';
		return '#';
	}

	let searchQuery = $state('');

	function handleSearch() {
		if (searchQuery.trim()) goto(`/searchResults?q=${encodeURIComponent(searchQuery.trim())}`);
	}

	async function handleLogout() {
		try {
			const res = await fetch(`${API_URL}/auth/logout`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
			});

			if (res.ok) {
				alert('Cierre de sesión realizado con éxito');
				authStore.logout();
				goto('/');
			} else {
				const err = await res.json();
				alert(err.message);
			}
		} catch {
			alert('Error del servidor');
		}
	}
</script>

<nav class="flex flex-wrap items-center gap-3 bg-gray-100 px-3 py-3 lg:px-20">
	<a href="/" class="flex items-center gap-2 text-xl font-bold text-blue-600">
		<Briefcase class="h-6 w-6" />
		Empleos
	</a>

	<button
		class="ml-auto rounded border border-gray-300 p-2 lg:hidden"
		onclick={() => (menuOpen = !menuOpen)}
		aria-label="Toggle navigation"
	>
		<Menu class="h-6 w-6" />
	</button>

	<!-- Search (desktop) -->
	<div class="mx-auto hidden w-full max-w-md lg:block">
		<input
			type="text"
			bind:value={searchQuery}
			onkeydown={(e) => e.key === 'Enter' && handleSearch()}
			placeholder="Buscar empleos, empresas..."
			class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
		/>
	</div>

	<!-- Auth (desktop) -->
	<div class="ml-3 hidden items-center gap-2 lg:flex">
		{#if authStore.isAuthenticated}
			<a href={miPerfilHref()} class="text-blue-600" aria-label="Mi perfil">
				<User class="h-6 w-6" />
			</a>

			<button
				onclick={handleLogout}
				class="rounded border border-blue-600 px-3 py-1 text-sm text-blue-600 transition hover:bg-blue-50"
			>
				Cerrar Sesión
			</button>
		{:else}
			<a href="/login">
				<button
					class="rounded border border-gray-300 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-gray-50"
				>
					Iniciar Sesión
				</button>
			</a>

			<a href="/register">
				<button
					class="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
				>
					Registrarse
				</button>
			</a>
		{/if}
	</div>

	<!-- Mobile menu -->
	{#if menuOpen}
		<div class="mt-2 flex w-full flex-col gap-2 lg:hidden">
			<input
				type="text"
				bind:value={searchQuery}
				onkeydown={(e) => e.key === 'Enter' && handleSearch()}
				placeholder="Buscar empleos, empresas..."
				class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
			/>

			<ul class="flex flex-col gap-1 border-t pt-3">
				{#if authStore.isAuthenticated && authStore.userRole === 'admin'}
					<li>
						<a
							href="/admin"
							class="flex items-center gap-2 px-2 py-1 text-sm text-gray-800 hover:text-blue-600"
						>
							<LayoutDashboard class="h-4 w-4" />
							Dashboard
						</a>
					</li>
				{/if}

				<li>
					<a
						href="/searchResults"
						class="flex items-center gap-2 px-2 py-1 text-sm text-gray-800 hover:text-blue-600"
					>
						<Search class="h-4 w-4" />
						Buscar Empleo
					</a>
				</li>

				<li>
					<a
						href="/resources"
						class="flex items-center gap-2 px-2 py-1 text-sm text-gray-800 hover:text-blue-600"
					>
						<FolderOpen class="h-4 w-4" />
						Recursos
					</a>
				</li>

				<li>
					<a
						href="/forums_and_ratings"
						class="flex items-center gap-2 px-2 py-1 text-sm text-gray-800 hover:text-blue-600"
					>
						<Star class="h-4 w-4" />
						Valoraciones
					</a>
				</li>

				<li>
					<a
						href={miPerfilHref()}
						class="flex items-center gap-2 px-2 py-1 text-sm text-gray-800 hover:text-blue-600"
					>
						<User class="h-4 w-4" />
						Mi Perfil
					</a>
				</li>
			</ul>

			{#if authStore.isAuthenticated}
				<button
					onclick={handleLogout}
					class="w-full rounded border border-blue-600 px-3 py-2 text-sm text-blue-600 transition hover:bg-blue-50"
				>
					Cerrar Sesión
				</button>
			{:else}
				<a href="/login">
					<button
						class="w-full rounded border border-gray-300 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-gray-50"
					>
						Iniciar Sesión
					</button>
				</a>

				<a href="/register">
					<button
						class="w-full rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
					>
						Registrarse
					</button>
				</a>
			{/if}
		</div>
	{/if}
</nav>

<!-- Secondary nav (desktop) -->
<div class="hidden gap-8 border-t border-gray-200 px-20 py-3 text-sm lg:flex">
	{#if authStore.isAuthenticated && authStore.userRole === 'admin'}
		<a href="/admin" class="flex items-center gap-1 text-gray-800 transition hover:text-blue-600">
			<LayoutDashboard class="h-4 w-4" />
			Dashboard
		</a>
	{/if}

	<a
		href="/searchResults"
		class="flex items-center gap-1 text-gray-800 transition hover:text-blue-600"
	>
		<Search class="h-4 w-4" />
		Buscar Empleo
	</a>

	<a href="/resources" class="flex items-center gap-1 text-gray-800 transition hover:text-blue-600">
		<FolderOpen class="h-4 w-4" />
		Recursos
	</a>

	<a
		href="/forums_and_ratings"
		class="flex items-center gap-1 text-gray-800 transition hover:text-blue-600"
	>
		<Star class="h-4 w-4" />
		Valoraciones
	</a>

	<a
		href={miPerfilHref()}
		class="flex items-center gap-1 text-gray-800 transition hover:text-blue-600"
	>
		<User class="h-4 w-4" />
		Mi Perfil
	</a>
</div>
