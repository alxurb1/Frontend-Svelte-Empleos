<script lang="ts">
	import { onMount } from 'svelte';
	import {
		companyDashboardStore,
		getInitials,
		formatDate,
		STATUS_LABELS,
		CONTRACT_MAP,
		CONTRACT_LABEL,
		EXPERIENCE_MAP,
		EXPERIENCE_LABEL,
		type ApplicationStatus
	} from '$lib/stores/companyEditStore.svelte';
	import {
		Upload,
		FileText,
		MapPin,
		Pencil,
		PauseCircle,
		CheckCircle,
		Trash2,
		X,
		Star,
		BriefcaseBusiness
	} from 'lucide-svelte';

	// -----------------------------------------------TABS--------------------------------------
	type Tab = 'perfil' | 'publicar' | 'vacantes' | 'resenas' | 'postulaciones';
	let activeTab = $state<Tab>('perfil');

	const handleTabChange = (tab: Tab) => {
		activeTab = tab;
		if (tab === 'postulaciones' && companyDashboardStore.applications.length === 0) {
			companyDashboardStore.loadApplications();
		}
		if (tab === 'vacantes' && companyDashboardStore.vacancies.length === 0) {
			companyDashboardStore.loadVacancies();
		}
		if (tab === 'resenas' && companyDashboardStore.reviews.length === 0) {
			companyDashboardStore.loadReviews();
		}
	};

	// -------------------------------------SUBIR LOGO---------------------------------------------
	let fileInput = $state<HTMLInputElement | null>(null);

	const handleLogoChange = (e: Event) => {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (file) companyDashboardStore.uploadLogo(file);
	};

	// -------------------------------------------CONFIRMAR ELIMINACIÓN--------------------------
	let confirmDeleteId = $state<string | null>(null);

	onMount(() => {
		if (!companyDashboardStore.companyId) {
			window.location.href = '/login';
			return;
		}
		companyDashboardStore.loadProfile();
	});

	// -------------------------------------------ATAJOS--------------------------------------
	const s = companyDashboardStore;

	const inputClass =
		'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white';
	const labelClass = 'block text-xs font-semibold text-gray-700 mb-1';

	// ----------------------------------------ESTRELLAS--------------------------------------
	const renderStars = (rating: number) => {
		return Array.from({ length: 5 }, (_, i) => i < rating);
	};

	const avgRating = $derived(
		s.reviews.length
			? (s.reviews.reduce((acc, r) => acc + r.rating, 0) / s.reviews.length).toFixed(1)
			: null
	);

	const ratingDistribution = $derived(() => {
		const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
		s.reviews.forEach((r) => {
			dist[r.rating] = (dist[r.rating] ?? 0) + 1;
		});
		return dist;
	});
</script>

