<script>
import { useLanguage } from '../../composables/useLanguage';

export default {
	props: ['project'],
	setup() {
		const { t } = useLanguage();
		return { t };
	},
	methods: {
		formatDate(dateString) {
			if (!dateString) return '';
			const date = new Date(dateString);
			return date.toLocaleDateString('zh-CN', {
				year: 'numeric',
				month: 'short'
			});
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
			<img
				:src="project.thumbnail"
				:alt="t(project.title)"
				class="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 dark:group-hover:brightness-75"
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
