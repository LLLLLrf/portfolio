const fs = require('fs');
const path = require('path');

// 源文件路径（后端数据）
const projectsSource = path.join(__dirname, '..', 'data', 'projects.json');
const aboutSource = path.join(__dirname, '..', 'data', 'about.json');

// 目标文件路径（前端静态数据）
const projectsDest = path.join(__dirname, '..', 'src', 'data', 'projects.js');
const aboutDest = path.join(__dirname, '..', 'src', 'data', 'about.js');

// 同步项目数据
if (fs.existsSync(projectsSource)) {
  const projectsData = fs.readFileSync(projectsSource, 'utf8');
  const exportContent = `export default ${projectsData};\n`;
  fs.writeFileSync(projectsDest, exportContent);
  console.log('✓ Projects data synced successfully');
} else {
  console.log('✗ Projects source file not found');
}

// 同步关于我数据
if (fs.existsSync(aboutSource)) {
  const aboutData = fs.readFileSync(aboutSource, 'utf8');
  const exportContent = `export default ${aboutData};\n`;
  fs.writeFileSync(aboutDest, exportContent);
  console.log('✓ About data synced successfully');
} else {
  console.log('✗ About source file not found');
}

console.log('Data sync completed!');
