<script>
import { useLanguage } from '../../composables/useLanguage';

export default {
  setup() {
    const { currentLanguage, availableLanguages, setLanguage } = useLanguage();
    return { currentLanguage, availableLanguages, setLanguage };
  },
  methods: {
    toggleLanguage() {
      // 切换语言：如果当前是中文则切换到英文，反之亦然
      const newLanguage = this.currentLanguage === 'zh' ? 'en' : 'zh';
      this.setLanguage(newLanguage);
    }
  }
};
</script>

<template>
  <div>
    <button
      @click="toggleLanguage"
      class="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary-light dark:bg-ternary-dark cursor-pointer hover:bg-primary-light dark:hover:bg-secondary-dark transition-colors"
      title="切换语言"
    >
      <span class="font-general-medium text-ternary-dark dark:text-ternary-light">
        {{ availableLanguages[currentLanguage].name }}
      </span>
    </button>
  </div>
</template>

<style scoped></style>
