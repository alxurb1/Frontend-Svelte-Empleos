<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { vacancyDetailStore } from '$lib/stores/vacancyDetailsStore.svelte';
	import {
		MapPin,
		Briefcase,
		DollarSign,
		Clock,
		Send,
		Building2,
		Users,
		Layers,
		Package
	} from 'lucide-svelte';

	const userRole = typeof localStorage !== 'undefined' ? localStorage.getItem('userRole') : null;
	const isCompany = userRole === 'company';

	const formatK = (num: number) => `${Math.round(num / 1000)}K`;

	const formatSalario = (min: number | null, max: number | null): string => {
		if (!min && !max) return 'Salario no especificado';
		if (min && max) return `$${formatK(min)} – $${formatK(max)} mensual`;
		if (min) return `Desde $${formatK(min)} mensual`;
		return `Hasta $${formatK(max!)} mensual`;
	};

	const formatFecha = (fecha: string): string => {
		if (!fecha) return '';
		const dias = Math.floor((Date.now() - new Date(fecha).getTime()) / 86_400_000);
		if (dias === 0) return 'Hoy';
		if (dias === 1) return 'Hace 1 día';
		return `Hace ${dias} días`;
	};

	const formatContrato = (tipo: string): string =>
		({
			full_time: 'Tiempo Completo',
			part_time: 'Medio Tiempo',
			freelance: 'Freelance',
			contract: 'Contrato'
		})[tipo] ??
		tipo ??
		'No especificado';

	const formatNivel = (nivel: string): string =>
		({ junior: 'Junior', mid: 'Mid', senior: 'Senior', executive: 'Ejecutivo' })[nivel] ??
		nivel ??
		'';

	onMount(() => {
		const id = $page.url.searchParams.get('id');
		if (id) vacancyDetailStore.fetchVacancy(id);
	});

	const { vacancy, similarVacancies, loading, error, applying, applyMessage, applySuccess } =
		$derived(vacancyDetailStore);
</script>

