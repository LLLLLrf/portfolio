<script>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { apiService } from '@/services/apiService';
import { useLanguage } from '@/composables/useLanguage';
import { convertToWebPUrl } from '@/composables/useImageOptimization';
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue';

export default {
	name: 'Gallery',
	components: { SkeletonLoader },
	setup() {
		const { t } = useLanguage();

		const galleryImages = ref([]);
		const selectedGroup = ref(null);
		const selectedImageIndex = ref(0);
		const isModalOpen = ref(false);
		const loadedImages = ref(new Set());
		const preloadedImages = ref(new Set());
		const imageLoadingStates = ref({});
		const currentRotation = ref(0);
		const isDragging = ref(false);
		const startX = ref(0);
		const currentX = ref(0);
		const startRotation = ref(0);
		const isAutoRotating = ref(true);
		const loadTimeout = ref(null);
		const isMobile = ref(false);
		const modalTouchStartX = ref(0);
		const modalTouchStartY = ref(0);
		const wrapper = ref(null);
		let autoRotateInterval = null;

		const pageDescription = ref({
			zh: '使用 ← → 键切换，空格查看详情',
			en: 'Use the ← → keys to switch, and space to view details'
		});

		const pageDescriptionMobile = ref({
			zh: '点击查看详情，滑动切换图片',
			en: 'Tap to view, swipe to switch'
		});

		const noImagesText = ref({
			zh: '暂无图片',
			en: 'No images found in projects.'
		});

		// 获取移动端适配的描述文本
		const displayPageDescription = computed(() => {
			return isMobile.value ? pageDescriptionMobile.value : pageDescription.value;
		});

		// 计算卡片样式
		const cardStyles = computed(() => {
			const quantity = galleryImages.value.length || 1;
			return galleryImages.value.map((group, index) => {
				const rotateY = (360 / quantity) * index + currentRotation.value;
				return {
					'--index': index,
					'--rotate-y': `${rotateY}deg`
				};
			});
		});

		// 计算inner样式
		const innerStyle = computed(() => {
			const quantity = galleryImages.value.length || 1;
			return {
				'--quantity': quantity,
				'transform': `perspective(1000px) rotateX(5deg) rotateY(${-currentRotation.value}deg)`
			};
		});

		// 检测是否是移动端
		const checkMobile = () => {
			isMobile.value = window.innerWidth < 768;
			console.log('Gallery: checkMobile, isMobile:', isMobile.value, 'width:', window.innerWidth);
		};

		// 获取图组的所有图片
		const getImageUrls = (group) => {
			if (group.images && Array.isArray(group.images) && group.images.length > 0) {
				return group.images;
			}
			return [group.url];
		};

		// 获取图组的封面图片（优先 WebP）
		const getCoverImageUrl = (group) => {
			const urls = getImageUrls(group);
			return convertToWebPUrl(urls[0] || '');
		};

		// 获取图组的图片数量
		const getImageCount = (group) => {
			return getImageUrls(group).length;
		};

		// 检查是否图片已加载
		const isGroupImageLoaded = (group) => {
			return loadedImages.value.has(group.id);
		};

		// 检查是否图片正在加载
		const isUrlLoading = (url) => {
			return imageLoadingStates.value[url] === true;
		};

		const checkAllImagesLoaded = () => {
			galleryImages.value.forEach(group => {
				const coverUrl = getCoverImageUrl(group);
				const image = new Image();
				image.onload = () => {
					loadedImages.value.add(group.id);
				};
				image.onerror = () => {
					console.warn('Failed to load gallery image:', coverUrl);
					loadedImages.value.add(group.id);
				};
				image.src = coverUrl;
				if (image.complete) {
					loadedImages.value.add(group.id);
				}
			});
			
			// 设置超时保护，最多等待5秒
			loadTimeout.value = setTimeout(() => {
				galleryImages.value.forEach(group => {
					if (!loadedImages.value.has(group.id)) {
						console.warn('Gallery image load timeout, showing anyway:', getCoverImageUrl(group));
						loadedImages.value.add(group.id);
					}
				});
			}, 5000);
		};

		const preloadImage = (url) => {
			if (preloadedImages.value.has(url)) {
				return Promise.resolve();
			}
			return new Promise((resolve) => {
				imageLoadingStates.value[url] = true;
				const img = new Image();
				img.onload = () => {
					preloadedImages.value.add(url);
					imageLoadingStates.value[url] = false;
					resolve();
				};
				img.onerror = () => {
					console.warn('Failed to preload image:', url);
					preloadedImages.value.add(url);
					imageLoadingStates.value[url] = false;
					resolve();
				};
				img.src = url;
				if (img.complete) {
					preloadedImages.value.add(url);
					imageLoadingStates.value[url] = false;
					resolve();
				}
			});
		};

		const onModalImageLoad = () => {
			const url = getModalImageUrl();
			imageLoadingStates.value[url] = false;
		};

		const onModalImageError = (event) => {
			const webpUrl = getModalImageUrl();
			const originalUrl = getModalOriginalImageUrl();
			
			// 如果 WebP 加载失败，尝试加载原图
			if (webpUrl !== originalUrl && event.target.src.endsWith('.webp')) {
				console.log('WebP load failed, trying original:', originalUrl);
				imageLoadingStates.value[webpUrl] = false;
				// 强制重新加载原始图片
				event.target.src = originalUrl;
			} else {
				imageLoadingStates.value[originalUrl] = false;
			}
		};

		const preloadAllImages = () => {
			const allUrls = [];
			galleryImages.value.forEach(group => {
				const urls = getImageUrls(group);
				urls.forEach(url => allUrls.push(url));
			});
			
			console.log('Starting to preload', allUrls.length, 'images...');
			
			const concurrency = 3;
			let index = 0;
			
			const loadNext = () => {
				if (index >= allUrls.length) {
					console.log('All images preloaded!');
					return;
				}
				
				const url = allUrls[index++];
				preloadImage(url).then(() => {
					loadNext();
				});
			};
			
			for (let i = 0; i < concurrency; i++) {
				loadNext();
			}
		};

		const preloadGroupImages = (group) => {
			const urls = getImageUrls(group);
			console.log('Preloading group images:', urls.length);
			urls.forEach((url, index) => {
				setTimeout(() => {
					preloadImage(url);
				}, index * 100);
			});
		};

		// 键盘处理
		const keyboardHandler = (event) => {
			if (event.key === 'Escape') {
				if (isModalOpen.value) {
					closeImageModal();
				}
			} else if (event.key === ' ' && isModalOpen.value) {
				event.preventDefault();
				closeImageModal();
			} else if (event.key === 'ArrowLeft' && !isModalOpen.value) {
				rotateLeft();
			} else if (event.key === 'ArrowRight' && !isModalOpen.value) {
				rotateRight();
			} else if (event.key === 'ArrowLeft' && isModalOpen.value) {
				prevModalImage();
			} else if (event.key === 'ArrowRight' && isModalOpen.value) {
				nextModalImage();
			} else if (event.key === ' ' && !isModalOpen.value) {
				event.preventDefault();
				const frontGroup = getFrontGroup();
				if (frontGroup) {
					handleGroupClick(frontGroup);
				}
			}
		};

		// 获取当前最前面的图组
		const getFrontGroup = () => {
			if (galleryImages.value.length === 0) return null;
			
			const quantity = galleryImages.value.length;
			const step = 360 / quantity;
			
			// 计算哪个卡片在最前面
			// 我们需要找到满足 step * i ≈ currentRotation 的 i
			let normalizedRotation = ((currentRotation.value % 360) + 360) % 360;
			
			// 找到最接近的索引
			let frontIndex = Math.round(normalizedRotation / step) % quantity;
			if (frontIndex < 0) frontIndex += quantity;
			
			return galleryImages.value[frontIndex];
		};

		// 向左旋转
		const rotateLeft = () => {
			const quantity = galleryImages.value.length || 1;
			currentRotation.value -= 360 / quantity;
		};

		// 向右旋转
		const rotateRight = () => {
			const quantity = galleryImages.value.length || 1;
			currentRotation.value += 360 / quantity;
		};

		// 开始自动旋转
		const startAutoRotation = () => {
			autoRotateInterval = setInterval(() => {
				if (isAutoRotating.value && !isDragging.value) {
					rotateRight();
				}
			}, 6000);
		};

		// 停止自动旋转
		const stopAutoRotation = () => {
			if (autoRotateInterval) {
				clearInterval(autoRotateInterval);
			}
		};

		// 点击图组卡片 - 直接进入大图模式
		const handleGroupClick = (group) => {
			selectedGroup.value = group;
			selectedImageIndex.value = 0;
			isModalOpen.value = true;
			document.body.style.overflow = 'hidden';
			isAutoRotating.value = false;
			preloadGroupImages(group);
		};

		// 关闭图片查看模态框
		const closeImageModal = () => {
			isModalOpen.value = false;
			setTimeout(() => {
				selectedImageIndex.value = 0;
				document.body.style.overflow = '';
				isAutoRotating.value = true;
			}, 300);
		};

		// 模态框中上一张图片
		const prevModalImage = () => {
			if (!selectedGroup.value) return;
			const urls = getImageUrls(selectedGroup.value);
			if (selectedImageIndex.value > 0) {
				selectedImageIndex.value--;
			} else {
				selectedImageIndex.value = urls.length - 1;
			}
			// 设置加载状态
			const webpUrl = getModalImageUrl();
			const originalUrl = getModalOriginalImageUrl();
			imageLoadingStates.value[webpUrl] = true;
			imageLoadingStates.value[originalUrl] = true;
			// 预加载当前图片
			if (!preloadedImages.value.has(webpUrl)) {
				preloadImage(webpUrl);
			}
		};

		// 模态框中下一张图片
		const nextModalImage = () => {
			if (!selectedGroup.value) return;
			const urls = getImageUrls(selectedGroup.value);
			if (selectedImageIndex.value < urls.length - 1) {
				selectedImageIndex.value++;
			} else {
				selectedImageIndex.value = 0;
			}
			// 设置加载状态
			const webpUrl = getModalImageUrl();
			const originalUrl = getModalOriginalImageUrl();
			imageLoadingStates.value[webpUrl] = true;
			imageLoadingStates.value[originalUrl] = true;
			// 预加载当前图片
			if (!preloadedImages.value.has(webpUrl)) {
				preloadImage(webpUrl);
			}
		};

		// 获取模态框当前显示的图片URL（优先 WebP）
		const getModalImageUrl = () => {
			if (!selectedGroup.value) return '';
			const urls = getImageUrls(selectedGroup.value);
			return convertToWebPUrl(urls[selectedImageIndex.value] || urls[0]);
		};

		// 获取原始图片URL（降级方案）
		const getModalOriginalImageUrl = () => {
			if (!selectedGroup.value) return '';
			const urls = getImageUrls(selectedGroup.value);
			return urls[selectedImageIndex.value] || urls[0];
		};

		// 鼠标事件处理
		const handleMouseDown = (event) => {
			isDragging.value = true;
			isAutoRotating.value = false;
			startX.value = event.clientX;
			currentX.value = event.clientX;
			startRotation.value = currentRotation.value;
			
			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseup', handleMouseUp);
		};

		const handleMouseMove = (event) => {
			if (!isDragging.value) return;
			currentX.value = event.clientX;
			const diff = (currentX.value - startX.value) * 0.3;
			currentRotation.value = startRotation.value + diff;
		};

		const handleMouseUp = () => {
			if (!isDragging.value) return;
			
			const quantity = galleryImages.value.length || 1;
			const step = 360 / quantity;
			const normalizedRotation = ((currentRotation.value % 360) + 360) % 360;
			const nearestStep = Math.round(normalizedRotation / step) * step;
			currentRotation.value = currentRotation.value - (normalizedRotation - nearestStep);
			
			isDragging.value = false;
			isAutoRotating.value = true;
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};

		// 触摸事件处理
		const handleTouchStart = (event) => {
			event.preventDefault();
			isDragging.value = true;
			isAutoRotating.value = false;
			startX.value = event.touches[0].clientX;
			currentX.value = event.touches[0].clientX;
			startRotation.value = currentRotation.value;
			
			document.addEventListener('touchmove', handleTouchMove, { passive: false });
			document.addEventListener('touchend', handleTouchEnd);
		};

		const handleTouchMove = (event) => {
			if (!isDragging.value) return;
			event.preventDefault();
			currentX.value = event.touches[0].clientX;
			const diff = (currentX.value - startX.value) * 0.3;
			currentRotation.value = startRotation.value + diff;
		};

		const handleTouchEnd = () => {
			if (!isDragging.value) return;
			
			const quantity = galleryImages.value.length || 1;
			const step = 360 / quantity;
			const normalizedRotation = ((currentRotation.value % 360) + 360) % 360;
			const nearestStep = Math.round(normalizedRotation / step) * step;
			currentRotation.value = currentRotation.value - (normalizedRotation - nearestStep);
			
			isDragging.value = false;
			isAutoRotating.value = true;
			document.removeEventListener('touchmove', handleTouchMove);
			document.removeEventListener('touchend', handleTouchEnd);
		};

		// 模态框触摸开始
		const handleModalTouchStart = (event) => {
			modalTouchStartX.value = event.touches[0].clientX;
			modalTouchStartY.value = event.touches[0].clientY;
		};

		// 模态框触摸移动
		const handleModalTouchMove = (event) => {
			// 预留用于滑动动画效果
		};

		// 模态框触摸结束
		const handleModalTouchEnd = (event) => {
			const touchEndX = event.changedTouches[0].clientX;
			const touchEndY = event.changedTouches[0].clientY;
			
			const deltaX = touchEndX - modalTouchStartX.value;
			const deltaY = touchEndY - modalTouchStartY.value;
			
			// 判断是水平滑动还是垂直滑动
			if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
				// 水平滑动
				if (deltaX > 0) {
					// 向右滑动 - 上一张
					prevModalImage();
				} else {
					// 向左滑动 - 下一张
					nextModalImage();
				}
			}
		};

		// 加载数据
		const loadData = async () => {
			galleryImages.value = await apiService.getGallery();
			console.log('Gallery.vue - Loaded gallery groups:', galleryImages.value);
			checkAllImagesLoaded();
			setTimeout(() => {
				preloadAllImages();
			}, 1000);
		};

		onMounted(() => {
			checkMobile();
			loadData();
			document.addEventListener('keydown', keyboardHandler);
			startAutoRotation();
			
			// 鼠标/触摸事件（桌面端）
			nextTick(() => {
				if (wrapper.value) {
					wrapper.value.addEventListener('mousedown', handleMouseDown);
					wrapper.value.addEventListener('touchstart', handleTouchStart, { passive: false });
				}
			});
			
			// 窗口大小变化监听
			window.addEventListener('resize', checkMobile);
		});

		onBeforeUnmount(() => {
			if (loadTimeout.value) {
				clearTimeout(loadTimeout.value);
			}
			stopAutoRotation();
			document.removeEventListener('keydown', keyboardHandler);
			window.removeEventListener('resize', checkMobile);
			
			if (wrapper.value) {
				wrapper.value.removeEventListener('mousedown', handleMouseDown);
				wrapper.value.removeEventListener('touchstart', handleTouchStart);
			}
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
			document.removeEventListener('touchmove', handleTouchMove);
			document.removeEventListener('touchend', handleTouchEnd);
		});

		return {
			t,
			galleryImages,
			selectedGroup,
			selectedImageIndex,
			isModalOpen,
			loadedImages,
			preloadedImages,
			imageLoadingStates,
			currentRotation,
			isDragging,
			startX,
			currentX,
			startRotation,
			isAutoRotating,
			isMobile,
			modalTouchStartX,
			modalTouchStartY,
			wrapper,
			displayPageDescription,
			cardStyles,
			innerStyle,
			pageDescription,
			pageDescriptionMobile,
			noImagesText,
			checkMobile,
			getImageUrls,
			getCoverImageUrl,
			getImageCount,
			isGroupImageLoaded,
			isUrlLoading,
			checkAllImagesLoaded,
			preloadImage,
			onModalImageLoad,
			onModalImageError,
			preloadAllImages,
			preloadGroupImages,
			keyboardHandler,
			getFrontGroup,
			rotateLeft,
			rotateRight,
			startAutoRotation,
			stopAutoRotation,
			handleGroupClick,
			closeImageModal,
			prevModalImage,
			nextModalImage,
			getModalImageUrl,
			getModalOriginalImageUrl,
			handleMouseDown,
			handleMouseMove,
			handleMouseUp,
			handleTouchStart,
			handleTouchMove,
			handleTouchEnd,
			handleModalTouchStart,
			handleModalTouchMove,
			handleModalTouchEnd,
			loadData
		};
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
					{{ t(displayPageDescription) }}
				</p>
			</div>

			<!-- 桌面端：3D 旋转布局 -->
			<template v-if="galleryImages.length > 0">
				<div v-if="!isMobile" class="gallery-container">
					<!-- 左翻页按钮 -->
					<button 
						class="gallery-nav-btn gallery-nav-btn-left"
						@click="rotateLeft"
						@mouseenter="isAutoRotating = false"
						@mouseleave="isAutoRotating = true"
					>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
						</svg>
					</button>
					
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
									<div v-if="!isGroupImageLoaded(group)" class="gallery-image-skeleton">
										<SkeletonLoader width="100%" height="100%" rounded="lg" />
									</div>
									<img
										:src="getCoverImageUrl(group)"
										:class="['img', isGroupImageLoaded(group) ? 'image-visible' : 'image-hidden']"
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
					
					<!-- 右翻页按钮 -->
					<button 
						class="gallery-nav-btn gallery-nav-btn-right"
						@click="rotateRight"
						@mouseenter="isAutoRotating = false"
						@mouseleave="isAutoRotating = true"
					>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
						</svg>
					</button>
				</div>

				<!-- 移动端：平面网格布局 -->
				<div v-else class="gallery-container-mobile">
					<div class="gallery-grid">
						<div
							v-for="group in galleryImages"
							:key="group.id"
							class="gallery-card-mobile"
							@click="handleGroupClick(group)"
						>
							<div class="img-wrapper-mobile">
								<div class="img-container-mobile">
									<div v-if="!isGroupImageLoaded(group)" class="gallery-image-skeleton-mobile">
										<SkeletonLoader width="100%" height="100%" rounded="lg" />
									</div>
									<img
										:src="getCoverImageUrl(group)"
										:class="['img-mobile', isGroupImageLoaded(group) ? 'image-visible' : 'image-hidden']"
										:alt="t(group.title)"
									/>
									<div class="image-count-badge-mobile">
										{{ getImageCount(group) }} 张
									</div>
								</div>
							</div>
							<div class="card-content-mobile">
								<p class="card-title-mobile">{{ t(group.title) }}</p>
							</div>
						</div>
					</div>
				</div>
			</template>

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
					<div 
						class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden max-w-5xl"
						@touchstart="handleModalTouchStart"
						@touchmove="handleModalTouchMove"
						@touchend="handleModalTouchEnd"
					>
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
							
							<div class="relative w-full h-auto max-h-[75vh] flex items-center justify-center">
								<!-- 加载骨架屏 -->
								<div v-if="isUrlLoading(getModalImageUrl())" class="absolute inset-0 flex items-center justify-center">
									<SkeletonLoader width="100%" height="100%" rounded="lg" />
								</div>
								<!-- 图片（优先 WebP） -->
								<img 
									:key="selectedImageIndex"
									:src="getModalImageUrl()" 
									:alt="t(selectedGroup.title)"
									:class="['w-full h-auto max-h-[75vh] object-contain modal-image transition-opacity duration-300', isUrlLoading(getModalImageUrl()) ? 'opacity-0' : 'opacity-100']"
									@click.stop
									@load="onModalImageLoad"
									@error="onModalImageError"
								/>
							</div>
							
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
	height: calc(100vh - 350px);
	margin-top: -6%;
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0px 60px;
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
	--w: 600px;
	--translateZ: 1000px;
	--rotateX: -15deg;
	--perspective: 1000px;
	position: absolute;
	width: var(--w);
	top: -46px;
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
	width: 96%;
	height: auto;
	top: 0;
	left: 0;
	transform: rotateY(calc((360deg / var(--quantity)) * var(--index)))
		translateZ(var(--translateZ))
		scale(0.37);
	background: linear-gradient(135deg, 
		rgba(100, 255, 218, 0.05) 0%, 
		rgba(100, 255, 218, 0.02) 100%);
	cursor: pointer;
	transition: all 0.3s ease;
	backface-visibility: visible;
	/* transform-origin: center center; */
}

