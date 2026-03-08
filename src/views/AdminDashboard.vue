<script>
import { apiService } from '../services/apiService';
import { useLanguage } from '../composables/useLanguage';
import { useRouter } from 'vue-router';
const feather = require('feather-icons');

export default {
  setup() {
    const router = useRouter();
    const { t } = useLanguage();
    return { router, t };
  },
  data() {
    return {
      activeTab: 'projects',
      projects: [],
      editingProject: null,
      isProjectModalOpen: false,
      isAboutModalOpen: false,
      aboutMeData: null,
      resumeVersions: [],
      editingResumeAlias: '',
      editingResumeId: null,
      backendAvailable: false,
      isUploading: false,
      tagsInput: '',
      technologiesInput: '',
      relatedProjectsInput: ''
    };
  },
  watch: {
    'editingProject.tags': {
      handler(newTags) {
        this.tagsInput = newTags ? newTags.join(', ').trim() : '';
      },
      deep: true
    },
    'editingProject.technologies': {
      handler(newTechnologies) {
        this.technologiesInput = newTechnologies ? newTechnologies.join(', ').trim() : '';
      },
      deep: true
    },
    'editingProject.relatedProjects': {
      handler(newRelated) {
        this.relatedProjectsInput = newRelated ? newRelated.join(', ').trim() : '';
      },
      deep: true
    },
    editingProject: {
      handler(newProject) {
        if (newProject) {
          this.tagsInput = newProject.tags ? newProject.tags.join(', ').trim() : '';
          this.technologiesInput = newProject.technologies ? newProject.technologies.join(', ').trim() : '';
          this.relatedProjectsInput = newProject.relatedProjects ? newProject.relatedProjects.join(', ').trim() : '';
        }
      },
      immediate: true
    },
    activeTab: {
      handler() {
        // 当tab切换时，确保DOM更新后重新替换图标
        this.$nextTick(() => {
          feather.replace();
        });
      }
    }
  },
  mounted() {
    if (!apiService.isAuthenticated()) {
      this.router.push('/admin/login');
      return;
    }
    this.checkBackend();
    this.loadProjects();
    this.loadAboutMe();
    this.loadResumes();
    // 确保DOM完全渲染后再替换图标
    this.$nextTick(() => {
      feather.replace();
    });
  },
  methods: {
    updateTags() {
      this.editingProject.tags = this.tagsInput.split(/[,，]/).map(t => t.trim()).filter(t => t);
    },
    updateTechnologies() {
      this.editingProject.technologies = this.technologiesInput.split(/[,，]/).map(t => t.trim()).filter(t => t);
    },
    updateRelatedProjects() {
      this.editingProject.relatedProjects = this.relatedProjectsInput.split(/[,，]/).map(t => parseInt(t.trim())).filter(t => !isNaN(t));
    },
    async checkBackend() {
      this.backendAvailable = await apiService.checkBackendAvailable();
    },
    async loadProjects() {
      this.projects = await apiService.getProjects();
      // 数据加载完成后重新替换图标
      this.$nextTick(() => {
        feather.replace();
      });
    },
    async loadAboutMe() {
      this.aboutMeData = await apiService.getAboutMe();
      // 数据加载完成后重新替换图标
      this.$nextTick(() => {
        feather.replace();
      });
    },
    async loadResumes() {
      const config = await apiService.getResumes();
      this.resumeVersions = config.configs || [];
      // 数据加载完成后重新替换图标
      this.$nextTick(() => {
        feather.replace();
      });
    },
    
    createNewProject() {
      this.editingProject = {
        id: null,
        title: { zh: '', en: '' },
        category: { zh: '', en: '' },
        thumbnail: '',
        date: '',
        tags: [],
        projectUrl: '',
        codeUrl: '',
        objective: { zh: '', en: '' },
        technologies: [],
        challenge: { zh: '', en: '' },
        details: [],
        images: [],
        relatedProjects: []
      };
      this.isProjectModalOpen = true;
    },
    
    editProject(project) {
      const projectCopy = JSON.parse(JSON.stringify(project));
      this.editingProject = {
        id: projectCopy.id || null,
        title: projectCopy.title || { zh: '', en: '' },
        category: projectCopy.category || { zh: '', en: '' },
        thumbnail: projectCopy.thumbnail || '',
        date: projectCopy.date || '',
        tags: projectCopy.tags || [],
        projectUrl: projectCopy.projectUrl || '',
        codeUrl: projectCopy.codeUrl || '',
        objective: projectCopy.objective || { zh: '', en: '' },
        technologies: projectCopy.technologies || [],
        challenge: projectCopy.challenge || { zh: '', en: '' },
        details: projectCopy.details || [],
        images: projectCopy.images || [],
        relatedProjects: projectCopy.relatedProjects || []
      };
      this.isProjectModalOpen = true;
    },
    
    async deleteProject(id) {
      if (confirm('确定要删除这个项目吗？')) {
        await apiService.deleteProject(id);
        this.loadProjects();
      }
    },
    
    async saveProject() {
      // Ensure all input values are processed before saving
      this.updateTags();
      this.updateTechnologies();
      this.updateRelatedProjects();
      
      await apiService.saveProject(this.editingProject);
      this.isProjectModalOpen = false;
      this.editingProject = null;
      this.loadProjects();
    },
    
    logout() {
      apiService.setAuthenticated(false);
      this.router.push('/admin/login');
    },
    
    async resetData() {
      if (confirm('确定要重置所有数据吗？这将恢复默认项目。')) {
        await apiService.resetData();
        this.loadProjects();
      }
    },
    
    addDetail() {
      this.editingProject.details.push({
        id: Date.now(),
        content: { zh: '', en: '' }
      });
    },
    
    removeDetail(index) {
      this.editingProject.details.splice(index, 1);
    },
    
    addImage() {
      this.editingProject.images.push({
        id: Date.now(),
        url: '',
        caption: { zh: '', en: '' }
      });
    },
    
    removeImage(index) {
      this.editingProject.images.splice(index, 1);
    },
    
    handleThumbnailUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.convertFileToBase64(file).then(base64 => {
          this.editingProject.thumbnail = base64;
        });
      }
    },
    
    handleProjectImageUpload(event, index) {
      const file = event.target.files[0];
      if (file) {
        this.convertFileToBase64(file).then(base64 => {
          this.editingProject.images[index].url = base64;
        });
      }
    },
    
    convertFileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });
    },

    async openAboutEdit() {
      this.aboutMeData = await apiService.getAboutMe();
      this.isAboutModalOpen = true;
    },

    addBio() {
      this.aboutMeData.bios.push({
        id: Date.now(),
        bio: { zh: '', en: '' }
      });
    },

    removeBio(index) {
      this.aboutMeData.bios.splice(index, 1);
    },

    async saveAboutMe() {
      await apiService.saveAboutMe(this.aboutMeData);
      this.isAboutModalOpen = false;
    },

    async handleResumeUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      try {
        this.isUploading = true;
        await apiService.uploadResume(file);
        await this.loadResumes();
        event.target.value = '';
      } catch (error) {
        alert(error.message);
      } finally {
        this.isUploading = false;
      }
    },

    async deleteResume(id) {
      if (confirm('确定要删除这个简历吗？')) {
        await apiService.deleteResume(id);
        await this.loadResumes();
      }
    },

    async setCurrentResume(id) {
      await apiService.setCurrentResume(id);
      await this.loadResumes();
    },

    async saveResumeAlias() {
      if (this.editingResumeId && this.editingResumeAlias !== null) {
        await apiService.setResumeAlias(this.editingResumeId, this.editingResumeAlias);
        this.editingResumeId = null;
        this.editingResumeAlias = null;
        await this.loadResumes();
      }
    },

    startEditAlias(resume) {
      this.editingResumeId = resume.id;
      this.editingResumeAlias = resume.alias || resume.fileName;
    },

    cancelEditAlias() {
      this.editingResumeId = null;
      this.editingResumeAlias = null;
    },

    downloadResume(resume) {
      const link = document.createElement('a');
      link.href = `/files/cv/${encodeURIComponent(resume.fileName)}`;
      link.download = resume.fileName;
      link.click();
    },

    formatDateTime(timestamp) {
      if (!timestamp) return '未知';
      const date = new Date(timestamp);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    exportConfig() {
      const config = {
        files: this.resumeVersions.map(r => r.fileName),
        configs: this.resumeVersions
      };
      const configString = JSON.stringify(config, null, 2);
      
      navigator.clipboard.writeText(configString).then(() => {
        alert('配置已复制到剪贴板，请打开 public/files/cv/config.json 并粘贴替换内容');
      }).catch(err => {
        console.error('复制失败:', err);
        alert('复制失败，请手动复制配置');
      });
    }
  }
};
</script>

