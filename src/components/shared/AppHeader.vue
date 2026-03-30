<script>
import ThemeSwitcher from '../ThemeSwitcher';
import HireMeModal from '../HireMeModal.vue';
import feather from 'feather-icons';
import AppHeaderLinks from './AppHeaderLinks.vue';
import Button from '../reusable/Button.vue';
import LanguageSwitcher from './LanguageSwitcher.vue';

export default {
	components: {
		ThemeSwitcher,
		HireMeModal,
		AppHeaderLinks,
		Button,
		LanguageSwitcher,
	},
	data() {
		return {
			isOpen: false,
			theme: '',
			modal: false,
			categories: [
				{
					id: 1,
					value: 'web',
					name: 'Web Application',
				},
				{
					id: 2,
					value: 'mobile',
					name: 'Mobile Application',
				},
				{
					id: 3,
					value: 'ui-ux',
					name: 'UI/UX Design',
				},
				{
					id: 4,
					value: 'branding',
					name: 'Branding & Anim',
				},
			],
		};
	},

	created() {
		this.theme = localStorage.getItem('theme') || 'dark';
	},
	mounted() {
		feather.replace();
		this.theme = localStorage.getItem('theme') || 'dark';
		// 添加点击外部关闭菜单的功能
		document.addEventListener('click', this.handleClickOutside);
	},
	beforeUnmount() {
		document.removeEventListener('click', this.handleClickOutside);
	},
	methods: {
		updateTheme(theme) {
			this.theme = theme;
		},
		showModal() {
			if (this.modal) {
				// Stop screen scrolling
				document
					.getElementsByTagName('html')[0]
					.classList.remove('overflow-y-hidden');
				this.modal = false;
			} else {
				document
					.getElementsByTagName('html')[0]
					.classList.add('overflow-y-hidden');
				this.modal = true;
			}
		},
		handleClickOutside(event) {
			const navElement = document.getElementById('nav');
			if (this.isOpen && navElement && !navElement.contains(event.target)) {
				this.isOpen = false;
			}
		},
	},
	updated() {
		feather.replace();
	},
};
</script>

<template>
	<nav id="nav" class="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 shadow-md z-50">
		<!-- Header start -->
		<div
			class="sm:container sm:mx-auto max-w-screen-lg xl:max-w-screen-xl block sm:flex sm:justify-between sm:items-center py-3 px-4 sm:px-0"
		>
			<!-- Header menu links and small screen hamburger menu -->
			<div class="flex justify-between items-center px-4 sm:px-0">
				<!-- Header logos -->
				<div>
					<router-link to="/"
						><img
							v-if="theme === 'light'"
							src="@/assets/images/Leos-none-light.png"
							class="w-32 h-auto rounded-lg"
							alt="Dark Logo"
						/>
						<img
							v-else
							src="@/assets/images/Leos-none-dark.png"
							class="w-32 h-auto rounded-lg"
							alt="Light Logo"
						/>
					</router-link>
				</div>

				<!-- Mobile controls container -->
			<div class="flex items-center gap-2 sm:hidden">
				<!-- Language switcher small screen -->
				<language-switcher class="bg-ternary-light dark:bg-ternary-dark hover:bg-hover-light dark:hover:bg-hover-dark hover:shadow-sm px-2.5 py-2 rounded-lg" />
				
				<!-- Theme switcher small screen -->
				<theme-switcher
					:theme="theme"
					@themeChanged="updateTheme"
					class="bg-ternary-light dark:bg-ternary-dark hover:bg-hover-light dark:hover:bg-hover-dark hover:shadow-sm px-2.5 py-2 rounded-lg"
				/>
			</div>

				<!-- Small screen hamburger menu -->
				<div class="sm:hidden">
					<button
						@click="isOpen = !isOpen"
						type="button"
						class="focus:outline-none"
						aria-label="Hamburger Menu"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							class="h-7 w-7 fill-current text-secondary-dark dark:text-ternary-light"
						>
							<path
								v-if="isOpen"
								fill-rule="evenodd"
								d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z"
								clip-rule="evenodd"
							></path>
							<path
								v-if="!isOpen"
								fill-rule="evenodd"
								d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"
							></path>
						</svg>
					</button>
				</div>
			</div>

			<!-- Header links -->
		<AppHeaderLinks 
			:showModal="showModal" 
			:isOpen="isOpen" 
			@closeMenu="isOpen = false"
		/>

			<!-- Header right section buttons -->
			<div
				class="hidden sm:flex justify-between items-center flex-col md:flex-row"
			>
				<!-- Hire me button -->
				<div class="hidden md:block">
					<Button
						title="Hire Me"
						class="text-md font-general-medium bg-indigo-500 hover:bg-indigo-600 text-white shadow-sm rounded-md px-5 py-2.5 duration-300"
						@click="showModal()"
						aria-label="Hire Me Button"
					/>
				</div>

				<!-- Language switcher -->
				<language-switcher class="ml-4" />
				
				<!-- Theme switcher large screen -->
				<theme-switcher
					:theme="theme"
					@themeChanged="updateTheme"
					class="ml-4 bg-primary-light dark:bg-ternary-dark px-3 py-2 shadow-sm rounded-xl cursor-pointer"
				/>
			</div>
		</div>

		<!-- Hire me modal -->
		<HireMeModal
			:showModal="showModal"
			:modal="modal"
			:categories="categories"
			aria-modal="Hire Me Modal"
		/>
	</nav>
</template>

<style scoped>
#nav a.router-link-exact-active {
	@apply text-indigo-700;
	@apply dark:text-indigo-400;
	@apply font-medium;
}
</style>
