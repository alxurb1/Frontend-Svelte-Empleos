<script lang="ts">
	import { Layers, MapPin, Briefcase } from 'lucide-svelte';
	import type { Vacancy } from '../stores/vacancyStore.svelte';

	interface Props {
		vacancy: Vacancy;
	}

	let { vacancy }: Props = $props();

	const modalityLabel: Record<string, string> = {
		remote: 'Remoto',
		Remoto: 'Remoto',
		in_person: 'Presencial',
		Presencial: 'Presencial',
		hybrid: 'Híbrido',
		Hibrido: 'Híbrido'
	};

	let salaryText = $derived(
		vacancy.salary_min ? `$${vacancy.salary_min} - $${vacancy.salary_max}` : 'Salario a convenir'
	);
	let modality = $derived(modalityLabel[vacancy.modality] ?? 'No especificado');
	let shortCompanyId = $derived(
		vacancy.id_company ? vacancy.id_company.substring(0, 8) + '...' : 'N/A'
	);
</script>

<div class="flex h-full flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
	<div class="flex items-start gap-3">
		<div
			class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600"
		>
			<Layers size={20} />
		</div>
		<div class="min-w-0">
			<p class="truncate text-sm font-semibold text-gray-900">{vacancy.title}</p>
			<p class="text-xs text-gray-500">Empresa ID: {shortCompanyId}</p>
		</div>
	</div>

	<p class="flex items-center gap-1 text-xs text-gray-500">
		<MapPin size={14} />
		{vacancy.location || 'Sin ubicación'}
	</p>
	<p class="flex items-center gap-1 text-xs text-gray-500">
		<Briefcase size={14} />
		{modality}
	</p>
	<p class="text-xs font-semibold text-blue-600">{salaryText}</p>

	<div class="mt-auto pt-2">
		<a href={`/vacancyDetails?id=${vacancy.id_vacancy}`}>
			<button
				class="rounded bg-blue-600 px-4 py-1.5 text-sm text-white transition hover:bg-blue-700"
			>
				Ver Más
			</button>
		</a>
	</div>
</div>
