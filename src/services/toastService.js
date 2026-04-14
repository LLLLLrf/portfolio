let toastInstance = null;

// 设置Toast实例
export function setToastInstance(instance) {
  toastInstance = instance;
}

// 显示Toast消息
export function showToast(message, type = 'info', duration = 3000) {
  if (toastInstance && toastInstance.show) {
    toastInstance.show(message, type, duration);
  } else {
    console.warn('Toast instance not set, using default alert');
    alert(message);
  }
}

// 快捷方法
export function toastSuccess(message, duration = 3000) {
  showToast(message, 'success', duration);
}

export function toastError(message, duration = 3000) {
  showToast(message, 'error', duration);
}

export function toastWarning(message, duration = 3000) {
  showToast(message, 'warning', duration);
}

export function toastInfo(message, duration = 3000) {
  showToast(message, 'info', duration);
}
