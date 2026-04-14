# 图片优化与 WebP 转换
本项目实现了自动将上传的图片转换为 WebP 格式的功能，以提高加载速度和节省存储空间。

## 功能特点

### 自动转换
- 自动将 JPG/JPEG/PNG 图片转换为 WebP 格式
- 最大宽度限制为 1200px（保持比例）
- WebP 质量设置为 80（平衡质量与大小）
- 保留原始文件作为降级方案

### 兼容性保证
- 保留原始格式文件，确保在不支持 WebP 的浏览器能正常显示
- 如果转换失败，自动回退到原始文件
- 删除图片时同时清理所有相关格式文件

## 安装依赖

已安装的依赖：
```bash
npm install sharp
```

## 使用方法

### 1. 自动转换（推荐）
上传图片时会自动转换，无需手动操作。

### 2. 批量转换现有图片
运行以下命令转换已上传的图片：

```bash
npm run convert-images
```

## 配置选项

在 `server.js` 中可以调整以下配置：

```javascript
const IMAGE_CONFIG = {
  maxWidth: 1200,        // 最大宽度
  webpQuality: 80,         // WebP 质量 (0-100)
  allowedFormats: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  formatsToConvert: ['.jpg', '.jpeg', '.png']  // 需要转换的格式
};
```

## API 响应变化

上传图片 API 现在会返回更多信息：

```json
{
  "success": true,
  "url": "/uploads/xxx.webp",           // WebP 格式（优先使用）
  "filename": "xxx.webp",
  "originalUrl": "/uploads/xxx.jpg",  // 原始格式（降级使用）
  "originalFilename": "xxx.jpg"
}
```

## 安全性考虑

1. **文件安全**：
   - 只允许指定格式上传
   - 文件名唯一化，防止路径遍历
   - 文件大小限制为 20MB

2. **转换安全**：
   - 转换失败自动回退
   - 保留原始文件作为备份
   - 错误处理和日志记录

3. **清理安全**：
   - 删除图片时同时清理所有相关格式
   - 防止文件残留

## 性能优化

- WebP 格式通常比 JPEG/PNG 小 25-50%
- 1200px 宽度限制平衡画质和文件大小
- 并发处理避免阻塞
- 保留原始文件确保兼容性

## 浏览器兼容性

WebP 支持的浏览器：
- Chrome 9+
- Firefox 65+
- Safari 14+
- Edge 18+
- 不支持的浏览器自动使用原始格式
