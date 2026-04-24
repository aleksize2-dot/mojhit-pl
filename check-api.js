const http = require('http');
const url = 'http://localhost:1933/health';

console.log('Testing OpenViking API at', url);

const req = http.request(url, { timeout: 3000 }, (res) => {
  console.log('Status:', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Response:', data);
    process.exit(0);
  });
});
req.on('error', (err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
req.on('timeout', () => {
  console.error('Timeout');
  req.destroy();
  process.exit(1);
});
req.end();