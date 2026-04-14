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
			galleryImages: [],
			selectedGroup: null,
			selectedImageIndex: 0,
			isModalOpen: false,
			loadedImages: new Set(),
			currentRotation: 0,
			isDragging: false,
			startX: 0,
			currentX: 0,
			startRotation: 0,
			isAutoRotating: true,
			loadTimeout: null,
			pageDescription: {
				zh: '使用 ← → 键切换，空格查看详情',
				en: 'Use the ← → keys to switch, and space to view details'
			},
			noImagesText: {
				zh: '暂无图片',
				en: 'No images found in projects.'
			}
		};
	},
	computed: {
		// 计算卡片样式
		cardStyles() {
			const quantity = this.galleryImages.length || 1;
			return this.galleryImages.map((group, index) => {
				const rotateY = (360 / quantity) * index + this.currentRotation;
				return {
					'--index': index,
					'--rotate-y': `${rotateY}deg`
				};
			});
		},
		// 计算inner样式
		innerStyle() {
			const quantity = this.galleryImages.length || 1;
			return {
				'--quantity': quantity,
				'transform': `perspective(1000px) rotateX(-2deg) rotateY(${-this.currentRotation}deg)`
			};
		}
	},
	mounted() {
		this.loadData();
		document.addEventListener('keydown', this.keyboardHandler);
		this.startAutoRotation();
		
		// 鼠标/触摸事件
		this.$refs.wrapper?.addEventListener('mousedown', this.handleMouseDown);
		this.$refs.wrapper?.addEventListener('touchstart', this.handleTouchStart, { passive: false });
	},
	beforeUnmount() {
		if (this.loadTimeout) {
			clearTimeout(this.loadTimeout);
		}
		this.stopAutoRotation();
		document.removeEventListener('keydown', this.keyboardHandler);
		
		this.$refs.wrapper?.removeEventListener('mousedown', this.handleMouseDown);
		this.$refs.wrapper?.removeEventListener('touchstart', this.handleTouchStart);
		document.removeEventListener('mousemove', this.handleMouseMove);
		document.removeEventListener('mouseup', this.handleMouseUp);
		document.removeEventListener('touchmove', this.handleTouchMove);
		document.removeEventListener('touchend', this.handleTouchEnd);
	},
	methods: {
		async loadData() {
			this.galleryImages = await apiService.getGallery();
			console.log('Gallery.vue - Loaded gallery groups:', this.galleryImages);
			this.checkAllImagesLoaded();
		},
		
		// 获取图组的所有图片
		getImageUrls(group) {
			if (group.images && Array.isArray(group.images) && group.images.length > 0) {
				return group.images;
			}
			return [group.url];
		},
		
		// 获取图组的封面图片
		getCoverImageUrl(group) {
			const urls = this.getImageUrls(group);
			return urls[0] || '';
		},
		
		// 获取图组的图片数量
		getImageCount(group) {
			return this.getImageUrls(group).length;
		},
		
		checkAllImagesLoaded() {
			this.galleryImages.forEach(group => {
				const coverUrl = this.getCoverImageUrl(group);
				const image = new Image();
				image.onload = () => {
					this.loadedImages.add(group.id);
				};
				image.onerror = () => {
					console.warn('Failed to load gallery image:', coverUrl);
					this.loadedImages.add(group.id);
				};
				image.src = coverUrl;
				if (image.complete) {
					this.loadedImages.add(group.id);
				}
			});
			
			// 设置超时保护，最多等待5秒
			this.loadTimeout = setTimeout(() => {
				this.galleryImages.forEach(group => {
					if (!this.loadedImages.has(group.id)) {
						console.warn('Gallery image load timeout, showing anyway:', this.getCoverImageUrl(group));
						this.loadedImages.add(group.id);
					}
				});
			}, 5000);
		},
		
		isImageLoaded(group) {
			return this.loadedImages.has(group.id);
		},
		
		// 键盘处理
		keyboardHandler(event) {
			if (event.key === 'Escape') {
				if (this.isModalOpen) {
					this.closeImageModal();
				}
			} else if (event.key === ' ' && this.isModalOpen) {
				event.preventDefault();
				this.closeImageModal();
			} else if (event.key === 'ArrowLeft' && !this.isModalOpen) {
				this.rotateLeft();
			} else if (event.key === 'ArrowRight' && !this.isModalOpen) {
				this.rotateRight();
			} else if (event.key === 'ArrowLeft' && this.isModalOpen) {
				this.prevModalImage();
			} else if (event.key === 'ArrowRight' && this.isModalOpen) {
				this.nextModalImage();
			} else if (event.key === ' ' && !this.isModalOpen) {
				event.preventDefault();
				const frontGroup = this.getFrontGroup();
				if (frontGroup) {
					this.handleGroupClick(frontGroup);
				}
			}
		},
		
		// 获取当前最前面的图组
		getFrontGroup() {
			if (this.galleryImages.length === 0) return null;
			
			const quantity = this.galleryImages.length;
			const step = 360 / quantity;
			
			// 计算哪个卡片在最前面
			// 我们需要找到满足 step * i ≈ currentRotation 的 i
			let normalizedRotation = ((this.currentRotation % 360) + 360) % 360;
			
			// 找到最接近的索引
			let frontIndex = Math.round(normalizedRotation / step) % quantity;
			if (frontIndex < 0) frontIndex += quantity;
			
			return this.galleryImages[frontIndex];
		},
		
		// 向左旋转
		rotateLeft() {
			const quantity = this.galleryImages.length || 1;
			this.currentRotation -= 360 / quantity;
		},
		
		// 向右旋转
		rotateRight() {
			const quantity = this.galleryImages.length || 1;
			this.currentRotation += 360 / quantity;
		},
		
		// 开始自动旋转
		startAutoRotation() {
			this.autoRotateInterval = setInterval(() => {
				if (this.isAutoRotating && !this.isDragging) {
					this.rotateRight();
				}
			}, 6000);
		},
		
		// 停止自动旋转
		stopAutoRotation() {
			if (this.autoRotateInterval) {
				clearInterval(this.autoRotateInterval);
			}
		},
		
		// 点击图组卡片 - 直接进入大图模式
		handleGroupClick(group) {
			this.selectedGroup = group;
			this.selectedImageIndex = 0;
			this.isModalOpen = true;
			document.body.style.overflow = 'hidden';
			this.isAutoRotating = false;
		},
		
		// 关闭图片查看模态框
		closeImageModal() {
			this.isModalOpen = false;
			setTimeout(() => {
				this.selectedImageIndex = 0;
				document.body.style.overflow = '';
				this.isAutoRotating = true;
			}, 300);
		},
		
		// 模态框中上一张图片
		prevModalImage() {
			if (!this.selectedGroup) return;
			const urls = this.getImageUrls(this.selectedGroup);
			if (this.selectedImageIndex > 0) {
				this.selectedImageIndex--;
			} else {
				this.selectedImageIndex = urls.length - 1;
			}
		},
		
		// 模态框中下一张图片
		nextModalImage() {
			if (!this.selectedGroup) return;
			const urls = this.getImageUrls(this.selectedGroup);
			if (this.selectedImageIndex < urls.length - 1) {
				this.selectedImageIndex++;
			} else {
				this.selectedImageIndex = 0;
			}
		},
		
		// 获取模态框当前显示的图片URL
		getModalImageUrl() {
			if (!this.selectedGroup) return '';
			const urls = this.getImageUrls(this.selectedGroup);
			return urls[this.selectedImageIndex] || urls[0];
		},
		
		// 鼠标事件处理
		handleMouseDown(event) {
			this.isDragging = true;
			this.isAutoRotating = false;
			this.startX = event.clientX;
			this.currentX = event.clientX;
			this.startRotation = this.currentRotation;
			
			document.addEventListener('mousemove', this.handleMouseMove);
			document.addEventListener('mouseup', this.handleMouseUp);
		},
		
		handleMouseMove(event) {
			if (!this.isDragging) return;
			this.currentX = event.clientX;
			const diff = (this.currentX - this.startX) * 0.3;
			this.currentRotation = this.startRotation + diff;
		},
		
		handleMouseUp() {
			if (!this.isDragging) return;
			
			const quantity = this.galleryImages.length || 1;
			const step = 360 / quantity;
			const normalizedRotation = ((this.currentRotation % 360) + 360) % 360;
			const nearestStep = Math.round(normalizedRotation / step) * step;
			this.currentRotation = this.currentRotation - (normalizedRotation - nearestStep);
			
			this.isDragging = false;
			this.isAutoRotating = true;
			document.removeEventListener('mousemove', this.handleMouseMove);
			document.removeEventListener('mouseup', this.handleMouseUp);
		},
		
		// 触摸事件处理
		handleTouchStart(event) {
			event.preventDefault();
			this.isDragging = true;
			this.isAutoRotating = false;
			this.startX = event.touches[0].clientX;
			this.currentX = event.touches[0].clientX;
			this.startRotation = this.currentRotation;
			
			document.addEventListener('touchmove', this.handleTouchMove, { passive: false });
			document.addEventListener('touchend', this.handleTouchEnd);
		},
		
		handleTouchMove(event) {
			if (!this.isDragging) return;
			event.preventDefault();
			this.currentX = event.touches[0].clientX;
			const diff = (this.currentX - this.startX) * 0.3;
			this.currentRotation = this.startRotation + diff;
		},
		
		handleTouchEnd() {
			if (!this.isDragging) return;
			
			const quantity = this.galleryImages.length || 1;
			const step = 360 / quantity;
			const normalizedRotation = ((this.currentRotation % 360) + 360) % 360;
			const nearestStep = Math.round(normalizedRotation / step) * step;
			this.currentRotation = this.currentRotation - (normalizedRotation - nearestStep);
			
			this.isDragging = false;
			this.isAutoRotating = true;
			document.removeEventListener('touchmove', this.handleTouchMove);
			document.removeEventListener('touchend', this.handleTouchEnd);
		}
	}
};
</script>

