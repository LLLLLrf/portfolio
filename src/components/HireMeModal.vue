<script>
import feather from 'feather-icons';
import Button from './reusable/Button.vue';
import { apiService } from '../services/apiService';
export default {
	props: ['showModal', 'modal'],
	components: { Button },
	data() {
		return {
			email: 'your.email@example.com',
			copied: false
		};
	},
	mounted() {
		feather.replace();
		this.loadEmail();
	},
	updated() {
		feather.replace();
	},
	methods: {
		async loadEmail() {
			try {
				const config = await apiService.getConfig();
				if (config && config.contactEmail) {
					this.email = config.contactEmail;
				}
			} catch (error) {
				console.error('Failed to load email:', error);
			}
		},
		copyEmail() {
			navigator.clipboard.writeText(this.email)
				.then(() => {
					this.copied = true;
					setTimeout(() => {
						this.copied = false;
					}, 2000);
				})
				.catch(err => {
					console.error('Failed to copy email:', err);
				});
		}
	},
};
</script>

<template>
	<transition name="fade">
		<div v-show="modal" class="font-general-regular fixed inset-0 z-30">
			<!-- Modal body background as backdrop -->
			<div
				v-show="modal"
				@click="showModal()"
				class="bg-filter bg-black bg-opacity-50 fixed inset-0 w-full h-full z-20"
			></div>
			<!-- Modal content -->
			<main
				class="flex flex-col items-center justify-center h-full w-full"
			>
				<transition name="fade-up-down">
					<div
						v-show="modal"
						class="modal-wrapper flex items-center z-30"
					>
						<div
							class="modal max-w-md mx-5 md:max-w-lg bg-secondary-light dark:bg-primary-dark max-h-screen shadow-lg rounded-lg relative"
						>
							<div
								class="modal-header flex justify-between gap-10 p-5 border-b border-ternary-light dark:border-ternary-dark"
							>
								<h5
									class="text-primary-dark dark:text-primary-light text-xl"
								>
									Get in Touch
								</h5>
								<button
									class="px-4 text-primary-dark dark:text-primary-light"
									@click="showModal()"
								>
									<i data-feather="x"></i>
								</button>
							</div>
							<div class="modal-body p-8 w-full h-full text-center">
								<div class="mb-6">
									<i data-feather="mail" class="h-16 w-16 text-indigo-500 mx-auto mb-4"></i>
									<h3 class="text-2xl font-bold text-primary-dark dark:text-primary-light mb-2">
										Email Me
									</h3>
									<p class="text-gray-600 dark:text-gray-400 mb-6">
										Feel free to reach out for collaborations or inquiries
									</p>
								</div>
								
								<div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6 flex items-center justify-between">
									<span class="text-primary-dark dark:text-primary-light font-medium">
										{{ email }}
									</span>
									<button
										@click="copyEmail"
										class="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md transition-colors duration-300"
										aria-label="Copy Email"
									>
										{{ copied ? 'Copied!' : 'Copy' }}
									</button>
								</div>
								
								<div class="mt-4">
									<Button
										title="Close"
										class="px-6 py-2 bg-gray-600 text-primary-light hover:bg-ternary-dark dark:bg-gray-200 dark:text-secondary-dark dark:hover:bg-primary-light rounded-md focus:ring-1 focus:ring-indigo-900 duration-500"
										@click="showModal()"
										aria-label="Close Modal"
									/>
								</div>
							</div>
						</div>
					</div>
				</transition>
			</main>
		</div>
	</transition>
</template>

<style scoped>
.modal-body {
	max-height: 570px;
}
.bg-gray-800-opacity {
	background-color: #2d374850;
}
@media screen and (max-width: 768px) {
	.modal-body {
		max-height: 400px;
	}
}
.fade-up-down-enter-active {
	transition: all 0.3s ease;
}
.fade-up-down-leave-active {
	transition: all 0.3s ease;
}
.fade-up-down-enter {
	transform: translateY(10%);
	opacity: 0;
}
.fade-up-down-leave-to {
	transform: translateY(10%);
	opacity: 0;
}

.fade-enter-active {
	-webkit-transition: opacity 2s;
	transition: opacity 0.3s;
}
.fade-leave-active {
	transition: opacity 0.3s;
}

.fade-enter,
.fade-leave-to {
	opacity: 0;
}
</style>
