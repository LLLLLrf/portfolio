<script>
import { apiService } from '@/services/apiService';
import { useLanguage } from '@/composables/useLanguage';
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue';

export default {
	components: { SkeletonLoader },
	setup() {
		const { t } = useLanguage();
		return { t };
	},
	data() {
		return {
			aboutMeData: null,
			isAvatarLoaded: false,
			isDataLoaded: false
		};
	},
	async mounted() {
		this.aboutMeData = await apiService.getAboutMe();
		this.isDataLoaded = true;
		this.checkAvatarLoaded();
		
		// 超时保护，3秒后自动显示
		setTimeout(() => {
			if (!this.isAvatarLoaded) {
				this.isAvatarLoaded = true;
			}
		}, 3000);
	},
	methods: {
		checkAvatarLoaded() {
			if (this.aboutMeData?.avatar) {
				const img = new Image();
				img.onload = () => {
					this.isAvatarLoaded = true;
				};
				img.onerror = () => {
					this.isAvatarLoaded = true;
				};
				img.src = this.aboutMeData.avatar;
				if (img.complete) {
					this.isAvatarLoaded = true;
				}
			} else {
				// 如果没有头像，直接显示
				this.isAvatarLoaded = true;
			}
		},
		formatText(text) {
			if (!text) return '';
			return text.replace(/\*\*(.*?)\*\*/g, '<strong class="about-bold">$1</strong>');
		},
		onAvatarLoad() {
			this.isAvatarLoaded = true;
		}
	}
};
</script>

<template>
	<div class="about-page-container">
		<div class="about-wrapper">
			<!-- 左侧：照片区域 -->
			<div class="photo-section">
				<div class="photo-container">
					<!-- 照片装饰背景 -->
					<div class="photo-bg-decoration"></div>
					
					<!-- 主照片 -->
					<div class="photo-main">
						<div v-if="!isAvatarLoaded" class="profile-photo-skeleton">
							<SkeletonLoader width="320px" height="320px" rounded="lg" />
						</div>
						<img
							:src="aboutMeData?.avatar || '@/assets/images/profile.jpg'"
							:class="['profile-photo', isAvatarLoaded ? 'photo-visible' : 'photo-hidden']"
							alt="Profile image"
							@load="onAvatarLoad"
							@error="onAvatarLoad"
						/>
						
						<!-- 个人信息 -->
						<div class="personal-info" v-if="aboutMeData?.personalInfo">
							<span class="personal-info-text">{{ t(aboutMeData.personalInfo) }}</span>
						</div>
						
						<!-- 底部装饰几何图形 -->
						<div class="photo-decoration-bottom"></div>
					</div>
				</div>
				
				<!-- 侧边装饰元素 -->
				<div class="side-decoration left">
					<div class="decor-line"></div>
					<div class="decor-circle"></div>
				</div>
				<div class="side-decoration right">
					<div class="decor-line"></div>
					<div class="decor-circle"></div>
				</div>
			</div>
			
			<!-- 右侧：简介区域 -->
			<div class="bio-section">
				<div class="bio-container">
					<!-- 标题装饰 -->
					<div class="bio-header">
						<div class="header-line"></div>
						<h2 class="bio-title">About Me</h2>
						<div class="header-dots">
							<span class="dot"></span>
							<span class="dot"></span>
							<span class="dot"></span>
						</div>
					</div>
					
					<!-- 简介内容 -->
					<div class="bio-content">
						<div v-if="isDataLoaded && aboutMeData" class="bio-texts">
							<div
								v-for="bio in aboutMeData.bios"
								:key="bio.id"
								class="bio-paragraph"
								v-html="formatText(t(bio.bio))"
							>
							</div>
							<!-- 强制滚动条显示的占位元素 -->
							<div class="scrollbar-spacer"></div>
						</div>
						<div v-else class="bio-skeleton">
							<SkeletonLoader width="100%" height="20px" rounded="md" />
							<div class="mt-4">
								<SkeletonLoader width="90%" height="20px" rounded="md" />
							</div>
							<div class="mt-4">
								<SkeletonLoader width="95%" height="20px" rounded="md" />
							</div>
							<div class="mt-4">
								<SkeletonLoader width="85%" height="20px" rounded="md" />
							</div>
							<div class="mt-4">
								<SkeletonLoader width="80%" height="20px" rounded="md" />
							</div>
						</div>
					</div>
					
					<!-- 底部装饰 -->
					<div class="bio-footer">
						<div class="footer-gradient"></div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.about-page-container {
	min-height: calc(100vh - 100px);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 60px 10% 40px 10%;
	background: linear-gradient(135deg, 
		rgba(6, 182, 212, 0.03) 0%, 
		rgba(139, 92, 246, 0.03) 50%, 
		rgba(236, 72, 153, 0.03) 100%);
}

