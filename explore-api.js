const http = require('http');

function tryEndpoint(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(`http://localhost:9621${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {}
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`${method} ${path}: ${res.statusCode}`);
        try {
          const json = JSON.parse(data);
          console.log(JSON.stringify(json, null, 2));
        } catch {
          console.log(data.slice(0, 200));
        }
        resolve();
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  console.log('=== LightRAG API exploration ===');
  await tryEndpoint('/');
  await tryEndpoint('/health');
  await tryEndpoint('/documents');
  await tryEndpoint('/query', 'POST', JSON.stringify({ query: 'test' }));
  await tryEndpoint('/query', 'POST', JSON.stringify({ query: 'What are coins?' }));
}

main().catch(console.error);