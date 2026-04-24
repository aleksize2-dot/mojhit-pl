const fs = require('fs');

let serverIndex = fs.readFileSync('server/index.js', 'utf8');

const oldEndpoint = `app.get('/api/admin/producers', requireAuth(), requireAdmin, async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('producers')
        .select('*')
        .order('created_at', { ascending: false });
  
      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });`;

const newEndpoint = `app.get('/api/admin/producers', requireAuth(), requireAdmin, async (req, res) => {
    try {
      const { data: producers, error } = await supabase
        .from('producers')
        .select('*')
        .order('created_at', { ascending: false });
  
      if (error) throw error;

      const { data: tracksData, error: tracksError } = await supabase
        .from('tracks')
        .select('producer_id, likes');

      if (tracksError) console.error('Tracks stats fetch error:', tracksError);

      const statsMap = {};
      if (tracksData) {
        tracksData.forEach(t => {
          if (!t.producer_id) return;
          if (!statsMap[t.producer_id]) {
            statsMap[t.producer_id] = { tracks_count: 0, total_likes: 0 };
          }
          statsMap[t.producer_id].tracks_count += 1;
          statsMap[t.producer_id].total_likes += (t.likes || 0);
        });
      }

      const enrichedProducers = producers.map(p => ({
        ...p,
        stats: statsMap[p.id] || { tracks_count: 0, total_likes: 0 }
      }));

      res.json(enrichedProducers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });`;

serverIndex = serverIndex.replace(oldEndpoint, newEndpoint);

// If the indentation or newlines didn't perfectly match, let's just do a regex replace:
if (serverIndex.includes(oldEndpoint)) {
    console.log("Replaced perfectly");
} else {
    console.log("Fallback regex replacement");
    serverIndex = serverIndex.replace(
        /app\.get\('\/api\/admin\/producers'[\s\S]+?res\.json\(data\);[\s\S]+?catch[\s\S]+?\}\);/,
        newEndpoint
    );
}

fs.writeFileSync('server/index.js', serverIndex, 'utf8');