<template>
	<div class="gallery-page">
		<div class="container mx-auto py-10 px-4">
			<div class="text-center mb-8">
				<h1 class="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
					Gallery
				</h1>
				<p class="text-gray-600 dark:text-gray-400 text-lg">
					{{ t(pageDescription) }}
				</p>
			</div>

			<div v-if="galleryImages.length > 0" class="gallery-container">
				<div class="wrapper" ref="wrapper">
					<div 
						class="inner" 
						:style="innerStyle"
						:class="{ 'no-animation': isDragging }"
					>
						<div
							v-for="(group, index) in galleryImages"
							:key="group.id"
							class="card"
							:style="cardStyles[index]"
							@click="handleGroupClick(group)"
						>
							<div class="img-container">
								<div v-if="!isImageLoaded(group)" class="gallery-image-skeleton">
									<SkeletonLoader width="100%" height="100%" rounded="lg" />
								</div>
								<img
									:src="getCoverImageUrl(group)"
									:class="['img', isImageLoaded(group) ? 'image-visible' : 'image-hidden']"
									:alt="t(group.title)"
								/>
								<div class="image-count-badge">
									{{ getImageCount(group) }} 张
								</div>
								<div class="card-content">
									<p class="card-title">{{ t(group.title) }}</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div v-else class="text-center py-20">
				<p class="text-gray-500 dark:text-gray-400 text-lg">
					{{ t(noImagesText) }}
				</p>
			</div>



			<!-- 图片查看模态框 -->
			<div 
				v-if="isModalOpen && selectedGroup" 
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
							<!-- 左右切换箭头 -->
							<button 
								@click="prevModalImage"
								class="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 p-2 rounded-full shadow-lg transition-all duration-300 backdrop-blur-sm z-10"
							>
								<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
								</svg>
							</button>
							<button 
								@click="nextModalImage"
								class="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 p-2 rounded-full shadow-lg transition-all duration-300 backdrop-blur-sm z-10"
							>
								<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
								</svg>
							</button>
							
							<img 
								:src="getModalImageUrl()" 
								:alt="t(selectedGroup.title)"
								class="w-full h-auto max-h-[75vh] object-contain modal-image"
								@click.stop
							/>
							
							<!-- 图片数量指示器 -->
							<div class="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
								{{ selectedImageIndex + 1 }} / {{ getImageCount(selectedGroup) }}
							</div>
							
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
								{{ t(selectedGroup.title) }}
							</p>
							<p v-if="selectedGroup.description" class="font-general-regular text-sm text-center text-gray-600 dark:text-gray-400 whitespace-pre-line">
								{{ t(selectedGroup.description) }}
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

