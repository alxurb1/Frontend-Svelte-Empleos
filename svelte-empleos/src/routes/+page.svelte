<script lang="ts">
	import { browser } from '$app/environment';
	import { Loader2, WifiOff, RotateCcw, Search } from 'lucide-svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import VacancyCard from '$lib/components/VacancyCard.svelte';
	import { vacancyStore } from '$lib/stores/vacancyStore.svelte';
	import type { SearchFilters } from '$lib/stores/vacancyStore.svelte';

	$effect(() => {
		if (browser) {
			vacancyStore.fetchVacancies();
		}
	});

	function handleSearch(filters: SearchFilters) {
		vacancyStore.fetchVacancies(filters);
	}
</script>

<!-- Hero -->
<section class="bg-blue-600 px-4 py-12 text-center text-white">
	<h1 class="mb-2 text-3xl leading-snug font-bold">
		Encuentra tu Próxima Oportunidad<br />Profesional
	</h1>
	<p class="mb-6 text-xl">Conectamos talento con las mejores empresas</p>
	<SearchBar onsearch={handleSearch} />
</section>

<!-- Vacancies -->
<main class="container mx-auto px-20 py-10">
	<div class="mb-4 flex items-center justify-between">
		<div>
			<h2 class="text-lg font-bold text-gray-900">Empleos Destacados</h2>
			<p class="text-sm text-gray-500">Gestión de Vacantes y Candidatos</p>
		</div>
		<a href="/searchResults">
			<button class="rounded bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700">
				Ver Todos
			</button>
		</a>
	</div>

	{#if vacancyStore.loading}
		<div class="py-16 text-center text-gray-500">
			<Loader2 class="mx-auto mb-2 animate-spin" size={32} />
			Cargando vacantes...
		</div>
	{:else if vacancyStore.error}
		<div class="flex flex-col items-center gap-3 py-16 text-center text-gray-400">
			<WifiOff size={40} />
			<p class="text-base font-medium">No se pudo conectar al servidor</p>
			<button
				onclick={() => vacancyStore.fetchVacancies()}
				class="mt-2 flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700"
			>
				<RotateCcw size={14} /> Reintentar
			</button>
		</div>
	{:else if vacancyStore.vacancies.length === 0}
		<div class="flex flex-col items-center gap-2 py-16 text-center text-gray-400">
			<Search size={32} />
			No se encontraron vacantes con esos filtros.
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each vacancyStore.vacancies as vacancy (vacancy.id_vacancy)}
				<VacancyCard {vacancy} />
			{/each}
		</div>
	{/if}
</main>
