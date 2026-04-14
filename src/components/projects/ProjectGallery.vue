<script>
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue';
import { convertToWebPUrl } from '@/composables/useImageOptimization';

export default {
	components: { SkeletonLoader },
	props: ['projectImages'],
	data() {
		return {
			selectedImage: null,
			isModalOpen: false,
			showLeftArrow: false,
			showRightArrow: false,
			scrollContainer: null,
			loadedImages: new Set(),
			imageSources: {} // 存储每个图片的当前使用源 (id -> { webpUrl, originalUrl, useFallback }
		};
	},
	methods: {
		getImageSource(img) {
			if (!this.imageSources[img.id]) {
				const webpUrl = convertToWebPUrl(img.img);
				this.imageSources[img.id] = {
					webpUrl,
					originalUrl: img.img,
					useFallback: false,
					currentUrl: webpUrl
				};
			}
			return this.imageSources[img.id].currentUrl;
		},
		checkAllImagesLoaded() {
			this.projectImages.forEach(img => {
				const source = this.getImageSource(img);
				const image = new Image();
				
				// 设置加载成功和失败的回调
				image.onload = () => {
					this.loadedImages.add(img.id);
				};
				
				image.onerror = () => {
					const imgSource = this.imageSources[img.id];
					if (!imgSource.useFallback && imgSource.webpUrl !== imgSource.originalUrl) {
						// 尝试加载原图
						imgSource.useFallback = true;
						imgSource.currentUrl = imgSource.originalUrl;
						
						const imgFallback = new Image();
						imgFallback.onload = () => {
							this.loadedImages.add(img.id);
						};
						imgFallback.onerror = () => {
							console.warn('Failed to load gallery image (both WebP and original):', img.img);
							this.loadedImages.add(img.id);
						};
						imgFallback.src = imgSource.originalUrl;
						
						if (imgFallback.complete) {
							this.loadedImages.add(img.id);
						}
					} else {
						console.warn('Failed to load gallery image:', img.img);
						this.loadedImages.add(img.id);
					}
				};
				
				// 开始加载图片
				image.src = source;
				
				// 如果图片已经在缓存中，直接设置为已加载
				if (image.complete) {
					this.loadedImages.add(img.id);
				}
			});
			
			// 设置超时保护，最多等待5秒
			this.loadTimeout = setTimeout(() => {
				this.projectImages.forEach(img => {
					if (!this.loadedImages.has(img.id)) {
						console.warn('Gallery image load timeout, showing anyway:', img.img);
						this.loadedImages.add(img.id);
					}
				});
			}, 5000);
		},
		onImageLoad(imageId) {
			this.loadedImages.add(imageId);
		},
		onImageError(imageId) {
			const img = this.projectImages.find(i => i.id === imageId);
			if (img && this.imageSources[imageId]) {
				const imgSource = this.imageSources[imageId];
				if (!imgSource.useFallback && imgSource.webpUrl !== imgSource.originalUrl) {
					// 切换到原图
					imgSource.useFallback = true;
					imgSource.currentUrl = imgSource.originalUrl;
					return; // 不标记为已加载，让新的 img 标签处理
				}
			}
			this.loadedImages.add(imageId);
		},
		isImageLoaded(imageId) {
			return this.loadedImages.has(imageId);
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
			// 键盘左右箭头切换图片
			if (event.key === 'ArrowLeft' && this.isModalOpen) {
				this.prevImage();
			}
			if (event.key === 'ArrowRight' && this.isModalOpen) {
				this.nextImage();
			}
		},
		nextImage() {
			const currentIndex = this.projectImages.findIndex(img => img.id === this.selectedImage.id);
			if (currentIndex < this.projectImages.length - 1) {
				this.selectedImage = this.projectImages[currentIndex + 1];
			}
		},
		prevImage() {
			const currentIndex = this.projectImages.findIndex(img => img.id === this.selectedImage.id);
			if (currentIndex > 0) {
				this.selectedImage = this.projectImages[currentIndex - 1];
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
		this.checkAllImagesLoaded();
		
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
	beforeUnmount() {
		// 组件卸载时清除定时器
		if (this.loadTimeout) {
			clearTimeout(this.loadTimeout);
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
							<!-- Skeleton Loader -->
							<SkeletonLoader 
								v-if="!isImageLoaded(projectImage.id)" 
								width="100%" 
								height="18rem" 
								rounded="lg"
							/>
							
							<!-- Image -->
							<img
								v-show="isImageLoaded(projectImage.id)"
								:key="imageSources[projectImage.id]?.useFallback ? 'fallback' : 'webp'"
								:src="getImageSource(projectImage)"
								class="w-full h-64 sm:h-72 object-cover rounded-t-xl gallery-image fade-in"
								:alt="projectImage.title"
								loading="lazy"
								@load="onImageLoad(projectImage.id)"
								@error="onImageError(projectImage.id)"
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
						<!-- Left Arrow -->
						<button
							@click="prevImage"
							class="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 p-2 rounded-full shadow-lg transition-all duration-300 backdrop-blur-sm"
							aria-label="Previous image"
						>
							<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
							</svg>
						</button>
						
						<!-- Right Arrow -->
						<button
							@click="nextImage"
							class="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 p-2 rounded-full shadow-lg transition-all duration-300 backdrop-blur-sm"
							aria-label="Next image"
						>
							<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
							</svg>
						</button>
						
						<!-- Skeleton Loader for Modal -->
						<SkeletonLoader 
							v-if="!isImageLoaded(selectedImage.id)" 
							width="100%" 
							height="75vh" 
							rounded="xl"
						/>
						
						<img 
							v-show="isImageLoaded(selectedImage.id)"
							:key="imageSources[selectedImage.id]?.useFallback ? 'fallback' : 'webp'"
							:src="getImageSource(selectedImage)" 
							:alt="selectedImage.title"
							class="w-full h-auto max-h-[75vh] object-contain modal-image fade-in"
							@click.stop
							@load="onImageLoad(selectedImage.id)"
							@error="onImageError(selectedImage.id)"
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
.fade-in {
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