.card:hover {
	transform: rotateY(calc((360deg / var(--quantity)) * var(--index)))
		translateZ(calc(var(--translateZ) + 30px))
		scale(0.4);
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
	padding: 60px 16px 40px 16px;
	background: linear-gradient(
		to top,
		rgba(0, 0, 0, 0.98) 0%,
		rgba(0, 0, 0, 0.75) 40%,
		rgba(0, 0, 0, 0.5) 60%,
		rgba(0, 0, 0, 0.25) 80%,
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
	top: 24px;
	right: 24px;
	width: 88px;
	background: rgba(0,0,0, 0.15);
	color: white;
	padding: 4px 4px;
	border-radius: 20px;
	font-size: 22px;
	font-weight: 700;
	backdrop-filter: blur(8px);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.0);
	z-index: 10;
	text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.card-title {
	font-size: 24px;
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

/* 左右翻页按钮 */
.gallery-nav-btn {
	position: absolute;
	top: calc(35% + 100px);
	transform: translateY(-50%);
	z-index: 10;
	width: 55px;
	height: 55px;
	background: transparent;
	border: none;
	box-shadow: none;
	color: #6b7280;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.2s ease;
	padding: 0;
}

.dark .gallery-nav-btn {
	color: #9ca3af;
}

.gallery-nav-btn:hover {
	transform: translateY(-50%) scale(1.2);
	color: #0891b2;
}

.dark .gallery-nav-btn:hover {
	color: #22d3ee;
}

.gallery-nav-btn:active {
	transform: translateY(-50%) scale(0.9);
}

.gallery-nav-btn-left {
	left: 6px;
}

.gallery-nav-btn-right {
	right: 6px;
}

.modal-overlay {
	backdrop-filter: blur(8px);
}

@media (min-width: 400px) {
	.inner {
		--w: 580px;
		--translateZ: 360px;
	}
}

/* 响应式断点：中等大屏 */
@media (min-width: 1400px) {
	.inner {
		--w: 650px;
		--translateZ: 420px;
	}
}

/* 响应式断点：大屏 (1680px+) */
@media (min-width: 1680px) {
	.inner {
		--w: 680px;
		--translateZ: 440px;
	}
}

/* 响应式断点：全高清 (1920px+) */
@media (min-width: 1920px) {
	.inner {
		--w: 760px;
		--translateZ: 480px;
	}
}

/* 响应式断点：2K/4K屏 (2560px+) */
@media (min-width: 2560px) {
	.inner {
		--w: 790px;
		--translateZ: 520px;
	}
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
			transition: all 0.3s ease-in-out;
		}

img {
	transition: opacity 0.3s ease-in-out;
}

img.loading {
	opacity: 0.5;
}

/* 移动端网格布局 */
.gallery-container-mobile {
	padding: 20px 0;
}

.gallery-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 16px;
	padding: 0 16px;
}

.gallery-card-mobile {
	background: #ffffff;
	border-radius: 16px;
	overflow: hidden;
	cursor: pointer;
	transition: all 0.3s ease;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	display: flex;
	flex-direction: column;
}

.dark .gallery-card-mobile {
	background: #1f2937;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.gallery-card-mobile:active {
	transform: scale(0.97);
}

.img-wrapper-mobile {
	width: 100%;
	flex-shrink: 0;
}

.img-container-mobile {
	width: 100%;
	aspect-ratio: 4 / 3;
	overflow: hidden;
	position: relative;
	background: linear-gradient(135deg, 
		rgba(100, 255, 218, 0.05) 0%, 
		rgba(100, 255, 218, 0.02) 100%);
}

.gallery-image-skeleton-mobile {
	width: 100%;
	height: 100%;
}

.img-mobile {
	width: 100%;
	height: 100%;
	display: block;
	object-fit: cover;
}

.image-count-badge-mobile {
	position: absolute;
	top: 8px;
	right: 8px;
	background: rgba(0,0,0, 0.6);
	color: white;
	padding: 4px 10px;
	border-radius: 20px;
	font-size: 11px;
	font-weight: 700;
	backdrop-filter: blur(8px);
	text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	z-index: 10;
}

.card-content-mobile {
	padding: 12px;
	background: #ffffff;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	min-height: 44px;
}

.dark .card-content-mobile {
	background: #1f2937;
}

.card-title-mobile {
	font-size: 13px;
	font-weight: 600;
	color: #1f2937;
	text-align: center;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	width: 100%;
	line-height: 1.4;
}

.dark .card-title-mobile {
	color: #f3f4f6;
}

/* 模态框移动端优化 */
@media (max-width: 768px) {
	.modal-content {
		width: 100%;
		max-width: 100%;
	}
	
	.modal-content .max-w-5xl {
		max-width: 100%;
	}
	
	/* 移动端模态框按钮隐藏左右箭头 */
	@media (max-width: 640px) {
		button[class*="absolute"] {
			/* 在移动端保留按钮更小一些 */
		}
		
		.modal-content .absolute.left-3,
		.modal-content .absolute.right-3 {
			transform: translateY(-50%) scale(0.9);
		}
	}
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
	
	/* 移动端网格布局调整 */
	.gallery-grid {
		grid-template-columns: repeat(2, 1fr);
		gap: 12px;
		padding: 0 12px;
	}
}

/* 小屏幕手机 */
@media (max-width: 400px) {
	.gallery-grid {
		grid-template-columns: 1fr;
	}
}
</style>
