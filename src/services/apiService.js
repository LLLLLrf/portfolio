const API_BASE_URL = 'http://localhost:3002/api';
const STORAGE_KEY_AUTH = 'portfolio_auth';
const STORAGE_KEY_ABOUT_ME = 'portfolio_about_me';
const STORAGE_KEY_RESUMES = 'portfolio_resumes';
const STORAGE_KEY_CONFIG = 'portfolio_config';
const STORAGE_KEY_PROJECTS = 'portfolio_projects_cache';
const STORAGE_KEY_GALLERY = 'portfolio_gallery_cache';
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

export const apiService = {
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await fetch(`${API_BASE_URL}/upload/image`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  },
  async checkBackendAvailable() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000) // 缩短超时时间，提高响应速度
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Backend available:', data.enabled);
        return data.enabled;
      }
      console.log('Backend response not ok');
      return false;
    } catch (error) {
      console.warn('Backend not available, falling back to static files');
      return false;
    }
  },

  async getProjects(skipCache = false) {
    const backendAvailable = await this.checkBackendAvailable();

    let projects;
    if (backendAvailable) {
      try {
        const response = await fetch(`${API_BASE_URL}/projects`);
        if (!response.ok) throw new Error('Failed to fetch');
        projects = await response.json();
      } catch (error) {
        console.warn('Backend failed, falling back to static file');
        projects = await this.getProjectsLocal();
      }
    } else {
      // 后端断开时，从静态文件读取数据，确保在任何设备上都能获取到最新数据
      console.log('Backend not available, loading projects from static file');
      projects = await this.getProjectsLocal();
    }

    return projects;
  },

  formatText(text) {
    if (!text) return '';
    // 处理加粗格式 **text** - 使用类名，让全局样式控制颜色
    return text.replace(/\*\*(.*?)\*\*/g, '<strong class="md-bold-text">$1</strong>');
  },

  async getProject(id) {
    const backendAvailable = await this.checkBackendAvailable();
    if (backendAvailable) {
      try {
        const response = await fetch(`${API_BASE_URL}/projects/${id}`);
        if (!response.ok) throw new Error('Failed to fetch');
        const project = await response.json();
        // 处理所有文本字段的加粗格式
        if (project.objective) {
          if (project.objective.zh) project.objective.zh = this.formatText(project.objective.zh);
          if (project.objective.en) project.objective.en = this.formatText(project.objective.en);
        }
        if (project.challenge) {
          if (project.challenge.zh) project.challenge.zh = this.formatText(project.challenge.zh);
          if (project.challenge.en) project.challenge.en = this.formatText(project.challenge.en);
        }
        if (project.details) {
          project.details.forEach(detail => {
            if (detail.content) {
              if (detail.content.zh) detail.content.zh = this.formatText(detail.content.zh);
              if (detail.content.en) detail.content.en = this.formatText(detail.content.en);
            }
          });
        }
        return project;
      } catch (error) {
        console.warn('Backend failed, falling back to localStorage');
      }
    }
    const projects = await this.getProjectsLocal();
    const project = projects.find(p => p.id === parseInt(id));
    // 处理所有文本字段的加粗格式
    if (project) {
      if (project.objective) {
        if (project.objective.zh) project.objective.zh = this.formatText(project.objective.zh);
        if (project.objective.en) project.objective.en = this.formatText(project.objective.en);
      }
      if (project.challenge) {
        if (project.challenge.zh) project.challenge.zh = this.formatText(project.challenge.zh);
        if (project.challenge.en) project.challenge.en = this.formatText(project.challenge.en);
      }
      if (project.details) {
        project.details.forEach(detail => {
          if (detail.content) {
            if (detail.content.zh) detail.content.zh = this.formatText(detail.content.zh);
            if (detail.content.en) detail.content.en = this.formatText(detail.content.en);
          }
        });
      }
    }
    return project;
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
        // 清除缓存，确保下次加载最新数据
        localStorage.removeItem(STORAGE_KEY_PROJECTS);
        return savedProject;
      } catch (error) {
        console.warn('Backend failed, falling back to localStorage:', error);
      }
    }
    console.log('Saving project to localStorage:', project.id);
    const savedProject = this.saveProjectLocal(project);
    // 清除缓存，确保下次加载最新数据
    localStorage.removeItem(STORAGE_KEY_PROJECTS);
    return savedProject;
  },

  async saveAllProjects(projects) {
    const backendAvailable = await this.checkBackendAvailable();
    if (backendAvailable) {
      try {
        console.log('Saving all projects to backend');
        const response = await fetch(`${API_BASE_URL}/projects`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(projects),
        });
        if (!response.ok) throw new Error('Failed to save');
        const result = await response.json();
        console.log('All projects saved to backend');
        // 清除缓存，确保下次加载最新数据
        localStorage.removeItem(STORAGE_KEY_PROJECTS);
        return result;
      } catch (error) {
        console.warn('Backend failed, falling back to localStorage:', error);
      }
    }
    console.log('Saving all projects to localStorage');
    const result = this.saveAllProjectsLocal(projects);
    // 清除缓存，确保下次加载最新数据
    localStorage.removeItem(STORAGE_KEY_PROJECTS);
    return result;
  },

  async deleteProject(id) {
    const backendAvailable = await this.checkBackendAvailable();
    if (backendAvailable) {
      try {
        const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          // 清除缓存，确保下次加载最新数据
          localStorage.removeItem(STORAGE_KEY_PROJECTS);
          return true;
        }
      } catch (error) {
        console.warn('Backend failed, falling back to localStorage');
      }
    }
    const result = this.deleteProjectLocal(id);
    // 清除缓存，确保下次加载最新数据
    localStorage.removeItem(STORAGE_KEY_PROJECTS);
    return result;
  },

  async resetData() {
    const backendAvailable = await this.checkBackendAvailable();
    if (backendAvailable) {
      try {
        const response = await fetch(`${API_BASE_URL}/reset`, {
          method: 'POST',
        });
        if (response.ok) {
          // 清除缓存，确保下次加载最新数据
          localStorage.removeItem(STORAGE_KEY_PROJECTS);
          return true;
        }
      } catch (error) {
        console.warn('Backend failed, falling back to localStorage');
      }
    }
    const result = this.resetDataLocal();
    // 清除缓存，确保下次加载最新数据
    localStorage.removeItem(STORAGE_KEY_PROJECTS);
    return result;
  },

  async getProjectsLocal() {
    // 直接从后端数据文件读取，不从 localStorage 读取
    // 这样可以确保显示的是服务器上的最新静态数据
    try {
      // 使用 fetch 读取 JSON 文件，添加时间戳避免缓存
      const timestamp = Date.now();
      const response = await fetch(`/data/projects.json?t=${timestamp}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded projects from static file');
        return data;
      }
    } catch (error) {
      console.error('Failed to load static projects data:', error);
    }
    
    // 如果静态文件加载失败，返回默认数据
    return this.getDefaultProjects();
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

  saveAllProjectsLocal(projects) {
    localStorage.setItem('portfolio_projects', JSON.stringify(projects));
    return true;
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
        console.warn('Backend failed, falling back to static file');
      }
    }
    console.log('Backend not available, loading about me from static file');
    return await this.getAboutMeLocal();
  },

  async getAboutMeLocal() {
    // 直接从后端数据文件读取，不从 localStorage 读取
    // 这样可以确保显示的是服务器上的最新静态数据
    try {
      // 使用 fetch 读取 JSON 文件，添加时间戳避免缓存
      const timestamp = Date.now();
      const response = await fetch(`/data/about.json?t=${timestamp}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded about data from static file');
        return data;
      }
    } catch (error) {
      console.error('Failed to load static about data:', error);
    }
    
    // 如果静态文件加载失败，返回默认数据
    return {
      avatar: '/assets/images/profile.jpg',
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
        const resumes = await response.json();
        return resumes;
      } catch (error) {
        console.warn('Backend failed, falling back to static file');
      }
    }
    
    // 从静态文件读取简历数据，确保在任何设备上都能获取到最新数据
    console.log('Backend not available, loading resumes from static file');
    return this.getResumesLocal();
  },

  async getResumesLocal() {
    try {
      // 尝试从静态文件读取配置
      const response = await fetch('/files/cv/config.json');
      if (response.ok) {
        const config = await response.json();
        console.log('Raw static config:', config);
        
        // 直接使用配置文件中的configs数据
        let configs = config.configs || [];
        
        // 确保每个简历都有fileName，并且指向实际存在的文件
        configs = configs.map(resume => {
          // 如果没有originalName，用fileName
          if (!resume.originalName) {
            resume.originalName = resume.fileName;
          }
          // 如果没有alias，用originalName
          if (!resume.alias) {
            resume.alias = resume.originalName.replace(/\.[^/.]+$/, '');
          }
          return resume;
        });
        
        configs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        
        if (configs.length > 0 && !configs.some(c => c.isCurrent)) {
          configs[0].isCurrent = true;
        }
        
        console.log('Loaded resumes from static config file:', configs);
        return { 
          files: config.files || configs.map(c => c.fileName), 
          configs 
        };
      } else {
        console.warn('Config file not found, trying to load from local storage as fallback');
        const savedConfigs = this.getResumeConfigsLocal();
        if (savedConfigs.length > 0) {
          console.log('Loaded resumes from localStorage fallback');
          return { files: savedConfigs.map(c => c.fileName), configs: savedConfigs };
        }
      }
    } catch (e) {
      console.error('Failed to load resumes:', e);
      const savedConfigs = this.getResumeConfigsLocal();
      if (savedConfigs.length > 0) {
        console.log('Loaded resumes from localStorage fallback');
        return { files: savedConfigs.map(c => c.fileName), configs: savedConfigs };
      }
    }
    
    console.log('No resumes found, returning empty array');
    return { files: [], configs: [] };
  },

  getResumeConfigsLocal() {
    const stored = localStorage.getItem(STORAGE_KEY_RESUMES);
    return stored ? JSON.parse(stored) : [];
  },

  async uploadResume(file) {
    console.log('apiService uploading file:', {
      name: file.name,
      type: file.type,
      size: file.size
    });
    
    const backendAvailable = await this.checkBackendAvailable();
    if (backendAvailable) {
      try {
        const formData = new FormData();
        formData.append('resume', file);
        // 使用自定义头部传递文件名，避免编码问题
        const headers = new Headers();
        headers.append('X-File-Name', encodeURIComponent(file.name));
        
        const response = await fetch(`${API_BASE_URL}/resumes/upload`, {
          method: 'POST',
          headers: headers,
          body: formData
        });
        console.log('Response status:', response.status, response.statusText);
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error('Failed to upload');
        }
        const result = await response.json();
        console.log('Upload result from server:', result);
        return result;
      } catch (error) {
        console.warn('Backend failed, upload not available in local mode:', error);
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
    const config = await this.getResumes();
    return config.configs;
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

  async setResumeFilename(id, newFilename) {
    const backendAvailable = await this.checkBackendAvailable();
    if (backendAvailable) {
      try {
        const response = await fetch(`${API_BASE_URL}/resumes/${id}/filename`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newFilename })
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
      configs[idx].originalName = newFilename;
    }
    localStorage.setItem(STORAGE_KEY_RESUMES, JSON.stringify(configs));
    return { id, originalName: newFilename };
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
  },

  async getConfig() {
    const backendAvailable = await this.checkBackendAvailable();
    if (backendAvailable) {
      try {
        const response = await fetch(`${API_BASE_URL}/config`);
        if (!response.ok) throw new Error('Failed to fetch');
        const config = await response.json();
        return config;
      } catch (error) {
        console.warn('Backend failed, falling back to static file');
      }
    }
    
    // 从静态文件读取配置，确保在任何设备上都能获取到最新数据
    console.log('Backend not available, loading config from static file');
    return await this.getConfigLocal();
  },

  async getConfigLocal() {
    try {
      const timestamp = Date.now();
      const response = await fetch(`/data/config.json?t=${timestamp}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded config from static file');
        return data;
      }
    } catch (error) {
      console.error('Failed to load static config:', error);
    }
    
    return {
      extraSections: {
        gallery: { enabled: false },
        resume: { enabled: false, selectedResumeId: null }
      }
    };
  },

  async saveConfig(data) {
    const backendAvailable = await this.checkBackendAvailable();
    if (backendAvailable) {
      try {
        console.log('Saving config to backend');
        const response = await fetch(`${API_BASE_URL}/config`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to save');
        const savedData = await response.json();
        console.log('Config saved to backend');
        // 同时保存到localStorage，在同一设备上提供更好的用户体验
        this.saveConfigLocal(data);
        return savedData;
      } catch (error) {
        console.warn('Backend failed, falling back to localStorage:', error);
      }
    }
    console.log('Saving config to localStorage');
    this.saveConfigLocal(data);
  },

  saveConfigLocal(data) {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(data));
  },

  async getGallery(skipCache = false) {
    const backendAvailable = await this.checkBackendAvailable();

    let gallery;
    if (backendAvailable) {
      try {
        const response = await fetch(`${API_BASE_URL}/gallery`);
        if (!response.ok) throw new Error('Failed to fetch');
        gallery = await response.json();
      } catch (error) {
        console.warn('Backend failed, falling back to static file');
        gallery = await this.getGalleryLocal();
      }
    } else {
      // 后端断开时，从静态文件读取数据，确保在任何设备上都能获取到最新数据
      console.log('Backend not available, loading gallery from static file');
      gallery = await this.getGalleryLocal();
    }

    return gallery;
  },

  async getGalleryLocal() {
    try {
      const timestamp = Date.now();
      const response = await fetch(`/data/gallery.json?t=${timestamp}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded gallery from static file');
        return data;
      }
    } catch (error) {
      console.error('Failed to load static gallery data:', error);
    }
    return [];
  },

  async saveGalleryImage(image) {
    const backendAvailable = await this.checkBackendAvailable();
    if (backendAvailable) {
      try {
        console.log('Saving gallery image to backend:', image.id);
        const response = await fetch(`${API_BASE_URL}/gallery`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(image),
        });
        if (!response.ok) throw new Error('Failed to save');
        const savedImage = await response.json();
        console.log('Gallery image saved to backend:', savedImage.id);
        // 清除缓存，确保下次加载最新数据
        localStorage.removeItem(STORAGE_KEY_GALLERY);
        return savedImage;
      } catch (error) {
        console.warn('Backend failed, falling back to localStorage:', error);
      }
    }
    console.log('Saving gallery image to localStorage:', image.id);
    const savedImage = this.saveGalleryImageLocal(image);
    // 清除缓存，确保下次加载最新数据
    localStorage.removeItem(STORAGE_KEY_GALLERY);
    return savedImage;
  },

  saveGalleryImageLocal(image) {
    const gallery = this.getGalleryLocal();
    const index = gallery.findIndex(img => img.id === image.id);
    if (index !== -1) {
      gallery[index] = image;
    } else {
      image.id = gallery.length ? Math.max(...gallery.map(img => img.id)) + 1 : 1;
      gallery.push(image);
    }
    localStorage.setItem('portfolio_gallery', JSON.stringify(gallery));
    return image;
  },

  async deleteGalleryImage(id) {
    const backendAvailable = await this.checkBackendAvailable();
    if (backendAvailable) {
      try {
        const response = await fetch(`${API_BASE_URL}/gallery/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          // 清除缓存，确保下次加载最新数据
          localStorage.removeItem(STORAGE_KEY_GALLERY);
          return true;
        }
      } catch (error) {
        console.warn('Backend failed, falling back to localStorage');
      }
    }
    const result = this.deleteGalleryImageLocal(id);
    // 清除缓存，确保下次加载最新数据
    localStorage.removeItem(STORAGE_KEY_GALLERY);
    return result;
  },

  deleteGalleryImageLocal(id) {
    const gallery = this.getGalleryLocal().filter(img => img.id !== id);
    localStorage.setItem('portfolio_gallery', JSON.stringify(gallery));
    return true;
  }
};
