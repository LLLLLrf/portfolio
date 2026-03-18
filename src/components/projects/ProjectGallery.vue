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
		},
		handleWheel(event) {
			// 阻止默认的滚轮行为（页面上下滚动）
			event.preventDefault();
			// 调整滚动速度，使每个滚轮刻度滚动适量距离
			const scrollSpeed = 20; // 滚动速度系数，越小滚动越细腻
			event.currentTarget.scrollLeft += event.deltaY * scrollSpeed;
		}
	},
	mounted() {
		document.addEventListener('keydown', this.escapeKeyHandler);
		// 为滚动容器添加鼠标滚轮事件监听器
		this.$nextTick(() => {
			const scrollContainer = document.querySelector('.scrollbar-visible');
			if (scrollContainer) {
				scrollContainer.addEventListener('wheel', this.handleWheel);
			}
		});
	},
	unmounted() {
		document.removeEventListener('keydown', this.escapeKeyHandler);
		// 移除鼠标滚轮事件监听器
		const scrollContainer = document.querySelector('.scrollbar-visible');
		if (scrollContainer) {
			scrollContainer.removeEventListener('wheel', this.handleWheel);
		}
	}
};
</script>

<template>
	<div class="mt-10 md:mt-12">
		<!-- Image Horizontal Scroll -->
		<div class="relative">
			<div class="flex gap-4 sm:gap-6 md:gap-8 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-visible">
				<div
					class="group flex-shrink-0 w-80 sm:w-96 md:w-80 snap-start"
					v-for="projectImage in projectImages"
					:key="projectImage.id"
				>
					<div 
						class="bg-secondary-light dark:bg-ternary-dark rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer h-full"
						@click="openImageModal(projectImage)"
					>
						<div class="relative overflow-hidden">
							<img
								:src="projectImage.img"
								class="w-full h-64 sm:h-72 object-cover rounded-t-xl transition-transform duration-500 group-hover:scale-105"
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
							{{ projectImage.title || projectImage.caption }}
						</p>
					</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Image Modal -->
		<div 
			v-if="isModalOpen && selectedImage" 
			class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4 transition-opacity duration-300"
			@click="closeImageModal"
		>
			<div 
				class="relative transition-all duration-500 ease-out transform"
				:class="isModalOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0'"
				@click.stop
			>
				<div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden max-w-5xl">
					<div class="relative">
						<img 
							:src="selectedImage.img" 
							:alt="selectedImage.title"
							class="w-full h-auto max-h-[75vh] object-contain"
							@click.stop
						/>
						<button 
							@click="closeImageModal"
							class="absolute top-3 right-3 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 p-2 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110"
							aria-label="Close"
						>
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
					<div class="p-4 bg-gray-50 dark:bg-gray-900">
						<p class="font-general-semibold text-lg text-center text-gray-800 dark:text-gray-200 mb-2">
							{{ selectedImage.title || selectedImage.caption }}
						</p>
						<p v-if="selectedImage.description" class="font-general-regular text-sm text-center text-gray-600 dark:text-gray-400 whitespace-pre-line">
							{{ selectedImage.description }}
						</p>
					</div>
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

.scrollbar-visible {
	scrollbar-width: thin;
	scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
	-ms-overflow-style: auto;
}

.scrollbar-visible::-webkit-scrollbar {
	width: 6px;
	height: 6px;
}

.scrollbar-visible::-webkit-scrollbar-track {
	background: transparent;
}

.scrollbar-visible::-webkit-scrollbar-thumb {
	background-color: rgba(156, 163, 175, 0.5);
	border-radius: 3px;
	opacity: 1 !important;
	visibility: visible !important;
}

.scrollbar-visible::-webkit-scrollbar-thumb:hover {
	background-color: rgba(156, 163, 175, 0.7);
}

.dark .scrollbar-visible {
	scrollbar-color: rgba(75, 85, 99, 0.5) transparent;
}

.dark .scrollbar-visible::-webkit-scrollbar-thumb {
	background-color: rgba(75, 85, 99, 0.5);
}

.dark .scrollbar-visible::-webkit-scrollbar-thumb:hover {
	background-color: rgba(75, 85, 99, 0.7);
}
</style>
