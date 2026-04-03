<script>
import { useLanguage } from '../../composables/useLanguage';
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue';

export default {
	components: { SkeletonLoader },
	props: ['project'],
	setup() {
		const { t } = useLanguage();
		return { t };
	},
	data() {
		return {
			isImageLoaded: false
		};
	},
	mounted() {
		// 先尝试检查图片是否已经在缓存中
		this.checkImageLoaded();
		
		// 设置超时保护，最多等待5秒
		this.loadTimeout = setTimeout(() => {
			if (!this.isImageLoaded) {
				console.warn('Image load timeout, showing image anyway:', this.project.thumbnail);
				this.isImageLoaded = true;
				sessionStorage.setItem(`project_image_${this.project.id}`, 'true');
			}
		}, 5000);
	},
	beforeUnmount() {
		// 组件卸载时清除定时器
		if (this.loadTimeout) {
			clearTimeout(this.loadTimeout);
		}
	},
	methods: {
		formatDate(dateString) {
			if (!dateString) return '';
			const date = new Date(dateString);
			return date.toLocaleDateString('zh-CN', {
				year: 'numeric',
				month: 'short'
			});
		},
		checkImageLoaded() {
			const img = new Image();
			
			// 设置加载成功和失败的回调
			img.onload = () => {
				this.isImageLoaded = true;
				sessionStorage.setItem(`project_image_${this.project.id}`, 'true');
			};
			
			img.onerror = () => {
				console.warn('Failed to load image:', this.project.thumbnail);
				this.isImageLoaded = true;
				sessionStorage.setItem(`project_image_${this.project.id}`, 'true');
			};
			
			// 开始加载图片
			img.src = this.project.thumbnail;
			
			// 如果图片已经在缓存中，直接设置为已加载
			if (img.complete) {
				this.isImageLoaded = true;
				sessionStorage.setItem(`project_image_${this.project.id}`, 'true');
			}
		},
		onImageLoad() {
			this.isImageLoaded = true;
			sessionStorage.setItem(`project_image_${this.project.id}`, 'true');
		},
		onImageError() {
			this.isImageLoaded = true;
			sessionStorage.setItem(`project_image_${this.project.id}`, 'true');
		}
	}
};
</script>

<template>
	<router-link
		:to="`/projects/${project.id}`"
		class="group relative overflow-hidden rounded-xl bg-secondary-light dark:bg-secondary-dark shadow-lg hover:shadow-neon-cyan dark:hover:shadow-neon-cyan transition-all duration-500 cursor-pointer mb-10 sm:mb-0 project-card sci-fi-gradient-border-advanced"
		aria-label="Single Project"
	>
		<!-- Date badge - top left - Apple style glass capsule -->
		<div class="absolute top-4 left-4 z-20">
			<div class="date-badge-glass text-xs font-general-bold px-4 py-1.5 rounded-full">
				{{ formatDate(project.date) }}
			</div>
		</div>
		
		<!-- Thumbnail overlay -->
		<div class="relative overflow-hidden h-64">
			<!-- Skeleton Loader -->
			<SkeletonLoader 
				v-if="!isImageLoaded" 
				width="100%" 
				height="100%" 
				rounded="none"
			/>
			
			<!-- Image -->
			<img
				v-show="isImageLoaded"
				:src="project.thumbnail"
				:alt="t(project.title)"
				@load="onImageLoad"
				@error="onImageError"
				class="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 dark:group-hover:brightness-75 fade-in"
			/>
			<div class="absolute inset-0 bg-black/40 opacity-0 dark:group-hover:opacity-100 transition-opacity duration-500"></div>
		</div>
		
		<!-- Content - name first, then category -->
		<div class="p-5 bg-secondary-light dark:bg-secondary-dark">
			<!-- Title first - with gradient on hover -->
			<h3 class="font-general-bold text-xl text-ternary-dark dark:text-gray-100 mb-2 transition-all duration-300 group-hover:tracking-wider">
				<span class="project-title-gradient">
					{{ t(project.title) }}
				</span>
			</h3>
			
			<!-- Category below -->
			<div>
				<span class="text-sm text-gray-500 dark:text-gray-400 font-general-medium tracking-wide uppercase group-hover:text-accent-cyan dark:group-hover:text-accent-neon transition-colors duration-300">
					{{ t(project.category) }}
				</span>
			</div>
			
			<!-- Decorative line -->
			<div class="mt-3 h-px w-0 group-hover:w-full bg-gradient-to-r from-accent-cyan via-accent-purple to-accent-cyan transition-all duration-500 ease-out"></div>
		</div>
	</router-link>
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

.project-title-gradient {
	display: inline-block;
	transition: all 0.3s ease;
}

.group:hover .project-title-gradient {
	background: linear-gradient(90deg, #06b6d4, #8b5cf6, #ec4899, #06b6d4);
	background-size: 300% 300%;
	-webkit-background-clip: text;
	background-clip: text;
	-webkit-text-fill-color: transparent;
	animation: sciFiGradient 2s ease infinite;
}

@keyframes sciFiGradient {
	0% {
		background-position: 0% 50%;
	}
	50% {
		background-position: 100% 50%;
	}
	100% {
		background-position: 0% 50%;
	}
}

@media (prefers-color-scheme: light) {
	.group:hover .project-title-gradient {
		background: linear-gradient(90deg, #0891b2, #7c3aed, #db2777, #0891b2);
		background-size: 300% 300%;
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
		animation: sciFiGradient 2s ease infinite;
	}
}
</style>
