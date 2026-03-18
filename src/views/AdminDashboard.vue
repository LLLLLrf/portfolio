<script>
import { apiService } from '../services/apiService';
import { useLanguage } from '../composables/useLanguage';
import { useRouter } from 'vue-router';
import feather from 'feather-icons';
import draggable from 'vuedraggable';

export default {
  components: {
    draggable
  },
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
    }
  },
  async mounted() {
    if (!apiService.isAuthenticated()) {
      this.router.push('/admin/login');
      return;
    }
    await this.checkBackend();
    await this.loadProjects();
    await this.loadAboutMe();
    await this.loadResumes();
    feather.replace();
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
    },
    async loadAboutMe() {
      this.aboutMeData = await apiService.getAboutMe();
      // 确保avatar字段存在
      if (!this.aboutMeData.avatar) {
        this.aboutMeData.avatar = '/assets/images/profile.jpg';
      }
    },
    async loadResumes() {
      const config = await apiService.getResumes();
      this.resumeVersions = config.configs || [];
    },
    
    createNewProject() {
      this.editingProject = {
        id: null,
        title: { zh: '', en: '' },
        category: { zh: '', en: '' },
        thumbnail: '',
        date: '',
        tags: [],
        client: {
          name: { zh: '', en: '' },
          services: { zh: '', en: '' },
          website: '',
          phone: ''
        },
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
      // 初始化所有图片的 title 和 description 字段
      if (projectCopy.images) {
        projectCopy.images.forEach(img => {
          if (!img.title) {
            img.title = { zh: '', en: '' };
          }
          if (!img.description) {
            img.description = { zh: '', en: '' };
          }
          // 如果有 caption 但没有 title，将 caption 复制到 title
          if (img.caption) {
            if (!img.title.zh) img.title.zh = img.caption.zh || '';
            if (!img.title.en) img.title.en = img.caption.en || '';
          }
        });
      }
      this.editingProject = {
        id: projectCopy.id || null,
        title: projectCopy.title || { zh: '', en: '' },
        category: projectCopy.category || { zh: '', en: '' },
        thumbnail: projectCopy.thumbnail || '',
        date: projectCopy.date || '',
        tags: projectCopy.tags || [],
        codeRepos: projectCopy.codeRepos || [],
        objective: projectCopy.objective || { zh: '', en: '' },
        technologies: projectCopy.technologies || [],
        challenge: projectCopy.challenge || { zh: '', en: '' },
        details: projectCopy.details || [],
        images: projectCopy.images || [],
        relatedProjects: projectCopy.relatedProjects || []
      };
      this.isProjectModalOpen = true;
      // 重新初始化图标
      this.$nextTick(() => {
        feather.replace();
      });
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
    
    moveDetailUp(index) {
      if (index > 0) {
        const temp = this.editingProject.details[index];
        this.editingProject.details[index] = this.editingProject.details[index - 1];
        this.editingProject.details[index - 1] = temp;
      }
    },
    
    moveDetailDown(index) {
      if (index < this.editingProject.details.length - 1) {
        const temp = this.editingProject.details[index];
        this.editingProject.details[index] = this.editingProject.details[index + 1];
        this.editingProject.details[index + 1] = temp;
      }
    },
    
    toggleDetailBold(detail, lang) {
      if (!detail.content[lang]) {
        detail.content[lang] = '**加粗文本**';
      } else {
        detail.content[lang] += ' **加粗文本**';
      }
    },
    
    addImage() {
      this.editingProject.images.push({
        id: Date.now(),
        url: '',
        title: { zh: '', en: '' },
        description: { zh: '', en: '' }
      });
      // 重新初始化图标
      this.$nextTick(() => {
        feather.replace();
      });
    },
    
    initImageFields(image) {
      // 初始化旧图片的 title 和 description 字段
      if (!image.title) {
        image.title = { zh: '', en: '' };
      }
      if (!image.description) {
        image.description = { zh: '', en: '' };
      }
      // 如果没有 title 但有 caption，将 caption 复制到 title
      if (image.caption && (!image.title.zh || !image.title.en)) {
        if (!image.title.zh) image.title.zh = image.caption.zh || '';
        if (!image.title.en) image.title.en = image.caption.en || '';
      }
    },
    
    addCodeRepo() {
      if (!this.editingProject.codeRepos) {
        this.editingProject.codeRepos = [];
      }
      this.editingProject.codeRepos.push({
        id: Date.now(),
        name: '',
        url: ''
      });
    },
    
    removeCodeRepo(index) {
      this.editingProject.codeRepos.splice(index, 1);
    },
    
    async removeImage(index) {
      const oldImageUrl = this.editingProject.images[index].url;
      
      // 如果是本地上传的图片，从服务器删除
      if (oldImageUrl && oldImageUrl.startsWith('/uploads/')) {
        try {
          await fetch(`${API_BASE_URL}/upload/image`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ filename: oldImageUrl.replace('/uploads/', '') })
          });
        } catch (error) {
          console.error('Failed to delete old image:', error);
        }
      }
      
      this.editingProject.images.splice(index, 1);
    },
    
    moveImageUp(index) {
      if (index > 0) {
        const temp = this.editingProject.images[index];
        this.editingProject.images[index] = this.editingProject.images[index - 1];
        this.editingProject.images[index - 1] = temp;
        // 重新初始化图标
        this.$nextTick(() => {
          feather.replace();
        });
      }
    },
    
    moveImageDown(index) {
      if (index < this.editingProject.images.length - 1) {
        const temp = this.editingProject.images[index];
        this.editingProject.images[index] = this.editingProject.images[index + 1];
        this.editingProject.images[index + 1] = temp;
        // 重新初始化图标
        this.$nextTick(() => {
          feather.replace();
        });
      }
    },
    
    async handleThumbnailUpload(event) {
      const file = event.target.files[0];
      if (file) {
        try {
          const result = await apiService.uploadImage(file);
          this.editingProject.thumbnail = result.url;
        } catch (error) {
          alert('图片上传失败，请重试');
          console.error('Thumbnail upload error:', error);
        }
      }
    },
    
    async handleProjectImageUpload(event, index) {
      const file = event.target.files[0];
      if (file) {
        try {
          // 删除旧图片
          const oldImageUrl = this.editingProject.images[index].url;
          if (oldImageUrl && oldImageUrl.startsWith('/uploads/')) {
            try {
              await fetch(`${API_BASE_URL}/upload/image`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ filename: oldImageUrl.replace('/uploads/', '') })
              });
            } catch (error) {
              console.error('Failed to delete old image:', error);
            }
          }
          
          // 上传新图片
          const result = await apiService.uploadImage(file);
          this.editingProject.images[index].url = result.url;
        } catch (error) {
          alert('图片上传失败，请重试');
          console.error('Image upload error:', error);
        }
      }
    },
    
    async handleAvatarUpload(event) {
      const file = event.target.files[0];
      if (file) {
        try {
          // 删除旧头像
          const oldAvatarUrl = this.aboutMeData.avatar;
          if (oldAvatarUrl && oldAvatarUrl.startsWith('/uploads/')) {
            try {
              await fetch(`${API_BASE_URL}/upload/image`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ filename: oldAvatarUrl.replace('/uploads/', '') })
              });
            } catch (error) {
              console.error('Failed to delete old avatar:', error);
            }
          }
          
          // 上传新头像
          const result = await apiService.uploadImage(file);
          this.aboutMeData.avatar = result.url;
        } catch (error) {
          alert('头像上传失败，请重试');
          console.error('Avatar upload error:', error);
        }
      }
    },

    async openAboutEdit() {
      await this.loadAboutMe();
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

    toggleBold(bioObj, lang) {
      // 简化的加粗功能：在文本末尾添加 ** ** 作为示例
      // 实际项目中可以使用更复杂的编辑器库
      if (!bioObj[lang]) {
        bioObj[lang] = '**加粗文本**';
      } else {
        bioObj[lang] += ' **加粗文本**';
      }
    },
    
    formatText(text) {
      if (!text) return '';
      // 处理加粗格式 **text**
      return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    },

    saveAboutMe() {
      apiService.saveAboutMe(this.aboutMeData);
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

    async resetProjectIds() {
      if (confirm('确定要重置所有项目 ID 吗？这将会按照当前项目列表的顺序重新分配 ID（从 1 开始）。')) {
        try {
          // 重新排序项目 ID
          const updatedProjects = this.projects.map((project, index) => ({
            ...project,
            id: index + 1
          }));
          
          console.log('Resetting project IDs:', updatedProjects.map(p => ({ id: p.id, title: p.title.zh || p.title.en })));
          
          // 批量保存所有项目
          const result = await apiService.saveAllProjects(updatedProjects);
          console.log('Save result:', result);
          
          // 重新加载项目列表
          await this.loadProjects();
          
          alert('项目 ID 已重置成功！');
        } catch (error) {
          console.error('Reset project IDs error:', error);
          alert('重置项目 ID 失败，请重试');
        }
      }
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
      link.download = resume.originalName || resume.fileName;
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
    },
    
    async handleDragEnd() {
      try {
        // 重新排序项目 ID
        const updatedProjects = this.projects.map((project, index) => ({
          ...project,
          id: index + 1
        }));
        
        console.log('Updating project order:', updatedProjects.map(p => ({ id: p.id, title: p.title.zh || p.title.en })));
        
        // 批量保存所有项目
        await apiService.saveAllProjects(updatedProjects);
        
        // 重新加载项目列表
        await this.loadProjects();
        
        alert('项目排序已更新成功！');
      } catch (error) {
        console.error('Update project order error:', error);
        alert('更新项目排序失败，请重试');
      }
    }
  }
};
</script>

