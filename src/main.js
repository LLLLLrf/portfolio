import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/css/app.css';
import BackToTop from 'vue-backtotop';
import { showToast } from './services/toastService';

const feather = require('feather-icons');
feather.replace();

// 重写全局alert方法
window.originalAlert = window.alert;
window.alert = function(message) {
  showToast(message, 'info', 3000);
};

createApp(App)
	.use(router)
	.use(BackToTop)
	.mount('#app');

const appTheme = localStorage.getItem('theme') || 'dark';

// Check what is the active theme and change theme when user clicks on the theme button in header.
if (
	appTheme === 'dark' &&
	document.querySelector('body')
) {
	document.querySelector('body').classList.add('bg-primary-dark');
} else if (document.querySelector('body')) {
	document.querySelector('body').classList.add('bg-secondary-light');
}
