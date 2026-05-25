<script lang="ts">
	import { onMount } from 'svelte';
	import {
		profileStore,
		getInitials,
		formatDate,
		calculateProgress,
		STATUS_LABELS
	} from '$lib/stores/profileEditStore.svelte';

	// --------------------------TABS--------------------------------------
	type Tab = 'info' | 'curriculum' | 'postulaciones' | 'alertas';
	let activeTab = $state<Tab>('info');

	const handleTabChange = (tab: Tab) => {
		activeTab = tab;
		if (tab === 'postulaciones' && s.applications.length === 0) s.loadApplications();
		if (tab === 'alertas' && s.alerts.length === 0) s.loadAlerts();
	};

	// ---------------------------------INPUTS ARCHIVOS----------------------------------------
	let avatarFileInput = $state<HTMLInputElement | null>(null);
	let cvFileInput = $state<HTMLInputElement | null>(null);
	let newSkill = $state('');

	const handlePhotoChange = (e: Event) => {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (file) s.uploadPhoto(file);
		if (avatarFileInput) avatarFileInput.value = '';
	};

	const handleCVChange = (e: Event) => {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (file) s.uploadCV(file);
		if (cvFileInput) cvFileInput.value = '';
	};

	onMount(() => {
		if (!s.userId) {
			window.location.href = '/login';
			return;
		}
		s.loadProfile();
	});

	// ---------------------------------ATAJOS------------------------------s
	const s = profileStore;

	const progress = $derived(calculateProgress(s.profile ?? {}));
	const appStats = $derived({
		total: s.applications.length,
		enProceso: s.applications.filter((a) => ['pending', 'reviewing'].includes(a.status)).length,
		entrevistas: s.applications.filter((a) => a.status === 'interview').length
	});

	// -------------------------------------CLASES COMPARTIDAS/REPETIDAS---------------------------------
	const inputClass =
		'w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300';
	const labelClass = 'block text-xs font-semibold text-gray-600 mb-1';
	const btnPrimary =
		'flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50';
	const btnOutline =
		'rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-gray-300 transition-colors';
	const btnDanger =
		'rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors';
</script>

