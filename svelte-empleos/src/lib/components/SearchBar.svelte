<script lang="ts">
	import { Search, X } from 'lucide-svelte';
	import type { SearchFilters } from '$lib/stores/vacancyStore.svelte';

	interface Props {
		onsearch: (filters: SearchFilters) => void;
	}

	let { onsearch }: Props = $props();

	let keyword = $state('');
	let location = $state('');
	let type = $state('');
	let salary = $state('');
	let experience = $state('');

	const departamentos = [
		'Ahuachapan',
		'Cabañas',
		'Chalatenango',
		'Cuscatlán',
		'La Unión',
		'La Libertad',
		'La Paz',
		'Santa Ana',
		'San Salvador',
		'San Vicente',
		'San Miguel',
		'Sonsonate',
		'Morazán',
		'Usulután'
	];

	let hasFilters = $derived(!!(keyword || location || type || salary || experience));

	function handleSearch() {
		const filters: SearchFilters = {};
		if (keyword) filters.keyword = keyword;
		if (location) filters.location = location;
		if (type) filters.type = type;
		if (salary) filters.salary = salary;
		if (experience) filters.experience = experience;
		onsearch(filters);
	}

	function clearFilters() {
		keyword = '';
		location = '';
		type = '';
		salary = '';
		experience = '';
		onsearch({});
	}
</script>

<div class="mx-auto w-full max-w-2xl rounded-xl bg-white p-4 shadow-sm">
	<div class="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
		<input
			type="text"
			bind:value={keyword}
			placeholder="Puesto o Palabra Clave"
			class="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:col-span-2 lg:col-span-1"
		/>

		<select
			bind:value={location}
			class="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
		>
			<option value="">Ubicación</option>
			{#each departamentos as dept}
				<option value={dept}>{dept}</option>
			{/each}
		</select>

		<select
			bind:value={type}
			class="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
		>
			<option value="">Tipo de Trabajo</option>
			<option value="Presencial">Presencial</option>
			<option value="Hibrido">Híbrido</option>
			<option value="Remoto">Remoto</option>
		</select>

		<select
			bind:value={salary}
			class="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
		>
			<option value="">Rango Salarial</option>
			<option value="400-600">$400 - $600</option>
			<option value="600-1000">$600 - $1,000</option>
			<option value="1500+">$1,000+</option>
		</select>
	</div>

	<div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
		<select
			bind:value={experience}
			class="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:col-span-2"
		>
			<option value="">Nivel de Experiencia</option>
			<option value="junior">Junior</option>
			<option value="mid senior">Mid Senior</option>
			<option value="senior">Senior</option>
		</select>

		<div class="flex gap-2">
			{#if hasFilters}
				<button
					onclick={clearFilters}
					class="flex items-center justify-center gap-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-100"
					title="Limpiar filtros"
				>
					<X size={16} />
				</button>
			{/if}
			<button
				onclick={handleSearch}
				class="flex flex-1 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
			>
				<Search size={16} /> Buscar
			</button>
		</div>
	</div>
</div>
