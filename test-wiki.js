const http = require('http');

const query = "Explain the double economy of mojhit.pl – what are Coins and Notes?";
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
    console.log('=== LightRAG Response ===');
    try {
      const result = JSON.parse(body);
      console.log('Status:', res.statusCode);
      console.log('Answer:', result.answer || result.text || 'No answer');
      if (result.citations && result.citations.length > 0) {
        console.log('\nCitations:');
        result.citations.forEach((c, i) => console.log(`  ${i + 1}. ${c}`));
      }
    } catch (e) {
      console.error('Parse error:', e.message);
      console.log('Raw body:', body);
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.write(data);
req.end();