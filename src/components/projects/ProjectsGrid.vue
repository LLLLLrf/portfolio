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
			sortOrder: 'default', // default, newest, oldest
		};
	},
	computed: {
		// Get the filtered and sorted projects
		filteredProjects() {
			let filtered = this.projects;
			
			if (this.searchProject) {
				const searchRegExp = new RegExp(this.searchProject, 'i');
				filtered = filtered.filter((el) => {
					const title = this.t(el.title);
					return title.match(searchRegExp);
				});
			}
			
			// Sort projects based on selected order
			if (this.sortOrder === 'newest') {
				filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
			} else if (this.sortOrder === 'oldest') {
				filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
			} else if (this.sortOrder === 'default') {
				// Default sort by project ID ascending
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
		this.loadProjects();
		feather.replace();
	},
};
</script>

<template>
	<!-- Projects grid -->
	<section class="pt-10 sm:pt-14">
		<!-- Projects grid title -->
		<div class="text-center">
			<p
				class="font-general-semibold text-2xl sm:text-5xl font-semibold mb-2 text-ternary-dark dark:text-ternary-light"
			>
				{{ projectsHeading }}
			</p>
		</div>

		<!-- Search and sort projects -->
		<div class="mt-10 sm:mt-10">
			<h3
				class="font-general-regular
					text-center text-secondary-dark
					dark:text-ternary-light
					text-md
					sm:text-xl
					font-normal
					mb-4
				"
			>
				Search projects by title or sort by date
			</h3>
			<div
				class="
					flex
					justify-between
					border-b border-primary-light
					dark:border-secondary-dark
					pb-3
					gap-2
				"
			>
				<div class="flex justify-between gap-2">
					<span
						class="
							hidden
							sm:block
							bg-primary-light
							dark:bg-ternary-dark
							p-2.5
							shadow-sm
							rounded-xl
							cursor-pointer
							"
					>
						<i
							data-feather="search"
							class="text-ternary-dark dark:text-ternary-light"
						></i>
					</span>
					<input
						v-model="searchProject"
						class="font-general-medium
						pl-3
						pr-1
						sm:px-4
						py-2
						border-1 border-gray-200
						dark:border-secondary-dark
						rounded-lg
						text-sm
						sm:text-md
						bg-secondary-light
						dark:bg-ternary-dark
						text-primary-dark
						dark:text-ternary-light
						"
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
					class="font-general-medium
						px-4
						py-2.5
						border-1 border-gray-200
						dark:border-secondary-dark
						rounded-lg
						text-sm
						sm:text-md
						bg-secondary-light
						dark:bg-ternary-dark
						text-primary-dark
						dark:text-ternary-light
						shadow-sm
						hover:shadow-md
						hover:border-blue-300
						dark:hover:border-blue-600
						transition-all
						cursor-pointer
						appearance-none
						relative
					"
				>
					<option value="default">默认排序</option>
					<option value="newest">由新到旧</option>
					<option value="oldest">由旧到新</option>
				</select>
			</div>
		</div>

		<!-- Projects grid -->
		<div
			class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-6 sm:gap-10"
		>
			<ProjectSingle
				v-for="project in filteredProjects"
				:key="project.id"
				:project="project"
			/>
		</div>
	</section>
</template>

<style scoped></style>
