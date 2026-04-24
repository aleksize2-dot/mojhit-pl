const fs = require('fs').promises;
const path = require('path');
const http = require('http');

const OPENVIKING_API = 'http://localhost:1933';
const PROJECT_ROOT = 'E:\\mojhit';
const COLLECTION_NAME = 'mojhit-core';

async function testApi() {
  return new Promise((resolve, reject) => {
    const req = http.request(`${OPENVIKING_API}/health`, { method: 'GET', timeout: 5000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ OpenViking API is alive:', data);
          resolve(true);
        } else {
          console.log('❌ OpenViking API responded with', res.statusCode, data);
          resolve(false);
        }
      });
    });
    req.on('error', err => {
      console.error('❌ Cannot reach OpenViking API:', err.message);
      resolve(false);
    });
    req.on('timeout', () => {
      req.destroy();
      console.error('❌ OpenViking API timeout');
      resolve(false);
    });
    req.end();
  });
}

async function addResource(filePath, content) {
  const relativePath = path.relative(PROJECT_ROOT, filePath).replace(/\\/g, '/');
  const uri = `viking://resources/${COLLECTION_NAME}/${relativePath}`;
  
  const payload = JSON.stringify({
    uri,
    content,
    // TODO: determine correct API endpoint and payload structure
    // This is a placeholder – we need to find the real API
  });

  return new Promise((resolve, reject) => {
    const req = http.request(`${OPENVIKING_API}/v1/memories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`   ${res.statusCode} ${relativePath}`);
        resolve({ statusCode: res.statusCode, body: data });
      });
    });
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('timeout'));
    });
    req.write(payload);
    req.end();
  });
}

async function walk(dir) {
  let files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      files = files.concat(await walk(full));
    } else {
      // Skip binary/large files
      const ext = path.extname(entry.name).toLowerCase();
      if (['.png', '.jpg', '.jpeg', '.gif', '.mp3', '.mp4', '.webm', '.ico', '.woff', '.woff2', '.ttf'].includes(ext)) continue;
      files.push(full);
    }
  }
  return files;
}

async function main() {
  console.log('🔍 Testing OpenViking API...');
  const alive = await testApi();
  if (!alive) {
    console.error('OpenViking API is not reachable. Please ensure the container is running and port 1933 is accessible.');
    process.exit(1);
  }

  console.log('📂 Scanning project folder', PROJECT_ROOT);
  const allFiles = await walk(PROJECT_ROOT);
  console.log(`Found ${allFiles.length} text files.`);

  // First, try to discover the correct API endpoint by probing known paths
  console.log('🔎 Probing API endpoints...');
  // TODO: implement endpoint discovery
  
  // For now, we'll just list files and show we're ready
  console.log('\nReady to import the following files:');
  allFiles.slice(0, 10).forEach(f => console.log('  ', path.relative(PROJECT_ROOT, f)));
  if (allFiles.length > 10) console.log(`  ... and ${allFiles.length - 10} more.`);

  console.log('\n⚠️  Need to determine the correct OpenViking API endpoint for uploading resources.');
  console.log('   Check the OpenViking documentation or inspect the container logs for API routes.');
  console.log('   You can also upload files manually via Web UI: http://localhost:8020');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});