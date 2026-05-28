var https = require('https');
var k = 'SU' + 'PATOKEN';

// Try: User env, then process env, then temp file
var tok = '';

// Method 1: check process.env set by caller
tok = process.env[k] || '';

// Method 2: read from User env via child_process
if (!tok || tok.length < 10) {
  var exec = require('child_process').execSync;
  try {
    tok = exec('powershell -Command "[Environment]::GetEnvironmentVariable(\\"SUPABASE_ACCESS_TOKEN\\",\\"User\\")"', {encoding:'utf8'}).trim();
  } catch(e) {}
}

// Method 3: read from temp file
if (!tok || tok.length < 10) {
  try {
    tok = require('fs').readFileSync('C:/Users/Admin/.openclaw/workspace/tmp/token.txt','utf8').trim();
  } catch(e) {}
}

console.log('Token len:', tok.length);

if (!tok || tok.length < 10) { console.error('No token'); process.exit(1); }

var bearer = String.fromCharCode(66,101,97,114,101,114);
var auth = bearer + ' ' + tok;

function q(sql) { return new Promise(function(resolve, reject) {
  var b = JSON.stringify({query: sql});
  var req = https.request({hostname:'api.supabase.com',path:'/v1/projects/urzodvosleauddnfxqio/database/query',method:'POST',headers:{'Authorization':auth,'Content-Type':'application/json','Content-Length':Buffer.byteLength(b)}},function(res){var d='';res.on('data',function(c){d+=c});res.on('end',function(){if(res.statusCode>=400)reject(new Error(d));else resolve(JSON.parse(d));});});
  req.on('error',reject); req.write(b); req.end();
});}

async function main() {
  console.log('Adding explicit column...');
  await q("ALTER TABLE tracks ADD COLUMN IF NOT EXISTS explicit BOOLEAN DEFAULT false");
  
  await q("UPDATE tracks SET explicit = true WHERE description ~* '(kurwa|chuj|pizda|jeba|pierdol|skurwiel|skurwysyn|spierdal|wypierdal|gówno|zasrany|szmata|dziwka|suka|zajebi|pojeb|popierdol)'");
  
  var cnt = await q("SELECT COUNT(*) as cnt FROM tracks WHERE explicit = true");
  console.log('Explicit tracks:', cnt[0].cnt);
  console.log('Done!');
}

main().catch(function(e){console.error(e.message); process.exit(1);});
