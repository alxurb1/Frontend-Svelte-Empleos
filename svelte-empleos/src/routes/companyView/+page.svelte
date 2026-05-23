<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { companyStore, parseReview, type NewReviewForm } from '$lib/stores/companyStore.svelte';
	import {
		Calendar,
		Users,
		MapPin,
		Mail,
		Phone,
		Globe,
		Star,
		StarHalf,
		BarChart2,
		Plus,
		X,
		Loader2,
		Pencil
	} from 'lucide-svelte';

	const getInitials = (name?: string) => {
		if (!name) return '?';
		return name
			.split(' ')
			.slice(0, 2)
			.map((n) => n[0].toUpperCase())
			.join('');
	};

	const renderStars = (rating: number) => {
		const full = Math.floor(rating);
		const half = rating % 1 >= 0.5 ? 1 : 0;
		const empty = 5 - full - half;
		return { full, half, empty };
	};

	const formatDate = (date?: string) => (date ? new Date(date).toLocaleDateString('es-SV') : '');

	// ─----------------------------─ TAB ACTIVA ------------------------------------
	type Tab = 'acerca' | 'vacantes' | 'resenas';
	let activeTab = $state<Tab>('acerca');

	// ------------------------------FORM RESENIA-------------------------------------
	let form = $state<NewReviewForm>({ name: '', position: '', period: '', rating: '', comment: '' });

	const handleSubmitReview = async () => {
		const id = $page.url.searchParams.get('id');
		if (!id) return;
		const ok = await companyStore.submitReview(id, form);
		if (ok) form = { name: '', position: '', period: '', rating: '', comment: '' };
	};

	// -----------------------------LOAD------------------------------------------
	onMount(() => {
		const id = $page.url.searchParams.get('id');
		if (id) companyStore.fetchCompany(id);
	});
</script>

