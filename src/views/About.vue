<script>
import AboutMe from '@/components/about/AboutMe';
import feather from 'feather-icons';

export default {
	name: 'About',
	components: {
		AboutMe,
	},
	mounted() {
		feather.replace();
	},
	updated() {
		feather.replace();
	},
};
</script>

<template>
	<div>
		<!-- About me - Full page display -->
		<AboutMe />
	</div>
</template>

<style scoped></style>
