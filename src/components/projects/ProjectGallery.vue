<script>
export default {
	props: ['projectImages'],
	data() {
		return {
			selectedImage: null,
			isModalOpen: false,
			showLeftArrow: false,
			showRightArrow: false,
			scrollContainer: null
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
		scrollLeft() {
			if (this.scrollContainer) {
				this.scrollContainer.scrollBy({ left: -300, behavior: 'smooth' });
			}
		},
		scrollRight() {
			if (this.scrollContainer) {
				this.scrollContainer.scrollBy({ left: 300, behavior: 'smooth' });
			}
		},
		updateArrows() {
			if (!this.scrollContainer) return;
			
			const { scrollLeft, scrollWidth, clientWidth } = this.scrollContainer;
			this.showLeftArrow = scrollLeft > 0;
			this.showRightArrow = scrollLeft < (scrollWidth - clientWidth);
		}
	},
	mounted() {
		document.addEventListener('keydown', this.escapeKeyHandler);
		
		// 等待DOM渲染完成后获取滚动容器
		this.$nextTick(() => {
			this.scrollContainer = this.$refs.scrollContainer;
			if (this.scrollContainer) {
				// 添加滚动事件监听
				this.scrollContainer.addEventListener('scroll', this.updateArrows);
				// 初始检查
				this.updateArrows();
			}
		});
	},
	unmounted() {
		document.removeEventListener('keydown', this.escapeKeyHandler);
		if (this.scrollContainer) {
			this.scrollContainer.removeEventListener('scroll', this.updateArrows);
		}
	}
};
</script>

<template>
	<div class="mt-10 md:mt-12 detail-card detail-card-gallery">
		<!-- Image Horizontal Scroll -->
		<div class="relative">
			<!-- Left Arrow -->
			<button
				v-if="showLeftArrow"
				@click="scrollLeft"
				class="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-lg rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 opacity-80 hover:opacity-100"
				aria-label="Scroll left"
			>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
				</svg>
			</button>
			
			<!-- Right Arrow -->
			<button
				v-if="showRightArrow"
				@click="scrollRight"
				class="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-lg rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 opacity-80 hover:opacity-100"
				aria-label="Scroll right"
			>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
			</button>
			
			<div ref="scrollContainer" class="flex gap-4 sm:gap-6 md:gap-8 overflow-x-auto pb-6 snap-x snap-mandatory gallery-scrollbar">
				<div
					class="group flex-shrink-0 w-80 sm:w-96 md:w-80 snap-start"
					v-for="projectImage in projectImages"
					:key="projectImage.id"
				>
					<div 
						class="bg-secondary-light dark:bg-ternary-dark rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer h-full gallery-card"
						@click="openImageModal(projectImage)"
					>
						<div class="relative overflow-hidden">
							<img
								:src="projectImage.img"
								class="w-full h-64 sm:h-72 object-cover rounded-t-xl gallery-image"
								:alt="projectImage.title"
								loading="lazy"
							/>
							<div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center">
								<div class="opacity-0 group-hover:opacity-100 transition-all duration-300 mb-4">
									<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
									</svg>
								</div>
							</div>
						</div>
						<div class="p-4">
							<p class="gallery-title text-base sm:text-lg text-center">
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
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 transition-opacity duration-400 modal-overlay"
			@click="closeImageModal"
		>
			<div 
				class="relative transition-all duration-500 ease-out transform modal-content"
				:class="isModalOpen ? 'modal-open' : 'modal-closed'"
				@click.stop
			>
				<div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden max-w-5xl">
					<div class="relative">
						<img 
							:src="selectedImage.img" 
							:alt="selectedImage.title"
							class="w-full h-auto max-h-[75vh] object-contain modal-image"
							@click.stop
						/>
						<button 
							@click="closeImageModal"
							class="absolute top-3 right-3 bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 p-2 rounded-full shadow-lg transition-all duration-300 backdrop-blur-sm"
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
/* Gallery Scrollbar - Custom Style */
.gallery-scrollbar {
	scrollbar-width: auto;
	scrollbar-color: linear-gradient(90deg, #06b6d4, #8b5cf6, #ec4899) transparent;
	-ms-overflow-style: auto;
}

.gallery-scrollbar::-webkit-scrollbar {
	width: 8px;
	height: 8px;
}

.gallery-scrollbar::-webkit-scrollbar-track {
	background: rgba(31, 41, 55, 0.3);
	border-radius: 4px;
}

.gallery-scrollbar::-webkit-scrollbar-thumb {
	background: linear-gradient(90deg, #06b6d4, #8b5cf6, #ec4899);
	border-radius: 4px;
	opacity: 1 !important;
	visibility: visible !important;
	transition: all 0.3s ease;
}

.gallery-scrollbar::-webkit-scrollbar-thumb:hover {
	background: linear-gradient(90deg, #0891b2, #7c3aed, #db2777);
	box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
}

/* Gallery Card Hover Effect */
.gallery-card {
	transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.gallery-card:hover {
	box-shadow: 0 20px 40px -15px rgba(6, 182, 212, 0.3), 0 20px 40px -15px rgba(139, 92, 246, 0.2);
}

/* Light mode - no dark shadow */
@media (prefers-color-scheme: light) {
	.gallery-card:hover {
		box-shadow: 0 10px 30px -10px rgba(6, 182, 212, 0.15), 0 10px 30px -10px rgba(139, 92, 246, 0.1);
	}
}

/* Gallery Image Effect */
.gallery-image {
	transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	filter: brightness(0.95);
}

.gallery-card:hover .gallery-image {
	filter: brightness(1.05);
}

/* Gallery Title - Ellipsis */
.gallery-title {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	max-width: 100%;
	font-weight: 800;
	color: #111827;
	transition: all 0.3s ease;
}

.dark .gallery-title {
	color: #f9fafb;
}

.gallery-card:hover .gallery-title {
	background: linear-gradient(90deg, #06b6d4, #8b5cf6, #ec4899);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
	letter-spacing: 0.5px;
}

/* Modal Animations */
.modal-overlay {
	backdrop-filter: blur(8px);
}

.modal-content {
	opacity: 0;
	transform: scale(0.8) rotateX(10deg);
	filter: blur(10px);
}

.modal-open {
	opacity: 1;
	transform: scale(1) rotateX(0deg);
	filter: blur(0);
	animation: modalZoomIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-closed {
	opacity: 0;
	transform: scale(0.9) rotateX(-5deg);
	filter: blur(5px);
}

@keyframes modalZoomIn {
	0% {
		opacity: 0;
		transform: scale(0.7) rotateX(15deg);
		filter: blur(20px);
	}
	50% {
		transform: scale(1.05) rotateX(-2deg);
		filter: blur(0);
	}
	100% {
		opacity: 1;
		transform: scale(1) rotateX(0deg);
		filter: blur(0);
	}
}

.modal-image {
	transition: all 0.3s ease;
}

/* Image loading placeholder */
img {
	transition: opacity 0.3s ease-in-out;
}

img.loading {
	opacity: 0.5;
}
</style>
