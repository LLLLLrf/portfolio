<script>
export default {
	props: ['projectImages'],
	data() {
		return {
			selectedImage: null,
			isModalOpen: false
		};
	},
	methods: {
		openImageModal(image) {
			this.selectedImage = image;
			this.isModalOpen = true;
			document.body.style.overflow = 'hidden';
		},
		closeImageModal() {
			this.isModalOpen = false;
			setTimeout(() => {
				this.selectedImage = null;
				document.body.style.overflow = '';
			}, 300);
		},
		escapeKeyHandler(event) {
			if (event.key === 'Escape' && this.isModalOpen) {
				this.closeImageModal();
			}
		}
	},
	mounted() {
		document.addEventListener('keydown', this.escapeKeyHandler);
	},
	unmounted() {
		document.removeEventListener('keydown', this.escapeKeyHandler);
	}
};
</script>

<template>
	<div class="mt-10 md:mt-12">
		<!-- Image Grid -->
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
			<div
				class="group"
				v-for="projectImage in projectImages"
				:key="projectImage.id"
			>
				<div 
					class="bg-secondary-light dark:bg-ternary-dark rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
					@click="openImageModal(projectImage)"
				>
					<div class="relative overflow-hidden">
						<img
							:src="projectImage.img"
							class="w-full h-64 sm:h-72 md:h-80 object-cover rounded-t-xl transition-transform duration-500 group-hover:scale-105"
							:alt="projectImage.title"
							loading="lazy"
						/>
						<div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
							<div class="transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
								</svg>
							</div>
						</div>
					</div>
					<div class="p-4">
						<p class="font-general-medium text-base sm:text-lg text-ternary-dark dark:text-ternary-light text-center">
							{{ projectImage.title }}
						</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Image Modal -->
		<div 
			v-if="isModalOpen && selectedImage" 
			class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4 transition-opacity duration-300"
			@click="closeImageModal"
		>
			<div 
				class="relative max-w-4xl max-h-[90vh] transition-transform duration-300 transform scale-95 opacity-0 animate-fade-in"
				style="animation: fadeIn 0.3s forwards"
				@click.stop
			>
				<img 
					:src="selectedImage.img" 
					:alt="selectedImage.title"
					class="max-w-full max-h-[80vh] object-contain rounded-lg"
				/>
				<div class="absolute top-4 right-4">
					<button 
						@click="closeImageModal"
						class="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all duration-300"
						aria-label="Close"
					>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
				<div class="mt-4 text-center text-white">
					<p class="font-general-medium text-lg">{{ selectedImage.title }}</p>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
@keyframes fadeIn {
	to {
		transform: scale(1);
		opacity: 1;
	}
}

/* Image loading placeholder */
img {
	transition: opacity 0.3s ease-in-out;
}

img.loading {
	opacity: 0.5;
}
</style>
