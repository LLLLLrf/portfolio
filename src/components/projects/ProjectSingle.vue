<script>
import { useLanguage } from '../../composables/useLanguage';

export default {
	props: ['project'],
	setup() {
		const { t } = useLanguage();
		return { t };
	},
};
</script>

<template>
	<router-link
		:to="`/projects/${project.id}`"
		class="rounded-xl shadow-lg hover:shadow-xl cursor-pointer mb-10 sm:mb-0 bg-secondary-light dark:bg-ternary-dark"
		aria-label="Single Project"
	>
		<div class="relative h-64 sm:h-72 overflow-hidden">
			<img
				:src="project.thumbnail"
				:alt="t(project.title)"
				class="w-full h-full object-cover rounded-t-xl border-none"
			/>
		</div>
		<div class="text-center px-4 py-6">
			<p
				class="font-general-semibold text-xl text-ternary-dark dark:text-ternary-light font-semibold mb-2"
			>
				{{ t(project.title) }}
			</p>
			<span
				class="font-general-medium text-sm text-gray-600 dark:text-gray-400"
				>{{ t(project.category) }}</span
			>
		</div>
	</router-link>
</template>

<style lang="scss" scoped></style>
