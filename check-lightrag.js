const http = require('http');

function checkHealth() {
  return new Promise((resolve, reject) => {
    const req = http.request('http://localhost:9621/health', { method: 'GET' }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log(`Health endpoint: status ${res.statusCode}, body: ${body}`);
        resolve({ status: res.statusCode, body });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function checkQuery() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: "What are Coins and Notes?" });
    const req = http.request('http://localhost:9621/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log(`Query endpoint: status ${res.statusCode}, body length: ${body.length}`);
        resolve({ status: res.statusCode, body });
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('Checking LightRAG health...');
  try {
    const health = await checkHealth();
    console.log('Health check result:', health);
  } catch (e) {
    console.log('Health endpoint not available:', e.message);
  }
  
  console.log('Testing query...');
  try {
    const query = await checkQuery();
    console.log('Query result:', query);
    if (query.status === 200) {
      const parsed = JSON.parse(query.body);
      console.log('Parsed answer:', parsed.answer || parsed.text || 'No answer');
      console.log('Citations:', parsed.citations || []);
    }
  } catch (e) {
    console.log('Query failed:', e.message);
  }
}

main();