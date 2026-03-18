<script>
import feather from 'feather-icons';
import ProjectHeader from '../components/projects/ProjectHeader.vue';
import ProjectGallery from '../components/projects/ProjectGallery.vue';
import ProjectInfo from '../components/projects/ProjectInfo.vue';
import ProjectRelatedProjects from '../components/projects/ProjectRelatedProjects.vue';
import { apiService } from '../services/apiService';
import { useLanguage } from '../composables/useLanguage';
import { useRoute } from 'vue-router';

export default {
  name: 'SingleProject',
  components: {
    ProjectHeader,
    ProjectGallery,
    ProjectInfo,
    ProjectRelatedProjects,
  },
  setup() {
    const route = useRoute();
    const { t } = useLanguage();
    return { route, t };
  },
  data() {
    return {
      project: null,
      allProjects: [],
      isLoading: true
    };
  },
  computed: {
    singleProjectHeader() {
      if (!this.project) return {};
      return {
        singleProjectTitle: this.t(this.project.title),
        singleProjectDate: this.project.date,
        singleProjectTag: this.project.tags?.[0] || ''
      };
    },
    projectImages() {
      if (!this.project) return [];
      return (this.project.images || []).map(img => ({
        id: img.id,
        title: img.title ? this.t(img.title) : (img.caption ? this.t(img.caption) : ''),
        description: img.description ? this.t(img.description) : '',
        img: img.url
      }));
    },
    projectInfo() {
      if (!this.project) return {};
      const projectInfo = {};

      // 代码仓库板块
      const codeRepos = [];
      if (this.project.codeRepos && this.project.codeRepos.length > 0) {
        this.project.codeRepos.forEach((repo, index) => {
          if (repo.url && repo.url.trim()) {
            codeRepos.push({
              id: index + 1,
              title: repo.name || `Repository ${index + 1}`,
              details: repo.url,
              link: repo.url
            });
          }
        });
      }
      if (codeRepos.length > 0) {
        projectInfo.codeReposHeading = 'Code Repositories';
        projectInfo.codeRepos = codeRepos;
      }

      // 项目目标板块
      if (this.project.objective) {
        projectInfo.objectivesHeading = 'Objective';
        projectInfo.objectivesDetails = this.t(this.project.objective);
      }

      // 技术栈板块
      if (this.project.technologies && this.project.technologies.length > 0) {
        projectInfo.technologies = [
          {
            title: 'Tools & Technologies',
            techs: this.project.technologies
          }
        ];
      }

      // 项目挑战板块
      if (this.project.challenge) {
        projectInfo.challengeHeading = 'Challenge';
        projectInfo.challengeDetails = this.t(this.project.challenge);
      }

      // 项目详情板块
      if (this.project.details && this.project.details.length > 0) {
        projectInfo.projectDetailsHeading = 'Project Details';
        projectInfo.projectDetails = this.project.details.map(d => ({
          id: d.id,
          details: this.t(d.content) // 这里d.content已经在apiService中被格式化为HTML
        }));
      }

      return projectInfo;
    },
    relatedProject() {
      if (!this.project) return { relatedProjectsHeading: 'Related Projects', relatedProjects: [] };
      const related = (this.project.relatedProjects || []).map(id => 
        this.allProjects.find(p => p.id === id)
      ).filter(Boolean);
      
      return {
        relatedProjectsHeading: 'Related Projects',
        relatedProjects: related.map(p => ({
          id: p.id,
          title: this.t(p.title),
          img: p.thumbnail
        }))
      };
    }
  },
  mounted() {
    this.loadProject();
    feather.replace();
  },
  watch: {
    '$route.params.id': {
      immediate: true,
      handler() {
        this.loadProject();
      }
    }
  },
  updated() {
    feather.replace();
  },
  methods: {
    async loadProject() {
      this.isLoading = true;
      try {
        const projectId = parseInt(this.route.params.id);
        this.allProjects = await apiService.getProjects();
        this.project = await apiService.getProject(projectId);
        if (!this.project) {
          console.error('Project not found');
        }
      } catch (error) {
        console.error('Error loading project:', error);
      } finally {
        this.isLoading = false;
      }
    }
  },
};
</script>

<template>
  <div class="container mx-auto mt-10 sm:mt-20">
    <!-- Loading state -->
    <div v-if="isLoading" class="text-center py-20">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <p class="font-general-semibold text-xl text-ternary-dark dark:text-ternary-light mt-4">
        加载中...
      </p>
    </div>
    
    <div v-else-if="!project" class="text-center py-20">
      <p class="font-general-semibold text-xl text-ternary-dark dark:text-ternary-light">
        项目未找到
      </p>
    </div>
    
    <div v-else class="space-y-12">
      <!-- Project header -->
      <ProjectHeader :singleProjectHeader="singleProjectHeader" />

      <!-- Project gallery -->
      <ProjectGallery :projectImages="projectImages" />

      <!-- Project information -->
      <ProjectInfo :projectInfo="projectInfo" />

      <!-- Project related projects -->
      <ProjectRelatedProjects :relatedProject="relatedProject" />
    </div>
  </div>
</template>

<style scoped>
/* Loading animation */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