<!-- LOADING -->
{#if loading}
	<div class="flex flex-col items-center justify-center gap-3 py-20">
		<div
			class="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"
		></div>
		<p class="text-sm text-gray-400">Cargando empleo...</p>
	</div>

	<!-- ERROR -->
{:else if error}
	<div class="container mx-auto mt-6 px-4">
		<div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
			{error}
		</div>
	</div>

	<!-- CONTENIDO -->
{:else if vacancy}
	<div class="mx-auto max-w-6xl px-4 py-6">
		<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
			<!-- ─── Columna izquierda ─── -->
			<div class="flex flex-col gap-4 md:col-span-2">
				<!-- Header del empleo -->
				<div class="rounded-2xl bg-white p-5 shadow-sm">
					<div class="mb-4 flex items-start gap-4">
						<!-- Logo -->
						<div
							class="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100"
						>
							{#if vacancy.companies?.logo_url}
								<img
									src={vacancy.companies.logo_url}
									alt="Logo empresa"
									class="h-full w-full object-contain"
								/>
							{:else}
								<Package class="h-6 w-6 text-blue-500" />
							{/if}
						</div>

						<div class="min-w-0 flex-1">
							<div class="flex items-start justify-between gap-2">
								<h1 class="text-lg leading-snug font-bold text-gray-900">{vacancy.title}</h1>
								{#if vacancy.experience_level}
									<span
										class="shrink-0 rounded-full bg-gray-900 px-3 py-0.5 text-xs font-semibold text-white"
									>
										{formatNivel(vacancy.experience_level)}
									</span>
								{/if}
							</div>
							<p class="mt-0.5 text-sm text-gray-500">{vacancy.companies?.name ?? ''}</p>
						</div>
					</div>

					<div class="mb-4 flex flex-wrap gap-3">
						<span class="flex items-center gap-1 text-sm text-gray-500">
							<MapPin class="h-4 w-4" />
							{vacancy.location ?? 'No especificada'}
						</span>
						<span class="flex items-center gap-1 text-sm text-gray-500">
							<Briefcase class="h-4 w-4" />
							{formatContrato(vacancy.contract_type)}
						</span>
						<span class="flex items-center gap-1 text-sm font-semibold text-green-600">
							<DollarSign class="h-4 w-4" />
							{formatSalario(vacancy.salary_min, vacancy.salary_max)}
						</span>
						<span class="flex items-center gap-1 text-sm text-gray-400">
							<Clock class="h-4 w-4" />
							{formatFecha(vacancy.published_at)}
						</span>
					</div>

					<!-- Botón postular -->
					{#if !isCompany}
						<button
							onclick={() => vacancyDetailStore.apply(vacancy!.id_vacancy)}
							disabled={applying}
							class="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:bg-blue-400"
						>
							{#if applying}
								<div
									class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
								></div>
								Enviando...
							{:else}
								<Send class="h-4 w-4" />
								Postularse Ahora
							{/if}
						</button>

						{#if applyMessage}
							<p class="mt-2 text-sm {applySuccess ? 'text-green-600' : 'text-red-500'}">
								{applyMessage}
							</p>
						{/if}
					{/if}
				</div>

				<!-- Descripción -->
				<div class="rounded-2xl bg-white p-5 shadow-sm">
					<h2 class="mb-2 text-sm font-bold tracking-wide text-gray-800 uppercase">
						Descripción del puesto
					</h2>
					<p class="text-sm leading-relaxed whitespace-pre-line text-gray-600">
						{vacancy.description ?? 'Sin descripción.'}
					</p>
				</div>

				<!-- Requisitos -->
				<div class="rounded-2xl bg-white p-5 shadow-sm">
					<h2 class="mb-2 text-sm font-bold tracking-wide text-gray-800 uppercase">Requisitos</h2>
					<p class="text-sm leading-relaxed whitespace-pre-line text-gray-600">
						{vacancy.requirements ?? 'Sin requisitos especificados.'}
					</p>
				</div>

				<!-- Beneficios -->
				<div class="rounded-2xl bg-white p-5 shadow-sm">
					<h2 class="mb-2 text-sm font-bold tracking-wide text-gray-800 uppercase">Beneficios</h2>
					<p class="text-sm leading-relaxed whitespace-pre-line text-gray-600">
						{vacancy.benefits ?? 'Sin beneficios especificados.'}
					</p>
				</div>
			</div>

			<!-- ─── Columna derecha ─── -->
			<div class="flex flex-col gap-4">
				<!-- Sobre la Empresa -->
				<div class="rounded-2xl bg-white p-5 shadow-sm">
					<h2 class="mb-4 text-sm font-bold tracking-wide text-gray-800 uppercase">
						Sobre la Empresa
					</h2>

					<div class="mb-4 flex items-center gap-3">
						<div
							class="justify-content-center flex h-14 w-14 shrink-0 items-center overflow-hidden rounded-xl bg-gray-100"
						>
							{#if vacancy.companies?.logo_url}
								<img
									src={vacancy.companies.logo_url}
									alt="Logo"
									class="h-full w-full object-contain"
								/>
							{:else}
								<Building2 class="h-7 w-7 text-gray-400" />
							{/if}
						</div>
						<div>
							<p class="text-xs text-gray-400">Empresa</p>
							<p class="text-sm font-semibold text-gray-800">{vacancy.companies?.name ?? ''}</p>
						</div>
					</div>

					{#if vacancy.companies?.location}
						<div class="mb-3 flex items-start gap-2">
							<MapPin class="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
							<div>
								<p class="text-xs text-gray-400">Ubicación</p>
								<p class="text-sm font-semibold text-gray-800">{vacancy.companies.location}</p>
							</div>
						</div>
					{/if}

					{#if vacancy.companies?.size}
						<div class="mb-3 flex items-start gap-2">
							<Users class="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
							<div>
								<p class="text-xs text-gray-400">Tamaño</p>
								<p class="text-sm font-semibold text-gray-800">{vacancy.companies.size}</p>
							</div>
						</div>
					{/if}

					{#if vacancy.companies?.sector}
						<div class="mb-3 flex items-start gap-2">
							<Layers class="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
							<div>
								<p class="text-xs text-gray-400">Sector</p>
								<p class="text-sm font-semibold text-gray-800">{vacancy.companies.sector}</p>
							</div>
						</div>
					{/if}

					{#if vacancy.companies?.description}
						<p class="mb-4 text-sm leading-relaxed text-gray-500">
							{vacancy.companies.description}
						</p>
					{/if}

					{#if vacancy.companies?.id_company}
						<a
							href={`/companyView?id=${vacancy.companies.id_company}`}
							class="block rounded-xl border border-gray-200 py-2 text-center text-sm font-medium text-gray-600 transition-colors hover:border-blue-400 hover:text-blue-600"
						>
							Ver Perfil Completo
						</a>
					{/if}
				</div>

				<!-- Información de Contacto -->
				<div class="rounded-2xl bg-white p-5 shadow-sm">
					<h2 class="mb-4 text-sm font-bold tracking-wide text-gray-800 uppercase">
						Información de Contacto
					</h2>

					{#each [{ label: 'Email', value: vacancy.companies?.email }, { label: 'Teléfono', value: vacancy.companies?.phone }, { label: 'Sitio Web', value: vacancy.companies?.website }] as item}
						{#if item.value}
							<div class="mb-3 last:mb-0">
								<p class="text-xs text-gray-400">{item.label}</p>
								<p class="text-sm font-semibold text-gray-800">{item.value}</p>
							</div>
						{/if}
					{/each}
				</div>

				<!-- Empleos Similares -->
				<div class="rounded-2xl bg-white p-5 shadow-sm">
					<h2 class="mb-4 text-sm font-bold tracking-wide text-gray-800 uppercase">
						Empleos Similares
					</h2>

					{#if similarVacancies.length === 0}
						<p class="text-sm text-gray-400">Sin empleos similares.</p>
					{:else}
						{#each similarVacancies as v}
							<a
								href={`/vacancyDetails?id=${v.id_vacancy}`}
								class="group mb-3 flex items-center gap-3 last:mb-0"
							>
								<div
									class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100"
								>
									<Package class="h-5 w-5 text-blue-500" />
								</div>
								<div>
									<p
										class="text-sm font-semibold text-gray-800 transition-colors group-hover:text-blue-600"
									>
										{v.title}
									</p>
									<p class="text-xs text-gray-400">{v.companies?.name ?? ''}</p>
								</div>
							</a>
						{/each}
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}