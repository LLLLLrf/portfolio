<script>
import { apiService } from '../services/apiService';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const router = useRouter();
    return { router };
  },
  data() {
    return {
      password: '',
      error: ''
    };
  },
  methods: {
    login() {
      if (apiService.authenticate(this.password)) {
        apiService.setAuthenticated(true);
        this.router.push('/admin');
      } else {
        this.error = '密码错误，请重试';
      }
    }
  }
};
</script>

<template>
  <div class="admin-container container mx-auto mt-20 max-w-md p-4">
    <div class="admin-card p-8">
      <h1 class="font-general-semibold text-2xl text-gray-800 dark:text-gray-100 mb-6 text-center">
        管理后台登录
      </h1>
      
      <div v-if="error" class="mb-4 p-3 bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-200 rounded-lg">
        {{ error }}
      </div>
      
      <div class="mb-6">
        <label class="form-label">
          密码
        </label>
        <input
          v-model="password"
          type="password"
          @keyup.enter="login"
          class="form-input"
          placeholder="请输入管理密码"
        />
      </div>
      
      <button
        @click="login"
        class="btn-success w-full"
      >
        登录
      </button>
      
      <p class="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
        默认密码: admin123
      </p>
    </div>
  </div>
</template>

<style scoped>
.admin-container {
  @apply min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300;
}

.admin-card {
  @apply bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-md;
}

.btn-success {
  @apply px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-300 font-medium;
}

.form-input {
  @apply w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent;
}

.form-label {
  @apply block font-medium text-gray-700 dark:text-gray-300 mb-2;
}
</style>
