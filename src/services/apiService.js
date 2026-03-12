const API_BASE_URL = 'http://localhost:3002/api';
const STORAGE_KEY_AUTH = 'portfolio_auth';
const STORAGE_KEY_ABOUT_ME = 'portfolio_about_me';
const STORAGE_KEY_RESUMES = 'portfolio_resumes';

export const apiService = {
  async checkBackendAvailable() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Backend available:', data.enabled);
        return data.enabled;
      }
      console.log('Backend response not ok');
      return false;
    } catch (error) {
      console.warn('Backend not available, falling back to local mode:', error);
      return false;
    }
  },

  async getProjects() {
    const backendAvailable = await this.checkBackendAvailable();
    if (backendAvailable) {
      try {
        const response = await fetch(`${API_BASE_URL}/projects`);
        if (!response.ok) throw new Error('Failed to fetch');
        return await response.json();
      } catch (error) {
        console.warn('Backend failed, falling back to localStorage');
      }
    }
    return await this.getProjectsLocal();
  },

  async getProject(id) {
    const backendAvailable = await this.checkBackendAvailable();
    if (backendAvailable) {
      try {
        const response = await fetch(`${API_BASE_URL}/projects/${id}`);
        if (!response.ok) throw new Error('Failed to fetch');
        return await response.json();
      } catch (error) {
        console.warn('Backend failed, falling back to localStorage');
      }
    }
    const projects = await this.getProjectsLocal();
    return projects.find(p => p.id === parseInt(id));
  },

  async saveProject(project) {
    const backendAvailable = await this.checkBackendAvailable();
    if (backendAvailable) {
      try {
        console.log('Saving project to backend:', project.id);
        const response = await fetch(`${API_BASE_URL}/projects`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(project),
        });
        if (!response.ok) throw new Error('Failed to save');
        const savedProject = await response.json();
        console.log('Project saved to backend:', savedProject.id);
        return savedProject;
      } catch (error) {
        console.warn('Backend failed, falling back to localStorage:', error);
      }
    }
    console.log('Saving project to localStorage:', project.id);
    return this.saveProjectLocal(project);
  },

  async deleteProject(id) {
    const backendAvailable = await this.checkBackendAvailable();
    if (backendAvailable) {
      try {
        const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) return true;
      } catch (error) {
        console.warn('Backend failed, falling back to localStorage');
      }
    }
    return this.deleteProjectLocal(id);
  },

  async resetData() {
    const backendAvailable = await this.checkBackendAvailable();
    if (backendAvailable) {
      try {
        const response = await fetch(`${API_BASE_URL}/reset`, {
          method: 'POST',
        });
        if (response.ok) return true;
      } catch (error) {
        console.warn('Backend failed, falling back to localStorage');
      }
    }
    return this.resetDataLocal();
  },

  async getProjectsLocal() {
    // 优先从静态文件读取数据，而不是 localStorage
    // 这样可以确保在没有后端的情况下也能显示最新的项目数据
    try {
      // 尝试从 src/data 目录加载静态数据文件
      const staticData = await import('@/data/projects.js');
      if (staticData && staticData.default) {
        console.log('Loaded projects from static file');
        return staticData.default;
      }
    } catch (error) {
      console.log('Failed to load static projects data, falling back to localStorage');
    }
    
    // 如果静态文件加载失败，回退到 localStorage
    const stored = localStorage.getItem('portfolio_projects');
    return stored ? JSON.parse(stored) : this.getDefaultProjects();
  },

  getDefaultProjects() {
    return [
      {
        id: 1,
        title: { zh: 'Google Health Platform', en: 'Google Health Platform' },
        category: { zh: 'Web 应用', en: 'Web Application' },
        thumbnail: '/assets/images/web-project-2.jpg',
        date: '2021-07-26',
        tags: ['UI/Frontend'],
        client: {
          name: { zh: 'Company Ltd', en: 'Company Ltd' },
          services: { zh: 'UI 设计和前端开发', en: 'UI Design & Frontend Development' },
          website: 'https://company.com',
          phone: '555 8888 888'
        },
        objective: {
          zh: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Optio, natus! Quibusdam enim quod in esse, mollitia molestias incidunt quas ipsa accusamus veniam.',
          en: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Optio, natus! Quibusdam enim quod in esse, mollitia molestias incidunt quas ipsa accusamus veniam.'
        },
        technologies: ['HTML', 'CSS', 'JavaScript', 'Vue.js', 'TailwindCSS', 'AdobeXD'],
        challenge: {
          zh: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit.',
          en: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit.'
        },
        details: [
          {
            id: 1,
            content: {
              zh: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Nihil vel illum asperiores dignissimos cumque quibusdam et fugiat voluptatem nobis suscipit explicabo, eaque consequatur nesciunt, fugit eligendi corporis laudantium adipisci soluta?',
              en: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Nihil vel illum asperiores dignissimos cumque quibusdam et fugiat voluptatem nobis suscipit explicabo, eaque consequatur nesciunt, fugit eligendi corporis laudantium adipisci soluta?'
            }
          }
        ],
        images: [
          {
            id: 1,
            url: '/assets/images/ui-project-1.jpg',
            caption: { zh: '项目管理界面', en: 'Project Management UI' }
          },
          {
            id: 2,
            url: '/assets/images/web-project-2.jpg',
            caption: { zh: 'Web 应用界面', en: 'Web Application Interface' }
          }
        ],
        relatedProjects: [2, 3]
      },
      {
        id: 2,
        title: { zh: 'Phoenix Digital Agency', en: 'Phoenix Digital Agency' },
        category: { zh: '移动应用', en: 'Mobile Application' },
        thumbnail: '/assets/images/mobile-project-2.jpg',
        date: '2021-08-15',
        tags: ['Mobile'],
        client: {
          name: { zh: 'Phoenix Agency', en: 'Phoenix Agency' },
          services: { zh: '移动应用开发', en: 'Mobile App Development' },
          website: 'https://phoenix.com'
        },
        objective: {
          zh: '创建一个现代化的移动应用界面',
          en: 'Create a modern mobile app interface'
        },
        technologies: ['React Native', 'TypeScript'],
        details: [
          {
            id: 1,
            content: {
              zh: '专注于用户体验设计',
              en: 'Focus on user experience design'
            }
          }
        ],
        images: [
          {
            id: 1,
            url: '/assets/images/mobile-project-2.jpg',
            caption: { zh: '移动应用界面', en: 'Mobile App Interface' }
          }
        ],
        relatedProjects: [1, 4]
      },
      {
        id: 3,
        title: { zh: '项目管理 UI', en: 'Project Management UI' },
        category: { zh: 'UI/UX 设计', en: 'UI/UX Design' },
        thumbnail: '/assets/images/ui-project-1.jpg',
        date: '2021-09-10',
        tags: ['UI/UX'],
        objective: {
          zh: '设计直观的项目管理界面',
          en: 'Design intuitive project management interface'
        },
        technologies: ['Figma', 'AdobeXD'],
        images: [
          {
            id: 1,
            url: '/assets/images/ui-project-1.jpg',
            caption: { zh: 'UI 设计稿', en: 'UI Design Mockup' }
          }
        ],
        relatedProjects: [1, 6]
      },
      {
        id: 4,
        title: { zh: '云存储平台', en: 'Cloud Storage Platform' },
        category: { zh: 'UI/UX 设计', en: 'UI/UX Design' },
        thumbnail: '/assets/images/ui-project-2.jpg',
        date: '2021-10-05',
        tags: ['UI/UX'],
        objective: {
          zh: '设计简洁的云存储界面',
          en: 'Design clean cloud storage interface'
        },
        technologies: ['Figma'],
        images: [
          {
            id: 1,
            url: '/assets/images/ui-project-2.jpg',
            caption: { zh: '云存储界面', en: 'Cloud Storage Interface' }
          }
        ],
        relatedProjects: [3, 5]
      },
      {
        id: 5,
        title: { zh: 'React 社交应用', en: 'React Social App' },
        category: { zh: '移动应用', en: 'Mobile Application' },
        thumbnail: '/assets/images/mobile-project-1.jpg',
        date: '2021-11-20',
        tags: ['Mobile'],
        objective: {
          zh: '构建社交应用',
          en: 'Build social application'
        },
        technologies: ['React', 'Redux', 'Node.js'],
        images: [
          {
            id: 1,
            url: '/assets/images/mobile-project-1.jpg',
            caption: { zh: '社交应用界面', en: 'Social App Interface' }
          }
        ],
        relatedProjects: [2, 6]
      },
      {
        id: 6,
        title: { zh: 'Apple Design System', en: 'Apple Design System' },
        category: { zh: 'Web 应用', en: 'Web Application' },
        thumbnail: '/assets/images/web-project-1.jpg',
        date: '2021-12-01',
        tags: ['Web', 'Design System'],
        objective: {
          zh: '创建设计系统',
          en: 'Create design system'
        },
        technologies: ['Vue.js', 'TailwindCSS'],
        images: [
          {
            id: 1,
            url: '/assets/images/web-project-1.jpg',
            caption: { zh: '设计系统展示', en: 'Design System Showcase' }
          }
        ],
        relatedProjects: [1, 3]
      }
    ];
  },

  saveProjectLocal(project) {
    const projects = this.getProjectsLocal();
    const index = projects.findIndex(p => p.id === project.id);
    if (index !== -1) {
      projects[index] = project;
    } else {
      project.id = projects.length ? Math.max(...projects.map(p => p.id)) + 1 : 1;
      projects.push(project);
    }
    localStorage.setItem('portfolio_projects', JSON.stringify(projects));
    return project;
  },

  deleteProjectLocal(id) {
    const projects = this.getProjectsLocal().filter(p => p.id !== id);
    localStorage.setItem('portfolio_projects', JSON.stringify(projects));
    return true;
  },

  resetDataLocal() {
    localStorage.setItem('portfolio_projects', JSON.stringify(this.getDefaultProjects()));
    return true;
  },

  authenticate(password) {
    const storedPassword = localStorage.getItem(STORAGE_KEY_AUTH);
    if (!storedPassword) {
      localStorage.setItem(STORAGE_KEY_AUTH, 'admin123');
      return password === 'admin123';
    }
    return password === storedPassword;
  },

  isAuthenticated() {
    return localStorage.getItem('portfolio_authenticated') === 'true';
  },

  setAuthenticated(status) {
    localStorage.setItem('portfolio_authenticated', status ? 'true' : 'false');
  },

  async getAboutMe() {
    const backendAvailable = await this.checkBackendAvailable();
    if (backendAvailable) {
      try {
        const response = await fetch(`${API_BASE_URL}/about`);
        if (!response.ok) throw new Error('Failed to fetch');
        return await response.json();
      } catch (error) {
        console.warn('Backend failed, falling back to localStorage');
      }
    }
    return this.getAboutMeLocal();
  },

  getAboutMeLocal() {
    const stored = localStorage.getItem(STORAGE_KEY_ABOUT_ME);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      bios: [
        {
          id: 1,
          bio: {
            zh: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            en: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
          }
        }
      ]
    };
  },

  async saveAboutMe(data) {
    const backendAvailable = await this.checkBackendAvailable();
    if (backendAvailable) {
      try {
        console.log('Saving about me to backend');
        const response = await fetch(`${API_BASE_URL}/about`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to save');
        const savedData = await response.json();
        console.log('About me saved to backend');
        return savedData;
      } catch (error) {
        console.warn('Backend failed, falling back to localStorage:', error);
      }
    }
    console.log('Saving about me to localStorage');
    this.saveAboutMeLocal(data);
  },

  saveAboutMeLocal(data) {
    localStorage.setItem(STORAGE_KEY_ABOUT_ME, JSON.stringify(data));
  },

  async getResumes() {
    const backendAvailable = await this.checkBackendAvailable();
    if (backendAvailable) {
      try {
        const response = await fetch(`${API_BASE_URL}/resumes`);
        if (!response.ok) throw new Error('Failed to fetch');
        return await response.json();
      } catch (error) {
        console.warn('Backend failed, falling back to local mode');
      }
    }
    
    return this.getResumesLocal();
  },

  async getResumesLocal() {
    try {
      const response = await fetch('/files/cv/config.json');
      if (response.ok) {
        const config = await response.json();
        const savedConfigs = this.getResumeConfigsLocal();
        
        const configs = (config.files || []).map(fileName => {
          const existing = savedConfigs.find(c => c.fileName === fileName);
          return {
            id: existing?.id || fileName.replace(/\.[^/.]+$/, ''),
            fileName: fileName,
            alias: existing?.alias || fileName.replace(/\.[^/.]+$/, ''),
            isCurrent: existing?.isCurrent || false,
            createdAt: existing?.createdAt || Date.now()
          };
        });
        
        configs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        
        if (configs.length > 0 && !configs.some(c => c.isCurrent)) {
          configs[0].isCurrent = true;
        }
        
        return { files: config.files || [], configs };
      }
    } catch (e) {
      console.error('Failed to load config.json:', e);
    }
    
    return { files: [], configs: [] };
  },

  getResumeConfigsLocal() {
    const stored = localStorage.getItem(STORAGE_KEY_RESUMES);
    return stored ? JSON.parse(stored) : [];
  },

  async uploadResume(file) {
    const backendAvailable = await this.checkBackendAvailable();
    if (backendAvailable) {
      try {
        const formData = new FormData();
        formData.append('resume', file);
        
        const response = await fetch(`${API_BASE_URL}/resumes/upload`, {
          method: 'POST',
          body: formData
        });
        if (!response.ok) throw new Error('Failed to upload');
        return await response.json();
      } catch (error) {
        console.warn('Backend failed, upload not available in local mode');
        throw new Error('上传功能需要后端支持');
      }
    }
    throw new Error('上传功能需要后端支持');
  },

  async setResumeAlias(id, alias) {
    const backendAvailable = await this.checkBackendAvailable();
    if (backendAvailable) {
      try {
        const response = await fetch(`${API_BASE_URL}/resumes/${id}/alias`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ alias })
        });
        if (!response.ok) throw new Error('Failed to update');
        return await response.json();
      } catch (error) {
        console.warn('Backend failed, falling back to local mode');
      }
    }
    
    const configs = this.getResumeConfigsLocal();
    const idx = configs.findIndex(c => c.id === id);
    if (idx !== -1) {
      configs[idx].alias = alias;
    }
    localStorage.setItem(STORAGE_KEY_RESUMES, JSON.stringify(configs));
    return { id, alias };
  },

  async setCurrentResume(id) {
    const backendAvailable = await this.checkBackendAvailable();
    if (backendAvailable) {
      try {
        const response = await fetch(`${API_BASE_URL}/resumes/${id}/current`, {
          method: 'PUT'
        });
        if (!response.ok) throw new Error('Failed to update');
        return await response.json();
      } catch (error) {
        console.warn('Backend failed, falling back to local mode');
      }
    }
    
    const configs = this.getResumeConfigsLocal();
    configs.forEach(c => {
      c.isCurrent = c.id === id;
    });
    localStorage.setItem(STORAGE_KEY_RESUMES, JSON.stringify(configs));
    return configs.find(c => c.id === id);
  },

  async deleteResume(id) {
    const backendAvailable = await this.checkBackendAvailable();
    if (backendAvailable) {
      try {
        const response = await fetch(`${API_BASE_URL}/resumes/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) return true;
      } catch (error) {
        console.warn('Backend failed, falling back to local mode');
      }
    }
    
    const configs = this.getResumeConfigsLocal().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY_RESUMES, JSON.stringify(configs));
    return true;
  },

  async getResumeConfigs() {
    const backendAvailable = await this.checkBackendAvailable();
    if (backendAvailable) {
      try {
        const config = await this.getResumes();
        return config.configs;
      } catch (error) {
        console.warn('Backend failed, falling back to local mode');
      }
    }
    return this.getResumeConfigsLocal();
  },

  async saveResumeConfigs(configs) {
    localStorage.setItem(STORAGE_KEY_RESUMES, JSON.stringify(configs));
  },

  async setResumeAliasById(id, alias) {
    return this.setResumeAlias(id, alias);
  },

  async setCurrentResumeById(id) {
    return this.setCurrentResume(id);
  },

  async changePassword(oldPassword, newPassword) {
    const backendAvailable = await this.checkBackendAvailable();
    if (backendAvailable) {
      try {
        const response = await fetch(`${API_BASE_URL}/change-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ oldPassword, newPassword }),
        });
        if (!response.ok) throw new Error('Failed to change password');
        const result = await response.json();
        if (result.success) {
          localStorage.setItem(STORAGE_KEY_AUTH, newPassword);
        }
        return result;
      } catch (error) {
        console.warn('Backend failed, falling back to localStorage');
      }
    }
    
    // 本地模式下的密码修改
    const storedPassword = localStorage.getItem(STORAGE_KEY_AUTH);
    if (!storedPassword) {
      localStorage.setItem(STORAGE_KEY_AUTH, 'admin123');
    }
    
    if (storedPassword === oldPassword) {
      localStorage.setItem(STORAGE_KEY_AUTH, newPassword);
      return { success: true, message: '密码修改成功' };
    } else {
      return { success: false, message: '旧密码错误' };
    }
  }
};
