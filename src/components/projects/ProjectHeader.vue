<script>
export default {
	props: ['singleProjectHeader'],
};
</script>

<template>
	<div class="mb-8">
		<!-- Project heading and meta info -->
		<div class="p-6 sm:p-8 bg-secondary-light dark:bg-ternary-dark rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
			<p
				class="font-general-medium text-left text-2xl sm:text-3xl md:text-4xl font-bold text-primary-dark dark:text-primary-light mb-4 sm:mb-6 animate-fade-in"
			>
				{{ singleProjectHeader.singleProjectTitle }}
			</p>
			<div class="flex flex-wrap gap-4 sm:gap-6">
				<div class="flex items-center group">
					<div class="w-10 h-10 bg-primary-light dark:bg-secondary-dark rounded-full flex items-center justify-center mr-3 transition-all duration-300 group-hover:bg-blue-500 group-hover:scale-110">
						<i
							data-feather="clock"
							class="w-5 h-5 text-primary-dark dark:text-primary-light transition-colors duration-300 group-hover:text-white"
						></i>
					</div>
					<span
						class="font-general-medium leading-none text-ternary-dark dark:text-ternary-light transition-colors duration-300 group-hover:text-blue-500"
						>{{ singleProjectHeader.singleProjectDate }}</span
					>
				</div>
				<div class="flex items-center group">
					<div class="w-10 h-10 bg-primary-light dark:bg-secondary-dark rounded-full flex items-center justify-center mr-3 transition-all duration-300 group-hover:bg-blue-500 group-hover:scale-110">
						<i
							data-feather="tag"
							class="w-5 h-5 text-primary-dark dark:text-primary-light transition-colors duration-300 group-hover:text-white"
						></i>
					</div>
					<span
						class="font-general-medium leading-none text-ternary-dark dark:text-ternary-light transition-colors duration-300 group-hover:text-blue-500"
						>{{ singleProjectHeader.singleProjectTag }}</span
					>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
/* Fade in animation */
@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.animate-fade-in {
	animation: fadeIn 0.6s ease-out forwards;
}
</style>