.gallery-container {
	height: calc(100vh - 200px);
	margin-top: -50px;
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
}

.wrapper {
	width: 100%;
	height: 100%;
	position: relative;
	text-align: center;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: visible;
}

.inner {
	--w: 280px;
	--translateZ: 500px;
	--rotateX: -15deg;
	--perspective: 1000px;
	position: absolute;
	width: var(--w);
	top: 10%;
	left: calc(50% - (var(--w) / 2) - 2.5px);
	z-index: 2;
	transform-style: preserve-3d;
	transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.inner.no-animation {
	transition: none;
}

.card {
	position: absolute;
	/* border: 2px solid rgba(100, 255, 218, 0.3); */
	border-radius: 16px;
	overflow: hidden;
	width: 98%;
	height: auto;
	top: 0;
	left: 0;
	transform: rotateY(calc((360deg / var(--quantity)) * var(--index)))
		translateZ(var(--translateZ));
	background: linear-gradient(135deg, 
		rgba(100, 255, 218, 0.05) 0%, 
		rgba(100, 255, 218, 0.02) 100%);
	cursor: pointer;
	transition: all 0.3s ease;
	backface-visibility: visible;
}

.card:hover {
	transform: rotateY(calc((360deg / var(--quantity)) * var(--index)))
		translateZ(calc(var(--translateZ) + 30px))
		scale(1.03);
	box-shadow: 0 20px 60px rgba(100, 255, 218, 0.2);
	/* border-color: rgba(100, 255, 218, 0.6); */
}

.img-container {
	width: 100%;
	aspect-ratio: 4 / 3.6;
	overflow: hidden;
	position: relative;
	background: linear-gradient(135deg, 
		rgba(100, 255, 218, 0.05) 0%, 
		rgba(100, 255, 218, 0.02) 100%);
}

.img-container img {
	width: 100%;
	height: 100%;
	display: block;
	object-fit: cover;
}

.gallery-image-skeleton {
	width: 100%;
	height: 100%;
}

.img {
	width: 100%;
	height: 100%;
	display: block;
	object-fit: cover;
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

.card-content {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	padding: 24px 16px 16px;
	background: linear-gradient(
		to top,
		rgba(0, 0, 0, 0.85) 0%,
		rgba(0, 0, 0, 0.6) 50%,
		rgba(0, 0, 0, 0) 100%
	);
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
	align-items: center;
	z-index: 10;
}

.image-count-badge {
	position: absolute;
	top: 12px;
	right: 12px;
	width: 30px;
	background: rgba(0,0,0, 0.15);
	color: white;
	padding: 4px 4px;
	border-radius: 20px;
	font-size: 8px;
	font-weight: 700;
	backdrop-filter: blur(8px);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.0);
	z-index: 10;
	text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.card-title {
	font-size: 10px;
	font-weight: 700;
	color: #ffffff;
	text-align: center;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	width: 100%;
	margin-bottom: -6px;
	line-height: 1.2;
	text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
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

/* 响应式调整 */
@media (max-width: 640px) {
	.gallery-container {
		height: 550px;
	}
	
	.inner {
		--w: 260px;
		--translateZ: 400px;
	}
	
	.card-content {
		padding: 20px 12px 12px;
	}
	
	.card-title {
		font-size: 14px;
	}
	
	.image-count-badge {
		font-size: 11px;
		padding: 4px 10px;
		top: 8px;
		right: 8px;
	}
}
</style>
