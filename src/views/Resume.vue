<script>
import { apiService } from '@/services/apiService';
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue';

export default {
	name: 'Resume',
	components: { SkeletonLoader },
	data() {
		return {
			config: null,
			resumes: [],
			selectedResume: null,
			isLoading: true,
			isIframeLoaded: false
		};
	},
	async mounted() {
		this.config = await apiService.getConfig();
		const resumeData = await apiService.getResumes();
		this.resumes = resumeData.configs || [];
		
		if (this.config?.extraSections?.resume?.selectedResumeId) {
			this.selectedResume = this.resumes.find(r => r.id === this.config.extraSections.resume.selectedResumeId);
		} else {
			this.selectedResume = this.resumes.find(r => r.isCurrent) || this.resumes[0];
		}
		this.isLoading = false;
		
		// 设置超时保护，5秒后自动显示 iframe
		setTimeout(() => {
			if (!this.isIframeLoaded) {
				this.isIframeLoaded = true;
			}
		}, 5000);
	},
	methods: {
		onIframeLoad() {
			this.isIframeLoaded = true;
		}
	}
};
</script>

<template>
	<div class="resume-page">
		<div class="container mx-auto py-12 px-4">
			<div v-if="isLoading" class="text-center mb-12">
				<h1 class="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
					Resume
				</h1>
				<div class="max-w-5xl mx-auto">
					<div class="bg-secondary-light dark:bg-ternary-dark rounded-xl shadow-lg p-6">
						<div class="resume-preview-container">
							<SkeletonLoader width="100%" height="85vh" rounded="lg" />
						</div>
					</div>
				</div>
			</div>

			<div v-else class="text-center mb-12">
				<h1 class="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
					Resume
				</h1>
			</div>

			<div v-if="!isLoading && selectedResume" class="max-w-5xl mx-auto">
				<div class="bg-secondary-light dark:bg-ternary-dark rounded-xl shadow-lg p-6">
					<div class="resume-preview-container">
						<div v-if="selectedResume.fileName.toLowerCase().endsWith('.pdf') && !isIframeLoaded" class="pdf-skeleton">
							<SkeletonLoader width="100%" height="85vh" rounded="lg" />
							<div class="pdf-loading-indicator">
								<div class="loading-spinner"></div>
								<p class="mt-4 text-gray-600 dark:text-gray-400">Loading resume...</p>
							</div>
						</div>
						<iframe
							v-if="selectedResume.fileName.toLowerCase().endsWith('.pdf')"
							:src="`/files/cv/${selectedResume.fileName}`"
							:class="[
								'w-full h-[85vh] rounded-lg border border-gray-200 dark:border-gray-700',
								isIframeLoaded ? 'pdf-loaded' : 'pdf-hidden'
							]"
							@load="onIframeLoad"
							@error="onIframeLoad"
						></iframe>
						<div v-else class="text-center py-12">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
							<p class="text-gray-600 dark:text-gray-400 mb-4">
								This file type cannot be previewed directly
							</p>
							<a
								:href="`/files/cv/${selectedResume.fileName}`"
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl"
							>
								<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
								</svg>
								Download Resume
							</a>
						</div>
					</div>

					<div class="mt-6 text-center">
						<a
							:href="`/files/cv/${selectedResume.fileName}`"
							download
							class="inline-flex items-center px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
						>
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
							</svg>
							Download File
						</a>
					</div>
				</div>
			</div>

			<div v-else-if="resumes.length === 0" class="text-center py-20">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
				<p class="text-gray-500 dark:text-gray-400 text-lg">
					No resume uploaded yet.
				</p>
			</div>

			<div v-else class="text-center py-20">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
				</svg>
				<p class="text-gray-500 dark:text-gray-400 text-lg">
					Please select a resume in admin settings.
				</p>
			</div>
		</div>
	</div>
</template>

<style scoped>
.resume-page {
	min-height: calc(100vh - 200px);
}

.resume-preview-container {
	position: relative;
}

.pdf-skeleton {
	position: relative;
}

.pdf-loading-indicator {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	display: flex;
	flex-direction: column;
	align-items: center;
}

.loading-spinner {
	width: 50px;
	height: 50px;
	border: 4px solid rgba(156, 163, 175, 0.2);
	border-top-color: #06b6d4;
	border-radius: 50%;
	animation: spin 1s linear infinite;
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

.pdf-hidden {
	opacity: 0;
	position: absolute;
	top: 0;
	left: 0;
}

.pdf-loaded {
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

.resume-preview-container iframe {
	background-color: white;
}
</style>
