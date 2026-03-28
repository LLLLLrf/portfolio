import { ref, onMounted } from 'vue';
import { apiService } from '@/services/apiService';

const config = ref(null);
const isLoading = ref(true);

export function useConfig() {
  const loadConfig = async () => {
    try {
      config.value = await apiService.getConfig();
    } catch (error) {
      console.error('Failed to load config:', error);
    } finally {
      isLoading.value = false;
    }
  };

  const saveConfig = async (newConfig) => {
    try {
      await apiService.saveConfig(newConfig);
      config.value = newConfig;
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  };

  onMounted(() => {
    if (!config.value) {
      loadConfig();
    }
  });

  return {
    config,
    isLoading,
    loadConfig,
    saveConfig
  };
}
