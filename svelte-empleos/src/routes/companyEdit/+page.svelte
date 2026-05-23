<script lang="ts">
	import { onMount } from 'svelte';
	import {
		companyDashboardStore,
		getInitials,
		formatDate,
		STATUS_LABELS,
		CONTRACT_MAP,
		EXPERIENCE_MAP,
		type ApplicationStatus
	} from '$lib/stores/companyEditStore.svelte';

	// -----------------------------------------------TABS--------------------------------------
	type Tab = 'perfil' | 'publicar' | 'postulaciones';
	let activeTab = $state<Tab>('perfil');

	const handleTabChange = (tab: Tab) => {
		activeTab = tab;
		if (tab === 'postulaciones' && companyDashboardStore.applications.length === 0) {
			companyDashboardStore.loadApplications();
		}
	};

	// -------------------------------------SUBIR LOGO---------------------------------------------
	let fileInput = $state<HTMLInputElement | null>(null);

	const handleLogoChange = (e: Event) => {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (file) companyDashboardStore.uploadLogo(file);
	};

	onMount(() => {
		if (!companyDashboardStore.companyId) {
			window.location.href = '/login';
			return;
		}
		companyDashboardStore.loadProfile();
	});

	// -------------------------------------------ATAJOS----------------------------------------------
	const s = companyDashboardStore;

	const inputClass =
		'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white';
	const labelClass = 'block text-xs font-semibold text-gray-700 mb-1';
</script>

<div class="mx-auto max-w-5xl px-20 py-6">
	<h1 class="mb-0.5 text-lg font-bold text-gray-900">Panel de Empresa</h1>
	<p class="mb-5 text-sm text-gray-400">Gestión de Vacantes y Candidatos</p>

	<!-- ── Tabs ── -->
	<div class="mb-6 flex gap-1 border-b border-gray-200">
		{#each [['perfil', 'Perfil'], ['publicar', 'Publicar Vacante'], ['postulaciones', 'Postulaciones']] as const as [tab, label]}
			<button
				onclick={() => handleTabChange(tab)}
				class="rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors {activeTab === tab
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
						<img src={s.profile.logo_url} alt="Logo" class="h-full w-full object-cover" />
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
					class="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-blue-400 hover:text-blue-600 disabled:opacity-50"
				>
					{#if s.logoUploading}
						<div
							class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"
						></div>
						Subiendo...
					{:else}
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
							/>
						</svg>
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

			<!-- Campos del perfil -->
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
								<!-- Avatar -->
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

									<!-- Meta -->
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

									<!-- Actions -->
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