<template>
  <div class="admin-container container mx-auto mt-10 p-4">
    <div class="admin-header flex justify-between items-center mb-8 p-6 rounded-xl">
      <h1 class="font-general-semibold text-3xl text-gray-800 dark:text-gray-100">
        管理后台
      </h1>
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2 px-3 py-1 rounded-lg" :class="backendAvailable ? 'badge-success' : 'badge-warning'">
          <span class="w-2 h-2 rounded-full" :class="backendAvailable ? 'bg-emerald-600' : 'bg-amber-600'"></span>
          <span class="text-sm">{{ backendAvailable ? '后端已连接' : '仅前端模式' }}</span>
        </div>
        <button
          @click="resetData"
          class="btn-warning"
        >
          重置数据
        </button>
        <button
          @click="logout"
          class="btn-danger"
        >
          退出登录
        </button>
      </div>
    </div>

    <div class="mb-6 border-b border-gray-200 dark:border-gray-700">
      <nav class="flex gap-4">
        <button
          @click="activeTab = 'projects'"
          :class="[
            'admin-tab',
            activeTab === 'projects'
              ? 'admin-tab-active'
              : 'admin-tab-inactive'
          ]"
        >
          <i data-feather="folder" class="w-4 h-4 inline mr-2"></i>
          项目管理
        </button>
        <button
          @click="activeTab = 'about'"
          :class="[
            'admin-tab',
            activeTab === 'about'
              ? 'admin-tab-active'
              : 'admin-tab-inactive'
          ]"
        >
          <i data-feather="user" class="w-4 h-4 inline mr-2"></i>
          关于我
        </button>
        <button
          @click="activeTab = 'resumes'"
          :class="[
            'admin-tab',
            activeTab === 'resumes'
              ? 'admin-tab-active'
              : 'admin-tab-inactive'
          ]"
        >
          <i data-feather="file-text" class="w-4 h-4 inline mr-2"></i>
          简历管理
        </button>
      </nav>
    </div>

    <div v-if="activeTab === 'projects'">
      <div class="mb-6">
        <button
          @click="createNewProject"
          class="btn-success px-6 py-3"
        >
          <i data-feather="plus" class="w-4 h-4 inline mr-2"></i>
          新建项目
        </button>
      </div>

      <div class="admin-card overflow-hidden">
        <table class="admin-table">
          <thead>
            <tr>
              <th>项目标题</th>
              <th>分类</th>
              <th>日期</th>
              <th class="text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="project in projects" :key="project.id">
              <td class="px-6 py-4 text-gray-800 dark:text-gray-200">
                {{ t(project.title) }}
              </td>
              <td class="px-6 py-4 text-gray-700 dark:text-gray-300">
                {{ t(project.category) }}
              </td>
              <td class="px-6 py-4 text-gray-700 dark:text-gray-300">
                {{ project.date }}
              </td>
              <td class="px-6 py-4 text-right">
                <button
                  @click="editProject(project)"
                  class="btn-primary px-3 py-1 mr-2 text-sm"
                >
                  <i data-feather="edit" class="w-4 h-4 inline"></i>
                  编辑
                </button>
                <button
                  @click="deleteProject(project.id)"
                  class="btn-danger px-3 py-1 text-sm"
                >
                  <i data-feather="trash" class="w-4 h-4 inline"></i>
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="activeTab === 'about'">
      <div class="mb-6">
        <button
          @click="openAboutEdit"
          class="btn-success px-6 py-3"
        >
          <i data-feather="edit" class="w-4 h-4 inline mr-2"></i>
          编辑关于我
        </button>
      </div>

      <div class="admin-card p-6">
        <h3 class="font-general-semibold text-xl text-gray-800 dark:text-gray-100 mb-4">当前关于我内容</h3>
        <div v-for="bio in aboutMeData?.bios" :key="bio.id" class="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p class="text-gray-700 dark:text-gray-300">{{ bio.bio }}</p>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'resumes'">
      <div class="mb-6">
        <div class="flex flex-wrap gap-4 items-center">
          <div v-if="backendAvailable" class="flex-1">
            <input
              type="file"
              id="resume-upload"
              accept=".pdf,.doc,.docx"
              @change="handleResumeUpload"
              class="hidden"
            />
            <label
              for="resume-upload"
              :class="[
                'px-6 py-3 rounded-lg font-general-semibold cursor-pointer inline-flex items-center gap-2',
                isUploading 
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'btn-success'
              ]"
              :disabled="isUploading"
            >
              <i data-feather="upload" class="w-4 h-4"></i>
              {{ isUploading ? '上传中...' : '上传简历' }}
            </label>
          </div>
          
          <div v-else class="flex-1 badge-warning p-4 rounded-lg">
            <p class="text-sm flex items-center gap-2">
              <i data-feather="info" class="w-4 h-4"></i>
              仅前端模式：请将简历文件放到 <code class="bg-white dark:bg-gray-800 px-2 py-1 rounded">public/files/cv</code> 目录
            </p>
          </div>
          
          <button
            v-if="resumeVersions.length > 0"
            @click="exportConfig"
            class="btn-primary inline-flex items-center gap-2"
          >
            <i data-feather="copy" class="w-4 h-4"></i>
            复制配置
          </button>
          
          <button
            @click="loadResumes"
            class="btn-secondary inline-flex items-center gap-2"
          >
            <i data-feather="refresh-cw" class="w-4 h-4"></i>
            刷新
          </button>
        </div>
      </div>

      <div v-if="resumeVersions.length === 0" class="admin-card p-12 text-center">
        <i data-feather="file-text" class="w-16 h-16 mx-auto text-gray-400 mb-4"></i>
        <p class="text-gray-800 dark:text-gray-100 text-lg">暂无简历</p>
        <p class="text-gray-500 dark:text-gray-400 mt-2">
          {{ backendAvailable ? '点击上方按钮上传简历' : '请在 public/files/cv 目录下添加简历文件后刷新' }}
        </p>
      </div>

      <div v-else class="grid gap-4">
        <div
          v-for="resume in resumeVersions"
          :key="resume.id"
          :class="[
            'admin-card p-6 transition-all',
            resume.isCurrent ? 'ring-2 ring-emerald-500' : ''
          ]"
        >
          <div class="flex flex-wrap items-start gap-4">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                <i data-feather="file-text" class="w-6 h-6 text-indigo-600 dark:text-indigo-400"></i>
              </div>
            </div>
            
            <div class="flex-grow min-w-0">
              <div class="flex items-center gap-3 mb-2">
                <h4 class="font-general-semibold text-lg text-gray-800 dark:text-gray-100 truncate">
                  {{ resume.alias }}
                </h4>
                <span v-if="resume.isCurrent" class="badge badge-success">
                  当前使用
                </span>
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400 truncate">
                {{ resume.fileName }}
              </p>
              <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                上传时间: {{ formatDateTime(resume.createdAt) }}
              </p>
            </div>
            
            <div class="flex flex-wrap gap-2 flex-shrink-0">
              <button
                v-if="!resume.isCurrent"
                @click="setCurrentResume(resume.id)"
                class="btn-primary px-3 py-1.5 text-sm inline-flex items-center gap-1"
              >
                <i data-feather="star" class="w-4 h-4"></i>
                设为当前
              </button>
              
              <button
                @click="startEditAlias(resume)"
                class="btn-warning px-3 py-1.5 text-sm inline-flex items-center gap-1"
              >
                <i data-feather="edit-2" class="w-4 h-4"></i>
                别名
              </button>
              
              <button
                @click="downloadResume(resume)"
                class="btn-secondary px-3 py-1.5 text-sm inline-flex items-center gap-1"
              >
                <i data-feather="download" class="w-4 h-4"></i>
                下载
              </button>
              
              <button
                @click="deleteResume(resume.id)"
                class="btn-danger px-3 py-1.5 text-sm inline-flex items-center gap-1"
              >
                <i data-feather="trash" class="w-4 h-4"></i>
                删除
              </button>
            </div>
          </div>
          
          <div v-if="editingResumeId === resume.id" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div class="flex items-center gap-3">
              <input
                v-model="editingResumeAlias"
                type="text"
                class="form-input flex-grow"
                placeholder="输入别名"
                @keyup.enter="saveResumeAlias"
                @keyup.escape="cancelEditAlias"
              />
              <button @click="saveResumeAlias" class="btn-success">
                保存
              </button>
              <button @click="cancelEditAlias" class="btn-secondary">
                取消
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isProjectModalOpen" class="modal-backdrop">
      <div class="modal-content">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex justify-between items-center">
            <h2 class="font-general-semibold text-2xl text-gray-800 dark:text-gray-100">
              {{ editingProject.id ? '编辑项目' : '新建项目' }}
            </h2>
            <button
              @click="isProjectModalOpen = false; editingProject = null"
              class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <i data-feather="x" class="w-6 h-6"></i>
            </button>
          </div>
        </div>
        
        <div class="p-6 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="form-label">
                标题 (中文)
              </label>
              <input
                v-model="editingProject.title.zh"
                type="text"
                class="form-input"
              />
            </div>
            <div>
              <label class="form-label">
                Title (English)
              </label>
              <input
                v-model="editingProject.title.en"
                type="text"
                class="form-input"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="form-label">
                分类 (中文)
              </label>
              <input
                v-model="editingProject.category.zh"
                type="text"
                class="form-input"
              />
            </div>
            <div>
              <label class="form-label">
                Category (English)
              </label>
              <input
                v-model="editingProject.category.en"
                type="text"
                class="form-input"
              />
            </div>
            <div>
              <label class="form-label">
                日期
              </label>
              <input
                v-model="editingProject.date"
                type="date"
                class="form-input"
              />
            </div>
          </div>

          <div>
            <label class="form-label">
              缩略图
            </label>
            <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
              <input
                type="file"
                accept="image/*"
                @change="handleThumbnailUpload"
                class="hidden"
                id="thumbnail-input"
              />
              <div class="text-center">
                <label
                  for="thumbnail-input"
                  class="btn-primary inline-block mb-2 cursor-pointer"
                >
                  选择或拖拽图片
                </label>
                <p class="text-sm text-gray-500 dark:text-gray-400">支持 JPG, PNG, GIF 等格式</p>
              </div>
              <div v-if="editingProject.thumbnail" class="mt-4">
                <img :src="editingProject.thumbnail" class="max-h-40 mx-auto rounded" />
                <input
                  v-model="editingProject.thumbnail"
                  type="text"
                  placeholder="或输入图片URL"
                  class="form-input w-full mt-2 text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label class="form-label">
              标签 (逗号分隔)
            </label>
            <input
                v-model="tagsInput"
                @blur="updateTags"
                type="text"
                class="form-input"
              />
          </div>

          <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 class="font-general-semibold text-xl text-gray-800 dark:text-gray-100 mb-4">
              项目链接 (选填)
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="form-label">
                  项目地址
                </label>
                <input
                  v-model="editingProject.projectUrl"
                  type="text"
                  class="form-input"
                  placeholder="例如: https://example.com/project"
                />
              </div>
              <div>
                <label class="form-label">
                  代码网址
                </label>
                <input
                  v-model="editingProject.codeUrl"
                  type="text"
                  class="form-input"
                  placeholder="例如: https://github.com/username/project"
                />
              </div>
            </div>
          </div>

          <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 class="font-general-semibold text-xl text-gray-800 dark:text-gray-100 mb-4">
              项目目标
            </h3>
            <div class="space-y-4">
              <div>
                <label class="form-label">
                  目标 (中文)
                </label>
                <textarea
                  v-model="editingProject.objective.zh"
                  rows="3"
                  class="form-input"
                ></textarea>
              </div>
              <div>
                <label class="form-label">
                  Objective (English)
                </label>
                <textarea
                  v-model="editingProject.objective.en"
                  rows="3"
                  class="form-input"
                ></textarea>
              </div>
            </div>
          </div>

          <div>
            <label class="form-label">
              技术栈 (逗号分隔)
            </label>
            <input
              v-model="technologiesInput"
              @blur="updateTechnologies"
              type="text"
              class="form-input"
            />
          </div>

          <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 class="font-general-semibold text-xl text-gray-800 dark:text-gray-100 mb-4">
              挑战
            </h3>
            <div class="space-y-4">
              <div>
                <label class="form-label">
                  挑战 (中文)
                </label>
                <textarea
                  v-model="editingProject.challenge.zh"
                  rows="3"
                  class="form-input"
                ></textarea>
              </div>
              <div>
                <label class="form-label">
                  Challenge (English)
                </label>
                <textarea
                  v-model="editingProject.challenge.en"
                  rows="3"
                  class="form-input"
                ></textarea>
              </div>
            </div>
          </div>

          <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="font-general-semibold text-xl text-gray-800 dark:text-gray-100">
                详情段落
              </h3>
              <button
                @click="addDetail"
                class="btn-primary px-3 py-1 text-sm"
              >
                <i data-feather="plus" class="w-4 h-4 inline mr-1"></i>
                添加
              </button>
            </div>
            <div v-for="(detail, index) in editingProject.details" :key="detail.id" class="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div class="flex justify-end mb-2">
                <button
                  @click="removeDetail(index)"
                  class="btn-danger px-2 py-1 text-sm"
                >
                  <i data-feather="x" class="w-3 h-3 inline mr-1"></i>
                  移除
                </button>
              </div>
              <div class="space-y-4">
                <div>
                  <label class="form-label">
                    内容 (中文)
                  </label>
                  <textarea
                    v-model="detail.content.zh"
                    rows="3"
                    class="form-input"
                  ></textarea>
                </div>
                <div>
                  <label class="form-label">
                    Content (English)
                  </label>
                  <textarea
                    v-model="detail.content.en"
                    rows="3"
                    class="form-input"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="font-general-semibold text-xl text-gray-800 dark:text-gray-100">
                图片
              </h3>
              <button
                @click="addImage"
                class="btn-primary px-3 py-1 text-sm"
              >
                <i data-feather="plus" class="w-4 h-4 inline mr-1"></i>
                添加
              </button>
            </div>
            <div v-for="(image, index) in editingProject.images" :key="image.id" class="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div class="flex justify-end mb-2">
                <button
                  @click="removeImage(index)"
                  class="btn-danger px-2 py-1 text-sm"
                >
                  <i data-feather="x" class="w-3 h-3 inline mr-1"></i>
                  移除
                </button>
              </div>
              <div class="space-y-4">
                <div>
                  <label class="form-label">
                    图片
                  </label>
                  <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                    <input
                      type="file"
                      accept="image/*"
                      @change="(e) => handleProjectImageUpload(e, index)"
                      class="hidden"
                      :id="`project-image-input-${image.id}`"
                    />
                    <div class="text-center">
                      <label
                        :for="`project-image-input-${image.id}`"
                        class="btn-primary inline-block mb-2 cursor-pointer"
                      >
                        选择或拖拽图片
                      </label>
                      <p class="text-sm text-gray-500 dark:text-gray-400">支持 JPG, PNG, GIF 等格式</p>
                    </div>
                    <div v-if="image.url" class="mt-4">
                      <img :src="image.url" class="max-h-40 mx-auto rounded" />
                      <input
                        v-model="image.url"
                        type="text"
                        placeholder="或输入图片URL"
                        class="form-input w-full mt-2 text-sm"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label class="form-label">
                    说明 (中文)
                  </label>
                  <input
                    v-model="image.caption.zh"
                    type="text"
                    class="form-input"
                  />
                </div>
                <div>
                  <label class="form-label">
                    Caption (English)
                  </label>
                  <input
                    v-model="image.caption.en"
                    type="text"
                    class="form-input"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label class="form-label">
              相关项目 ID (逗号分隔)
            </label>
            <input
              v-model="relatedProjectsInput"
              @blur="updateRelatedProjects"
              type="text"
              class="form-input"
            />
          </div>
        </div>

        <div class="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            @click="isProjectModalOpen = false; editingProject = null"
            class="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors duration-300"
          >
            取消
          </button>
          <button
            @click="saveProject"
            class="btn-success"
          >
            保存
          </button>
        </div>
      </div>
    </div>

    <div v-if="isAboutModalOpen" class="modal-backdrop">
      <div class="modal-content">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex justify-between items-center">
            <h2 class="font-general-semibold text-2xl text-gray-800 dark:text-gray-100">
              编辑关于我
            </h2>
            <button
              @click="isAboutModalOpen = false"
              class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <i data-feather="x" class="w-6 h-6"></i>
            </button>
          </div>
        </div>
        
        <div class="p-6 space-y-6">
          <div class="flex justify-between items-center">
            <h3 class="font-general-semibold text-xl text-gray-800 dark:text-gray-100">
              个人简介段落
            </h3>
            <button
              @click="addBio"
              class="btn-primary px-3 py-1 text-sm"
            >
              <i data-feather="plus" class="w-4 h-4 inline mr-1"></i>
              添加段落
            </button>
          </div>
          
          <div v-for="(bio, index) in aboutMeData.bios" :key="bio.id" class="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div class="flex justify-end mb-2">
              <button
                @click="removeBio(index)"
                class="btn-danger px-2 py-1 text-sm"
              >
                <i data-feather="x" class="w-3 h-3 inline mr-1"></i>
                移除
              </button>
            </div>
            <div class="space-y-4">
              <div>
                <label class="form-label">
                  段落内容 (中文)
                </label>
                <textarea
                  v-model="bio.bio.zh"
                  rows="3"
                  class="form-input"
                ></textarea>
              </div>
              <div>
                <label class="form-label">
                  段落内容 (English)
                </label>
                <textarea
                  v-model="bio.bio.en"
                  rows="3"
                  class="form-input"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <div class="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            @click="isAboutModalOpen = false"
            class="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors duration-300"
          >
            取消
          </button>
          <button
            @click="saveAboutMe"
            class="btn-success"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 自定义样式 */
