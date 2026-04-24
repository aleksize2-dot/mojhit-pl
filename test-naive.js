const http = require('http');

const payload = JSON.stringify({
  query: "Explain the double economy of mojhit.pl – what are Coins and Notes?",
  mode: "naive" // Включаем простой векторный поиск (без графов)
});

const req = http.request('http://localhost:9621/query', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log(`=== LightRAG Naive Search ===`);
    console.log(`Status: ${res.statusCode}`);
    try {
      const json = JSON.parse(body);
      console.log('Answer:', json.answer || json.text || 'No answer');
      if (json.citations && json.citations.length) {
        console.log('Citations found:', json.citations.length);
        json.citations.forEach(c => console.log(` - ${c}`));
      }
    } catch (e) {
      console.log('Raw body:', body);
    }
  });
});

req.on('error', e => console.error('Error:', e.message));
req.write(payload);
req.end();