<script lang="ts">
	import { onMount } from 'svelte';
	import {
		adminStore,
		getInitials,
		formatDate,
		VACANCY_STATUS,
		type VacancyStatus
	} from '$lib/stores/adminStore.svelte';
	import { Users, Building2, CheckCircle, MessageCircle, Search } from 'lucide-svelte';

	type Tab = 'usuarios' | 'empresas' | 'vacantes' | 'comentarios' | 'analiticas';
	let activeTab = $state<Tab>('usuarios');

	let chartData = $derived(adminStore.barChartData);
	let maxVal = $derived(Math.max(...chartData.map((d) => d.value), 1));
	let sectorData = $derived(adminStore.sectorData);
	let maxSector = $derived(sectorData[0]?.[1] ?? 1);

	onMount(() => {
		adminStore.loadMetrics();
		adminStore.loadUsers();
		adminStore.loadCompanies();
		adminStore.loadVacancies();
		adminStore.loadReviews();
	});
</script>

<div class="mx-auto max-w-7xl px-4 py-6">
	<h1 class="mb-0.5 text-xl font-bold text-gray-900">Panel de Administración</h1>
	<p class="mb-6 text-sm text-gray-400">Gestión Completa del Sistema</p>

	<!-- STATS -->
	<div class="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
		{#each [{ label: 'Total Usuarios', value: adminStore.metrics.total_users, icon: Users }, { label: 'Total Empresas', value: adminStore.metrics.total_companies, icon: Building2 }, { label: 'Vacantes Activas', value: adminStore.metrics.active_vacancies, icon: CheckCircle }, { label: 'Total Foros', value: adminStore.metrics.total_forum_posts, icon: MessageCircle }] as { label, value, icon: Icon }}
			<div class="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm">
				<div>
					<p class="mb-1 text-xs text-gray-400">{label}</p>
					<p class="text-xl font-bold text-gray-900">{value?.toLocaleString() ?? '—'}</p>
				</div>
				<Icon class="h-8 w-8 shrink-0 text-gray-300" strokeWidth={1.5} />
			</div>
		{/each}
	</div>

	<!-- TABS -->
	<div class="mb-5 flex gap-1 overflow-x-auto border-b border-gray-200">
		{#each [['usuarios', 'Usuarios'], ['empresas', 'Empresas'], ['vacantes', 'Vacantes'], ['comentarios', 'Comentarios'], ['analiticas', 'Analíticas']] as [tab, label]}
			<button
				onclick={() => (activeTab = tab as Tab)}
				class="shrink-0 px-4 py-2.5 text-sm font-medium transition-colors {activeTab === tab
					? 'border-b-2 border-blue-600 text-blue-600'
					: 'text-gray-500 hover:text-gray-700'}"
			>
				{label}
			</button>
		{/each}
	</div>

	<!-- USUARIOS -->
	{#if activeTab === 'usuarios'}
		<div class="rounded-2xl bg-white p-5 shadow-sm">
			<h2 class="mb-4 font-bold text-gray-800">Gestionar Usuarios</h2>

			<div class="mb-4 flex max-w-xs items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
				<Search class="h-4 w-4 shrink-0 text-gray-400" />
				<input
					type="text"
					placeholder="Buscar Usuarios..."
					bind:value={adminStore.userSearch}
					class="w-full bg-transparent text-sm focus:outline-none"
				/>
			</div>

			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b border-gray-100 text-xs text-gray-400">
							<th class="pb-2 text-left font-medium">Usuario</th>
							<th class="pb-2 text-left font-medium">Correo</th>
							<th class="pb-2 text-left font-medium">Tipo</th>
							<th class="pb-2 text-left font-medium">Registro</th>
							<th class="pb-2 text-left font-medium">Estado</th>
							<th class="pb-2 text-left font-medium">Acciones</th>
						</tr>
					</thead>
					<tbody>
						{#if adminStore.usersLoading}
							<tr>
								<td colspan={6} class="py-8 text-center">
									<div
										class="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"
									></div>
								</td>
							</tr>
						{:else if adminStore.filteredUsers.length === 0}
							<tr>
								<td colspan={6} class="py-6 text-center text-sm text-gray-400">Sin usuarios.</td>
							</tr>
						{:else}
							{#each adminStore.filteredUsers as user}
								<tr class="border-b border-gray-50 last:border-0">
									<td class="py-3">
										<div class="flex items-center gap-2">
											<div
												class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white"
											>
												{getInitials(user.full_name)}
											</div>
											<span class="font-semibold text-gray-800">{user.full_name ?? '—'}</span>
										</div>
									</td>
									<td class="py-3 text-gray-500">{user.email ?? '—'}</td>
									<td class="py-3 text-gray-600">{user.role ?? '—'}</td>
									<td class="py-3 text-gray-400">{formatDate(user.created_at)}</td>
									<td class="py-3">
										<span
											class="rounded-full px-2 py-1 text-xs font-semibold {user.is_active
												? 'bg-blue-600 text-white'
												: 'bg-gray-800 text-white'}"
										>
											{user.is_active ? 'Activo' : 'Suspendido'}
										</span>
									</td>
									<td class="py-3">
										<div class="flex gap-1.5">
											<button
												onclick={() => adminStore.toggleUser(user.id_user, user.is_active)}
												disabled={adminStore.togglingUser === user.id_user}
												class="rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
											>
												{user.is_active ? 'Suspender' : 'Activar'}
											</button>
											<button
												onclick={() => adminStore.deleteUser(user.id_user)}
												disabled={adminStore.togglingUser === user.id_user}
												class="rounded-lg bg-red-500 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
											>
												Eliminar
											</button>
										</div>
									</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		</div>

		<!-- EMPRESAS -->
	{:else if activeTab === 'empresas'}
		<div class="rounded-2xl bg-white p-5 shadow-sm">
			<h2 class="mb-4 font-bold text-gray-800">Gestionar Empresas</h2>

			<div class="mb-4 flex max-w-xs items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
				<Search class="h-4 w-4 shrink-0 text-gray-400" />
				<input
					type="text"
					placeholder="Buscar Empresas..."
					bind:value={adminStore.companySearch}
					class="w-full bg-transparent text-sm focus:outline-none"
				/>
			</div>

			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b border-gray-100 text-xs text-gray-400">
							<th class="pb-2 text-left font-medium">Empresa</th>
							<th class="pb-2 text-left font-medium">Sector</th>
							<th class="pb-2 text-left font-medium">Ubicación</th>
							<th class="pb-2 text-left font-medium">Estado</th>
							<th class="pb-2 text-left font-medium">Acciones</th>
						</tr>
					</thead>
					<tbody>
						{#if adminStore.companiesLoading}
							<tr>
								<td colspan={5} class="py-8 text-center">
									<div
										class="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"
									></div>
								</td>
							</tr>
						{:else if adminStore.filteredCompanies.length === 0}
							<tr>
								<td colspan={5} class="py-6 text-center text-sm text-gray-400">Sin empresas.</td>
							</tr>
						{:else}
							{#each adminStore.filteredCompanies as company}
								<tr class="border-b border-gray-50 last:border-0">
									<td class="py-3">
										<div class="flex items-center gap-2">
											<div
												class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white"
											>
												{getInitials(company.name)}
											</div>
											<span class="font-semibold text-gray-800">{company.name ?? '—'}</span>
										</div>
									</td>
									<td class="py-3 text-gray-500">{company.sector ?? '—'}</td>
									<td class="py-3 text-gray-500">{company.location ?? '—'}</td>
									<td class="py-3">
										<span
											class="rounded-full px-2 py-1 text-xs font-semibold {company.is_active
												? 'bg-blue-600 text-white'
												: 'bg-gray-800 text-white'}"
										>
											{company.is_active ? 'Activo' : 'Suspendido'}
										</span>
									</td>
									<td class="py-3">
										<div class="flex gap-1.5">
											<button
												onclick={() =>
													adminStore.toggleCompany(company.id_company, company.is_active)}
												disabled={adminStore.togglingCompany === company.id_company}
												class="rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
											>
												{company.is_active ? 'Suspender' : 'Activar'}
											</button>
											<button
												onclick={() => adminStore.deleteCompany(company.id_company)}
												disabled={adminStore.togglingCompany === company.id_company}
												class="rounded-lg bg-red-500 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
											>
												Eliminar
											</button>
										</div>
									</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		</div>

		<!-- VACANTES -->
	{:else if activeTab === 'vacantes'}
		<div class="rounded-2xl bg-white p-5 shadow-sm">
			<h2 class="mb-4 font-bold text-gray-800">Gestionar Vacantes</h2>

			<div class="mb-4 flex max-w-xs items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
				<Search class="h-4 w-4 shrink-0 text-gray-400" />
				<input
					type="text"
					placeholder="Buscar Vacantes..."
					bind:value={adminStore.vacancySearch}
					class="w-full bg-transparent text-sm focus:outline-none"
				/>
			</div>

			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b border-gray-100 text-xs text-gray-400">
							<th class="pb-2 text-left font-medium">Título</th>
							<th class="pb-2 text-left font-medium">Empresa</th>
							<th class="pb-2 text-left font-medium">Publicado</th>
							<th class="pb-2 text-left font-medium">Estado</th>
							<th class="pb-2 text-left font-medium">Acciones</th>
						</tr>
					</thead>
					<tbody>
						{#if adminStore.vacanciesLoading}
							<tr>
								<td colspan={5} class="py-8 text-center">
									<div
										class="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"
									></div>
								</td>
							</tr>
						{:else if adminStore.filteredVacancies.length === 0}
							<tr>
								<td colspan={5} class="py-6 text-center text-sm text-gray-400">Sin vacantes.</td>
							</tr>
						{:else}
							{#each adminStore.filteredVacancies as vacancy}
								{@const statusInfo = VACANCY_STATUS[vacancy.status ?? ''] ?? {
									label: vacancy.status ?? '—',
									color: 'bg-gray-400 text-white'
								}}
								<tr class="border-b border-gray-50 last:border-0">
									<td class="py-3 font-semibold text-gray-800">{vacancy.title ?? '—'}</td>
									<td class="py-3 text-gray-500">{vacancy.companies?.name ?? '—'}</td>
									<td class="py-3 text-gray-400">{formatDate(vacancy.published_at)}</td>
									<td class="py-3">
										<span class="rounded-full px-2 py-1 text-xs font-semibold {statusInfo.color}">
											{statusInfo.label}
										</span>
									</td>
									<td class="py-3">
										<div class="flex flex-wrap gap-1.5">
											<button
												onclick={() => adminStore.changeVacancyStatus(vacancy.id_vacancy, 'active')}
												disabled={adminStore.changingVacancy === vacancy.id_vacancy}
												class="rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
												>Activar</button
											>
											<button
												onclick={() => adminStore.changeVacancyStatus(vacancy.id_vacancy, 'paused')}
												disabled={adminStore.changingVacancy === vacancy.id_vacancy}
												class="rounded-lg bg-yellow-400 px-2.5 py-1.5 text-xs font-semibold text-gray-900 transition-colors hover:bg-yellow-500 disabled:opacity-50"
												>Pausar</button
											>
											<button
												onclick={() =>
													adminStore.changeVacancyStatus(
														vacancy.id_vacancy,
														'deleted' as VacancyStatus
													)}
												disabled={adminStore.changingVacancy === vacancy.id_vacancy}
												class="rounded-lg bg-red-500 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
												>Eliminar</button
											>
										</div>
									</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		</div>

		<!-- COMENTARIOS -->
	{:else if activeTab === 'comentarios'}
		<div class="rounded-2xl bg-white p-5 shadow-sm">
			<h2 class="mb-4 font-bold text-gray-800">Moderación de Comentarios</h2>

			{#if adminStore.reviewsLoading}
				<div class="flex justify-center py-10">
					<div
						class="h-7 w-7 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"
					></div>
				</div>
			{:else if adminStore.reviews.length === 0}
				<p class="text-sm text-gray-400">Sin comentarios pendientes.</p>
			{:else}
				<div class="space-y-3">
					{#each adminStore.reviews as review}
						<div class="rounded-xl bg-gray-50 p-4">
							<div class="mb-2 flex items-start justify-between gap-3">
								<div class="flex items-center gap-2">
									<div
										class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white"
									>
										{getInitials(review.users?.full_name)}
									</div>
									<div>
										<p class="text-sm font-semibold text-gray-800">
											{review.users?.full_name ?? 'Usuario'}
										</p>
										<p class="text-xs text-gray-400">
											Valoración de empresa: {review.companies?.name ?? '—'}
										</p>
									</div>
								</div>
								<span
									class="shrink-0 rounded-full bg-gray-800 px-2 py-1 text-xs font-semibold text-white"
								>
									{review.status ?? 'pending'}
								</span>
							</div>

							<p class="mb-1 text-sm text-gray-600">{review.comment ?? 'Sin comentario.'}</p>
							<p class="mb-3 text-xs text-gray-400">{formatDate(review.created_at)}</p>

							<div class="flex gap-2">
								<button
									onclick={() => adminStore.moderateReview(review.id, 'Aprobado')}
									disabled={adminStore.moderatingReview === review.id}
									class="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-green-400 hover:text-green-600 disabled:opacity-50"
									>Aprobar</button
								>
								<button
									onclick={() => adminStore.moderateReview(review.id, 'Rechazado')}
									disabled={adminStore.moderatingReview === review.id}
									class="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-red-400 hover:text-red-500 disabled:opacity-50"
									>Rechazar</button
								>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- ANALITICAS -->
	{:else if activeTab === 'analiticas'}
		<div class="rounded-2xl bg-white p-5 shadow-sm">
			<h2 class="mb-5 font-bold text-gray-800">Analíticas del Sistema</h2>

			<div class="mb-6 grid grid-cols-2 gap-4">
				<div>
					<p class="mb-0.5 text-xs text-gray-400">Registros Hoy</p>
					<p class="text-2xl font-bold text-gray-900">{adminStore.registrosHoy}</p>
				</div>
				<div>
					<p class="mb-0.5 text-xs text-gray-400">Vacantes Publicadas Hoy</p>
					<p class="text-2xl font-bold text-gray-900">{adminStore.vacantesHoy}</p>
				</div>
			</div>

			<h3 class="mb-3 text-sm font-bold text-gray-700">Nuevos Usuarios (Últimos 7 Días)</h3>
			<div class="mb-6 rounded-xl bg-gray-50 p-4">
				<div class="flex h-36 items-end justify-around gap-1">
					{#each chartData as bar}
						{@const pct = Math.max(Math.round((bar.value / maxVal) * 100), 3)}
						<div class="flex flex-1 flex-col items-center gap-1">
							<span class="text-xs text-gray-400">{bar.value}</span>
							<div
								class="w-full rounded-t-md bg-blue-600 transition-all"
								style="height: {pct}%"
							></div>
							<span class="text-xs text-gray-400">{bar.label}</span>
						</div>
					{/each}
				</div>
			</div>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<!-- SECTORES -->
				<div>
					<h3 class="mb-3 text-sm font-bold text-gray-700">Sectores Más Populares</h3>
					<div class="space-y-2">
						{#each sectorData as [sector, count]}
							{@const pct = Math.round((count / maxSector) * 100)}
							<div>
								<p class="mb-1 text-xs text-gray-500">{sector}</p>
								<div class="h-1.5 overflow-hidden rounded-full bg-gray-100">
									<div class="h-full rounded-full bg-blue-600" style="width: {pct}%"></div>
								</div>
							</div>
						{/each}
					</div>
				</div>

				<!-- UBICACIONES -->
				<div>
					<h3 class="mb-3 text-sm font-bold text-gray-700">Ubicaciones Principales</h3>
					<div class="space-y-2">
						{#each adminStore.locationData as [loc, count]}
							<div class="flex items-center justify-between">
								<span class="text-xs text-gray-500">{loc}</span>
								<span class="rounded-full bg-gray-800 px-2 py-0.5 text-xs font-semibold text-white"
									>{count}</span
								>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
