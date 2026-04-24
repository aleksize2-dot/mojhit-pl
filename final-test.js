const http = require('http');

async function fetchJSON(path, method = 'GET', body = null) {
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
  console.log('=== Checking remaining documents ===');
  const docs = await fetchJSON('/documents');
  if (docs.status === 200 && docs.body && docs.body.documents) {
    console.log(`Total documents: ${docs.body.documents.length}`);
    docs.body.documents.forEach(d => {
      console.log(`  - ${d.file_path} (${d.status || 'unknown'})`);
    });
  } else {
    console.log('Failed to fetch documents:', docs.status, docs.body);
  }

  console.log('\n=== Testing query ===');
  const query = await fetchJSON('/query', 'POST', JSON.stringify({ 
    query: "Explain the double economy of mojhit.pl – what are Coins and Notes?" 
  }));
  console.log('Query status:', query.status);
  if (query.status === 200 && query.body) {
    console.log('Answer:', query.body.answer || query.body.text || 'No answer');
    if (query.body.citations && query.body.citations.length) {
      console.log('Citations:', query.body.citations.length);
      query.body.citations.forEach(c => console.log(`  - ${c}`));
    }
  } else {
    console.log('Query error:', query.body);
  }
}

main().catch(console.error);