const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const PASSWORD_FILE = path.join(__dirname, 'data', 'password.json');

const app = express();
const PORT = 3002;

const DATA_FILE = path.join(__dirname, 'data', 'projects.json');
const ABOUT_FILE = path.join(__dirname, 'data', 'about.json');
const CV_DIR = path.join(__dirname, 'public', 'files', 'cv');
const CV_CONFIG_FILE = path.join(CV_DIR, 'config.json');
const DATA_DIR = path.dirname(DATA_FILE);
const UPLOAD_DIR = path.join(__dirname, 'public', 'uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const defaultProjects = [
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

function loadProjects() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading projects:', error);
      return defaultProjects;
    }
  }
  return defaultProjects;
}

function saveProjects(projects) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(projects, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving projects:', error);
    return false;
  }
}

function loadAbout() {
  if (fs.existsSync(ABOUT_FILE)) {
    try {
      const data = fs.readFileSync(ABOUT_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading about data:', error);
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
    }
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
}

function saveAbout(aboutData) {
  try {
    fs.writeFileSync(ABOUT_FILE, JSON.stringify(aboutData, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving about data:', error);
    return false;
  }
}

function loadPassword() {
  if (fs.existsSync(PASSWORD_FILE)) {
    try {
      const data = fs.readFileSync(PASSWORD_FILE, 'utf8');
      const passwordData = JSON.parse(data);
      return passwordData.password;
    } catch (error) {
      console.error('Error loading password:', error);
      return 'admin123';
    }
  }
  return 'admin123';
}

function savePassword(password) {
  try {
    fs.writeFileSync(PASSWORD_FILE, JSON.stringify({ password }, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving password:', error);
    return false;
  }
}

app.use(cors());
app.use(express.json({ limit: '20mb' }));

const API_ENABLED = true;

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', enabled: API_ENABLED });
});

app.get('/api/projects', (req, res) => {
  if (!API_ENABLED) {
    return res.status(403).json({ error: 'API disabled' });
  }
  const projects = loadProjects();
  res.json(projects);
});

app.get('/api/projects/:id', (req, res) => {
  if (!API_ENABLED) {
    return res.status(403).json({ error: 'API disabled' });
  }
  const projects = loadProjects();
  const project = projects.find(p => p.id === parseInt(req.params.id));
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  res.json(project);
});

app.post('/api/projects', (req, res) => {
  if (!API_ENABLED) {
    return res.status(403).json({ error: 'API disabled' });
  }
  const projects = loadProjects();
  let project = req.body;
  
  if (project.id) {
    const index = projects.findIndex(p => p.id === project.id);
    if (index !== -1) {
      projects[index] = project;
    } else {
      project.id = projects.length ? Math.max(...projects.map(p => p.id)) + 1 : 1;
      projects.push(project);
    }
  } else {
    project.id = projects.length ? Math.max(...projects.map(p => p.id)) + 1 : 1;
    projects.push(project);
  }
  
  if (saveProjects(projects)) {
    res.json(project);
  } else {
    res.status(500).json({ error: 'Failed to save project' });
  }
});

app.put('/api/projects', (req, res) => {
  if (!API_ENABLED) {
    return res.status(403).json({ error: 'API disabled' });
  }
  const projects = req.body;
  
  if (!Array.isArray(projects)) {
    return res.status(400).json({ error: 'Invalid data format' });
  }
  
  if (saveProjects(projects)) {
    res.json({ success: true });
  } else {
    res.status(500).json({ error: 'Failed to save projects' });
  }
});

app.delete('/api/projects/:id', (req, res) => {
  if (!API_ENABLED) {
    return res.status(403).json({ error: 'API disabled' });
  }
  const projects = loadProjects();
  const filtered = projects.filter(p => p.id !== parseInt(req.params.id));
  
  if (saveProjects(filtered)) {
    res.json({ success: true });
  } else {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

app.post('/api/reset', (req, res) => {
  if (saveProjects(defaultProjects)) {
    res.json({ success: true });
  } else {
    res.status(500).json({ error: 'Failed to reset data' });
  }
});

app.get('/api/about', (req, res) => {
  if (!API_ENABLED) {
    return res.status(403).json({ error: 'API disabled' });
  }
  const aboutData = loadAbout();
  res.json(aboutData);
});

app.post('/api/about', (req, res) => {
  if (!API_ENABLED) {
    return res.status(403).json({ error: 'API disabled' });
  }
  const aboutData = req.body;
  
  if (saveAbout(aboutData)) {
    res.json(aboutData);
  } else {
    res.status(500).json({ error: 'Failed to save about data' });
  }
});

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const imageUpload = multer({ 
  storage: imageStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image file type'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const cvStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(CV_DIR)) {
      fs.mkdirSync(CV_DIR, { recursive: true });
    }
    cb(null, CV_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const cvUpload = multer({ 
  storage: cvStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

function loadCVConfig() {
  if (fs.existsSync(CV_CONFIG_FILE)) {
    try {
      const data = fs.readFileSync(CV_CONFIG_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading CV config:', error);
      return { files: [], configs: [] };
    }
  }
  return { files: [], configs: [] };
}

function saveCVConfig(config) {
  try {
    fs.writeFileSync(CV_CONFIG_FILE, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving CV config:', error);
    return false;
  }
}

app.get('/api/resumes', (req, res) => {
  if (!API_ENABLED) {
    return res.status(403).json({ error: 'API disabled' });
  }
  const config = loadCVConfig();
  
  const files = [];
  if (fs.existsSync(CV_DIR)) {
    const allFiles = fs.readdirSync(CV_DIR);
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    allFiles.forEach(file => {
      if (file !== 'config.json') {
        const ext = path.extname(file).toLowerCase();
        if (allowedTypes.includes(ext)) {
          files.push(file);
        }
      }
    });
  }
  
  config.files = files;
  
  config.configs = files.map(fileName => {
    const existing = config.configs.find(c => c.fileName === fileName);
    return {
      id: existing?.id || fileName.replace(/\.[^/.]+$/, ''),
      fileName: fileName,
      alias: existing?.alias || fileName.replace(/\.[^/.]+$/, ''),
      isCurrent: existing?.isCurrent || false,
      createdAt: existing?.createdAt || Date.now()
    };
  });
  
  config.configs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  
  if (config.configs.length > 0 && !config.configs.some(c => c.isCurrent)) {
    config.configs[0].isCurrent = true;
  }
  
  res.json(config);
});

app.post('/api/upload/image', imageUpload.single('image'), (req, res) => {
  if (!API_ENABLED) {
    return res.status(403).json({ error: 'API disabled' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    url: imageUrl,
    filename: req.file.filename
  });
});

app.delete('/api/upload/image', (req, res) => {
  if (!API_ENABLED) {
    return res.status(403).json({ error: 'API disabled' });
  }
  
  const { filename } = req.body;
  if (!filename) {
    return res.status(400).json({ error: 'Filename required' });
  }
  
  const filePath = path.join(UPLOAD_DIR, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

app.post('/api/resumes/upload', cvUpload.single('resume'), (req, res) => {
  if (!API_ENABLED) {
    return res.status(403).json({ error: 'API disabled' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const config = loadCVConfig();
  const MAX_VERSIONS = 20;
  const uploadTime = Date.now();
  
  const existing = config.configs.find(c => c.fileName === req.file.originalname);
  const newResume = {
    id: existing?.id || Date.now().toString(),
    fileName: req.file.originalname,
    alias: existing?.alias || req.file.originalname.replace(/\.[^/.]+$/, ''),
    isCurrent: existing?.isCurrent || (config.configs.length === 0),
    createdAt: uploadTime
  };
  
  if (existing) {
    const idx = config.configs.findIndex(c => c.fileName === req.file.originalname);
    newResume.createdAt = existing.createdAt || uploadTime;
    config.configs[idx] = newResume;
  } else {
    config.configs.push(newResume);
    
    if (config.configs.length > MAX_VERSIONS) {
      const sortedConfigs = [...config.configs].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      const oldestConfig = sortedConfigs[0];
      
      const oldestFilePath = path.join(CV_DIR, oldestConfig.fileName);
      if (fs.existsSync(oldestFilePath)) {
        fs.unlinkSync(oldestFilePath);
      }
      
      config.configs = config.configs.filter(c => c.id !== oldestConfig.id);
      config.files = config.files.filter(f => f !== oldestConfig.fileName);
      
      console.log(`已自动删除最老的简历版本: ${oldestConfig.fileName}`);
    }
  }
  
  config.files = config.files.includes(req.file.originalname) 
    ? config.files 
    : [...config.files, req.file.originalname];
  
  saveCVConfig(config);
  res.json(newResume);
});

app.put('/api/resumes/:id/alias', (req, res) => {
  if (!API_ENABLED) {
    return res.status(403).json({ error: 'API disabled' });
  }
  const config = loadCVConfig();
  const resume = config.configs.find(r => r.id === req.params.id);
  
  if (!resume) {
    return res.status(404).json({ error: 'Resume not found' });
  }
  
  resume.alias = req.body.alias;
  saveCVConfig(config);
  res.json(resume);
});

app.put('/api/resumes/:id/current', (req, res) => {
  if (!API_ENABLED) {
    return res.status(403).json({ error: 'API disabled' });
  }
  const config = loadCVConfig();
  
  config.configs.forEach(r => {
    r.isCurrent = r.id === req.params.id;
  });
  
  saveCVConfig(config);
  const current = config.configs.find(r => r.id === req.params.id);
  res.json(current);
});

app.delete('/api/resumes/:id', (req, res) => {
  if (!API_ENABLED) {
    return res.status(403).json({ error: 'API disabled' });
  }
  const config = loadCVConfig();
  const resume = config.configs.find(r => r.id === req.params.id);
  
  if (!resume) {
    return res.status(404).json({ error: 'Resume not found' });
  }
  
  config.configs = config.configs.filter(r => r.id !== req.params.id);
  config.files = config.files.filter(f => f !== resume.fileName);
  
  const filePath = path.join(CV_DIR, resume.fileName);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  
  if (config.configs.length > 0 && !config.configs.some(c => c.isCurrent)) {
    config.configs[0].isCurrent = true;
  }
  
  saveCVConfig(config);
  res.json({ success: true });
});

app.post('/api/change-password', (req, res) => {
  if (!API_ENABLED) {
    return res.status(403).json({ error: 'API disabled' });
  }
  
  const { oldPassword, newPassword } = req.body;
  
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ success: false, message: '请提供旧密码和新密码' });
  }
  
  const currentPassword = loadPassword();
  
  if (currentPassword !== oldPassword) {
    return res.status(401).json({ success: false, message: '旧密码错误' });
  }
  
  if (savePassword(newPassword)) {
    res.json({ success: true, message: '密码修改成功' });
  } else {
    res.status(500).json({ success: false, message: '密码修改失败' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Data will be saved to: ${DATA_FILE}`);
});
