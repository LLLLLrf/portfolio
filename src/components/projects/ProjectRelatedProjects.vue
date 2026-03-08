<script>
export default {
	props: ['relatedProject'],
};
</script>

<template>
	<div
		class="mt-10 pt-10 sm:pt-14 sm:mt-20 border-t-2 border-primary-light dark:border-secondary-dark"
	>
		<p
			class="font-general-regular text-primary-dark dark:text-primary-light text-2xl sm:text-3xl font-bold mb-8 sm:mb-10 text-left animate-fade-in"
		>
			{{ relatedProject.relatedProjectsHeading }}
		</p>

		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
			<router-link 
				v-for="item in relatedProject.relatedProjects" 
				:key="item.id"
				:to="`/projects/${item.id}`"
				class="group relative overflow-hidden rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
			>
				<img
					:src="item.img"
					class="w-full h-48 sm:h-56 object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
					:alt="item.title"
					loading="lazy"
				/>
				<div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
					<div class="p-4 w-full">
						<p class="font-general-medium text-white text-sm sm:text-base">{{ item.title }}</p>
					</div>
				</div>
			</router-link>
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