<!-- LOADING -->
{#if companyStore.loading}
	<div class="flex flex-col items-center justify-center gap-3 py-20">
		<Loader2 class="h-10 w-10 animate-spin text-blue-600" />
		<p class="text-sm text-gray-400">Cargando perfil...</p>
	</div>

	<!-- ERROR -->
{:else if companyStore.error}
	<div class="mx-auto mt-8 max-w-xl px-4">
		<div
			class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-600"
		>
			{companyStore.error}
		</div>
	</div>

	<!-- CONTENIDO -->
{:else if companyStore.company}
	{@const company = companyStore.company}
	{@const ratingAvg = companyStore.rating.average_rating ?? 0}
	{@const totalReviews = companyStore.rating.total_reviews ?? 0}
	{@const stars = renderStars(ratingAvg)}

	<div class="mx-auto max-w-6xl px-4 py-6">
		<div class="grid grid-cols-1 gap-4 md:grid-cols-4">
			<!-- ─── Columna izquierda ─── -->
			<div class="md:col-span-1">
				<div class="rounded-2xl bg-white p-5 text-center shadow-sm">
					<!-- Avatar -->
					<div
						class="mx-auto mb-3 flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-blue-600"
					>
						{#if company.logo_url}
							<img src={company.logo_url} alt="Logo" class="h-full w-full object-cover" />
						{:else}
							<span class="text-2xl font-bold text-white">{getInitials(company.name)}</span>
						{/if}
					</div>

					<h2 class="mb-0.5 text-base font-bold text-gray-900">{company.name ?? ''}</h2>
					<p class="mb-1 text-sm text-blue-600">{company.sector ?? company.industry ?? ''}</p>

					<!-- Estrellas -->
					<div class="mb-1 flex items-center justify-center gap-1">
						{#each Array(stars.full) as _}
							<Star class="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
						{/each}
						{#each Array(stars.half) as _}
							<StarHalf class="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
						{/each}
						{#each Array(stars.empty) as _}
							<Star class="h-3.5 w-3.5 fill-gray-300 text-gray-300" />
						{/each}
						<span class="ml-1 text-xs text-gray-500"
							>{ratingAvg.toFixed(1)} ({totalReviews} reseñas)</span
						>
					</div>

					<hr class="my-3 border-gray-100" />

					<!-- Meta info -->
					<div class="space-y-2 text-left">
						<div class="flex items-start gap-2 text-sm text-gray-600">
							<Calendar class="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
							<span>Fundada en {company.founded_year ?? 'N/D'}</span>
						</div>
						<div class="flex items-start gap-2 text-sm text-gray-600">
							<Users class="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
							<span>{company.size ?? company.employees_range ?? 'N/D'} empleados</span>
						</div>
						<div class="flex items-start gap-2 text-sm text-gray-600">
							<MapPin class="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
							<span>{company.location ?? 'N/D'}</span>
						</div>
						<div class="flex items-start gap-2 text-sm text-gray-600">
							<Mail class="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
							<span class="break-all">{company.email ?? 'N/D'}</span>
						</div>
						<div class="flex items-start gap-2 text-sm text-gray-600">
							<Phone class="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
							<span>{company.phone ?? 'N/D'}</span>
						</div>

						<!-- External links -->
						<div class="flex gap-3 pt-1">
							{#if company.linkedin_url}
								<a
									href={company.linkedin_url}
									target="_blank"
									rel="noopener"
									class="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
								>
									<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"
										><path
											d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
										/></svg
									>
									LinkedIn
								</a>
							{/if}
							{#if company.website}
								<a
									href={company.website}
									target="_blank"
									rel="noopener"
									class="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
								>
									<Globe class="h-4 w-4" />
									Web
								</a>
							{/if}
						</div>
					</div>

					<hr class="my-3 border-gray-100" />

					<!-- Stats mini -->
					<div class="space-y-1.5">
						<div class="flex justify-between text-sm">
							<span class="text-gray-400">Vacantes Activas</span>
							<span class="font-semibold text-gray-800">{companyStore.vacancies.length}</span>
						</div>
						<div class="flex justify-between text-sm">
							<span class="text-gray-400">Vistas del Perfil</span>
							<span class="font-semibold text-gray-800">{company.profile_views ?? 0}</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Columna derecha -->
			<div class="md:col-span-3">
				<div class="rounded-2xl bg-white shadow-sm">
					<!-- Tabs -->
					<div class="flex gap-1 border-b border-gray-100 px-5 pt-4">
						{#each [['acerca', 'Acerca de'], ['vacantes', 'Vacantes'], ['resenas', 'Reseñas']] as const as [tab, label]}
							<button
								onclick={() => (activeTab = tab)}
								class="rounded-t-lg px-4 py-2 text-sm font-medium transition-colors {activeTab ===
								tab
									? 'border-b-2 border-blue-600 text-blue-600'
									: 'text-gray-500 hover:text-gray-700'}"
							>
								{label}
							</button>
						{/each}
					</div>

					<div class="p-5">
						<!-- ACERCA DE -->
						{#if activeTab === 'acerca'}
							<div class="grid grid-cols-1 gap-4 md:grid-cols-5">
								<div class="space-y-3 md:col-span-3">
									{#each [{ title: 'Descripción de la Empresa', content: company.description ?? 'Sin descripción.' }, { title: 'Nuestra Misión', content: company.mission ?? 'Sin misión registrada.' }, { title: 'Nuestra Visión', content: company.vision ?? 'Sin visión registrada.' }] as section}
										<div class="rounded-xl bg-gray-50 p-4">
											<h3 class="mb-2 text-sm font-semibold text-gray-800">{section.title}</h3>
											<p class="text-sm leading-relaxed text-gray-500">{section.content}</p>
										</div>
									{/each}
								</div>

								<div class="space-y-3 md:col-span-2">
									<div class="rounded-xl bg-gray-50 p-4">
										<h3 class="mb-2 text-sm font-semibold text-gray-800">Beneficios</h3>
										{#if companyStore.benefits.length > 0}
											<ul class="space-y-1">
												{#each companyStore.benefits as b}
													<li class="flex items-start gap-1.5 text-sm text-gray-500">
														<span class="mt-0.5 text-blue-500">•</span>
														{b.benefit}
													</li>
												{/each}
											</ul>
										{:else}
											<p class="text-sm text-gray-400">Sin beneficios registrados.</p>
										{/if}
									</div>

									<div class="rounded-xl bg-gray-50 p-4">
										<h3 class="mb-2 text-sm font-semibold text-gray-800">Valores</h3>
										{#if companyStore.values.length > 0}
											<ul class="space-y-1">
												{#each companyStore.values as v}
													<li class="flex items-start gap-1.5 text-sm text-gray-500">
														<span class="mt-0.5 text-blue-500">•</span>
														{v.value_name}
													</li>
												{/each}
											</ul>
										{:else}
											<p class="text-sm text-gray-400">Sin valores registrados.</p>
										{/if}
									</div>
								</div>
							</div>

							<!-- VACANTES -->
						{:else if activeTab === 'vacantes'}
							<h3 class="mb-3 text-sm font-bold text-gray-800">Vacantes Activas</h3>

							{#if companyStore.vacancies.length === 0}
								<p class="text-sm text-gray-400">Sin vacantes activas.</p>
							{:else}
								<div class="mb-4 space-y-2">
									{#each companyStore.vacancies as v}
										<div
											class="flex items-center justify-between gap-3 rounded-xl bg-gray-50 px-4 py-3"
										>
											<div>
												<p class="text-sm font-semibold text-gray-800">{v.title}</p>
												<p class="mt-0.5 text-xs text-gray-400">
													{v.location ?? ''}
													{[v.modality, v.contract_type].filter(Boolean).join(' · ')
														? '· ' + [v.modality, v.contract_type].filter(Boolean).join(' · ')
														: ''}
												</p>
												{#if v.published_at}
													<p class="text-xs text-gray-400">
														Publicado el {formatDate(v.published_at)}
													</p>
												{/if}
											</div>
											<a href={`/vacancy_details?id=${v.id_vacancy}`}>
												<button
													class="shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
												>
													Ver Vacante
												</button>
											</a>
										</div>
									{/each}
								</div>
							{/if}

							<!-- Stats -->
							<div class="mt-2 rounded-xl bg-gray-50 p-4">
								<h4 class="mb-3 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
									<BarChart2 class="h-4 w-4" />
									Estadísticas
								</h4>
								<div class="grid grid-cols-3 gap-2 text-center">
									<div>
										<p class="text-2xl font-bold text-blue-600">{companyStore.vacancies.length}</p>
										<p class="text-xs text-gray-400">Activas</p>
									</div>
									<div>
										<p class="text-2xl font-bold text-blue-600">{company.total_applicants ?? 0}</p>
										<p class="text-xs text-gray-400">Postulantes</p>
									</div>
									<div>
										<p class="text-2xl font-bold text-green-500">{company.total_hired ?? 0}</p>
										<p class="text-xs text-gray-400">Contratados</p>
									</div>
								</div>
							</div>

							<!--  RESEÑAS  -->
						{:else if activeTab === 'resenas'}
							<h3 class="mb-3 text-sm font-bold text-gray-800">Reseñas de Empleados</h3>

							{#if companyStore.reviews.length === 0}
								<p class="mb-4 text-sm text-gray-400">Sin reseñas aún.</p>
							{:else}
								<div class="mb-4 space-y-2">
									{#each companyStore.reviews as rawReview}
										{@const r = parseReview(rawReview)}
										{@const s = renderStars(r.rating)}
										<div class="rounded-xl bg-gray-50 px-4 py-3">
											<div class="flex items-start gap-3">
												<div
													class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-400 text-sm font-bold text-white"
												>
													{getInitials(r.name)}
												</div>
												<div class="min-w-0 flex-1">
													<div class="mb-0.5 flex items-center justify-between gap-2">
														<p class="text-sm font-semibold text-gray-800">{r.name}</p>
														<div class="flex shrink-0 items-center gap-0.5">
															{#each Array(s.full) as _}
																<Star class="h-3 w-3 fill-yellow-400 text-yellow-400" />
															{/each}
															{#each Array(s.empty) as _}
																<Star class="h-3 w-3 fill-gray-300 text-gray-300" />
															{/each}
														</div>
													</div>
													{#if r.position || r.period}
														<p class="mb-1 text-xs text-gray-400">
															{r.position}{r.period ? ' · ' + r.period : ''}
														</p>
													{/if}
													<p class="text-sm leading-relaxed text-gray-500">{r.comment}</p>
												</div>
											</div>
										</div>
									{/each}
								</div>
							{/if}

							<!-- Toggle review form -->
							<button
								onclick={() => companyStore.toggleReviewForm()}
								class="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
							>
								{#if companyStore.showReviewForm}
									<X class="h-4 w-4" />
									Cancelar
								{:else}
									<Pencil class="h-4 w-4" />
									Escribir una Reseña
								{/if}
							</button>

							<!-- Review form -->
							{#if companyStore.showReviewForm}
								<div class="mt-3 rounded-xl bg-gray-50 p-4">
									<h4 class="mb-3 text-sm font-semibold text-gray-800">Nueva Reseña</h4>

									<div class="space-y-2">
										<input
											type="text"
											bind:value={form.name}
											placeholder="Tu nombre"
											class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
										/>
										<input
											type="text"
											bind:value={form.position}
											placeholder="Cargo que desempeñaste"
											class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
										/>
										<input
											type="text"
											bind:value={form.period}
											placeholder="Período (ej: 2021-2023)"
											class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
										/>
										<select
											bind:value={form.rating}
											class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
										>
											<option value="" disabled>Calificación</option>
											<option value={5}>⭐⭐⭐⭐⭐ Excelente</option>
											<option value={4}>⭐⭐⭐⭐ Muy Bueno</option>
											<option value={3}>⭐⭐⭐ Bueno</option>
											<option value={2}>⭐⭐ Regular</option>
											<option value={1}>⭐ Malo</option>
										</select>
										<textarea
											bind:value={form.comment}
											rows={3}
											placeholder="Escribe tu reseña..."
											class="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
										></textarea>
									</div>

									{#if companyStore.reviewError}
										<p class="mt-2 text-xs text-red-500">{companyStore.reviewError}</p>
									{/if}

									<button
										onclick={handleSubmitReview}
										disabled={companyStore.submittingReview || !form.rating || !form.comment}
										class="mt-3 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:bg-blue-300"
									>
										{#if companyStore.submittingReview}
											<Loader2 class="h-3.5 w-3.5 animate-spin" />
											Enviando...
										{:else}
											<Plus class="h-3.5 w-3.5" />
											Enviar Reseña
										{/if}
									</button>
								</div>
							{/if}
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
