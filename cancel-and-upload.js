const http = require('http');
const fs = require('fs');
const path = require('path');

const LIGHTRAG_URL = 'http://localhost:9621';
const STUCK_DOC_ID = 'doc-33b64fb2f0c379110ec27ca94af0f86a';
const WIKI_ROOT = 'E:\\mojhit\\wiki';

// 1. Try to cancel/delete the stuck document
function cancelStuckDocument() {
  return new Promise((resolve) => {
    const req = http.request(`${LIGHTRAG_URL}/documents/${STUCK_DOC_ID}`, {
      method: 'DELETE'
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log(`DELETE /documents/${STUCK_DOC_ID}: status ${res.statusCode}, body: ${body}`);
        resolve();
      });
    });
    req.on('error', (e) => {
      console.log(`DELETE failed (maybe endpoint doesn't exist): ${e.message}`);
      resolve();
    });
    req.end();
  });
}

// 2. Upload wiki .md files
function uploadFile(filePath) {
  return new Promise((resolve, reject) => {
    const filename = path.basename(filePath);
    let fileData;
    try {
      fileData = fs.readFileSync(filePath);
    } catch (e) {
      console.error(`❌ Can't read ${filename}:`, e.message);
      return resolve();
    }

    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).slice(2);
    const postData = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: application/octet-stream\r\n\r\n`),
      fileData,
      Buffer.from(`\r\n--${boundary}--\r\n`)
    ]);

    const req = http.request(`${LIGHTRAG_URL}/documents/upload`, {
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
          console.log(`✅ Uploaded: ${path.relative(WIKI_ROOT, filePath)}`);
        } else {
          console.error(`❌ Failed ${path.relative(WIKI_ROOT, filePath)}: ${res.statusCode} ${data}`);
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

async function walk(dir, fileList = []) {
  const files = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const file of files) {
    const filePath = path.join(dir, file.name);
    if (file.isDirectory()) {
      await walk(filePath, fileList);
    } else if (file.name.endsWith('.md')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

async function main() {
  console.log('🚫 Trying to cancel stuck document', STUCK_DOC_ID);
  await cancelStuckDocument();

  console.log(`📂 Scanning wiki folder: ${WIKI_ROOT}`);
  try {
    const files = await walk(WIKI_ROOT);
    console.log(`Found ${files.length} .md files.`);
    for (let i = 0; i < files.length; i++) {
      console.log(`[${i + 1}/${files.length}] Uploading ${path.basename(files[i])}...`);
      await uploadFile(files[i]);
      await new Promise(r => setTimeout(r, 300));
    }
    console.log('🎉 Wiki upload complete!');
  } catch (e) {
    console.error('Error:', e);
  }
}

main();