<template>
  <div class="container mx-auto mt-10 p-4">
    <div class="flex justify-between items-center mb-8">
      <h1 class="font-general-semibold text-3xl text-ternary-dark dark:text-ternary-light">
        管理后台
      </h1>
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2 px-3 py-1 rounded-lg" :class="backendAvailable ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'">
          <span class="w-2 h-2 rounded-full" :class="backendAvailable ? 'bg-green-500' : 'bg-yellow-500'"></span>
          <span class="text-sm">{{ backendAvailable ? '后端已连接' : '仅前端模式' }}</span>
        </div>
        <button
          @click="resetData"
          class="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
        >
          重置数据
        </button>
        <button
          @click="logout"
          class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
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
            'px-4 py-2 font-general-semibold rounded-t-lg transition-colors',
            activeTab === 'projects'
              ? 'bg-blue-500 text-white'
              : 'text-ternary-dark dark:text-ternary-light hover:bg-gray-100 dark:hover:bg-gray-800'
          ]"
        >
          <i data-feather="folder" class="w-4 h-4 inline mr-2"></i>
          项目管理
        </button>
        <button
          @click="activeTab = 'about'"
          :class="[
            'px-4 py-2 font-general-semibold rounded-t-lg transition-colors',
            activeTab === 'about'
              ? 'bg-blue-500 text-white'
              : 'text-ternary-dark dark:text-ternary-light hover:bg-gray-100 dark:hover:bg-gray-800'
          ]"
        >
          <i data-feather="user" class="w-4 h-4 inline mr-2"></i>
          关于我
        </button>
        <button
          @click="activeTab = 'resumes'"
          :class="[
            'px-4 py-2 font-general-semibold rounded-t-lg transition-colors',
            activeTab === 'resumes'
              ? 'bg-blue-500 text-white'
              : 'text-ternary-dark dark:text-ternary-light hover:bg-gray-100 dark:hover:bg-gray-800'
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
          class="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-general-semibold"
        >
          <i data-feather="plus" class="w-4 h-4 inline mr-2"></i>
          新建项目
        </button>
      </div>

      <div class="mb-4 flex justify-between items-center">
        <h3 class="font-general-semibold text-xl text-ternary-dark dark:text-ternary-light">项目列表</h3>
        <button
          @click="resetProjectIds"
          class="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm inline-flex items-center gap-2"
          title="删除项目后重新排序 ID"
        >
          <i data-feather="refresh-cw" class="w-4 h-4"></i>
          重置所有项目 ID
        </button>
      </div>
      
      <div class="bg-secondary-light dark:bg-ternary-dark rounded-xl shadow-lg overflow-hidden">
        <table class="w-full">
          <thead class="bg-primary-light dark:bg-secondary-dark">
            <tr>
              <th class="px-6 py-4 text-left font-general-semibold text-ternary-dark dark:text-ternary-light">ID</th>
              <th class="px-6 py-4 text-left font-general-semibold text-ternary-dark dark:text-ternary-light">项目标题</th>
              <th class="px-6 py-4 text-left font-general-semibold text-ternary-dark dark:text-ternary-light">分类</th>
              <th class="px-6 py-4 text-left font-general-semibold text-ternary-dark dark:text-ternary-light">日期</th>
              <th class="px-6 py-4 text-right font-general-semibold text-ternary-dark dark:text-ternary-light">操作</th>
            </tr>
          </thead>
          <draggable
            v-model="projects"
            @end="handleDragEnd"
            item-key="id"
            handle=".drag-handle"
            tag="tbody"
          >
            <template #item="{ element: project }">
              <tr class="border-t border-gray-200 dark:border-secondary-dark">
                <td class="px-6 py-4 text-ternary-dark dark:text-ternary-light font-mono text-left">
                  <div class="flex items-center">
                    <div class="drag-handle cursor-move mr-2">
                      <i data-feather="move" class="w-4 h-4"></i>
                    </div>
                    {{ project.id }}
                  </div>
                </td>
                <td class="px-6 py-4 text-ternary-dark dark:text-ternary-light text-left">
                  {{ t(project.title) }}
                </td>
                <td class="px-6 py-4 text-ternary-dark dark:text-ternary-light text-left">
                  {{ t(project.category) }}
                </td>
                <td class="px-6 py-4 text-ternary-dark dark:text-ternary-light text-left">
                  {{ project.date }}
                </td>
                <td class="px-6 py-4 text-right">
                  <button
                    @click="editProject(project)"
                    class="px-3 py-1 mr-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    <i data-feather="edit" class="w-4 h-4 inline"></i>
                    编辑
                  </button>
                  <button
                    @click="deleteProject(project.id)"
                    class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    <i data-feather="trash" class="w-4 h-4 inline"></i>
                    删除
                  </button>
                </td>
              </tr>
            </template>
          </draggable>
        </table>
      </div>
    </div>

    <div v-if="activeTab === 'about'">
      <div class="mb-6">
        <button
          @click="openAboutEdit"
          class="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-general-semibold"
        >
          <i data-feather="edit" class="w-4 h-4 inline mr-2"></i>
          编辑关于我
        </button>
      </div>

      <div class="bg-secondary-light dark:bg-ternary-dark rounded-xl shadow-lg p-6">
        <h3 class="font-general-semibold text-xl text-ternary-dark dark:text-ternary-light mb-4">当前关于我内容</h3>
        <div v-for="bio in aboutMeData?.bios" :key="bio.id" class="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div class="mb-2">
            <h4 class="font-general-medium text-lg text-ternary-dark dark:text-ternary-light mb-1">中文</h4>
            <p class="text-ternary-dark dark:text-ternary-light" v-html="formatText(bio.bio?.zh)"></p>
          </div>
          <div>
            <h4 class="font-general-medium text-lg text-ternary-dark dark:text-ternary-light mb-1">English</h4>
            <p class="text-ternary-dark dark:text-ternary-light" v-html="formatText(bio.bio?.en)"></p>
          </div>
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
                  : 'bg-green-500 text-white hover:bg-green-600'
              ]"
              :disabled="isUploading"
            >
              <i data-feather="upload" class="w-4 h-4"></i>
              {{ isUploading ? '上传中...' : '上传简历' }}
            </label>
          </div>
          
          <div v-else class="flex-1 bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
            <p class="text-yellow-800 dark:text-yellow-200 text-sm flex items-center gap-2">
              <i data-feather="info" class="w-4 h-4"></i>
              仅前端模式：请将简历文件放到 <code class="bg-yellow-200 dark:bg-yellow-800 px-2 py-1 rounded">public/files/cv</code> 目录
            </p>
          </div>
          
          <button
            v-if="resumeVersions.length > 0"
            @click="exportConfig"
            class="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 inline-flex items-center gap-2"
          >
            <i data-feather="copy" class="w-4 h-4"></i>
            复制配置
          </button>
          
          <button
            @click="loadResumes"
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 inline-flex items-center gap-2"
          >
            <i data-feather="refresh-cw" class="w-4 h-4"></i>
            刷新
          </button>
        </div>
      </div>

      <div v-if="resumeVersions.length === 0" class="bg-secondary-light dark:bg-ternary-dark rounded-xl shadow-lg p-12 text-center">
        <i data-feather="file-text" class="w-16 h-16 mx-auto text-gray-400 mb-4"></i>
        <p class="text-ternary-dark dark:text-ternary-light text-lg">暂无简历</p>
        <p class="text-gray-500 dark:text-gray-400 mt-2">
          {{ backendAvailable ? '点击上方按钮上传简历' : '请在 public/files/cv 目录下添加简历文件后刷新' }}
        </p>
      </div>

      <div v-else class="grid gap-4">
        <div
          v-for="resume in resumeVersions"
          :key="resume.id"
          :class="[
            'bg-secondary-light dark:bg-ternary-dark rounded-xl shadow-lg p-6 transition-all',
            resume.isCurrent ? 'ring-2 ring-green-500' : ''
          ]"
        >
          <div class="flex flex-wrap items-start gap-4">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <i data-feather="file-text" class="w-6 h-6 text-blue-600 dark:text-blue-400"></i>
              </div>
            </div>
            
            <div class="flex-grow min-w-0">
              <div class="flex items-center gap-3 mb-2">
                <h4 class="font-general-semibold text-lg text-ternary-dark dark:text-ternary-light truncate">
                  {{ resume.alias }}
                </h4>
                <span v-if="resume.isCurrent" class="px-2 py-1 bg-green-500 text-white text-xs rounded flex-shrink-0">
                  当前使用
                </span>
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400 truncate">
                {{ resume.originalName || resume.fileName }}
              </p>
              <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                上传时间: {{ formatDateTime(resume.createdAt) }}
              </p>
            </div>
            
            <div class="flex flex-wrap gap-2 flex-shrink-0">
              <button
                v-if="!resume.isCurrent"
                @click="setCurrentResume(resume.id)"
                class="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm inline-flex items-center gap-1"
              >
                <i data-feather="star" class="w-4 h-4"></i>
                设为当前
              </button>
              
              <button
                @click="startEditAlias(resume)"
                class="px-3 py-1.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm inline-flex items-center gap-1"
              >
                <i data-feather="edit-2" class="w-4 h-4"></i>
                别名
              </button>
              
              <button
                @click="downloadResume(resume)"
                class="px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm inline-flex items-center gap-1"
              >
                <i data-feather="download" class="w-4 h-4"></i>
                下载
              </button>
              
              <button
                @click="deleteResume(resume.id)"
                class="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm inline-flex items-center gap-1"
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
                class="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-ternary-dark dark:text-ternary-light"
                placeholder="输入别名"
                @keyup.enter="saveResumeAlias"
                @keyup.escape="cancelEditAlias"
              />
              <button @click="saveResumeAlias" class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                保存
              </button>
              <button @click="cancelEditAlias" class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
                取消
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isProjectModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-secondary-light dark:bg-ternary-dark rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200 dark:border-secondary-dark">
          <div class="flex justify-between items-center">
            <h2 class="font-general-semibold text-2xl text-ternary-dark dark:text-ternary-light">
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
              <label class="block font-general-medium text-ternary-dark dark:text-ternary-light mb-2">
                标题 (中文)
              </label>
              <input
                v-model="editingProject.title.zh"
                type="text"
                class="w-full px-4 py-2 border border-gray-200 dark:border-secondary-dark rounded-lg"
              />
            </div>
            <div>
              <label class="block font-general-medium text-ternary-dark dark:text-ternary-light mb-2">
                Title (English)
              </label>
              <input
                v-model="editingProject.title.en"
                type="text"
                class="w-full px-4 py-2 border border-gray-200 dark:border-secondary-dark rounded-lg"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block font-general-medium text-ternary-dark dark:text-ternary-light mb-2">
                分类 (中文)
              </label>
              <input
                v-model="editingProject.category.zh"
                type="text"
                class="w-full px-4 py-2 border border-gray-200 dark:border-secondary-dark rounded-lg"
              />
            </div>
            <div>
              <label class="block font-general-medium text-ternary-dark dark:text-ternary-light mb-2">
                Category (English)
              </label>
              <input
                v-model="editingProject.category.en"
                type="text"
                class="w-full px-4 py-2 border border-gray-200 dark:border-secondary-dark rounded-lg"
              />
            </div>
            <div>
              <label class="block font-general-medium text-ternary-dark dark:text-ternary-light mb-2">
                日期
              </label>
              <input
                v-model="editingProject.date"
                type="date"
                class="w-full px-4 py-2 border border-gray-200 dark:border-secondary-dark rounded-lg"
              />
            </div>
          </div>

          <div>
            <label class="block font-general-medium text-ternary-dark dark:text-ternary-light mb-2">
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
                  class="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mb-2 cursor-pointer"
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
                  class="w-full mt-2 px-3 py-2 border border-gray-200 dark:border-secondary-dark rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label class="block font-general-medium text-ternary-dark dark:text-ternary-light mb-2">
              标签 (逗号分隔)
            </label>
            <input
                v-model="tagsInput"
                @blur="updateTags"
                type="text"
                class="w-full px-4 py-2 border border-gray-200 dark:border-secondary-dark rounded-lg"
              />
          </div>

          <div class="border-t border-gray-200 dark:border-secondary-dark pt-6">
            <h3 class="font-general-semibold text-xl text-ternary-dark dark:text-ternary-light mb-4">
              代码仓库
            </h3>
            <div class="space-y-4">
              <div v-for="(repo, index) in editingProject.codeRepos" :key="repo.id || index" class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div class="md:col-span-1">
                  <label class="block font-general-medium text-ternary-dark dark:text-ternary-light mb-2">
                    仓库名称
                  </label>
                  <input
                    v-model="repo.name"
                    type="text"
                    class="w-full px-4 py-2 border border-gray-200 dark:border-secondary-dark rounded-lg"
                    placeholder="例如：My Project"
                  />
                </div>
                <div class="md:col-span-2">
                  <label class="block font-general-medium text-ternary-dark dark:text-ternary-light mb-2">
                    仓库网址
                  </label>
                  <input
                    v-model="repo.url"
                    type="url"
                    class="w-full px-4 py-2 border border-gray-200 dark:border-secondary-dark rounded-lg"
                    placeholder="https://github.com/username/repo"
                  />
                </div>
                <div class="md:col-span-3 text-right">
                  <button
                    @click="removeCodeRepo(index)"
                    class="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm inline-flex items-center gap-1"
                  >
                    <i data-feather="trash" class="w-3 h-3"></i>
                    删除
                  </button>
                </div>
              </div>
              
              <button
                @click="addCodeRepo"
                class="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 inline-flex items-center justify-center gap-2"
              >
                <i data-feather="plus" class="w-4 h-4"></i>
                添加代码仓库
              </button>
            </div>
          </div>

          <div class="border-t border-gray-200 dark:border-secondary-dark pt-6">
            <h3 class="font-general-semibold text-xl text-ternary-dark dark:text-ternary-light mb-4">
              项目目标
            </h3>
            <div class="space-y-4">
              <div>
                <label class="block font-general-medium text-ternary-dark dark:text-ternary-light mb-2">
                  目标 (中文)
                </label>
                <textarea
                  v-model="editingProject.objective.zh"
                  rows="3"
                  class="w-full px-4 py-2 border border-gray-200 dark:border-secondary-dark rounded-lg"
                ></textarea>
              </div>
              <div>
                <label class="block font-general-medium text-ternary-dark dark:text-ternary-light mb-2">
                  Objective (English)
                </label>
                <textarea
                  v-model="editingProject.objective.en"
                  rows="3"
                  class="w-full px-4 py-2 border border-gray-200 dark:border-secondary-dark rounded-lg"
                ></textarea>
              </div>
            </div>
          </div>

          <div>
            <label class="block font-general-medium text-ternary-dark dark:text-ternary-light mb-2">
              技术栈 (逗号分隔)
            </label>
            <input
              v-model="technologiesInput"
              @blur="updateTechnologies"
              type="text"
              class="w-full px-4 py-2 border border-gray-200 dark:border-secondary-dark rounded-lg"
            />
          </div>

          <div class="border-t border-gray-200 dark:border-secondary-dark pt-6">
            <h3 class="font-general-semibold text-xl text-ternary-dark dark:text-ternary-light mb-4">
              挑战
            </h3>
            <div class="space-y-4">
              <div>
                <label class="block font-general-medium text-ternary-dark dark:text-ternary-light mb-2">
                  挑战 (中文)
                </label>
                <textarea
                  v-model="editingProject.challenge.zh"
                  rows="3"
                  class="w-full px-4 py-2 border border-gray-200 dark:border-secondary-dark rounded-lg"
                ></textarea>
              </div>
              <div>
                <label class="block font-general-medium text-ternary-dark dark:text-ternary-light mb-2">
                  Challenge (English)
                </label>
                <textarea
                  v-model="editingProject.challenge.en"
                  rows="3"
                  class="w-full px-4 py-2 border border-gray-200 dark:border-secondary-dark rounded-lg"
                ></textarea>
              </div>
            </div>
          </div>

          <div class="border-t border-gray-200 dark:border-secondary-dark pt-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="font-general-semibold text-xl text-ternary-dark dark:text-ternary-light">
                详情段落
              </h3>
              <button
                @click="addDetail"
                class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                <i data-feather="plus" class="w-4 h-4 inline mr-1"></i>
                添加
              </button>
            </div>
            <div v-for="(detail, index) in editingProject.details" :key="detail.id" class="mb-4 p-4 border border-gray-200 dark:border-secondary-dark rounded-lg">
              <div class="flex justify-between items-center mb-2">
                <div class="flex gap-2">
                  <button
                    @click="moveDetailUp(index)"
                    :disabled="index === 0"
                    class="px-2 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i data-feather="arrow-up" class="w-3 h-3 inline"></i>
                  </button>
                  <button
                    @click="moveDetailDown(index)"
                    :disabled="index === editingProject.details.length - 1"
                    class="px-2 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i data-feather="arrow-down" class="w-3 h-3 inline"></i>
                  </button>
                </div>
                <button
                  @click="removeDetail(index)"
                  class="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                >
                  <i data-feather="x" class="w-3 h-3 inline mr-1"></i>
                  移除
                </button>
              </div>
              <div class="space-y-4">
                <div>
                  <label class="block font-general-medium text-ternary-dark dark:text-ternary-light mb-2">
                    内容 (中文)
                  </label>
                  <div class="flex gap-2 mb-2">
                    <button
                      @click="toggleDetailBold(detail, 'zh')"
                      class="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      <i data-feather="bold" class="w-4 h-4"></i>
                    </button>
                    <span class="text-sm text-gray-500 dark:text-gray-400">使用 **文本** 格式添加加粗</span>
                  </div>
                  <textarea
                    v-model="detail.content.zh"
                    rows="3"
                    class="w-full px-4 py-2 border border-gray-200 dark:border-secondary-dark rounded-lg"
                  ></textarea>
                </div>
                <div>
                  <label class="block font-general-medium text-ternary-dark dark:text-ternary-light mb-2">
                    Content (English)
                  </label>
                  <div class="flex gap-2 mb-2">
                    <button
                      @click="toggleDetailBold(detail, 'en')"
                      class="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      <i data-feather="bold" class="w-4 h-4"></i>
                    </button>
                    <span class="text-sm text-gray-500 dark:text-gray-400">Use **text** format to add bold</span>
                  </div>
                  <textarea
                    v-model="detail.content.en"
                    rows="3"
                    class="w-full px-4 py-2 border border-gray-200 dark:border-secondary-dark rounded-lg"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <div class="border-t border-gray-200 dark:border-secondary-dark pt-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="font-general-semibold text-xl text-ternary-dark dark:text-ternary-light">
                图片
              </h3>
              <button
                @click="addImage"
                class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                <i data-feather="plus" class="w-4 h-4 inline mr-1"></i>
                添加
              </button>
            </div>
            <div v-for="(image, index) in editingProject.images" :key="image.id" class="mb-4 p-4 border border-gray-200 dark:border-secondary-dark rounded-lg">
              <div class="flex justify-between items-center mb-2">
                <div class="flex gap-2">
                  <button
                    @click="moveImageUp(index)"
                    :disabled="index === 0"
                    class="px-2 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i data-feather="arrow-up" class="w-3 h-3 inline"></i>
                  </button>
                  <button
                    @click="moveImageDown(index)"
                    :disabled="index === editingProject.images.length - 1"
                    class="px-2 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i data-feather="arrow-down" class="w-3 h-3 inline"></i>
                  </button>
                </div>
                <button
                  @click="removeImage(index)"
                  class="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                >
                  <i data-feather="x" class="w-3 h-3 inline mr-1"></i>
                  移除
                </button>
              </div>
              <div class="space-y-4">
                <div>
                  <label class="block font-general-medium text-ternary-dark dark:text-ternary-light mb-2">
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
                        class="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mb-2 cursor-pointer"
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
                        class="w-full mt-2 px-3 py-2 border border-gray-200 dark:border-secondary-dark rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block font-general-medium text-ternary-dark dark:text-ternary-light mb-2">
                      标题 (中文)
                    </label>
                    <input
                      v-model="image.title.zh"
                      type="text"
                      class="w-full px-4 py-2 border border-gray-200 dark:border-secondary-dark rounded-lg"
                      placeholder="缩略图下方显示的标题"
                      @focus="initImageFields(image)"
                    />
                  </div>
                  <div>
                    <label class="block font-general-medium text-ternary-dark dark:text-ternary-light mb-2">
                      Title (English)
                    </label>
                    <input
                      v-model="image.title.en"
                      type="text"
                      class="w-full px-4 py-2 border border-gray-200 dark:border-secondary-dark rounded-lg"
                      placeholder="Title shown below thumbnail"
                      @focus="initImageFields(image)"
                    />
                  </div>
                </div>
                <div>
                  <label class="block font-general-medium text-ternary-dark dark:text-ternary-light mb-2">
                    描述 (中文)
                  </label>
                  <textarea
                    v-model="image.description.zh"
                    rows="3"
                    class="w-full px-4 py-2 border border-gray-200 dark:border-secondary-dark rounded-lg"
                    placeholder="大图中显示的详细描述，支持换行"
                    @focus="initImageFields(image)"
                  ></textarea>
                </div>
                <div>
                  <label class="block font-general-medium text-ternary-dark dark:text-ternary-light mb-2">
                    Description (English)
                  </label>
                  <textarea
                    v-model="image.description.en"
                    rows="3"
                    class="w-full px-4 py-2 border border-gray-200 dark:border-secondary-dark rounded-lg"
                    placeholder="Description shown in modal, supports line breaks"
                    @focus="initImageFields(image)"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label class="block font-general-medium text-ternary-dark dark:text-ternary-light mb-2">
              相关项目 ID (逗号分隔)
            </label>
            <input
              v-model="relatedProjectsInput"
              @blur="updateRelatedProjects"
              type="text"
              class="w-full px-4 py-2 border border-gray-200 dark:border-secondary-dark rounded-lg"
            />
          </div>
        </div>

        <div class="p-6 border-t border-gray-200 dark:border-secondary-dark flex justify-end gap-3">
          <button
            @click="isProjectModalOpen = false; editingProject = null"
            class="px-6 py-2 border border-gray-300 dark:border-secondary-dark rounded-lg text-ternary-dark dark:text-ternary-light hover:bg-gray-100 dark:hover:bg-secondary-dark"
          >
            取消
          </button>
          <button
            @click="saveProject"
            class="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            保存
          </button>
        </div>
      </div>
    </div>

    <div v-if="isAboutModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-secondary-light dark:bg-ternary-dark rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200 dark:border-secondary-dark">
          <div class="flex justify-between items-center">
            <h2 class="font-general-semibold text-2xl text-ternary-dark dark:text-ternary-light">
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
          <!-- 头像上传 -->
          <div class="mb-6">
            <h3 class="font-general-semibold text-xl text-ternary-dark dark:text-ternary-light mb-4">
              个人头像
            </h3>
            <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
              <input
                type="file"
                accept="image/*"
                @change="handleAvatarUpload"
                class="hidden"
                id="avatar-input"
              />
              <div class="text-center">
                <label
                  for="avatar-input"
                  class="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mb-2 cursor-pointer"
                >
                  选择或拖拽图片
                </label>
                <p class="text-sm text-gray-500 dark:text-gray-400">支持 JPG, PNG, GIF 等格式</p>
              </div>
              <div v-if="aboutMeData.avatar" class="mt-4">
                <img :src="aboutMeData.avatar" class="max-h-40 mx-auto rounded" />
                <input
                  v-model="aboutMeData.avatar"
                  type="text"
                  placeholder="或输入图片URL"
                  class="w-full mt-2 px-3 py-2 border border-gray-200 dark:border-secondary-dark rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          <div class="flex justify-between items-center">
            <h3 class="font-general-semibold text-xl text-ternary-dark dark:text-ternary-light">
              个人简介段落
            </h3>
            <button
              @click="addBio"
              class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <i data-feather="plus" class="w-4 h-4 inline mr-1"></i>
              添加段落
            </button>
          </div>
          
          <div v-for="(bio, index) in aboutMeData.bios" :key="bio.id" class="mb-4 p-4 border border-gray-200 dark:border-secondary-dark rounded-lg">
            <div class="flex justify-end mb-2">
              <button
                @click="removeBio(index)"
                class="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
              >
                <i data-feather="x" class="w-3 h-3 inline mr-1"></i>
                移除
              </button>
            </div>
            <div class="space-y-4">
              <div>
                <label class="block font-general-medium text-ternary-dark dark:text-ternary-light mb-2">
                  段落内容 (中文)
                </label>
                <div class="flex gap-2 mb-2">
                  <button
                    @click="toggleBold(bio.bio, 'zh')"
                    class="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <i data-feather="bold" class="w-4 h-4"></i>
                  </button>
                  <span class="text-sm text-gray-500 dark:text-gray-400">使用 **文本** 格式添加加粗</span>
                </div>
                <textarea
                  v-model="bio.bio.zh"
                  rows="3"
                  class="w-full px-4 py-2 border border-gray-200 dark:border-secondary-dark rounded-lg"
                ></textarea>
              </div>
              <div>
                <label class="block font-general-medium text-ternary-dark dark:text-ternary-light mb-2">
                  段落内容 (English)
                </label>
                <div class="flex gap-2 mb-2">
                  <button
                    @click="toggleBold(bio.bio, 'en')"
                    class="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <i data-feather="bold" class="w-4 h-4"></i>
                  </button>
                  <span class="text-sm text-gray-500 dark:text-gray-400">Use **text** format for bold</span>
                </div>
                <textarea
                  v-model="bio.bio.en"
                  rows="3"
                  class="w-full px-4 py-2 border border-gray-200 dark:border-secondary-dark rounded-lg"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <div class="p-6 border-t border-gray-200 dark:border-secondary-dark flex justify-end gap-3">
          <button
            @click="isAboutModalOpen = false"
            class="px-6 py-2 border border-gray-300 dark:border-secondary-dark rounded-lg text-ternary-dark dark:text-ternary-light hover:bg-gray-100 dark:hover:bg-secondary-dark"
          >
            取消
          </button>
          <button
            @click="saveAboutMe"
            class="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