<div class="mx-auto max-w-5xl px-20 py-6">
	<h1 class="mb-0.5 text-lg font-bold text-gray-900">Panel de Empresa</h1>
	<p class="mb-5 text-sm text-gray-400">Gestión de Vacantes y Candidatos</p>

	<!-- ── Tabs ── -->
	<div class="mb-6 flex gap-1 overflow-x-auto border-b border-gray-200">
		{#each [['perfil', 'Perfil'], ['publicar', 'Publicar Vacante'], ['vacantes', 'Mis Vacantes'], ['resenas', 'Reseñas'], ['postulaciones', 'Postulaciones']] as const as [tab, label]}
			<button
				onclick={() => handleTabChange(tab)}
				class="rounded-t-lg px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors {activeTab ===
				tab
					? 'border-b-2 border-blue-600 text-blue-600'
					: 'text-gray-500 hover:text-gray-700'}"
			>
				{label}
			</button>
		{/each}
	</div>

	<!-- PERFIL -->
	{#if activeTab === 'perfil'}
		<div class="rounded-2xl bg-white p-6 shadow-sm">
			<h2 class="mb-5 font-bold text-gray-800">Perfil de la Empresa</h2>

			<!-- Avatar + cargar logo -->
			<div class="mb-6 flex items-center gap-4">
				<div
					class="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-blue-600"
				>
					{#if s.profile?.logo_url}
						<img
							src={s.profile.logo_url}
							alt="Logo de la empresa"
							class="h-full w-full object-cover"
						/>
					{:else}
						<span
							class="flex h-full w-full items-center justify-center text-sm font-bold text-white"
						>
							{getInitials(s.profileForm.name)}
						</span>
					{/if}
				</div>

				<button
					onclick={() => fileInput?.click()}
					disabled={s.logoUploading}
					aria-label="Cambiar logo de la empresa"
					class="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-blue-400 hover:text-blue-600 disabled:opacity-50"
				>
					{#if s.logoUploading}
						<div
							class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"
						></div>
						Subiendo...
					{:else}
						<Upload size={16} />
						Cambiar Logo
					{/if}
				</button>
				<input
					bind:this={fileInput}
					type="file"
					accept="image/*"
					class="hidden"
					onchange={handleLogoChange}
				/>
			</div>

			{#if s.profileMessage}
				<div
					class="mb-4 rounded-lg px-4 py-2.5 text-sm {s.profileMessage.ok
						? 'bg-green-50 text-green-700'
						: 'bg-red-50 text-red-600'}"
				>
					{s.profileMessage.text}
				</div>
			{/if}

			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<label class="flex flex-col gap-1">
					<span class={labelClass}>Nombre de la empresa</span>
					<input
						type="text"
						bind:value={s.profileForm.name}
						placeholder="Nombre de la empresa"
						class={inputClass}
					/>
				</label>

				<label class="flex flex-col gap-1">
					<span class={labelClass}>Sector</span>
					<select bind:value={s.profileForm.sector} class={inputClass}>
						<option value="">Seleccionar un Sector</option>
						{#each ['Tecnología de la Información', 'Finanzas', 'Salud', 'Educación', 'Manufactura', 'Comercio', 'Servicios'] as opt}
							<option>{opt}</option>
						{/each}
					</select>
				</label>

				<label class="flex flex-col gap-1">
					<span class={labelClass}>Tamaño de la empresa</span>
					<select bind:value={s.profileForm.size} class={inputClass}>
						<option value="">Seleccionar Tamaño</option>
						{#each [['1-10', '1 - 10'], ['11-50', '11 - 50'], ['51-200', '51 - 200'], ['201-500', '201 - 500'], ['500+', '500+']] as [val, lbl]}
							<option value={val}>{lbl}</option>
						{/each}
					</select>
				</label>

				<label class="flex flex-col gap-1">
					<span class={labelClass}>Ubicación</span>
					<input
						type="text"
						bind:value={s.profileForm.location}
						placeholder="San Salvador, El Salvador"
						class={inputClass}
					/>
				</label>

				<label class="flex flex-col gap-1">
					<span class={labelClass}>Sitio Web</span>
					<input
						type="url"
						bind:value={s.profileForm.website}
						placeholder="https://www.ejemplo.com"
						class={inputClass}
					/>
				</label>

				<label class="flex flex-col gap-1">
					<span class={labelClass}>Email de Contacto</span>
					<input
						type="email"
						bind:value={s.profileForm.email}
						placeholder="contacto@gmail.com"
						class={inputClass}
					/>
				</label>

				<label class="flex flex-col gap-1">
					<span class={labelClass}>LinkedIn</span>
					<input
						type="url"
						bind:value={s.profileForm.linkedin_url}
						placeholder="https://www.linkedin.com"
						class={inputClass}
					/>
				</label>

				<label class="flex flex-col gap-1">
					<span class={labelClass}>Teléfono</span>
					<input
						type="text"
						bind:value={s.profileForm.phone}
						placeholder="1234 5678"
						class={inputClass}
					/>
				</label>

				<label class="flex flex-col gap-1 md:col-span-2">
					<span class={labelClass}>Descripción de la empresa</span>
					<textarea
						bind:value={s.profileForm.description}
						rows={3}
						placeholder="Describe tu empresa, valores, beneficios..."
						class="{inputClass} resize-none"
					></textarea>
				</label>

				<label class="flex flex-col gap-1 md:col-span-2">
					<span class={labelClass}>Misión de la empresa</span>
					<textarea
						bind:value={s.profileForm.mission}
						rows={2}
						placeholder="Misión..."
						class="{inputClass} resize-none"
					></textarea>
				</label>

				<label class="flex flex-col gap-1 md:col-span-2">
					<span class={labelClass}>Visión de la empresa</span>
					<textarea
						bind:value={s.profileForm.vision}
						rows={2}
						placeholder="Visión..."
						class="{inputClass} resize-none"
					></textarea>
				</label>

				<div class="md:col-span-2">
					<button
						onclick={() => s.saveProfile()}
						disabled={s.profileSaving}
						class="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:bg-blue-300"
					>
						{#if s.profileSaving}
							<div
								class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
							></div>
							Guardando...
						{:else}
							Guardar Cambios
						{/if}
					</button>
				</div>
			</div>
		</div>

		<!-- PUBLICAR VACANTE -->
	{:else if activeTab === 'publicar'}
		<div class="rounded-2xl bg-white p-6 shadow-sm">
			<h2 class="mb-5 font-bold text-gray-800">Publicar Vacante</h2>

			{#if s.vacancyMessage}
				<div
					class="mb-4 rounded-lg px-4 py-2.5 text-sm {s.vacancyMessage.ok
						? 'bg-green-50 text-green-700'
						: 'bg-red-50 text-red-600'}"
				>
					{s.vacancyMessage.text}
				</div>
			{/if}

			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<label class="flex flex-col gap-1">
					<span class={labelClass}>Título del Puesto</span>
					<input
						type="text"
						bind:value={s.vacancyForm.title}
						placeholder="Ej. Desarrollador Full Stack"
						class={inputClass}
					/>
				</label>

				<label class="flex flex-col gap-1">
					<span class={labelClass}>Tipo de Trabajo</span>
					<select bind:value={s.vacancyForm.contract_type} class={inputClass}>
						<option value="">Seleccionar Tipo</option>
						{#each Object.keys(CONTRACT_MAP) as opt}
							<option>{opt}</option>
						{/each}
					</select>
				</label>

				<label class="flex flex-col gap-1">
					<span class={labelClass}>Ubicación</span>
					<input
						type="text"
						bind:value={s.vacancyForm.location}
						placeholder="San Salvador, El Salvador"
						class={inputClass}
					/>
				</label>

				<label class="flex flex-col gap-1">
					<span class={labelClass}>Nivel Experiencia</span>
					<select bind:value={s.vacancyForm.experience_level} class={inputClass}>
						<option value="">Seleccionar Nivel</option>
						{#each Object.keys(EXPERIENCE_MAP) as opt}
							<option>{opt}</option>
						{/each}
					</select>
				</label>

				<label class="flex flex-col gap-1">
					<span class={labelClass}>Salario Mínimo</span>
					<input
						type="number"
						bind:value={s.vacancyForm.salary_min}
						placeholder="1000"
						class={inputClass}
					/>
				</label>

				<label class="flex flex-col gap-1">
					<span class={labelClass}>Salario Máximo</span>
					<input
						type="number"
						bind:value={s.vacancyForm.salary_max}
						placeholder="5000"
						class={inputClass}
					/>
				</label>

				<label class="flex flex-col gap-1 md:col-span-2">
					<span class={labelClass}>Descripción del Puesto</span>
					<textarea
						bind:value={s.vacancyForm.description}
						rows={4}
						placeholder="Describe el puesto, responsabilidades..."
						class="{inputClass} resize-none"
					></textarea>
				</label>

				<label class="flex flex-col gap-1 md:col-span-2">
					<span class={labelClass}>Requisitos</span>
					<textarea
						bind:value={s.vacancyForm.requirements}
						rows={3}
						placeholder="Lista los requisitos para el puesto..."
						class="{inputClass} resize-none"
					></textarea>
				</label>

				<label class="flex flex-col gap-1 md:col-span-2">
					<span class={labelClass}>Beneficios del puesto</span>
					<textarea
						bind:value={s.vacancyForm.benefits}
						rows={3}
						placeholder="Describe los beneficios del puesto..."
						class="{inputClass} resize-none"
					></textarea>
				</label>

				<div class="md:col-span-2">
					<button
						onclick={() => s.publishVacancy()}
						disabled={s.vacancyPublishing}
						class="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:bg-blue-300"
					>
						{#if s.vacancyPublishing}
							<div
								class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
							></div>
							Publicando...
						{:else}
							Publicar
						{/if}
					</button>
				</div>
			</div>
		</div>

		<!-- MIS VACANTES -->
	{:else if activeTab === 'vacantes'}
		<div class="rounded-2xl bg-white p-6 shadow-sm">
			<h2 class="mb-5 font-bold text-gray-800">Mis Vacantes</h2>

			{#if s.vacanciesLoading}
				<div class="flex justify-center py-10">
					<div
						class="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"
					></div>
				</div>
			{:else if s.vacanciesError}
				<p class="text-sm text-red-500">{s.vacanciesError}</p>
			{:else if s.vacancies.length === 0}
				<div class="flex flex-col items-center gap-3 py-12 text-center">
					<FileText size={48} class="text-gray-200" />
					<p class="text-sm text-gray-400">No tienes vacantes publicadas aún.</p>
					<button
						onclick={() => handleTabChange('publicar')}
						class="mt-1 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
					>
						Publicar primera vacante
					</button>
				</div>
			{:else}
				<div class="space-y-3">
					{#each s.vacancies as vacancy}
						<div
							class="rounded-xl border border-gray-100 bg-gray-50 px-5 py-4 transition-shadow hover:shadow-sm"
						>
							<div class="flex items-start justify-between gap-3">
								<div class="min-w-0 flex-1">
									<div class="mb-1.5 flex flex-wrap items-center gap-2">
										<p class="text-sm font-semibold text-gray-800">{vacancy.title}</p>
										<span
											class="rounded-full px-2 py-0.5 text-xs font-semibold {vacancy.is_active !==
											false
												? 'bg-green-100 text-green-700'
												: 'bg-gray-200 text-gray-500'}"
										>
											{vacancy.is_active !== false ? 'Activa' : 'Inactiva'}
										</span>
									</div>

									<!-- Meta chips -->
									<div class="mb-3 flex flex-wrap gap-2">
										{#if vacancy.contract_type}
											<span
												class="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs text-blue-700"
											>
												<BriefcaseBusiness size={11} />
												{CONTRACT_LABEL[vacancy.contract_type] ?? vacancy.contract_type}
											</span>
										{/if}
										{#if vacancy.experience_level}
											<span class="rounded-md bg-purple-50 px-2 py-0.5 text-xs text-purple-700">
												{EXPERIENCE_LABEL[vacancy.experience_level] ?? vacancy.experience_level}
											</span>
										{/if}
										{#if vacancy.location}
											<span
												class="flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
											>
												<MapPin size={11} />
												{vacancy.location}
											</span>
										{/if}
										{#if vacancy.salary_min || vacancy.salary_max}
											<span class="rounded-md bg-green-50 px-2 py-0.5 text-xs text-green-700">
												${vacancy.salary_min ?? '?'} – ${vacancy.salary_max ?? '?'}
											</span>
										{/if}
										{#if vacancy.created_at}
											<span class="text-xs text-gray-400"
												>Publicada {formatDate(vacancy.created_at)}</span
											>
										{/if}
									</div>

									<!-- Actions -->
									<div class="flex flex-wrap gap-2">
										<button
											onclick={() => s.openEditVacancy(vacancy)}
											aria-label="Editar vacante {vacancy.title}"
											class="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-blue-300 hover:text-blue-600"
										>
											<Pencil size={13} />
											Editar
										</button>

										<button
											onclick={() =>
												s.toggleVacancyStatus(vacancy.id_vacancy, vacancy.is_active !== false)}
											disabled={s.togglingVacancy === vacancy.id_vacancy}
											aria-label="{vacancy.is_active !== false
												? 'Pausar'
												: 'Activar'} vacante {vacancy.title}"
											class="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50
												{vacancy.is_active !== false
												? 'border-yellow-200 text-yellow-700 hover:bg-yellow-50'
												: 'border-green-200 text-green-700 hover:bg-green-50'}"
										>
											{#if s.togglingVacancy === vacancy.id_vacancy}
												<div
													class="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"
												></div>
											{:else if vacancy.is_active !== false}
												<PauseCircle size={13} />
												Pausar
											{:else}
												<CheckCircle size={13} />
												Activar
											{/if}
										</button>

										{#if confirmDeleteId === vacancy.id_vacancy}
											<span class="flex items-center gap-1.5 text-xs text-gray-500">
												¿Eliminar?
												<button
													onclick={() => {
														s.deleteVacancy(vacancy.id_vacancy);
														confirmDeleteId = null;
													}}
													disabled={s.deletingVacancy === vacancy.id_vacancy}
													aria-label="Confirmar eliminación de vacante {vacancy.title}"
													class="rounded-lg bg-red-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50"
												>
													Sí
												</button>
												<button
													onclick={() => (confirmDeleteId = null)}
													aria-label="Cancelar eliminación"
													class="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
												>
													No
												</button>
											</span>
										{:else}
											<button
												onclick={() => (confirmDeleteId = vacancy.id_vacancy)}
												aria-label="Eliminar vacante {vacancy.title}"
												class="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50"
											>
												<Trash2 size={13} />
												Eliminar
											</button>
										{/if}
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Modal de edición de vacante -->
		{#if s.editingVacancy}
			<div
				class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
			>
				<div class="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
					<div class="mb-5 flex items-center justify-between">
						<h3 class="font-bold text-gray-800">Editar Vacante</h3>
						<button
							onclick={() => s.closeEditVacancy()}
							aria-label="Cerrar modal de edición"
							class="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
						>
							<X size={20} />
						</button>
					</div>

					{#if s.editVacancyMessage}
						<div
							class="mb-4 rounded-lg px-4 py-2.5 text-sm {s.editVacancyMessage.ok
								? 'bg-green-50 text-green-700'
								: 'bg-red-50 text-red-600'}"
						>
							{s.editVacancyMessage.text}
						</div>
					{/if}

					<div class="grid max-h-[65vh] grid-cols-1 gap-4 overflow-y-auto pr-1 md:grid-cols-2">
						<label class="flex flex-col gap-1">
							<span class={labelClass}>Título del Puesto</span>
							<input type="text" bind:value={s.editVacancyForm.title} class={inputClass} />
						</label>

						<label class="flex flex-col gap-1">
							<span class={labelClass}>Tipo de Trabajo</span>
							<select bind:value={s.editVacancyForm.contract_type} class={inputClass}>
								<option value="">Seleccionar Tipo</option>
								{#each Object.keys(CONTRACT_MAP) as opt}
									<option>{opt}</option>
								{/each}
							</select>
						</label>

						<label class="flex flex-col gap-1">
							<span class={labelClass}>Ubicación</span>
							<input type="text" bind:value={s.editVacancyForm.location} class={inputClass} />
						</label>

						<label class="flex flex-col gap-1">
							<span class={labelClass}>Nivel Experiencia</span>
							<select bind:value={s.editVacancyForm.experience_level} class={inputClass}>
								<option value="">Seleccionar Nivel</option>
								{#each Object.keys(EXPERIENCE_MAP) as opt}
									<option>{opt}</option>
								{/each}
							</select>
						</label>

						<label class="flex flex-col gap-1">
							<span class={labelClass}>Salario Mínimo</span>
							<input type="number" bind:value={s.editVacancyForm.salary_min} class={inputClass} />
						</label>

						<label class="flex flex-col gap-1">
							<span class={labelClass}>Salario Máximo</span>
							<input type="number" bind:value={s.editVacancyForm.salary_max} class={inputClass} />
						</label>

						<label class="flex flex-col gap-1 md:col-span-2">
							<span class={labelClass}>Descripción</span>
							<textarea
								bind:value={s.editVacancyForm.description}
								rows={3}
								class="{inputClass} resize-none"
							></textarea>
						</label>

						<label class="flex flex-col gap-1 md:col-span-2">
							<span class={labelClass}>Requisitos</span>
							<textarea
								bind:value={s.editVacancyForm.requirements}
								rows={3}
								class="{inputClass} resize-none"
							></textarea>
						</label>

						<label class="flex flex-col gap-1 md:col-span-2">
							<span class={labelClass}>Beneficios</span>
							<textarea
								bind:value={s.editVacancyForm.benefits}
								rows={2}
								class="{inputClass} resize-none"
							></textarea>
						</label>
					</div>

					<div class="mt-5 flex justify-end gap-2">
						<button
							onclick={() => s.closeEditVacancy()}
							class="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
						>
							Cancelar
						</button>
						<button
							onclick={() => s.saveEditVacancy()}
							disabled={s.editVacancySaving}
							class="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-blue-300"
						>
							{#if s.editVacancySaving}
								<div
									class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
								></div>
								Guardando...
							{:else}
								Guardar Cambios
							{/if}
						</button>
					</div>
				</div>
			</div>
		{/if}

		<!-- RESEÑAS -->
	{:else if activeTab === 'resenas'}
		<div class="rounded-2xl bg-white p-6 shadow-sm">
			<h2 class="mb-5 font-bold text-gray-800">Reseñas de la Empresa</h2>

			{#if s.reviewsLoading}
				<div class="flex justify-center py-10">
					<div
						class="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"
					></div>
				</div>
			{:else if s.reviewsError}
				<p class="text-sm text-red-500">{s.reviewsError}</p>
			{:else if s.reviews.length === 0}
				<div class="flex flex-col items-center gap-2 py-12 text-center">
					<Star size={48} class="text-gray-200" />
					<p class="text-sm text-gray-400">Aún no tienes reseñas.</p>
				</div>
			{:else}
				<!-- Resumen de calificación -->
				<div class="mb-6 flex flex-wrap items-center gap-6 rounded-xl bg-gray-50 p-5">
					<div class="text-center">
						<p class="text-4xl font-bold text-gray-800">{avgRating ?? '—'}</p>
						<div class="mt-1 flex justify-center gap-0.5">
							{#each renderStars(Math.round(Number(avgRating ?? 0))) as filled}
								<Star
									size={16}
									class={filled ? 'text-yellow-400' : 'text-gray-200'}
									fill={filled ? 'currentColor' : 'none'}
								/>
							{/each}
						</div>
						<p class="mt-1 text-xs text-gray-400">
							{s.reviews.length} reseña{s.reviews.length !== 1 ? 's' : ''}
						</p>
					</div>

					<!-- Distribución por estrellas -->
					<div class="flex min-w-40 flex-1 flex-col gap-1.5">
						{#each [5, 4, 3, 2, 1] as star}
							{@const count = ratingDistribution()[star] ?? 0}
							{@const pct = s.reviews.length ? Math.round((count / s.reviews.length) * 100) : 0}
							<div class="flex items-center gap-2">
								<span class="w-3 text-right text-xs text-gray-500">{star}</span>
								<Star size={12} class="shrink-0 text-yellow-400" fill="currentColor" />
								<div class="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
									<div
										class="h-full rounded-full bg-yellow-400 transition-all"
										style="width: {pct}%"
									></div>
								</div>
								<span class="w-6 text-xs text-gray-400">{count}</span>
							</div>
						{/each}
					</div>
				</div>

				<!-- Lista de reseñas -->
				<div class="space-y-3">
					{#each s.reviews as review}
						<div class="rounded-xl bg-gray-50 px-4 py-4">
							<div class="flex items-start gap-3">
								<div
									class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white"
								>
									{getInitials(review.users?.full_name)}
								</div>

								<div class="min-w-0 flex-1">
									<div class="mb-1 flex flex-wrap items-center justify-between gap-2">
										<div>
											<p class="text-sm font-semibold text-gray-800">
												{review.users?.full_name ?? 'Usuario anónimo'}
											</p>
											{#if review.users?.professional_title}
												<p class="text-xs text-gray-400">{review.users.professional_title}</p>
											{/if}
										</div>
										<span class="text-xs text-gray-400">{formatDate(review.created_at)}</span>
									</div>

									<div class="mb-2 flex gap-0.5">
										{#each renderStars(review.rating) as filled}
											<Star
												size={16}
												class={filled ? 'text-yellow-400' : 'text-gray-200'}
												fill={filled ? 'currentColor' : 'none'}
											/>
										{/each}
									</div>

									{#if review.comment}
										<p class="text-sm leading-relaxed text-gray-600">{review.comment}</p>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- POSTULACIONES -->
	{:else if activeTab === 'postulaciones'}
		<div class="rounded-2xl bg-white p-6 shadow-sm">
			<h2 class="mb-5 font-bold text-gray-800">Gestionar Postulaciones</h2>

			{#if s.applicationsLoading}
				<div class="flex justify-center py-10">
					<div
						class="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"
					></div>
				</div>
			{:else if s.applicationsError}
				<p class="text-sm text-red-500">{s.applicationsError}</p>
			{:else if s.applications.length === 0}
				<p class="text-sm text-gray-400">Sin postulaciones aún.</p>
			{:else}
				<div class="space-y-3">
					{#each s.applications as app}
						{@const user = app.users ?? {}}
						{@const statusInfo = STATUS_LABELS[app.status] ?? {
							label: app.status,
							color: 'bg-gray-200 text-gray-700'
						}}

						<div class="rounded-xl bg-gray-50 px-4 py-6">
							<div class="flex items-start gap-3">
								<div
									class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white"
								>
									{getInitials(user.full_name)}
								</div>

								<div class="min-w-0 flex-1">
									<div class="mb-1 flex flex-wrap items-start justify-between gap-2">
										<div>
											<p class="text-sm font-semibold text-gray-800">{user.full_name ?? '—'}</p>
											<p class="text-xs text-gray-400">{app.vacancies?.title ?? '—'}</p>
										</div>
										<span class="rounded-full px-2.5 py-1 text-xs font-semibold {statusInfo.color}">
											{statusInfo.label}
										</span>
									</div>

									<div class="mb-3 flex flex-wrap gap-4 text-xs text-gray-500">
										<div>
											<span class="block font-semibold text-gray-700">Fecha de Postulación</span>
											{formatDate(app.applied_at)}
										</div>
										{#if user.professional_title}
											<div>
												<span class="block font-semibold text-gray-700">Cargo</span>
												{user.professional_title}
											</div>
										{/if}
									</div>

									<div class="flex flex-wrap gap-2">
										<a href={`/profile?id=${app.id_user}`}>
											<button
												class="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-gray-300"
											>
												Ver Perfil
											</button>
										</a>
										<button
											onclick={() =>
												s.updateStatus(app.id_application, 'interview' as ApplicationStatus)}
											disabled={s.updatingStatus === app.id_application}
											class="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
										>
											Aceptar
										</button>
										<button
											onclick={() =>
												s.updateStatus(app.id_application, 'rejected' as ApplicationStatus)}
											disabled={s.updatingStatus === app.id_application}
											class="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
										>
											Rechazar
										</button>
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>
