const fs = require('fs');
let code = fs.readFileSync('server/index.js', 'utf8');

const siteSettingsEndpoints = 
// Public: Get Site Settings
app.get('/api/settings/site', async (req, res) => {
  try {
    const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Get site settings error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin: Update Site Settings
app.put('/api/admin/settings/site', async (req, res) => {
  try {
    const updates = req.body;
    const { data, error } = await supabase.from('site_settings').update(updates).eq('id', 1).select().single();
    if (error) throw error;
    res.json({ success: true, settings: data });
  } catch (error) {
    console.error('Update site settings error:', error);
    res.status(500).json({ error: error.message });
  }
});
;

if (!code.includes('/api/settings/site')) {
  code = code.replace(
    /app\.get\('\/api\/admin\/settings\/api'/g,
    siteSettingsEndpoints + '\napp.get(\'/api/admin/settings/api\''
  );
  fs.writeFileSync('server/index.js', code);
  console.log('Added site settings endpoints');
} else {
  console.log('Site settings endpoints already exist');
}
