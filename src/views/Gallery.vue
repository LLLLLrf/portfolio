<script>
import { apiService } from '@/services/apiService';
import { useLanguage } from '@/composables/useLanguage';
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue';

export default {
	name: 'Gallery',
	components: { SkeletonLoader },
	setup() {
		const { t } = useLanguage();
		return { t };
	},
	data() {
		return {
			projects: [],
			galleryImages: [],
			selectedImage: null,
			isModalOpen: false,
			showLeftArrow: false,
			showRightArrow: false,
			scrollContainer: null,
			loadedImages: new Set()
		};
	},
	mounted() {
		// 尝试从sessionStorage加载图片加载状态
		const cachedImages = sessionStorage.getItem('gallery_loaded_images');
		if (cachedImages) {
			const imageIds = JSON.parse(cachedImages);
			imageIds.forEach(id => this.loadedImages.add(id));
			console.log('Loaded gallery image states from sessionStorage');
		}
		
		this.loadData();
		document.addEventListener('keydown', this.escapeKeyHandler);
		
		this.$nextTick(() => {
			this.scrollContainer = this.$refs.scrollContainer;
			if (this.scrollContainer) {
				this.scrollContainer.addEventListener('scroll', this.updateArrows);
				this.updateArrows();
			}
		});
	},
	methods: {
		async loadData() {
			this.projects = await apiService.getProjects();
			this.galleryImages = await apiService.getGallery();
			this.checkAllImagesLoaded();
		},
		checkAllImagesLoaded() {
			this.allImages.forEach(img => {
				const image = new Image();
				image.onload = () => {
					this.loadedImages.add(img.id);
					this.saveLoadedImages();
				};
				image.onerror = () => {
					this.loadedImages.add(img.id);
					this.saveLoadedImages();
				};
				image.src = img.url || img.img;
				if (image.complete) {
					this.loadedImages.add(img.id);
					this.saveLoadedImages();
				}
			});
		},
		saveLoadedImages() {
			sessionStorage.setItem('gallery_loaded_images', JSON.stringify(Array.from(this.loadedImages)));
		},
		isImageLoaded(imageId) {
			return this.loadedImages.has(imageId);
		},
		onImageLoad(imageId) {
			this.loadedImages.add(imageId);
			this.saveLoadedImages();
		},
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
	computed: {
		allImages() {
			const images = [];
			
			// 添加单独上传的 Gallery 图片
			this.galleryImages.forEach(img => {
				images.push({
					...img,
					isGalleryOnly: true
				});
			});
			
			// 添加项目图片
			this.projects.forEach(project => {
				if (project.images) {
					project.images.forEach(img => {
						images.push({
							...img,
							projectTitle: project.title,
							isGalleryOnly: false
						});
					});
				}
			});
			
			return images;
		}
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
	<div class="gallery-page">
		<div class="container mx-auto py-12 px-4">
			<div class="text-center mb-12">
				<h1 class="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
					Gallery
				</h1>
				<p class="text-gray-600 dark:text-gray-400 text-lg">
					All project images in one place
				</p>
			</div>

			<div v-if="allImages.length > 0" class="relative">
				<button
					v-if="showLeftArrow"
					@click="scrollLeft"
					class="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-lg rounded-full p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 opacity-80 hover:opacity-100"
					aria-label="Scroll left"
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
					</svg>
				</button>
				
				<button
					v-if="showRightArrow"
					@click="scrollRight"
					class="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-lg rounded-full p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 opacity-80 hover:opacity-100"
					aria-label="Scroll right"
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
					</svg>
				</button>
				
				<div ref="scrollContainer" class="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory gallery-scrollbar">
					<div
						class="group flex-shrink-0 w-80 sm:w-96 md:w-80 snap-start"
						v-for="image in allImages"
						:key="image.id"
					>
						<div 
							class="bg-secondary-light dark:bg-ternary-dark rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer h-full gallery-card"
							@click="openImageModal(image)"
						>
							<div class="relative overflow-hidden">
								<div v-if="!isImageLoaded(image.id)" class="gallery-image-skeleton">
									<SkeletonLoader width="100%" height="288px" rounded="lg" />
								</div>
								<img
								:src="image.url || image.img"
								:class="['w-full h-64 sm:h-72 object-cover rounded-t-xl gallery-image', isImageLoaded(image.id) ? 'image-visible' : 'image-hidden']"
								:alt="t(image.title) || t(image.caption)"
								loading="lazy"
								@load="onImageLoad(image.id)"
								@error="onImageLoad(image.id)"
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
									{{ t(image.title) || t(image.caption) }}
								</p>
								<p v-if="image.projectTitle && !image.isGalleryOnly" class="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
									{{ t(image.projectTitle) }}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div v-else class="text-center py-20">
				<p class="text-gray-500 dark:text-gray-400 text-lg">
					No images found in projects.
				</p>
			</div>

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
								:src="selectedImage.url || selectedImage.img" 
								:alt="t(selectedImage.title) || t(selectedImage.caption)"
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
								{{ t(selectedImage.title) || t(selectedImage.caption) }}
							</p>
							<p v-if="selectedImage.description" class="font-general-regular text-sm text-center text-gray-600 dark:text-gray-400 whitespace-pre-line">
								{{ t(selectedImage.description) }}
							</p>
							<p v-if="selectedImage.projectTitle && !selectedImage.isGalleryOnly" class="text-sm text-center text-gray-500 dark:text-gray-400 mt-2">
								From: {{ t(selectedImage.projectTitle) }}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.gallery-page {
	min-height: calc(100vh - 200px);
}

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

.gallery-card {
	transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.gallery-card:hover {
	box-shadow: 0 20px 40px -15px rgba(6, 182, 212, 0.3), 0 20px 40px -15px rgba(139, 92, 246, 0.2);
}

@media (prefers-color-scheme: light) {
	.gallery-card:hover {
		box-shadow: 0 10px 30px -10px rgba(6, 182, 212, 0.15), 0 10px 30px -10px rgba(139, 92, 246, 0.1);
	}
}

.gallery-image-skeleton {
	height: 288px;
}

.gallery-image {
	transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	filter: brightness(0.95);
}

.image-hidden {
	opacity: 0;
	position: absolute;
	top: 0;
	left: 0;
}

.image-visible {
	opacity: 1;
	animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}

.gallery-card:hover .gallery-image {
	filter: brightness(1.05);
}

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

img {
	transition: opacity 0.3s ease-in-out;
}

img.loading {
	opacity: 0.5;
}
</style>
