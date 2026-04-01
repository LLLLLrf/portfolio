<script>
import feather from 'feather-icons';
import ProjectSingle from './ProjectSingle.vue';
import { apiService } from '../../services/apiService';
import { useLanguage } from '../../composables/useLanguage';

export default {
	components: { ProjectSingle },
	setup() {
		const { t } = useLanguage();
		return { t };
	},
	data() {
		return {
			projects: [],
			projectsHeading: 'Projects Portfolio',
			searchProject: '',
			sortOrder: 'default',
		};
	},
	computed: {
		filteredProjects() {
			let filtered = this.projects;
			
			if (this.searchProject) {
				const searchRegExp = new RegExp(this.searchProject, 'i');
				filtered = filtered.filter((el) => {
					const title = this.t(el.title);
					return title.match(searchRegExp);
				});
			}
			
			if (this.sortOrder === 'newest') {
				filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
			} else if (this.sortOrder === 'oldest') {
				filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
			} else if (this.sortOrder === 'default') {
				filtered.sort((a, b) => a.id - b.id);
			}
			
			return filtered;
		},
	},
	methods: {
		async loadProjects() {
			this.projects = await apiService.getProjects();
		},
	},
	mounted() {
		// 直接从apiService加载数据，不从localStorage读取
		this.loadProjects();
		feather.replace();
	},
};
</script>

<template>
	<section class="pt-10 sm:pt-14">
		<div class="text-center">
			<p class="font-general-bold text-2xl sm:text-5xl font-bold mb-2 sci-fi-gradient-text">
				{{ projectsHeading }}
			</p>
			<div class="h-px w-32 mx-auto mt-4 bg-gradient-to-r from-transparent via-accent-cyan to-transparent"></div>
		</div>

		<div class="mt-10 sm:mt-10">
			<h3 class="font-general-regular text-center text-secondary-dark dark:text-gray-400 text-md sm:text-xl font-normal mb-4">
				Search projects by title or sort by date
			</h3>
			<div class="flex justify-between border-b border-gray-200 dark:border-gray-800 pb-3 gap-2">
				<div class="flex justify-between gap-2">
					<span class="hidden sm:block bg-secondary-light dark:bg-secondary-dark p-2.5 shadow-sm rounded-xl cursor-pointer border border-gray-200 dark:border-gray-700">
						<i data-feather="search" class="text-gray-500 dark:text-gray-400"></i>
					</span>
					<input
						v-model="searchProject"
						class="font-general-medium pl-3 pr-1 sm:px-4 py-2 border-1 border-gray-200 dark:border-gray-700 rounded-lg text-sm sm:text-md bg-secondary-light dark:bg-secondary-dark text-primary-dark dark:text-gray-200 focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/30 transition-all"
						id="name"
						name="name"
						type="search"
						required=""
						placeholder="Search Projects"
						aria-label="Name"
					/>
				</div>
				<select
					v-model="sortOrder"
					class="font-general-medium px-5 py-2.5 border-1 border-gray-200 dark:border-gray-700 rounded-lg text-sm sm:text-md bg-secondary-light dark:bg-secondary-dark text-primary-dark dark:text-gray-200 shadow-sm hover:border-accent-cyan dark:hover:border-accent-cyan transition-all cursor-pointer focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/30 !pr-10 text-center"
				>
					<option value="default">默认排序</option>
					<option value="newest">由新到旧</option>
					<option value="oldest">由旧到新</option>
				</select>
			</div>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-6 sm:gap-10">
			<ProjectSingle
				v-for="project in filteredProjects"
				:key="project.id"
				:project="project"
			/>
		</div>
	</section>
</template>

<style scoped>
/* Ensure search and select focus effects persist */
input:focus,
select:focus {
	border-color: #22d3ee !important;
	box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.15) !important;
	outline: none !important;
}

.dark input:focus,
.dark select:focus {
	border-color: #22d3ee !important;
	box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.2) !important;
	outline: none !important;
}
</style>