.about-wrapper {
	display: grid;
	grid-template-columns: 1fr 1.5fr;
	gap: clamp(12px, 2.5vw, 35px);
	max-width: 1300px;
	width: 100%;
	align-items: center;
}

/* 照片区域 */
.photo-section {
	position: relative;
	display: flex;
	justify-content: center;
	align-items: center;
}

.photo-container {
	position: relative;
	display: inline-block;
}

.photo-bg-decoration {
	position: absolute;
	top: -30px;
	left: -30px;
	right: -30px;
	bottom: -30px;
	background: 
		linear-gradient(135deg, transparent 30%, rgba(6, 182, 212, 0.1) 30%, rgba(6, 182, 212, 0.1) 35%, transparent 35%),
		linear-gradient(-135deg, transparent 65%, rgba(139, 92, 246, 0.1) 65%, rgba(139, 92, 246, 0.1) 70%, transparent 70%);
	border-radius: 24px;
	z-index: 0;
	pointer-events: none;
}

.photo-main {
	position: relative;
	z-index: 1;
	min-height: 320px;
}

.profile-photo-skeleton {
	max-width: 320px;
}

.profile-photo {
	max-width: 320px;
	height: auto;
	border-radius: 16px;
	box-shadow: 
		0 25px 50px -12px rgba(6, 182, 212, 0.15),
		0 25px 50px -12px rgba(139, 92, 246, 0.1),
		0 0 0 1px rgba(6, 182, 212, 0.1);
	transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.photo-hidden {
	opacity: 0;
	position: absolute;
	top: 0;
	left: 0;
}

.photo-visible {
	opacity: 1;
	animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
	from {
		opacity: 0;
		transform: scale(0.95);
	}
	to {
		opacity: 1;
		transform: scale(1);
	}
}

.profile-photo:hover {
	transform: translateY(-5px);
	box-shadow: 
		0 35px 60px -15px rgba(6, 182, 212, 0.2),
		0 35px 60px -15px rgba(139, 92, 246, 0.15),
		0 0 0 1px rgba(6, 182, 212, 0.2);
}

/* 个人信息 */
.personal-info {
	position: relative;
	margin-top: 24px;
	padding: 16px 32px;
	background: transparent;
	text-align: center;
}

.personal-info::before {
	content: '';
	position: absolute;
	left: 50%;
	top: 0;
	transform: translateX(-50%);
	width: 60px;
	height: 1px;
	background: linear-gradient(90deg, transparent, rgba(156, 163, 175, 0.4), transparent);
}

.personal-info-text {
	font-size: 1.1rem;
	font-weight: 400;
	color: #6b7280;
	letter-spacing: 0.8px;
	opacity: 0.9;
}

.dark .personal-info-text {
	color: #a6badb;
}

/* 照片底部装饰几何图形 */
.photo-decoration-bottom {
	position: absolute;
	bottom: -20px;
	left: 50%;
	transform: translateX(-50%);
	width: 80%;
	height: 40px;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 20px;
}

.photo-decoration-bottom::before {
	content: '';
	position: absolute;
	width: 100%;
	height: 2px;
	background: linear-gradient(90deg, 
		transparent, 
		rgba(6, 182, 212, 0.6), 
		rgba(139, 92, 246, 0.6), 
		rgba(236, 72, 153, 0.6), 
		transparent);
}

.photo-decoration-bottom::after {
	content: '';
	position: absolute;
	width: 12px;
	height: 12px;
	border: 2px solid rgba(6, 182, 212, 0.8);
	transform: rotate(45deg);
}

/* 侧边装饰 */
.side-decoration {
	position: absolute;
	top: 50%;
	transform: translateY(-50%);
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 30px;
}

.side-decoration.left {
	left: -40px;
}

.side-decoration.right {
	right: -40px;
}

.decor-line {
	width: 2px;
	height: 100px;
	background: linear-gradient(180deg, 
		transparent, 
		rgba(6, 182, 212, 0.4), 
		transparent);
}

.decor-circle {
	width: 10px;
	height: 10px;
	border-radius: 50%;
	background: linear-gradient(135deg, #06b6d4, #8b5cf6);
	box-shadow: 0 0 15px rgba(6, 182, 212, 0.4);
}

/* 简介区域 */
.bio-section {
	display: flex;
	align-items: center;
}

.bio-container {
	position: relative;
	width: 100%;
}

/* 标题装饰 */
.bio-header {
	display: flex;
	align-items: center;
	gap: 20px;
	margin-bottom: 40px;
}

.header-line {
	flex: 1;
	height: 2px;
	background: linear-gradient(90deg, 
		rgba(6, 182, 212, 0.6), 
		rgba(139, 92, 246, 0.6));
	border-radius: 1px;
}

.bio-title {
	font-size: 2rem;
	font-weight: 800;
	background: linear-gradient(135deg, #06b6d4, #8b5cf6, #ec4899);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
	white-space: nowrap;
	letter-spacing: 2px;
}

.header-dots {
	display: flex;
	gap: 8px;
}

.header-dots .dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background: #06b6d4;
	animation: pulse 2s ease-in-out infinite;
}

.header-dots .dot:nth-child(2) {
	background: #8b5cf6;
	animation-delay: 0.3s;
}

.header-dots .dot:nth-child(3) {
	background: #ec4899;
	animation-delay: 0.6s;
}

@keyframes pulse {
	0%, 100% {
		opacity: 0.4;
		transform: scale(1);
	}
	50% {
		opacity: 1;
		transform: scale(1.2);
	}
}

/* 简介内容 */
.bio-content {
	position: relative;
	padding: 30px 35px 60px 30px;
	background: rgba(255, 255, 255, 0.02);
	border-radius: 16px;
	border: 1px solid rgba(6, 182, 212, 0.1);
	height: 55vh;
	max-height: 550px;
	min-height: 350px;
	overflow-y: scroll;
	overflow-x: hidden;
	scrollbar-width: thin;
	scrollbar-color: rgba(6, 182, 212, 0.6) rgba(6, 182, 212, 0.1);
}

/* 确保滚动容器有足够内容来显示滚动条 */
.bio-texts {
	display: flex;
	flex-direction: column;
	gap: 24px;
	min-height: calc(100% + 60px);
}

.scrollbar-spacer {
	height: 60px;
	width: 100%;
	flex-shrink: 0;
	opacity: 0;
	pointer-events: none;
}

.bio-content::-webkit-scrollbar {
	width: 8px;
}

.bio-content::-webkit-scrollbar-track {
	background: rgba(6, 182, 212, 0.05);
	border-radius: 4px;
}

.bio-content::-webkit-scrollbar-thumb {
	background: linear-gradient(180deg, rgba(6, 182, 212, 0.6), rgba(139, 92, 246, 0.6));
	border-radius: 4px;
	opacity: 1 !important;
	visibility: visible !important;
}

.bio-content::-webkit-scrollbar-thumb:hover {
	background: linear-gradient(180deg, rgba(6, 182, 212, 0.8), rgba(139, 92, 246, 0.8));
}

.bio-texts {
	display: flex;
	flex-direction: column;
	gap: 24px;
}

.bio-paragraph {
	font-size: 1.15rem;
	line-height: 1.9;
	color: #374151;
	position: relative;
	padding-left: 20px;
	text-align: left;
}

.bio-paragraph::before {
	content: '';
	position: absolute;
	left: 0;
	top: 10px;
	width: 4px;
	height: 4px;
	border-radius: 50%;
	background: linear-gradient(135deg, #06b6d4, #8b5cf6);
}

.dark .bio-paragraph {
	color: #e5e7eb;
}

/* 加粗文本样式 */
:deep(.about-bold) {
	font-weight: 800;
	background: linear-gradient(135deg, #06b6d4, #8b5cf6);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
}

.dark :deep(.about-bold) {
	background: linear-gradient(135deg, #22d3ee, #a78bfa);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
}

/* 加载动画 */
.loading-text {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 40px;
}

.loading-dots {
	display: flex;
	gap: 8px;
}

.loading-dots span {
	width: 12px;
	height: 12px;
	border-radius: 50%;
	background: #06b6d4;
	animation: bounce 1.4s ease-in-out infinite;
}

.loading-dots span:nth-child(1) {
	animation-delay: 0s;
}

.loading-dots span:nth-child(2) {
	background: #8b5cf6;
	animation-delay: 0.2s;
}

.loading-dots span:nth-child(3) {
	background: #ec4899;
	animation-delay: 0.4s;
}

@keyframes bounce {
	0%, 80%, 100% {
		transform: translateY(0);
	}
	40% {
		transform: translateY(-15px);
	}
}

/* 底部装饰 */
.bio-footer {
	margin-top: 30px;
}

.footer-gradient {
	height: 3px;
	background: linear-gradient(90deg, 
		transparent, 
		rgba(6, 182, 212, 0.4), 
		rgba(139, 92, 246, 0.4), 
		rgba(236, 72, 153, 0.4), 
		transparent);
	border-radius: 2px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
	.about-wrapper {
		grid-template-columns: 1fr;
		gap: 50px;
	}
	
	.photo-section {
		order: -1;
	}
	
	.side-decoration {
		display: none;
	}
	
	.bio-title {
		font-size: 1.6rem;
	}
	
	.bio-content {
		height: 45vh;
		max-height: 400px;
		min-height: 300px;
	}
}

@media (max-width: 640px) {
	.about-page-container {
		padding: 30px 15px;
	}
	
	.profile-photo {
		max-width: 260px;
	}
	
	.bio-header {
		flex-wrap: wrap;
		justify-content: center;
	}
	
	.header-line {
		width: 100%;
		order: 3;
	}
	
	.bio-paragraph {
		font-size: 1rem;
	}
	
	.bio-content {
		height: 50vh;
		max-height: 450px;
		min-height: 280px;
		padding: 20px;
	}
}
</style>

<style>
/* 全局深色模式样式 */
.dark .bio-content {
	background: rgba(0, 0, 0, 0.1);
	border-color: rgba(139, 92, 246, 0.15);
}

.dark .bio-paragraph::before {
	background: linear-gradient(135deg, #22d3ee, #a78bfa);
}

/* 全局滚动条样式 - 强制始终显示 */
.bio-content {
	-ms-overflow-style: scrollbar !important;
}

.bio-content::-webkit-scrollbar {
	width: 8px !important;
	display: block !important;
	opacity: 1 !important;
}

.bio-content::-webkit-scrollbar-track {
	background: rgba(6, 182, 212, 0.08) !important;
	border-radius: 4px !important;
	display: block !important;
}

.bio-content::-webkit-scrollbar-thumb {
	background: linear-gradient(180deg, rgba(6, 182, 212, 0.7), rgba(139, 92, 246, 0.7)) !important;
	border-radius: 4px !important;
	opacity: 1 !important;
	visibility: visible !important;
	display: block !important;
	min-height: 40px !important;
}

.bio-content::-webkit-scrollbar-thumb:hover {
	background: linear-gradient(180deg, rgba(6, 182, 212, 0.9), rgba(139, 92, 246, 0.9)) !important;
}

.bio-content::-webkit-scrollbar-button {
	display: none !important;
}
</style>
