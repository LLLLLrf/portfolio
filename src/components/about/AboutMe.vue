<script>
import { apiService } from '@/services/apiService';
import { useLanguage } from '@/composables/useLanguage';

export default {
	setup() {
		const { t } = useLanguage();
		return { t };
	},
	data() {
		return {
			aboutMeData: null
		};
	},
	async mounted() {
		this.aboutMeData = await apiService.getAboutMe();
	}
};
</script>

<template>
	<div class="block sm:flex sm:gap-10 mt-10 sm:mt-20">
		<!-- About profile image -->
		<div class="w-full sm:w-1/4 mb-7 sm:mb-0">
			<img
				src="@/assets/images/profile.jpg"
				class="rounded-xl w-96"
				alt=""
			/>
		</div>

		<!-- About details -->
		<div class="w-full sm:w-3/4 text-left">
			<div v-if="aboutMeData">
				<p
					v-for="bio in aboutMeData.bios"
					:key="bio.id"
					class="font-general-regular mb-4 text-ternary-dark dark:text-ternary-light text-lg"
				>
					{{ t(bio.bio) }}
				</p>
			</div>
			<div v-else class="text-gray-500 dark:text-gray-400">加载中...</div>
		</div>
	</div>
</template>
