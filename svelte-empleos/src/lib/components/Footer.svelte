<script>
	import { Briefcase, MapPin, Phone, Mail } from 'lucide-svelte';
</script>

<footer class="bg-blue-600 px-4 py-6 text-white lg:px-8">
	<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
		<!-- Brand -->
		<div>
			<p class="mb-2 flex items-center gap-2 text-xl font-bold">
				<Briefcase class="h-6 w-6" />
				Empleos
			</p>

			<p class="text-sm">
				Conectamos talento con las mejores oportunidades profesionales. Tu próximo empleo está aquí.
			</p>
		</div>

		<!-- Quick links -->
		<div>
			<p class="mb-2 text-base font-semibold">Enlaces Rápidos</p>

			<ul class="flex flex-col gap-1 text-sm">
				<li>
					<a href="/" class="hover:underline">Inicio</a>
				</li>

				<li>
					<a href="/searchResults" class="hover:underline"> Buscar Trabajo </a>
				</li>

				<li>
					<a href="/resources" class="hover:underline"> Recursos </a>
				</li>

				<li>
					<a href="/forums_and_ratings" class="hover:underline"> Foros </a>
				</li>
			</ul>
		</div>

		<!-- Contact -->
		<div>
			<p class="mb-2 text-base font-semibold">Contacto</p>

			<ul class="flex flex-col gap-2 text-sm">
				<li class="flex items-center gap-2">
					<MapPin class="h-4 w-4" />
					San Salvador (Remoto)
				</li>

				<li class="flex items-center gap-2">
					<Phone class="h-4 w-4" />
					1234 5678
				</li>

				<li class="flex items-center gap-2">
					<Mail class="h-4 w-4" />
					correo@ejemplo.com
				</li>
			</ul>
		</div>
	</div>
</footer>