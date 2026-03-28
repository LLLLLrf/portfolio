<script>
import feather from 'feather-icons';

export default {
	props: ['projectInfo'],

	mounted() {
		feather.replace();
	},
	updated() {
		feather.replace();
	},
	methods: {
		parseBoldText(text) {
			if (!text) return '';
			return text.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 800; color: #06b6d4;" class="md-bold-text">$1</strong>');
		}
	}
};
</script>

<template>
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10 mt-12 md:mt-16 items-start">
		
		<div class="lg:col-span-1 w-full space-y-6">
			
			<div v-if="projectInfo.codeRepos" class="p-6 md:p-7 bg-white dark:bg-ternary-dark border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 detail-card detail-card-info">
				<p class="font-general-semibold text-lg md:text-xl text-secondary-dark dark:text-secondary-light mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
					{{ projectInfo.codeReposHeading }}
				</p>
				<ul class="space-y-3">
					<li
						v-for="repo in projectInfo.codeRepos"
						:key="repo.id"
						class="flex flex-col font-general-regular text-ternary-dark dark:text-ternary-light"
					>
						<a
							:href="repo.link"
							target="_blank"
							rel="noopener noreferrer"
							class="hover:underline cursor-pointer text-blue-600 dark:text-blue-400 break-all inline-flex items-center gap-2"
							aria-label="Code Repository"
						>
							<i data-feather="github" class="w-4 h-4"></i>
							<span>{{ repo.title }}</span>
						</a>
					</li>
				</ul>
			</div>

			<div v-if="projectInfo.objectivesDetails" class="p-6 md:p-7 bg-white dark:bg-ternary-dark border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 text-left detail-card detail-card-info">
				<p class="font-general-semibold text-lg md:text-xl text-ternary-dark dark:text-ternary-light mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
					{{ projectInfo.objectivesHeading }}
				</p>
				<p class="font-general-regular text-gray-600 dark:text-gray-300 leading-relaxed text-base whitespace-pre-line" v-html="parseBoldText(projectInfo.objectivesDetails)">
				</p>
			</div>

			<div v-if="projectInfo.technologies" class="p-6 md:p-7 bg-white dark:bg-ternary-dark border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 detail-card detail-card-tech">
				<p class="font-general-semibold text-lg md:text-xl text-ternary-dark dark:text-ternary-light mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
					{{ projectInfo.technologies[0].title }}
				</p>
				<div class="flex flex-wrap gap-2">
					<span
						v-for="(tech, index) in projectInfo.technologies[0].techs"
						:key="index"
						class="px-3 py-1.5 md:px-4 md:py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-medium text-ternary-dark dark:text-ternary-light hover:bg-accent-cyan hover:text-white dark:hover:bg-accent-cyan transition-colors duration-300 cursor-default"
					>
						{{ tech }}
					</span>
				</div>
			</div>

			<div v-if="projectInfo.socialSharings && projectInfo.socialSharings.length > 0" class="p-6 md:p-7 bg-white dark:bg-ternary-dark border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 detail-card detail-card-info">
				<p class="font-general-semibold text-lg md:text-xl text-ternary-dark dark:text-ternary-light mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
					{{ projectInfo.socialSharingsHeading }}
				</p>
				<div class="flex flex-wrap items-center gap-3">
					<a
						v-for="social in projectInfo.socialSharings"
						:key="social.id"
						:href="social.url"
						target="_blank"
						aria-label="Share Project"
						class="bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 p-3 rounded-xl shadow-sm duration-300 hover:shadow-md transition-all"
					>
						<i :data-feather="social.icon" class="w-5 h-5"></i>
					</a>
				</div>
			</div>
		</div>

		<div class="lg:col-span-2 w-full text-left space-y-8">
			<div v-if="projectInfo.projectDetails" class="p-6 md:p-8 lg:p-10 bg-white dark:bg-ternary-dark border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm detail-card detail-card-content">
				<h2 class="font-general-bold text-primary-dark dark:text-primary-light text-2xl md:text-3xl mb-6 md:mb-8">
					{{ projectInfo.projectDetailsHeading }}
				</h2>
				
				<div class="space-y-6 md:space-y-8">
					<p
						v-for="projectDetail in projectInfo.projectDetails"
						:key="projectDetail.id"
						class="font-general-regular text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line"
						v-html="parseBoldText(projectDetail.details)"
					></p>
				</div>
			</div>

			<div v-if="projectInfo.challengeDetails" class="p-6 md:p-8 lg:p-10 bg-white dark:bg-ternary-dark border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm detail-card detail-card-content">
				<h2 class="font-general-bold text-primary-dark dark:text-primary-light text-2xl md:text-3xl mb-6 md:mb-8">
					{{ projectInfo.challengeHeading }}
				</h2>
				<p class="font-general-regular text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line" v-html="parseBoldText(projectInfo.challengeDetails)">
				</p>
			</div>
		</div>

	</div>
</template>

<style scoped>
/* Ensure strong tags get proper styling */
:deep(.md-bold-text) {
	font-weight: 800 !important;
	color: #0891b2 !important;
}

.dark :deep(.md-bold-text) {
	color: #06b6d4 !important;
}
</style>

<style>
/* Global style for dark mode - ensure neon color */
.dark .md-bold-text {
	color: #06b6d4 !important;
}
</style>
