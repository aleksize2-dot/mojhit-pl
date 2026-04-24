const http = require('http');

function fetchJSON(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(`http://localhost:9621${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {}
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, body: json });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  console.log('=== LightRAG /documents list ===');
  const docs = await fetchJSON('/documents');
  console.log('Status:', docs.status);
  if (docs.body && docs.body.documents) {
    const wikiFiles = docs.body.documents.filter(d => 
      d.file_path && d.file_path.includes('wiki') || 
      d.file_path && (d.file_path.endsWith('.md') && !d.file_path.includes('node_modules'))
    );
    console.log(`Total documents: ${docs.body.documents.length}`);
    console.log('Wiki-related documents:');
    wikiFiles.forEach(d => {
      console.log(`  - ${d.file_path} (${d.status || 'unknown'})`);
    });
    // Show stuck large files
    const large = docs.body.documents.filter(d => d.size > 1000000);
    if (large.length) {
      console.log('\n⚠️ Large files (>1MB):');
      large.forEach(d => console.log(`  - ${d.file_path} (${d.size} bytes, ${d.status})`));
    }
  } else {
    console.log('Response:', JSON.stringify(docs.body, null, 2));
  }

  console.log('\n=== LightRAG /health ===');
  const health = await fetchJSON('/health');
  console.log('Health:', JSON.stringify(health.body, null, 2));
}

main().catch(console.error);