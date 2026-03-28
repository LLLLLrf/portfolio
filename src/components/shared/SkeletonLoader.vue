<script>
export default {
	name: 'SkeletonLoader',
	props: {
		width: {
			type: String,
			default: '100%'
		},
		height: {
			type: String,
			default: '200px'
		},
		rounded: {
			type: String,
			default: 'md'
		},
		animated: {
			type: Boolean,
			default: true
		}
	}
};
</script>

<template>
	<div 
		class="skeleton-loader"
		:style="{
			width: width,
			height: height,
			borderRadius: rounded === 'full' ? '9999px' : 
				rounded === 'lg' ? '0.5rem' : 
				rounded === 'md' ? '0.375rem' : '0.25rem'
		}"
	>
	</div>
</template>

<style scoped>
.skeleton-loader {
	background: linear-gradient(
		90deg,
		rgba(156, 163, 175, 0.1) 0%,
		rgba(156, 163, 175, 0.3) 50%,
		rgba(156, 163, 175, 0.1) 100%
	);
	background-size: 200% 100%;
	animation: shimmer 1.5s ease-in-out infinite;
}

.dark .skeleton-loader {
	background: linear-gradient(
		90deg,
		rgba(55, 65, 81, 0.4) 0%,
		rgba(75, 85, 99, 0.6) 50%,
		rgba(55, 65, 81, 0.4) 100%
	);
	background-size: 200% 100%;
}

@keyframes shimmer {
	0% {
		background-position: -200% 0;
	}
	100% {
		background-position: 200% 0;
	}
}
</style>