.admin-container {
  @apply min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300;
}

/* 头部样式 */
.admin-header {
  @apply bg-white dark:bg-gray-800 shadow-sm;
}

/* 按钮样式优化 */
.btn-primary {
  @apply px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-300 font-medium inline-flex items-center gap-2;
}

.btn-secondary {
  @apply px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-300 font-medium inline-flex items-center gap-2;
}

.btn-success {
  @apply px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-300 font-medium inline-flex items-center gap-2;
}

.btn-danger {
  @apply px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors duration-300 font-medium inline-flex items-center gap-2;
}

.btn-warning {
  @apply px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors duration-300 font-medium inline-flex items-center gap-2;
}

/* 卡片样式 */
.admin-card {
  @apply bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-md;
}

/* 表格样式 */
.admin-table {
  @apply w-full border-collapse;
}

.admin-table th {
  @apply px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800;
}

.admin-table td {
  @apply px-6 py-4 text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700;
}

.admin-table tr:hover {
  @apply bg-gray-50 dark:bg-gray-800;
}

/* 标签页样式 */
.admin-tab {
  @apply px-4 py-2 font-medium rounded-t-lg transition-colors duration-300;
}

.admin-tab-active {
  @apply bg-indigo-600 text-white;
}

.admin-tab-inactive {
  @apply text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800;
}

/* 表单元素样式 */
.form-input {
  @apply w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent;
}

.form-label {
  @apply block font-medium text-gray-700 dark:text-gray-300 mb-2;
}

/* 徽章样式 */
.badge {
  @apply px-2 py-1 text-xs rounded-full font-medium;
}

.badge-success {
  @apply bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200;
}

.badge-warning {
  @apply bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200;
}

/* 加载状态 */
.loading-spinner {
  @apply animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600;
}

/* 模态框样式 */
.modal-backdrop {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4;
}

.modal-content {
  @apply bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .admin-container {
    @apply p-2;
  }
  
  .admin-header {
    @apply flex-col gap-4 pb-4;
  }
  
  .admin-tab {
    @apply px-3 py-1.5 text-sm;
  }
}
</style>
