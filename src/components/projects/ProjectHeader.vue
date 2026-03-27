<script>
export default {
	props: ['singleProjectHeader'],
};
</script>

<template>
	<div class="mb-8">
		<div class="p-6 sm:p-8 bg-secondary-light dark:bg-ternary-dark rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 detail-card detail-card-header relative">
			<!-- 装饰元素 -->
			<div class="corner-tl"></div>
			<div class="corner-br"></div>
			<div class="bottom-line"></div>
			
			<p class="font-general-medium text-left text-2xl sm:text-3xl md:text-4xl font-bold text-primary-dark dark:text-primary-light mb-4 sm:mb-6">
				{{ singleProjectHeader.singleProjectTitle }}
			</p>
			<div class="flex flex-wrap gap-4 sm:gap-6">
				<div class="flex items-center group">
					<div class="w-10 h-10 bg-primary-light dark:bg-secondary-dark rounded-full flex items-center justify-center mr-3 transition-all duration-300 group-hover:bg-accent-cyan">
						<i data-feather="clock" class="w-5 h-5 text-primary-dark dark:text-primary-light transition-colors duration-300 group-hover:text-white"></i>
					</div>
					<span class="font-general-medium leading-none text-ternary-dark dark:text-ternary-light transition-colors duration-300 group-hover:text-accent-cyan">
						{{ singleProjectHeader.singleProjectDate }}
					</span>
				</div>
				<div class="flex items-center group">
					<div class="w-10 h-10 bg-primary-light dark:bg-secondary-dark rounded-full flex items-center justify-center mr-3 transition-all duration-300 group-hover:bg-accent-purple">
						<i data-feather="tag" class="w-5 h-5 text-primary-dark dark:text-primary-light transition-colors duration-300 group-hover:text-white"></i>
					</div>
					<span class="font-general-medium leading-none text-ternary-dark dark:text-ternary-light transition-colors duration-300 group-hover:text-accent-purple">
						{{ singleProjectHeader.singleProjectTag }}
					</span>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
/* Light mode - no dark shadow */
@media (prefers-color-scheme: light) {
	:deep(.detail-card-header) {
		box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1) !important;
	}
	
	:deep(.detail-card-header:hover) {
		box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) !important;
	}
}
</style>
