// 测试前端API调用
const API_BASE_URL = 'http://localhost:3002/api';

async function testApi() {
  console.log('Testing API...');
  
  try {
    // 测试健康检查
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('Health check:', healthData);
    
    // 测试获取项目列表
    const projectsResponse = await fetch(`${API_BASE_URL}/projects`);
    const projectsData = await projectsResponse.json();
    console.log('Projects count:', projectsData.length);
    
    // 查找包含Base64图片的项目
    const imageProject = projectsData.find(p => p.thumbnail && p.thumbnail.startsWith('data:image'));
    if (imageProject) {
      console.log('Found project with Base64 image:', imageProject.title.zh);
      console.log('Thumbnail length:', imageProject.thumbnail.length);
      if (imageProject.images && imageProject.images.length > 0) {
        console.log('Images count:', imageProject.images.length);
        console.log('First image URL length:', imageProject.images[0].url.length);
      }
    } else {
      console.log('No project with Base64 image found');
    }
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testApi();
