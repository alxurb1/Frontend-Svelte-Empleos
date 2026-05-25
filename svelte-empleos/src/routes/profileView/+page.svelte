<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { profileStore, getInitials } from '$lib/stores/profileStore.svelte';

	import { Download, Mail, Phone, FileUser, LogOut } from 'lucide-svelte';

	const myId = typeof localStorage !== 'undefined' ? localStorage.getItem('userId') : null;
	const userRole = typeof localStorage !== 'undefined' ? localStorage.getItem('userRole') : null;
	const isAdmin = userRole === 'admin';

	let urlId = $derived($page.url.searchParams.get('id'));
	let isOwnProfile = $derived(urlId === myId || (!urlId && !!myId));

	const logout = () => {
		localStorage.clear();
		window.location.href = '/login';
	};

	onMount(() => {
		profileStore.fetchProfile(urlId);
	});
</script>

<!-- LOADING -->
{#if profileStore.loading}
	<div class="flex flex-col items-center justify-center gap-3 py-20">
		<div
			class="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"
		></div>
		<p class="text-sm text-gray-400">Cargando perfil...</p>
	</div>

	<!-- ERROR -->
{:else if profileStore.error}
	<div class="mx-auto mt-8 max-w-xl px-4">
		<div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
			{profileStore.error}
		</div>
	</div>

	<!-- CONTENIDO -->
{:else if profileStore.profile}
	{@const p = profileStore.profile}

	<div class="mx-auto max-w-6xl px-4 py-6">
		<div class="grid grid-cols-1 {isAdmin ? '' : 'md:grid-cols-4'} gap-4">
			<!-- ─── Columna izquierda ─── -->
			<div class={isAdmin ? 'mx-auto w-full max-w-sm' : 'md:col-span-1'}>
				<div class="rounded-2xl bg-white p-5 text-center shadow-sm">
					<!-- Avatar -->
					<div
						class="mx-auto mb-3 flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-600"
					>
						{#if p.avatar_url}
							<img src={p.avatar_url} alt="Avatar" class="h-full w-full object-cover" />
						{:else}
							<span class="text-2xl font-bold text-white">{getInitials(p.full_name)}</span>
						{/if}
					</div>

					<h2 class="mb-0.5 text-base font-bold text-gray-900">{p.full_name ?? ''}</h2>
					<p class="mb-4 text-sm text-blue-600">{p.professional_title ?? ''}</p>

					<!-- CV download -->
					{#if p.cvs && p.cvs.length > 0}
						<a
							href={p.cvs[0].file_url}
							target="_blank"
							rel="noopener"
							class="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-blue-400 hover:text-blue-600"
						>
							<Download size={16} />
							Descargar CV
						</a>
					{/if}

					<hr class="mb-4 border-gray-100" />

					<!-- Contact info -->
					<div class="space-y-2.5 text-left">
						{#if p.email}
							<div class="flex items-center gap-2 text-sm text-gray-600">
								<Mail size={16} class="shrink-0 text-gray-400" />
								<span class="break-all">{p.email}</span>
							</div>
						{/if}

						<div class="flex items-center gap-2 text-sm text-gray-600">
							<Phone size={16} class="shrink-0 text-gray-400" />
							<span>{p.phone ?? 'No registrado'}</span>
						</div>

						{#if p.linkedin_url}
							<div class="flex items-center gap-2 text-sm">
								<FileUser size={16} class="shrink-0 text-gray-400" />
								<a
									href={p.linkedin_url}
									target="_blank"
									rel="noopener"
									class="text-blue-600 hover:underline"
								>
									LinkedIn
								</a>
							</div>
						{/if}
					</div>
				</div>

				<!-- Logout (solo perfil propio) -->
				{#if isOwnProfile}
					<div class="mt-4 {isAdmin ? 'text-center' : ''}">
						<button
							onclick={logout}
							class="flex items-center gap-2 rounded-xl border-2 border-red-200 px-4 py-2 text-sm font-semibold text-red-500 transition-colors hover:border-red-400 hover:bg-red-50"
						>
							<LogOut size={16} />
							Cerrar sesión
						</button>
					</div>
				{/if}
			</div>

			<!-- ─── Columna derecha (oculta para admin) ─── -->
			{#if !isAdmin}
				<div class="flex flex-col gap-4 md:col-span-3">
					<!-- Sobre Mí -->
					<div class="rounded-2xl bg-white p-5 shadow-sm">
						<h3 class="mb-2 text-sm font-bold tracking-wide text-gray-800 uppercase">Sobre Mí</h3>
						<p class="text-sm leading-relaxed text-gray-500">{p.bio ?? 'Sin descripción.'}</p>
					</div>

					<!-- Experiencia Laboral -->
					<div class="rounded-2xl bg-white p-5 shadow-sm">
						<h3 class="mb-3 text-sm font-bold tracking-wide text-gray-800 uppercase">
							Experiencia Laboral
						</h3>

						{#if !p.work_experiences || p.work_experiences.length === 0}
							<p class="text-sm text-gray-400">Sin experiencia registrada.</p>
						{:else}
							<div class="space-y-2">
								{#each p.work_experiences as exp}
									<div class="rounded-xl bg-gray-50 px-4 py-3">
										<p class="text-sm font-semibold text-gray-800">{exp.job_title}</p>
										<p class="text-sm text-gray-500">{exp.company_name}</p>
										<p class="text-xs text-gray-400">
											{exp.start_year} – {exp.end_year ?? 'Actualidad'}
										</p>
										{#if exp.description}
											<p class="mt-1 text-sm text-gray-500">{exp.description}</p>
										{/if}
									</div>
									align_even{/each}
							</div>
						{/if}
					</div>

					<!-- Habilidades -->
					<div class="rounded-2xl bg-white p-5 shadow-sm">
						<h3 class="mb-3 text-sm font-bold tracking-wide text-gray-800 uppercase">
							Habilidades
						</h3>

						{#if !p.skills || p.skills.length === 0}
							<p class="text-sm text-gray-400">Sin habilidades registradas.</p>
						{:else}
							<div class="flex flex-wrap gap-2">
								{#each p.skills as skill}
									<span class="rounded-full bg-gray-900 px-3 py-1.5 text-xs font-medium text-white">
										{skill.name}
									</span>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}