const fs = require('fs');
const path = require('path');
const http = require('http');

const LIGHTRAG_API = 'http://localhost:9621';
const PROJECT_ROOT = 'E:\\mojhit';
const ALLOWED_EXTS = ['.js', '.ts', '.tsx', '.jsx', '.json', '.md', '.py', '.txt', '.env', '.html', '.css'];

async function walk(dir, fileList = []) {
  const files = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const file of files) {
    const filePath = path.join(dir, file.name);
    if (file.isDirectory()) {
      if (['node_modules', '.git', '.next', 'dist', 'build'].includes(file.name)) continue;
      await walk(filePath, fileList);
    } else {
      const ext = path.extname(file.name).toLowerCase();
      if (ALLOWED_EXTS.includes(ext) || ALLOWED_EXTS.includes(file.name)) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

function uploadFile(filePath) {
  return new Promise((resolve, reject) => {
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    const filename = path.basename(filePath);
    
    let fileData;
    try {
      fileData = fs.readFileSync(filePath);
    } catch (e) {
      console.error(`Skipping ${filePath}: ${e.message}`);
      return resolve();
    }

    const postData = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: application/octet-stream\r\n\r\n`),
      fileData,
      Buffer.from(`\r\n--${boundary}--\r\n`)
    ]);

    const req = http.request(`${LIGHTRAG_API}/documents/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': postData.length
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✅ Uploaded: ${path.relative(PROJECT_ROOT, filePath)}`);
        } else {
          console.error(`❌ Failed: ${path.relative(PROJECT_ROOT, filePath)} (Status ${res.statusCode}): ${data}`);
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      console.error(`❌ Network error for ${filename}:`, e.message);
      resolve();
    });

    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log(`📂 Scanning project folder: ${PROJECT_ROOT}`);
  try {
    const files = await walk(PROJECT_ROOT);
    console.log(`Found ${files.length} text/code files.`);
    
    console.log('🚀 Starting upload to LightRAG...');
    for (let i = 0; i < files.length; i++) {
      console.log(`[${i + 1}/${files.length}] Uploading...`);
      await uploadFile(files[i]);
      // Adding a small delay to avoid overwhelming the server
      await new Promise(r => setTimeout(r, 200)); 
    }
    
    console.log('🎉 Upload complete! LightRAG is now processing the files in the background.');
  } catch (e) {
    console.error('Error during execution:', e);
  }
}

main();