import { ref } from 'vue';

// 图片格式转换配置
const ORIGINAL_FORMATS = ['.jpg', '.jpeg', '.png'];
const WEBP_FORMAT = '.webp';

/**
 * 将图片 URL 转换为 WebP 格式
 * @param {string} url - 原始图片 URL
 * @returns {string} - WebP 格式的 URL
 */
export function convertToWebPUrl(url) {
  if (!url) return url;

  // 如果已经是 WebP 格式，直接返回
  if (url.toLowerCase().endsWith(WEBP_FORMAT)) {
    return url;
  }

  // 检查是否是需要转换的格式
  const isConvertibleFormat = ORIGINAL_FORMATS.some(format =>
    url.toLowerCase().endsWith(format)
  );

  if (!isConvertibleFormat) {
    return url;
  }

  // 替换扩展名
  for (const format of ORIGINAL_FORMATS) {
    if (url.toLowerCase().endsWith(format)) {
      return url.slice(0, -format.length) + WEBP_FORMAT;
    }
  }

  return url;
}

/**
 * 获取原始图片 URL（从 WebP 格式还原）
 * @param {string} url - WebP 格式的 URL
 * @param {string} originalExtension - 原始扩展名（如果已知）
 * @returns {string} - 原始格式的 URL
 */
export function getOriginalImageUrl(url, originalExtension = null) {
  if (!url) return url;

  // 如果不是 WebP 格式，直接返回
  if (!url.toLowerCase().endsWith(WEBP_FORMAT)) {
    return url;
  }

  // 如果提供了原始扩展名，使用它
  if (originalExtension) {
    const ext = originalExtension.startsWith('.') ? originalExtension : `.${originalExtension}`;
    return url.slice(0, -WEBP_FORMAT.length) + ext;
  }

  // 尝试常见的原始格式
  const baseUrl = url.slice(0, -WEBP_FORMAT.length);
  return baseUrl + '.jpg'; // 默认回退到 jpg
}

/**
 * 检查浏览器是否支持 WebP 格式
 * @returns {Promise<boolean>} - 是否支持 WebP
 */
export function checkWebPSupport() {
  return new Promise((resolve) => {
    // 使用特性检测
    const webP = new Image();
    webP.onload = webP.onerror = function() {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
}

/**
 * 图片加载状态管理
 * @param {string} originalUrl - 原始图片 URL
 * @returns {Object} - 包含图片 URL、加载状态和错误处理的对象
 */
export function useImageLoader(originalUrl) {
  const imageUrl = ref(convertToWebPUrl(originalUrl));
  const isLoading = ref(true);
  const hasError = ref(false);
  const currentUrl = ref(imageUrl.value);

  const loadImage = () => {
    isLoading.value = true;
    hasError.value = false;

    const img = new Image();

    img.onload = () => {
      isLoading.value = false;
      hasError.value = false;
    };

    img.onerror = () => {
      // 如果 WebP 加载失败，尝试原始格式
      if (currentUrl.value === convertToWebPUrl(originalUrl)) {
        currentUrl.value = originalUrl;
        imageUrl.value = originalUrl;
        // 重新加载原始格式
        const imgOriginal = new Image();
        imgOriginal.onload = () => {
          isLoading.value = false;
          hasError.value = false;
        };
        imgOriginal.onerror = () => {
          isLoading.value = false;
          hasError.value = true;
        };
        imgOriginal.src = originalUrl;
      } else {
        isLoading.value = false;
        hasError.value = true;
      }
    };

    img.src = currentUrl.value;
  };

  // 初始化加载
  loadImage();

  return {
    imageUrl,
    isLoading,
    hasError,
    reload: loadImage
  };
}

/**
 * Vue 组件中使用的图片 URL 优化钩子
 * @param {Ref<string>} urlRef - 图片 URL 的响应式引用
 * @returns {Object} - 优化后的图片 URL 和相关状态
 */
export function useOptimizedImage(urlRef) {
  const optimizedUrl = ref('');
  const isLoading = ref(true);
  const hasError = ref(false);
  const webPSupported = ref(true);

  const updateImage = async () => {
    if (!urlRef.value) {
      optimizedUrl.value = '';
      isLoading.value = false;
      hasError.value = false;
      return;
    }

    isLoading.value = true;
    hasError.value = false;

    // 检查 WebP 支持
    webPSupported.value = await checkWebPSupport();

    const img = new Image();
    const primaryUrl = webPSupported.value ? convertToWebPUrl(urlRef.value) : urlRef.value;

    img.onload = () => {
      optimizedUrl.value = primaryUrl;
      isLoading.value = false;
      hasError.value = false;
    };

    img.onerror = () => {
      // 如果首选 URL 加载失败，尝试备用
      if (primaryUrl !== urlRef.value) {
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          optimizedUrl.value = urlRef.value;
          isLoading.value = false;
          hasError.value = false;
        };
        fallbackImg.onerror = () => {
          optimizedUrl.value = urlRef.value;
          isLoading.value = false;
          hasError.value = true;
        };
        fallbackImg.src = urlRef.value;
      } else {
        optimizedUrl.value = urlRef.value;
        isLoading.value = false;
        hasError.value = true;
      }
    };

    img.src = primaryUrl;
  };

  // 监听 URL 变化
  if (urlRef && typeof urlRef.value !== 'undefined') {
    updateImage();
  }

  return {
    optimizedUrl,
    isLoading,
    hasError,
    webPSupported,
    updateImage
  };
}

export default {
  convertToWebPUrl,
  getOriginalImageUrl,
  checkWebPSupport,
  useImageLoader,
  useOptimizedImage
};
