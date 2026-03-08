import { ref } from 'vue';

const STORAGE_KEY = 'portfolio_language';
const DEFAULT_LANGUAGE = 'zh';

export const availableLanguages = {
  zh: { name: '中文', flag: '🇨🇳' },
  en: { name: 'English', flag: '🇺🇸' }
};

const currentLanguage = ref(localStorage.getItem(STORAGE_KEY) || DEFAULT_LANGUAGE);

export function useLanguage() {
  const setLanguage = (lang) => {
    if (availableLanguages[lang]) {
      currentLanguage.value = lang;
      localStorage.setItem(STORAGE_KEY, lang);
    }
  };

  const t = (texts) => {
    if (!texts) return '';
    if (typeof texts === 'string') return texts;
    return texts[currentLanguage.value] || texts[DEFAULT_LANGUAGE] || '';
  };

  return {
    currentLanguage,
    availableLanguages,
    setLanguage,
    t
  };
}
