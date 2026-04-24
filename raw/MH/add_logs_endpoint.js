const fs = require('fs');
const file = 'server/index.js';
let data = fs.readFileSync(file, 'utf8');

const loggerCode = `
// System Logger
const systemLogger = async (level, action, message, metadata = {}) => {
  try {
    await supabase.from('system_logs').insert({
      level, action, message, metadata
    });
  } catch (e) {
    console.error('Failed to log to system_logs', e);
  }
};
`;

const endpointCode = `
app.get('/api/admin/logs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const { data, error } = await supabase
      .from('system_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/stats'`;

// Insert logger after supabase init
if (!data.includes('const systemLogger')) {
  data = data.replace(/(const supabase = createClient[^;]+;)/, '$1\n' + loggerCode);
}

// Insert endpoint before /api/admin/stats
if (!data.includes('/api/admin/logs')) {
  data = data.replace(/app\.get\('\/api\/admin\/stats'/, endpointCode);
}

fs.writeFileSync(file, data, 'utf8');
console.log('Added logs endpoint to server');
