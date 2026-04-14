<script>
import { ref, watch, computed } from 'vue';
import { convertToWebPUrl, checkWebPSupport } from '@/composables/useImageOptimization';
import SkeletonLoader from './SkeletonLoader.vue';

export default {
  name: 'WebpImage',
  components: { SkeletonLoader },
  props: {
    src: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    class: {
      type: [String, Object, Array],
      default: ''
    },
    width: {
      type: [String, Number],
      default: null
    },
    height: {
      type: [String, Number],
      default: null
    },
    objectFit: {
      type: String,
      default: 'cover'
    },
    showSkeleton: {
      type: Boolean,
      default: true
    },
    lazy: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const currentSrc = ref('');
    const isLoading = ref(true);
    const hasError = ref(false);
    const webPSupported = ref(true);

    const loadImage = async () => {
      if (!props.src) {
        isLoading.value = false;
        hasError.value = false;
        currentSrc.value = '';
        return;
      }

      isLoading.value = true;
      hasError.value = false;

      // 检查 WebP 支持
      webPSupported.value = await checkWebPSupport();

      const img = new Image();
      const primaryUrl = webPSupported.value ? convertToWebPUrl(props.src) : props.src;

      img.onload = () => {
        currentSrc.value = primaryUrl;
        isLoading.value = false;
        hasError.value = false;
      };

      img.onerror = () => {
        // 如果 WebP 加载失败，尝试原始格式
        if (primaryUrl !== props.src) {
          const fallbackImg = new Image();
          fallbackImg.onload = () => {
            currentSrc.value = props.src;
            isLoading.value = false;
            hasError.value = false;
          };
          fallbackImg.onerror = () => {
            currentSrc.value = props.src;
            isLoading.value = false;
            hasError.value = true;
          };
          fallbackImg.src = props.src;
        } else {
          currentSrc.value = props.src;
          isLoading.value = false;
          hasError.value = true;
        }
      };

      img.src = primaryUrl;
    };

    // 监听 src 变化
    watch(() => props.src, () => {
      loadImage();
    }, { immediate: true });

    return {
      currentSrc,
      isLoading,
      hasError,
      webPSupported,
      loadImage
    };
  }
};
</script>

<template>
  <div class="webp-image-container" :style="{ width, height }">
    <!-- 骨架屏加载 -->
    <SkeletonLoader
      v-if="isLoading && showSkeleton"
      width="100%"
      height="100%"
      rounded="lg"
    />

    <!-- 图片 -->
    <img
      v-if="!isLoading || !showSkeleton"
      :src="currentSrc"
      :alt="alt"
      :class="['webp-image', class, { 'image-loading': isLoading, 'image-error': hasError }]"
      :style="{ objectFit }"
      :loading="lazy ? 'lazy' : 'eager'"
      @error="loadImage"
    />

    <!-- 错误状态 -->
    <div v-if="hasError" class="image-error-placeholder">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.webp-image-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.webp-image {
  width: 100%;
  height: 100%;
  transition: opacity 0.3s ease-in-out;
}

.image-loading {
  opacity: 0.5;
}

.image-error {
  display: none;
}

.image-error-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
}
</style>
