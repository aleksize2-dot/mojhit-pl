import re

with open('index.js', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r"app\.post\('/api/suno/generate',\s*requireAuth\(\),\s*async\s*\(req,\s*res\)\s*=>\s*\{.*?await\s*supabase\s*\.from\('transactions'\)\s*\.insert\(\{.*?'deduct_notes',\s*amount:\s*cost\s*\}\);"

replacement = '''app.post('/api/suno/generate', async (req, res) => {
  try {
    const { prompt, tags, title, instrumental = false, model = 'V4', currency_type = 'notes', customMode = false, personaId, personaModel } = req.body;
    console.log('[SUNO GENERATE] Received personaId:', personaId, 'personaModel:', personaModel);

    const authData = typeof req.auth === 'function' ? req.auth() : req.auth;
    const clerk_id = authData?.userId;
    let user = null;
    let guestSessionId = req.headers['x-guest-session'] || '';

    if (!clerk_id) {
      // GUEST LOGIC
      let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      if (ip && ip.includes(',')) ip = ip.split(',')[0].trim();
      
      let { data: guestLimit } = await supabase
        .from('guest_limits')
        .select('*')
        .eq('ip_address', ip)
        .single();
        
      if (guestLimit && guestLimit.generations_count >= 1) {
        return res.status(403).json({ 
          error: 'LIMIT_REACHED', 
          message: 'Twój darmowy limit (1 wygenerowany utwór) został wyczerpany. Zarejestruj się i otrzymaj 20 darmowych not!' 
        });
      }
      
      if (guestLimit) {
         await supabase.from('guest_limits').update({ 
           generations_count: guestLimit.generations_count + 1,
           last_generation_at: new Date().toISOString()
         }).eq('id', guestLimit.id);
      } else {
         await supabase.from('guest_limits').insert({
           ip_address: ip,
           generations_count: 1
         });
      }
      console.log(`[GUEST GENERATE] Allowed for IP ${ip}`);
    } else {
      // REGISTERED USER LOGIC
      let { data: dbUser, error: userError } = await supabase
        .from('users')
        .select('id, coins, notes')
        .eq('clerk_id', clerk_id)
        .single();

      if (userError || !dbUser) {
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({ clerk_id, email: authData.email || '', coins: 0, notes: 20 })
          .select('id, coins, notes').single();
        if (insertError || !newUser) return res.status(500).json({ error: 'Nie udało się utworzyć użytkownika.' });
        dbUser = newUser;
      }
      user = dbUser;

      const cost = currency_type === 'coins' ? 1 : 10;
      if (currency_type === 'coins' && (user.coins || 0) < cost) return res.status(400).json({ error: 'Niewystarczająca liczba monet.' });
      if (currency_type === 'notes' && (user.notes || 0) < cost) return res.status(400).json({ error: 'Niewystarczająca liczba not.' });

      const updates = currency_type === 'coins' ? { coins: (user.coins || 0) - cost } : { notes: (user.notes || 0) - cost };
      const { error: deductError } = await supabase.from('users').update(updates).eq('clerk_id', clerk_id);
      if (deductError) return res.status(500).json({ error: 'Nie udało się pobrać opłaty.' });

      console.log(`[PAYMENT] Deducted ${cost} ${currency_type} from user ${clerk_id}`);
      await supabase.from('transactions').insert({ user_id: user.id, type: currency_type === 'coins' ? 'deduct_coins' : 'deduct_notes', amount: cost });
    }'''

new_content, count = re.subn(pattern, replacement, content, flags=re.DOTALL)
if count > 0:
    
    # We also need to update the `kie_tasks` insertion below it:
    # `user_id: user.id,` -> `user_id: user?.id || null,`
    # `guest_session_id: guestSessionId,`
    
    pattern2 = r"(\.from\('kie_tasks'\)\s*\.insert\(\{)(.*?user_id:\s*)user\.id(,)"
    replacement2 = r"\1\n        user_id: user?.id || null,\n        guest_session_id: guestSessionId\3"
    
    new_content2, count2 = re.subn(pattern2, replacement2, new_content, flags=re.DOTALL)
    
    with open('index.js', 'w', encoding='utf-8') as f:
        f.write(new_content2)
    print(f'Regex replace success. Count1: {count}, Count2: {count2}')
else:
    print('Regex match failed')
