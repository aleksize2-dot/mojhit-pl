const http = require('http');

const query = "What are Coins and Notes in mojhit.pl? Explain the double economy system.";
const data = JSON.stringify({ query });

const req = http.request('http://localhost:9621/query', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const result = JSON.parse(body);
      console.log('✅ LightRAG Response:');
      console.log('Answer:', result.answer || result.text || 'No answer');
      console.log('Citations:', result.citations?.length || 0);
      if (result.citations) {
        result.citations.forEach((c, i) => console.log(`  ${i + 1}. ${c}`));
      }
    } catch (e) {
      console.error('Failed to parse response:', e.message);
      console.log('Raw response:', body);
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.write(data);
req.end();