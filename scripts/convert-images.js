const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads');

const IMAGE_CONFIG = {
  maxWidth: 1200,
  webpQuality: 80,
  formatsToConvert: ['.jpg', '.jpeg', '.png']
};

async function convertImageToWebP(inputPath, outputPath) {
  try {
    await sharp(inputPath)
      .resize({ width: IMAGE_CONFIG.maxWidth, withoutEnlargement: true })
      .webp({ quality: IMAGE_CONFIG.webpQuality })
      .toFile(outputPath);
    return true;
  } catch (error) {
    console.error('Error converting image:', inputPath, error);
    return false;
  }
}

async function convertExistingImages() {
  console.log('Starting to convert existing images...');
  console.log('Upload directory:', UPLOAD_DIR);

  if (!fs.existsSync(UPLOAD_DIR)) {
    console.log('Upload directory does not exist, skipping conversion.');
    return;
  }

  const files = fs.readdirSync(UPLOAD_DIR);
  let convertedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const baseName = path.basename(file, ext);
    const webpFilename = `${baseName}.webp`;
    const webpPath = path.join(UPLOAD_DIR, webpFilename);
    const originalPath = path.join(UPLOAD_DIR, file);

    // 检查是否已经是 WebP 或已转换过
    if (ext === '.webp') {
      console.log(`Skipping (already WebP): ${file}`);
      skippedCount++;
      continue;
    }

    if (!IMAGE_CONFIG.formatsToConvert.includes(ext)) {
      console.log(`Skipping (unsupported format): ${file}`);
      skippedCount++;
      continue;
    }

    if (fs.existsSync(webpPath)) {
      console.log(`Skipping (WebP already exists): ${file}`);
      skippedCount++;
      continue;
    }

    // 转换图片
    console.log(`Converting: ${file} -> ${webpFilename}`);
    const success = await convertImageToWebP(originalPath, webpPath);

    if (success) {
      convertedCount++;
      console.log(`✓ Converted: ${webpFilename}`);
    } else {
      errorCount++;
      console.log(`✗ Failed to convert: ${file}`);
    }
  }

  console.log('\n=== Conversion Summary ===');
  console.log(`Converted: ${convertedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log(`Total files processed: ${files.length}`);
}

convertExistingImages().then(() => {
  console.log('\nImage conversion process completed!');
}).catch((error) => {
  console.error('Error during conversion:', error);
  process.exit(1);
});
