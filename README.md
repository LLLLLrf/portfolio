# 个人作品集网站

一个基于 Vue.js 3 和 TailwindCSS 构建的现代化个人作品集网站，支持暗黑模式、多语言切换和功能强大的管理后台。

## 项目特性

- **响应式设计**：完美适配各种屏幕尺寸，从移动设备到桌面端
- **Vue.js 3**：使用 Composition API，代码结构清晰易维护
- **Tailwind CSS**：现代化的实用优先 CSS 框架，实现美观的界面设计
- **暗黑模式**：支持主题无缝切换，提供舒适的浏览体验
- **多语言支持**：中文和英文双语切换，满足国际化需求
- **项目展示**：支持项目图片展示、项目链接和代码网址（选填）
- **图片查看**：支持图片点击放大查看，提供更好的视觉体验
- **简历管理**：支持上传和管理多个简历版本，可设置当前简历
- **管理后台**：直观的管理界面，支持项目和个人信息的编辑
- **后端服务**：内置 Express 后端，支持数据持久化和跨浏览器同步
- **WebSocket 支持**：实时数据更新，提升用户体验

## 技术栈

- **前端**：Vue.js 3, Vue Router, Tailwind CSS
- **后端**：Express.js
- **构建工具**：Vue CLI
- **图标库**：Feather Icons
- **存储**：本地文件系统
- **实时通信**：WebSocket

## 项目结构

```
├── data/                 # 后端数据文件
│   ├── about.json        # 关于我数据（支持双语）
│   └── projects.json     # 项目数据
├── public/               # 静态资源
│   ├── files/            # 文件（简历等）
│   │   └── cv/           # 简历文件目录
│   └── favicon.png       # 网站图标
├── src/                  # 源代码
│   ├── assets/           # 资源文件
│   │   ├── css/          # CSS 文件
│   │   ├── fonts/        # 字体文件
│   │   └── images/       # 图片文件
│   ├── components/        # 组件
│   │   ├── about/        # 关于我相关组件
│   │   ├── contact/      # 联系相关组件
│   │   ├── projects/     # 项目相关组件
│   │   ├── reusable/     # 可复用组件
│   │   └── shared/       # 共享组件
│   ├── composables/       # 组合式函数
│   ├── data/             # 前端数据
│   ├── router/           # 路由配置
│   ├── services/          # 服务（API 调用等）
│   ├── views/             # 页面视图
│   ├── App.vue           # 根组件
│   └── main.js           # 入口文件
├── server.js             # 后端服务器
├── package.json          # 项目配置
└── README.md             # 项目说明
```

## 快速开始

### 1. 环境要求

- Node.js 14.0 或更高版本
- npm 6.0 或更高版本

### 2. 安装

```bash
# 克隆项目
git clone https://github.com/yourusername/portfolio.git

# 进入项目目录
cd portfolio

# 安装依赖
npm install
```

### 3. 运行项目

```bash
# 启动开发服务器（包含前端和后端）
npm run dev

# 仅启动前端开发服务器
npm run serve

# 仅启动后端服务器
npm run server
```

开发服务器启动后，访问 http://localhost:8081 查看网站。

## 管理后台

### 访问管理后台

1. 访问 http://localhost:8081/admin/login
2. 使用默认密码 `admin123` 登录

### 功能

- **项目管理**：创建、编辑和删除项目
- **关于我管理**：编辑个人简介（支持双语）
- **简历管理**：上传、管理和设置默认简历

### 项目编辑

- **基本信息**：标题、分类、日期、缩略图
- **项目链接**：项目地址和代码网址（选填）
- **项目内容**：目标、技术栈、挑战、详细描述
- **项目图片**：支持多张图片上传，自动生成响应式网格布局

### 关于我编辑

- **中文内容**：编辑中文个人简介
- **英文内容**：编辑英文个人简介
- **同步保存**：修改后自动保存到后端，确保跨浏览器同步

### 简历管理

- **上传简历**：支持上传多个简历文件
- **设为当前**：设置默认简历，用于首页下载功能
- **删除简历**：管理不需要的简历文件

## 数据管理

### 前端数据

- 项目数据：`src/data/projects.js`
- 社交链接：`src/data/socialLinks.js`

### 后端数据

- 项目数据：`data/projects.json`
- 关于我数据：`data/about.json`
- 简历配置：`public/files/cv/config.json`

## 部署

### 构建生产版本

```bash
npm run build
```

构建完成后，`dist` 目录包含生产版本的文件。

### 部署到服务器

1. 将 `dist` 目录上传到服务器
2. 启动后端服务器：
   ```bash
   node server.js
   ```
3. 配置 Web 服务器（如 Nginx）指向 `dist` 目录

### 环境变量

可以通过环境变量配置服务器端口：

```bash
PORT=3002 node server.js
```

## 自定义

### 主题

- 颜色配置：`tailwind.config.js`
- 全局样式：`src/assets/css/app.css`

### 内容

- 修改 `data/about.json` 更新个人简介
- 修改 `data/projects.json` 更新项目列表
- 在 `public/files/cv` 目录添加简历文件

## 常见问题

### 图片上传问题
- 确保上传的图片格式正确（支持 JPG、PNG、WebP 等常见格式）
- 图片大小建议控制在 2MB 以内，以确保加载速度

### WebSocket 连接问题
- 确保服务器运行正常
- 检查网络连接是否稳定
- 如遇到连接失败，刷新页面通常可以解决

### 简历下载问题
- 确保已在管理后台设置了当前简历
- 如果未设置当前简历，系统会默认下载 `Stoman-Resume.pdf`

## 许可证

[MIT](LICENSE)

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目。

## 感谢

https://github.com/realstoman/vuejs-tailwindcss-portfolio
