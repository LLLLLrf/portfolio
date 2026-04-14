<template>
	<transition name="toast">
		<div 
			v-if="isVisible" 
			class="toast-container fixed top-4 right-4 z-[9999]"
		>
			<div class="toast bg-white dark:bg-gray-800 rounded-xl shadow-2xl px-6 py-4 flex items-center gap-3 border border-gray-100 dark:border-gray-700">
				<div 
					class="toast-icon w-10 h-10 rounded-full flex items-center justify-center"
					:class="iconClass"
				>
					<svg v-if="type === 'success'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
					</svg>
					<svg v-else-if="type === 'error'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
					<svg v-else-if="type === 'warning'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
					</svg>
					<svg v-else xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
				<div class="toast-content">
					<p class="toast-message text-gray-800 dark:text-gray-200 font-medium">
						{{ message }}
					</p>
				</div>
			</div>
		</div>
	</transition>
</template>

<script>
export default {
	name: 'Toast',
	data() {
		return {
			isVisible: false,
			message: '',
			type: 'info',
			duration: 3000,
			hideTimeout: null
		};
	},
	computed: {
		iconClass() {
			const classes = {
				success: 'bg-green-100 text-green-600',
				error: 'bg-red-100 text-red-600',
				warning: 'bg-yellow-100 text-yellow-600',
				info: 'bg-blue-100 text-blue-600'
			};
			return classes[this.type] || classes.info;
		}
	},
	methods: {
		show(message, type = 'info', duration = 3000) {
			// 清除之前的定时器
			if (this.hideTimeout) {
				clearTimeout(this.hideTimeout);
			}
			
			this.message = message;
			this.type = type;
			this.duration = duration;
			this.isVisible = true;
			
			// 自动隐藏
			if (this.duration > 0) {
				this.hideTimeout = setTimeout(() => {
					this.hide();
				}, this.duration);
			}
		},
		hide() {
			if (this.hideTimeout) {
				clearTimeout(this.hideTimeout);
				this.hideTimeout = null;
			}
			this.isVisible = false;
		}
	}
};
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
	transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from {
	opacity: 0;
	transform: translateX(100%);
}

.toast-leave-to {
	opacity: 0;
	transform: translateX(100%);
}

.toast {
	animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideIn {
	from {
		opacity: 0;
		transform: translateX(100%);
	}
	to {
		opacity: 1;
		transform: translateX(0);
	}
}
</style>