<div class="mx-auto px-20 py-6 lg:px-20">
	<h1 class="mb-0.5 text-lg font-bold text-gray-900">Mi Perfil</h1>
	<p class="mb-6 text-sm text-gray-400">Gestiona tu información y preferencias</p>

	<div class="flex flex-col gap-4 lg:flex-row lg:items-start">
		<!-- ── Sidebar ── -->
		<aside class="w-full shrink-0 lg:w-64">
			<div class="rounded-2xl bg-white p-5 text-center shadow-sm">
				<!-- Avatar -->
				<div
					class="mx-auto mb-3 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-xl font-bold text-white"
				>
					{#if s.profile?.avatar_url}
						<img src={s.profile.avatar_url} alt="Avatar" class="h-full w-full object-cover" />
					{:else}
						{getInitials(s.profile?.full_name)}
					{/if}
				</div>

				<p class="font-bold text-gray-800">{s.profile?.full_name ?? ''}</p>
				<p class="mb-4 text-sm text-gray-400">{s.profile?.professional_title ?? ''}</p>

				<button
					onclick={() => avatarFileInput?.click()}
					disabled={s.photoUploading}
					class="mb-4 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-blue-400 hover:text-blue-600 disabled:opacity-50"
				>
					{#if s.photoUploading}
						<span
							class="mr-1 inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"
						></span>
						Subiendo...
					{:else}
						↑ Cambiar Foto
					{/if}
				</button>
				<input
					bind:this={avatarFileInput}
					type="file"
					accept="image/*"
					class="hidden"
					onchange={handlePhotoChange}
				/>

				<!-- Progress bar -->
				<div class="mb-1 text-left">
					<span class="text-xs text-gray-400">Completitud del Perfil</span>
				</div>
				<div class="mb-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
					<div
						class="h-full rounded-full bg-blue-600 transition-all duration-500"
						style="width: {progress}%"
					></div>
				</div>
				<p class="mb-4 text-xs text-gray-400">{progress}% completado</p>

				<hr class="mb-3 border-gray-100" />

				<div class="flex justify-between text-sm">
					<span class="text-gray-400">Postulaciones</span>
					<span class="font-bold text-gray-800">{s.applications.length}</span>
				</div>
			</div>
		</aside>

		<!-- ── Main panel ── -->
		<div class="min-w-0 flex-1">
			<div class="rounded-2xl bg-white shadow-sm">
				<!-- Tabs -->
				<div class="flex gap-1 border-b border-gray-100 px-6 pt-4">
					{#each [['info', 'Información'], ['curriculum', 'Currículum'], ['postulaciones', 'Postulaciones'], ['alertas', 'Alertas']] as const as [tab, label]}
						<button
							onclick={() => handleTabChange(tab)}
							class="rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors {activeTab ===
							tab
								? 'border-b-2 border-blue-600 text-blue-600'
								: 'text-gray-500 hover:text-gray-700'}"
						>
							{label}
						</button>
					{/each}
				</div>

				<div class="p-6">
					<!-- INFORMATION -->
					{#if activeTab === 'info'}
						<h2 class="mb-5 font-bold text-gray-800">Información Personal</h2>

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
							<label class="flex flex-col gap-1 md:col-span-2">
								<span class={labelClass}>Nombre Completo</span>
								<input type="text" bind:value={s.profileForm.full_name} class={inputClass} />
							</label>

							<label class="flex flex-col gap-1">
								<span class={labelClass}>Email</span>
								<input
									type="email"
									value={s.profileForm.email}
									disabled
									class="{inputClass} cursor-not-allowed opacity-60"
								/>
							</label>

							<label class="flex flex-col gap-1">
								<span class={labelClass}>Teléfono</span>
								<input type="tel" bind:value={s.profileForm.phone} class={inputClass} />
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
								<span class={labelClass}>LinkedIn</span>
								<input
									type="url"
									bind:value={s.profileForm.linkedin_url}
									placeholder="https://linkedin.com/in/..."
									class={inputClass}
								/>
							</label>

							<label class="flex flex-col gap-1 md:col-span-2">
								<span class={labelClass}>Título Profesional</span>
								<input
									type="text"
									bind:value={s.profileForm.professional_title}
									placeholder="Ej. Desarrollador Full Stack"
									class={inputClass}
								/>
							</label>

							<label class="flex flex-col gap-1 md:col-span-2">
								<span class={labelClass}>Biografía Personal</span>
								<textarea
									bind:value={s.profileForm.bio}
									rows={3}
									placeholder="Cuéntanos sobre ti..."
									class="{inputClass} resize-none"
								></textarea>
							</label>
						</div>

						<!-- Skills -->
						<div class="mt-5">
							<span class={labelClass}>Habilidades</span>
							<div class="mb-3 flex flex-wrap gap-2">
								{#each s.profile?.skills ?? [] as skill}
									<span
										class="flex items-center gap-1 rounded-full bg-gray-900 px-3 py-1 text-xs font-medium text-white"
									>
										{skill.name}
										<button
											onclick={() => s.deleteSkill(skill.id_skill)}
											class="ml-0.5 opacity-60 transition-opacity hover:opacity-100"
											aria-label="Eliminar habilidad">✕</button
										>
									</span>
								{/each}
							</div>
							<div class="flex gap-2">
								<input
									type="text"
									bind:value={newSkill}
									placeholder="Nueva habilidad..."
									class="w-44 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
									onkeydown={async (e) => {
										if (e.key === 'Enter') {
											await s.addSkill(newSkill);
											newSkill = '';
										}
									}}
								/>
								<button
									onclick={async () => {
										await s.addSkill(newSkill);
										newSkill = '';
									}}
									disabled={s.skillAdding}
									class="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-700 disabled:opacity-50"
								>
									{s.skillAdding ? '...' : 'Agregar'}
								</button>
							</div>
						</div>

						<div class="mt-6">
							<button onclick={() => s.saveProfile()} disabled={s.profileSaving} class={btnPrimary}>
								{#if s.profileSaving}
									<span
										class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
									></span>
									Guardando...
								{:else}
									Guardar Cambios
								{/if}
							</button>
						</div>

						<!-- CV -->
					{:else if activeTab === 'curriculum'}
						<div class="mb-6 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
							<h2 class="mb-4 font-bold text-gray-800">Currículum Vitae</h2>

							<div
								class="mb-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-center"
							>
								<p class="mb-0.5 font-semibold text-gray-700">Sube tu Currículum</p>
								<p class="mb-3 text-sm text-gray-400">PDF, DOC o DOCX (máx. 5MB)</p>
								<button
									onclick={() => cvFileInput?.click()}
									disabled={s.cvUploading}
									class="{btnPrimary} mx-auto"
								>
									{#if s.cvUploading}
										<span
											class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
										></span>
										Subiendo...
									{:else}
										Seleccionar Archivo
									{/if}
								</button>
								<input
									bind:this={cvFileInput}
									type="file"
									accept=".pdf,.docx"
									class="hidden"
									onchange={handleCVChange}
								/>
							</div>

							{#if !s.profile?.cvs || s.profile.cvs.length === 0}
								<p class="text-sm text-gray-400">Sin CV subido.</p>
							{:else}
								<div class="space-y-2">
									{#each s.profile.cvs as cv}
										<div class="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
											<div class="flex items-center gap-3">
												<span class="text-xl text-blue-500">📄</span>
												<div>
													<p class="text-sm font-semibold text-gray-800">{cv.file_name}</p>
													<p class="text-xs text-gray-400">
														Subido el {formatDate(cv.uploaded_at)}
													</p>
												</div>
											</div>
											<div class="flex gap-2">
												<a href={cv.file_url} target="_blank" class={btnOutline}>Ver</a>
												<button onclick={() => s.deleteCV(cv.id_cv)} class={btnDanger}
													>Eliminar</button
												>
											</div>
										</div>
									{/each}
								</div>
							{/if}
						</div>

						<!-- Experiences -->
						<div class="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
							<h2 class="mb-4 font-bold text-gray-800">Experiencias Laborales</h2>

							{#if !s.profile?.work_experiences || s.profile.work_experiences.length === 0}
								<p class="mb-4 text-sm text-gray-400">Sin experiencia registrada.</p>
							{:else}
								<div class="mb-4 space-y-2">
									{#each s.profile.work_experiences as exp}
										<div class="flex items-start justify-between rounded-lg bg-gray-50 px-4 py-3">
											<div>
												<p class="text-sm font-bold text-gray-800">{exp.job_title}</p>
												<p class="text-xs text-gray-500">{exp.company_name}</p>
												<p class="text-xs text-gray-400">
													{exp.start_year} – {exp.end_year ?? 'Actualidad'}
												</p>
												{#if exp.description}
													<p class="mt-1 text-xs text-gray-400">{exp.description}</p>
												{/if}
											</div>
											<button
												onclick={() => s.deleteExperience(exp.id_experience)}
												class={btnDanger}
											>
												🗑
											</button>
										</div>
									{/each}
								</div>
							{/if}

							<div class="rounded-xl bg-gray-50 p-4">
								<p class="mb-3 text-sm font-semibold text-gray-700">Agregar Experiencia</p>
								<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
									<label class="flex flex-col gap-1">
										<span class={labelClass}>Título del Cargo</span>
										<input type="text" bind:value={s.experienceForm.job_title} class={inputClass} />
									</label>
									<label class="flex flex-col gap-1">
										<span class={labelClass}>Nombre Empresa</span>
										<input
											type="text"
											bind:value={s.experienceForm.company_name}
											class={inputClass}
										/>
									</label>
									<label class="flex flex-col gap-1">
										<span class={labelClass}>Año Inicio</span>
										<input
											type="number"
											bind:value={s.experienceForm.start_year}
											placeholder="2020"
											class={inputClass}
										/>
									</label>
									<label class="flex flex-col gap-1">
										<span class={labelClass}>Año Fin (vacío = Actual)</span>
										<input
											type="number"
											bind:value={s.experienceForm.end_year}
											placeholder="2024"
											class={inputClass}
										/>
									</label>
									<label class="flex flex-col gap-1 md:col-span-2">
										<span class={labelClass}>Descripción</span>
										<input
											type="text"
											bind:value={s.experienceForm.description}
											class={inputClass}
										/>
									</label>
								</div>
								<div class="mt-3 flex justify-end">
									<button
										onclick={() => s.addExperience()}
										disabled={s.experienceAdding}
										class={btnPrimary}
									>
										{#if s.experienceAdding}
											<span
												class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
											></span>
											Agregando...
										{:else}
											Agregar Experiencia
										{/if}
									</button>
								</div>
							</div>
						</div>

						<!-- POSTULACIONES -->
					{:else if activeTab === 'postulaciones'}
						<h2 class="mb-5 font-bold text-gray-800">Historial de Postulaciones</h2>

						{#if s.applicationsLoading}
							<div class="flex justify-center py-10">
								<div
									class="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"
								></div>
							</div>
						{:else if s.applicationsError}
							<p class="mb-4 text-sm text-red-500">{s.applicationsError}</p>
						{:else if s.applications.length === 0}
							<p class="mb-4 text-sm text-gray-400">Sin postulaciones aún.</p>
						{:else}
							<div class="mb-4 space-y-2">
								{#each s.applications as app}
									{@const badge = STATUS_LABELS[app.status] ?? {
										label: app.status,
										color: 'bg-gray-100 text-gray-600'
									}}
									<div class="rounded-xl bg-gray-50 px-4 py-3">
										<div class="flex items-center justify-between">
											<div>
												<p class="text-sm font-bold text-gray-800">{app.vacancies?.title ?? '—'}</p>
												<p class="text-xs text-gray-500">{app.vacancies?.companies?.name ?? '—'}</p>
												<p class="text-xs text-gray-400">
													Postulado el {formatDate(app.applied_at)}
												</p>
											</div>
											<span class="rounded-full px-2.5 py-1 text-xs font-semibold {badge.color}">
												{badge.label}
											</span>
										</div>
									</div>
								{/each}
							</div>
						{/if}

						<div class="rounded-xl bg-gray-50 p-5">
							<p class="mb-4 font-bold text-gray-800">📊 Estadísticas</p>
							<div class="grid grid-cols-3 gap-4 text-center">
								<div>
									<p class="text-2xl font-bold text-blue-600">{appStats.total}</p>
									<p class="text-xs text-gray-400">Total</p>
								</div>
								<div>
									<p class="text-2xl font-bold text-yellow-500">{appStats.enProceso}</p>
									<p class="text-xs text-gray-400">En Proceso</p>
								</div>
								<div>
									<p class="text-2xl font-bold text-green-500">{appStats.entrevistas}</p>
									<p class="text-xs text-gray-400">Entrevistas</p>
								</div>
							</div>
						</div>

						<!-- ALERTS -->
					{:else if activeTab === 'alertas'}
						<h2 class="mb-5 font-bold text-gray-800">🔔 Alertas de Empleo</h2>

						{#if s.alertsLoading}
							<div class="flex justify-center py-6">
								<div
									class="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"
								></div>
							</div>
						{:else if s.alerts.length === 0}
							<p class="mb-4 text-sm text-gray-400">Sin alertas configuradas.</p>
						{:else}
							<div class="mb-5 divide-y divide-gray-100">
								{#each s.alerts as alert}
									<div class="flex items-center justify-between py-3">
										<div>
											<p class="text-sm font-semibold text-gray-800">{alert.name}</p>
											<p class="text-xs text-gray-400">
												{alert.keywords ?? ''}{alert.keywords ? ' · ' : ''}{alert.frequency}
											</p>
										</div>
										<div class="flex items-center gap-3">
											<label class="relative inline-flex cursor-pointer items-center">
												<input
													type="checkbox"
													checked={alert.is_active}
													onchange={(e) =>
														s.toggleAlert(alert.id_alert, (e.target as HTMLInputElement).checked)}
													class="peer sr-only"
												/>
												<div
													class="peer h-5 w-9 rounded-full bg-gray-200 transition-colors peer-checked:bg-blue-600 after:absolute after:top-0.5 after:left-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-4"
												></div>
											</label>
											<button onclick={() => s.deleteAlert(alert.id_alert)} class={btnDanger}
												>🗑</button
											>
										</div>
									</div>
								{/each}
							</div>
						{/if}

						<div class="rounded-xl bg-gray-50 p-4">
							<p class="mb-3 text-sm font-semibold text-gray-700">Nueva Alerta</p>
							<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
								<label class="flex flex-col gap-1">
									<span class={labelClass}>Nombre de la alerta</span>
									<input
										type="text"
										bind:value={s.alertForm.name}
										placeholder="Ej. React Developer"
										class={inputClass}
									/>
								</label>
								<label class="flex flex-col gap-1">
									<span class={labelClass}>Palabras clave</span>
									<input
										type="text"
										bind:value={s.alertForm.keywords}
										placeholder="React, Node, TypeScript"
										class={inputClass}
									/>
								</label>
								<label class="flex flex-col gap-1">
									<span class={labelClass}>Ubicación</span>
									<input
										type="text"
										bind:value={s.alertForm.location}
										placeholder="San Salvador"
										class={inputClass}
									/>
								</label>
								<label class="flex flex-col gap-1">
									<span class={labelClass}>Frecuencia</span>
									<select bind:value={s.alertForm.frequency} class={inputClass}>
										<option value="daily">Diaria</option>
										<option value="weekly">Semanal</option>
										<option value="instant">Instantánea</option>
									</select>
								</label>
							</div>
							<div class="mt-3">
								<button
									onclick={() => s.createAlert()}
									disabled={s.alertCreating}
									class={btnPrimary}
								>
									{#if s.alertCreating}
										<span
											class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
										></span>
										Creando...
									{:else}
										Crear Alerta
									{/if}
								</button>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
