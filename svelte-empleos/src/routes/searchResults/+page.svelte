<script lang="ts">
	import { onMount } from 'svelte';
	import { vacancyStore, type Vacancy } from '$lib/stores/vacancyStore.svelte';
	import {
		Filter,
		Briefcase,
		MapPin,
		AlertTriangle,
		Search,
		ChevronLeft,
		ChevronRight
	} from 'lucide-svelte';

	// PAGINACION
	let currentPage = $state(1);
	const jobsPerPage = 6;

	//ESTADOS DE LOS FILTROS
	let searchInput = $state('');
	let filters = $state({
		junior: false,
		medio: false,
		senior: false,
		ejecutivo: false,
		tecnologia: false,
		diseno: false,
		marketing: false,
		datos: false,
		ventas: false,
		rrhh: false,
		tiempoCompleto: false,
		medioTiempo: false,
		freelance: false,
		contrato: false
	});

	const experienceMap: Record<string, string> = {
		junior: 'junior',
		medio: 'mid',
		senior: 'senior',
		ejecutivo: 'executive'
	};

	const categoryMap: Record<string, string> = {
		tecnologia: 'Tecnología',
		diseno: 'Diseño',
		marketing: 'Marketing',
		datos: 'Datos',
		ventas: 'Ventas',
		rrhh: 'Recursos Humanos'
	};

	const contractMap: Record<string, string> = {
		tiempoCompleto: 'full_time',
		medioTiempo: 'part_time',
		freelance: 'freelance',
		contrato: 'contract'
	};

	// LISTA FILTRADA DE LAS VACANTES
	const filteredJobs = $derived(() => {
		const search = searchInput.trim().toLowerCase();

		const selectedExp = Object.keys(experienceMap)
			.filter((k) => filters[k as keyof typeof filters])
			.map((k) => experienceMap[k]);

		const selectedCat = Object.keys(categoryMap)
			.filter((k) => filters[k as keyof typeof filters])
			.map((k) => categoryMap[k]);

		const selectedCon = Object.keys(contractMap)
			.filter((k) => filters[k as keyof typeof filters])
			.map((k) => contractMap[k]);

		return vacancyStore.vacancies.filter((job: Vacancy) => {
			if ((job as any).status !== 'active') return false;

			if (search) {
				const title = job.title?.toLowerCase() ?? '';
				if (!title.includes(search)) return false;
			}
			if (selectedExp.length > 0 && !selectedExp.includes((job as any).experience_level))
				return false;
			if (selectedCat.length > 0 && !selectedCat.includes((job as any).category)) return false;
			if (selectedCon.length > 0 && !selectedCon.includes((job as any).contract_type)) return false;
			return true;
		});
	});

	const totalPages = $derived(Math.ceil(filteredJobs().length / jobsPerPage));
	const paginatedJobs = $derived(() => {
		const start = (currentPage - 1) * jobsPerPage;
		return filteredJobs().slice(start, start + jobsPerPage);
	});

	//Nos regresa a la página uno cuando se aplica un filtro
	$effect(() => {
		filteredJobs();
		currentPage = 1;
	});

	function formatSalary(min: number | null, max: number | null): string | null {
		if (!min && !max) return null;
		if (min && max) return `$${(min / 1000).toFixed(0)}K – $${(max / 1000).toFixed(0)}K`;
		if (min) return `Desde $${(min / 1000).toFixed(0)}K`;
		if (max) return `Hasta $${(max / 1000).toFixed(0)}K`;
		return null;
	}

	function timeAgo(dateStr?: string): string {
		if (!dateStr) return '—';
		const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
		if (diff === 0) return 'Hoy';
		if (diff === 1) return 'Hace 1 día';
		return `Hace ${diff} días`;
	}

	function experienceBadge(level?: string): string {
		const map: Record<string, string> = {
			junior: 'Junior',
			mid: 'Medio',
			senior: 'Senior',
			executive: 'Ejecutivo'
		};
		return map[level ?? ''] ?? level ?? '';
	}

	function contractLabel(type?: string): string {
		const map: Record<string, string> = {
			full_time: 'Tiempo Completo',
			part_time: 'Medio Tiempo',
			freelance: 'Freelance',
			contract: 'Contrato'
		};
		return map[type ?? ''] ?? type ?? '';
	}

	function clearFilters() {
		searchInput = '';
		Object.keys(filters).forEach((k) => (filters[k as keyof typeof filters] = false));
	}

	function changePage(p: number) {
		if (p < 1 || p > totalPages) return;
		currentPage = p;
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	onMount(() => {
		const q = new URLSearchParams(window.location.search).get('q');
		if (q) searchInput = q;
		vacancyStore.fetchVacancies();
	});
</script>

<!-- MAIN -->
<main class="mx-auto max-w-7xl px-4 py-8">
	<h1 class="mb-0.5 text-xl font-bold text-gray-800">Resultados de Búsqueda</h1>
	<p class="mb-6 text-sm text-gray-500">
		Encontramos <span class="font-semibold text-blue-600">{filteredJobs().length}</span> empleos que coinciden
		con tu búsqueda
	</p>

	<div class="flex flex-col gap-6 lg:flex-row">
		<!-- COLUMNA IZQUIERDA CON FILTROS -->
		<aside class="w-full shrink-0 lg:w-64">
			<div class="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
				<h2 class="mb-4 flex items-center gap-1.5 text-sm font-bold text-gray-800">
					<Filter class="h-4 w-4 text-blue-600" />
					Filtros
				</h2>

				<!-- EXPERIENCIA -->
				<p class="mb-2 text-xs font-semibold tracking-wide text-gray-400 uppercase">
					Nivel de experiencia
				</p>
				{#each [['junior', 'Junior'], ['medio', 'Medio'], ['senior', 'Senior'], ['ejecutivo', 'Ejecutivo']] as [id, label]}
					<label
						class="mb-1.5 flex cursor-pointer items-center gap-2 text-sm text-gray-700 hover:text-blue-600"
					>
						<input
							type="checkbox"
							bind:checked={filters[id as keyof typeof filters]}
							class="h-3.5 w-3.5 accent-blue-600"
						/>
						{label}
					</label>
				{/each}

				<div class="my-3 border-t border-gray-100"></div>

				<!-- Sector -->
				<p class="mb-2 text-xs font-semibold tracking-wide text-gray-400 uppercase">
					Sector Laboral
				</p>
				{#each [['tecnologia', 'Tecnología'], ['diseno', 'Diseño'], ['marketing', 'Marketing'], ['datos', 'Datos'], ['ventas', 'Ventas'], ['rrhh', 'Recursos Humanos']] as [id, label]}
					<label
						class="mb-1.5 flex cursor-pointer items-center gap-2 text-sm text-gray-700 hover:text-blue-600"
					>
						<input
							type="checkbox"
							bind:checked={filters[id as keyof typeof filters]}
							class="h-3.5 w-3.5 accent-blue-600"
						/>
						{label}
					</label>
				{/each}

				<div class="my-3 border-t border-gray-100"></div>

				<!-- CONTRATO -->
				<p class="mb-2 text-xs font-semibold tracking-wide text-gray-400 uppercase">
					Tipo de Contrato
				</p>
				{#each [['tiempoCompleto', 'Tiempo Completo'], ['medioTiempo', 'Medio Tiempo'], ['freelance', 'Freelance'], ['contrato', 'Contrato']] as [id, label]}
					<label
						class="mb-1.5 flex cursor-pointer items-center gap-2 text-sm text-gray-700 hover:text-blue-600"
					>
						<input
							type="checkbox"
							bind:checked={filters[id as keyof typeof filters]}
							class="h-3.5 w-3.5 accent-blue-600"
						/>
						{label}
					</label>
				{/each}

				<button
					onclick={clearFilters}
					class="mt-4 w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
				>
					Limpiar Filtros
				</button>
			</div>
		</aside>

		<!-- LISTA DE VACANTES -->
		<section class="min-w-0 flex-1">
			<!-- Loading -->
			{#if vacancyStore.loading}
				<div class="flex items-center justify-center py-20">
					<div
						class="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"
					></div>
				</div>

				<!-- Error -->
			{:else if vacancyStore.error}
				<div class="rounded-xl border border-red-100 bg-white p-10 text-center shadow-sm">
					<AlertTriangle class="mx-auto mb-3 h-12 w-12 text-red-400" />
					<p class="text-sm text-red-500">{vacancyStore.error}</p>
				</div>

				<!-- LISTA DE VACANTES VACÍA -->
			{:else if paginatedJobs().length === 0}
				<div class="rounded-xl border border-gray-100 bg-white p-10 text-center shadow-sm">
					<Search class="mx-auto mb-3 h-12 w-12 text-gray-300" />
					<p class="text-sm text-gray-400">
						No se encontraron empleos con los filtros seleccionados.
					</p>
				</div>

				<!-- VACANTES -->
			{:else}
				<div class="flex flex-col gap-3">
					{#each paginatedJobs() as job (job.id_vacancy)}
						{@const salary = formatSalary(job.salary_min, job.salary_max)}
						{@const badge = experienceBadge((job as any).experience_level)}
						{@const contract = contractLabel((job as any).contract_type)}
						{@const ago = timeAgo((job as any).published_at)}

						<div
							class="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-blue-100 hover:shadow-md"
						>
							<div class="flex gap-4">
								<!-- Icon -->
								<div
									class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50"
								>
									<Briefcase class="h-5 w-5 text-blue-600" />
								</div>

								<!-- Content -->
								<div class="min-w-0 flex-1">
									<div class="flex flex-wrap items-start justify-between gap-2">
										<div>
											<h3 class="text-sm leading-tight font-bold text-gray-800">
												{job.title ?? '—'}
											</h3>
										</div>
										<div class="flex shrink-0 flex-col items-end gap-1.5">
											{#if badge}
												<span
													class="rounded-full bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-white"
													>{badge}</span
												>
											{/if}
											<span class="text-xs text-gray-400">{ago}</span>
										</div>
									</div>

									{#if (job as any).description}
										<p class="mt-1.5 line-clamp-2 text-xs text-gray-500">
											{(job as any).description}
										</p>
									{/if}

									<div class="mt-2.5 flex flex-wrap items-center gap-3">
										{#if job.location}
											<span class="flex items-center gap-1 text-xs text-gray-500">
												<MapPin class="h-3.5 w-3.5" />
												{job.location}
											</span>
										{/if}
										{#if contract}
											<span class="flex items-center gap-1 text-xs text-gray-500">
												<Briefcase class="h-3.5 w-3.5" />
												{contract}
											</span>
										{/if}
										{#if salary}
											<span class="text-xs font-semibold text-green-600">{salary}</span>
										{/if}

										<a
											href={`/vacancyDetails?id=${job.id_vacancy}`}
											class="ml-auto rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white
											transition hover:bg-blue-700"
										>
											Ver Detalles
										</a>
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>

				<!-- Paginacion -->
				{#if totalPages > 1}
					<nav class="mt-8 flex items-center justify-center gap-1.5">
						<button
							onclick={() => changePage(currentPage - 1)}
							disabled={currentPage === 1}
							class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
						>
							<ChevronLeft class="h-4 w-4" />
						</button>

						{#each Array.from({ length: totalPages }, (_, i) => i + 1) as p}
							<button
								onclick={() => changePage(p)}
								class="h-8 w-8 rounded-lg text-sm font-medium transition {p === currentPage
									? 'bg-blue-600 text-white'
									: 'border border-gray-200 text-gray-500 hover:bg-gray-50'}"
							>
								{p}
							</button>
						{/each}

						<button
							onclick={() => changePage(currentPage + 1)}
							disabled={currentPage === totalPages}
							class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
						>
							<ChevronRight class="h-4 w-4" />
						</button>
					</nav>
				{/if}
			{/if}
		</section>
	</div>
</main>
