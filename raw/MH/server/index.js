// ĐžĐ±Ń€Đ°Đ±ĐľŃ‚Ń‡Đ¸ĐşĐ¸ Đ˝ĐµĐľĐ±Ń€Đ°Đ±ĐľŃ‚Đ°Đ˝Đ˝Ń‹Ń… ĐľŃĐ¸Đ±ĐľĐş Đ´Đ»ŃŹ Đ´Đ¸Đ°ĐłĐ˝ĐľŃŃ‚Đ¸ĐşĐ¸
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION at:', promise, 'reason:', reason);
});

const express = require('express');
const cors = require('cors');
const path = require('path');
console.log('[CWD]', process.cwd());
const envPath = path.resolve(__dirname, '.env');
console.log('[ENV PATH]', envPath);
console.log('[ENV EXISTS]', require('fs').existsSync(envPath));
require('dotenv').config({ path: envPath });
console.log('[ENV] SUPABASE_URL:', process.env.SUPABASE_URL ? process.env.SUPABASE_URL.substring(0, 10) + '...' : 'missing');
console.log('[ENV] CLERK_SECRET_KEY:', process.env.CLERK_SECRET_KEY ? 'present (len=' + process.env.CLERK_SECRET_KEY.length + ')' : 'missing');
console.log('[ENV] CLERK_PUBLISHABLE_KEY:', process.env.CLERK_PUBLISHABLE_KEY ? 'present (len=' + process.env.CLERK_PUBLISHABLE_KEY.length + ')' : 'missing');
console.log('[ENV] All keys:', Object.keys(process.env).filter(k => k.includes('SUPABASE') || k.includes('CLERK')));
console.log('[ENV] OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? process.env.OPENROUTER_API_KEY.substring(0, 10) + '...' : 'missing');
const { createClient } = require('@supabase/supabase-js');
const { clerkMiddleware, requireAuth } = require('@clerk/express');
const { Webhook } = require('svix');
const kie = require('./kie');
const suno = require('./suno');
const persona = require('./persona');
const video = require('./video');
const createApiSettings = require('./config/apiSettings');
const { sendTrackEmail } = require('./emailService');

const app = express();
const port = process.env.PORT || 3000;

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.warn('âš ď¸Ź WARNING: SUPABASE_URL or keys are missing in the .env file.');
}

// We pass empty strings fallback to prevent immediate crash if .env is untouched,
// though requests will fail until properly configured.
const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseServiceKey || supabaseAnonKey || 'placeholder-key');

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


// Initialize API Settings module
const { getApiSettings, updateApiSettings, getMusicProviders } = createApiSettings(supabase);

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'https://fetal-hydroxide-wobbly.ngrok-free.dev', 'http://192.168.1.40:5173', 'http://100.118.254.128:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ----------------------------------------
// Clerk Webhooks
// ----------------------------------------
// IMPORTANT: express.raw must be used for the webhook endpoint BEFORE express.json() is applied globally
app.post('/api/webhooks/clerk', express.raw({ type: 'application/json' }), async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET || WEBHOOK_SECRET === 'placeholder') {
    console.log('âš ď¸Ź Warning: CLERK_WEBHOOK_SECRET is not correctly configured (is placeholder).');
    return res.status(200).json({ success: true, message: 'Webhook bypassed (no secret).' });
  }

  const payloadString = req.body.toString('utf8');
  const headerPayload = req.headers;

  const svix_id = headerPayload['svix-id'];
  const svix_timestamp = headerPayload['svix-timestamp'];
  const svix_signature = headerPayload['svix-signature'];

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: 'Missing svix headers' });
  }

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt;

  try {
    evt = wh.verify(payloadString, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Webhook verification failed:', err.message);
    return res.status(400).json({ error: 'Verification failed' });
  }

  // Helper to merge guest data
  const mergeGuestData = async (guestEmail, userId) => {
    try {
      console.log(`[MERGE] Merging guest data for email ${guestEmail} to user ${userId}`);
      
      const { error: tracksError } = await supabase
        .from('tracks')
        .update({ user_id: userId })
        .eq('guest_email', guestEmail)
        .is('user_id', null);
        
      if (tracksError) console.error('[MERGE] Error merging tracks:', tracksError);

      const { error: tasksError } = await supabase
        .from('kie_tasks')
        .update({ user_id: userId })
        .eq('guest_email', guestEmail)
        .is('user_id', null);

      if (tasksError) console.error('[MERGE] Error merging kie_tasks:', tasksError);
      
      console.log(`[MERGE] Successfully processed guest data for ${guestEmail}`);
    } catch (e) {
      console.error('[MERGE] Exception during mergeGuestData:', e);
    }
  };

  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook triggered: ID ${id}, Type: ${eventType}`);

  const clerk_id = id;
  const emailObj = evt.data.email_addresses && evt.data.email_addresses[0];
  const email = emailObj ? emailObj.email_address : '';

  switch (eventType) {
    case 'user.created': {
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          clerk_id,
          email,
          coins: 0,
          notes: 20 // Welcome bonus
        });

      if (insertError) {
        if (insertError.code === '23505') {
          console.log(`Race condition detected! User ${clerk_id} already exists (fallback). Updating email...`);
          const { error: updateError } = await supabase
            .from('users')
            .update({ email })
            .eq('clerk_id', clerk_id);

          if (updateError) {
            console.error('Failed to update email during race condition fallback:', updateError);
          } else {
            console.log(`Successfully updated email for existing user ${clerk_id}!`);
            if (email) {
              await mergeGuestData(email, clerk_id);
            }
          }
        } else {
          console.error('Error inserting webhook user into Supabase:', insertError);
        }
      } else {
        console.log(`User ${clerk_id} automatically created via Webhook with welcome bonus!`);
        if (email) {
          await mergeGuestData(email, clerk_id);
        }
      }
      break;
    }
    case 'user.updated': {
      const { error: updateError } = await supabase
        .from('users')
        .update({ email })
        .eq('clerk_id', clerk_id);

      if (updateError) {
        console.error('Error updating webhook user in Supabase:', updateError);
        return res.status(500).json({ error: 'Database error on update' });
      }

      console.log(`User ${clerk_id} synchronized update via Webhook!`);
      break;
    }
    case 'user.deleted': {
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('clerk_id', clerk_id);

      if (deleteError) {
        console.error('Error deleting webhook user from Supabase:', deleteError);
        return res.status(500).json({ error: 'Database error on delete' });
      }

      console.log(`User ${clerk_id} successfully deleted via Webhook!`);
      break;
    }
    default:
      console.log(`Unhandled Webhook event type: ${eventType}`);
      break;
  }

  return res.status(200).json({ success: true });
});

// ----------------------------------------
// Stripe Webhooks
// ----------------------------------------
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret || endpointSecret === 'placeholder') {
    console.log('⚠️ Warning: STRIPE_WEBHOOK_SECRET is not correctly configured (is placeholder).');
    return res.status(200).json({ success: true, message: 'Webhook bypassed (no secret).' });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Retrieve the client_reference_id which we set as the Clerk User ID
    const userId = session.client_reference_id;
    
    if (userId) {
      console.log(`[Stripe] Payment received for user ${userId}. Processing...`);
      
      try {
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        let coinsToAdd = 0;
        let newPlan = null;
        
        for (const item of lineItems.data) {
          const priceId = item.price.id;
          
          if (priceId === 'price_1TP5kxEX68boAvndPnhQ0bF9') coinsToAdd += 20;
          if (priceId === 'price_1TP5kyEX68boAvnduYSVC7LN') coinsToAdd += 50;
          if (priceId === 'price_1TP5kyEX68boAvnd8XoySccD') coinsToAdd += 150;
          
          if (priceId === 'price_1TP5kzEX68boAvnddF8WYcaj') {
             coinsToAdd += 50;
             newPlan = 'VIP';
          }
          if (priceId === 'price_1TP5kzEX68boAvnd5Hq3n7R7') {
             coinsToAdd += 150;
             newPlan = 'Legend';
          }
        }
        
        if (coinsToAdd > 0 || newPlan) {
          const { data: userRecord, error: fetchErr } = await supabase
            .from('users')
            .select('*')
            .eq('clerk_id', userId)
            .single();
            
          if (!fetchErr && userRecord) {
            const updates = {};
            if (coinsToAdd > 0) updates.coins = (userRecord.coins || 0) + coinsToAdd;
            if (newPlan) updates.subscription_tier = newPlan.toLowerCase();
            
            const { error: updateErr } = await supabase
              .from('users')
              .update(updates)
              .eq('clerk_id', userId);
              
            if (updateErr) {
              console.error(`[Stripe] Failed to update user ${userId}:`, updateErr);
            } else {
              console.log(`[Stripe] Successfully credited ${coinsToAdd} coins and updated plan to ${newPlan || 'unchanged'} for user ${userId}`);
            }
          } else {
             console.error(`[Stripe] User ${userId} not found in database.`);
          }
        }
      } catch (err) {
         console.error(`[Stripe] Error processing checkout session:`, err);
      }
    } else {
       console.log(`[Stripe] Warning: Received checkout.session.completed without client_reference_id. Session ID: ${session.id}`);
    }
  }

  res.send();
});

// Global JSON parser applied AFTER webhooks
app.use(express.json());

// ----------------------------------------
// Public Endpoints (before auth middleware)
// ----------------------------------------
app.get('/api/tracks/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const { data, error } = await supabase
      .from('tracks')
      .select('id, title, description, audio_url, cover_image_url, created_at, likes, producer_id, producers(name)')
      .eq('expired', false)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Error fetching recent tracks:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/tracks/top', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const { data, error } = await supabase
      .from('tracks')
      .select('id, title, description, audio_url, cover_image_url, created_at, likes, producer_id, producers(name)')
      .eq('expired', false)
      .order('likes', { ascending: false })
      .limit(limit);
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Error fetching top tracks:', err);
    res.status(500).json({ error: err.message });
  }
});

app.use(express.json());
console.log('[CLERK DEBUG] CLERK_PUBLISHABLE_KEY exists?', !!process.env.CLERK_PUBLISHABLE_KEY);
console.log('[CLERK DEBUG] CLERK_SECRET_KEY exists?', !!process.env.CLERK_SECRET_KEY);
app.use(clerkMiddleware({ secretKey: process.env.CLERK_SECRET_KEY, publishableKey: process.env.CLERK_PUBLISHABLE_KEY })); // Clerk authentication middleware

// ----------------------------------------
// Admin Middleware
// ----------------------------------------

// ĐźŃ€ĐľĐ˛ĐµŃ€ĐşĐ° Ń€ĐľĐ»Đ¸ Đ°Đ´ĐĽĐ¸Đ˝Đ¸ŃŃ‚Ń€Đ°Ń‚ĐľŃ€Đ° Ń‡ĐµŃ€ĐµĐ· env-ĐżĐµŃ€ĐµĐĽĐµĐ˝Đ˝ŃŃŽ ADMIN_USER_IDS (ŃĐżĐ¸ŃĐľĐş Clerk user ID Ń‡ĐµŃ€ĐµĐ· Đ·Đ°ĐżŃŹŃ‚ŃŃŽ)
const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS || '')
  .split(',')
  .map(id => id.trim())
  .filter(Boolean);

function requireAdmin(req, res, next) {
  const authData = typeof req.auth === 'function' ? req.auth() : req.auth;
  if (!authData || !authData.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  if (ADMIN_USER_IDS.length > 0 && !ADMIN_USER_IDS.includes(authData.userId)) {
    console.warn(`[ADMIN] Access denied for user ${authData.userId}`);
    return res.status(403).json({ error: 'Brak uprawnieĹ„ administratora' });
  }
  next();
}

// ----------------------------------------
// System Endpoints
// ----------------------------------------

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test Supabase Connection Endpoint
app.get('/api/test-supabase', async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('id').limit(1);
    if (error) {
      throw error;
    }
    res.json({ connected: true });
  } catch (error) {
    console.error('Supabase connection error:', error.message);
    res.status(500).json({ connected: false, error: error.message });
  }
});

// Test Audio Generation Endpoint (no auth, uses admin user)
app.post('/api/test-generate-audio', async (req, res) => {
  try {
    const { prompt, tags, title, instrumental = false, model = 'V4', currency_type = 'notes' } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    // Use admin user from environment
    const adminClerkId = process.env.ADMIN_USER_IDS?.split(',')[0]?.trim();
    if (!adminClerkId) {
      return res.status(500).json({ error: 'ADMIN_USER_IDS not configured' });
    }
    
    // 1. Find or create user in DB
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('id, coins, notes')
      .eq('clerk_id', adminClerkId)
      .single();

    if (userError || !user) {
      // Create admin user record if not exists
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          clerk_id: adminClerkId,
          email: 'admin@mojhit.pl',
          coins: 1000,
          notes: 1000
        })
        .select('id, coins, notes')
        .single();

      if (insertError || !newUser) {
        console.error('Failed to create admin user:', insertError);
        return res.status(500).json({ error: 'Nie udaĹ‚o siÄ™ utworzyÄ‡ uĹĽytkownika.' });
      }
      user = newUser;
    }

    // 2. Deduct currency (optional, skip for test)
    console.log(`[TEST GENERATE] Using user ${user.id}, balance: coins=${user.coins}, notes=${user.notes}`);
    
    // 3. Create task record
    const { data: task, error: taskError } = await supabase
      .from('kie_tasks')
      .insert({
        user_id: user.id,
        prompt,
        model,
        status: 'pending'
      })
      .select()
      .single();

    if (taskError || !task) {
      console.error('Failed to create kie_task:', taskError);
      return res.status(500).json({ error: 'Nie udaĹ‚o siÄ™ utworzyÄ‡ zadania generacji.' });
    }

    // 4. Call Kie API
    const taskId = await kie.generate(prompt, tags || '', title || '', instrumental, model, false, '', '');
    
    // 5. Update task with task_id
    await supabase
      .from('kie_tasks')
      .update({ task_id: taskId })
      .eq('id', task.id);

    res.json({ 
      success: true, 
      taskId, 
      dbId: task.id,
      message: 'Audio generation started. Check /api/suno/status/:id for progress.'
    });
  } catch (error) {
    console.error('Test generate error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test Audio Status Endpoint (no auth)
app.get('/api/test-status/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    if (!taskId) {
      return res.status(400).json({ error: 'taskId is required' });
    }
    
    // Call Kie API status
    const status = await kie.getTaskStatus(taskId);
    res.json(status);
  } catch (error) {
    console.error('Test status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test Video Generation Endpoint (no auth, uses admin user and existing audio task)
app.post('/api/test-generate-video', async (req, res) => {
  try {
    const { audioTaskId } = req.body; // kie_tasks.task_id or kie_tasks.id
    
    if (!audioTaskId) {
      return res.status(400).json({ error: 'audioTaskId is required' });
    }
    
    // Use admin user from environment
    const adminClerkId = process.env.ADMIN_USER_IDS?.split(',')[0]?.trim();
    if (!adminClerkId) {
      return res.status(500).json({ error: 'ADMIN_USER_IDS not configured' });
    }
    
    // 1. Find or create user in DB
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('id, subscription_tier')
      .eq('clerk_id', adminClerkId)
      .single();
    
    if (userError || !user) {
      // Create admin user with legend tier
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          clerk_id: adminClerkId,
          subscription_tier: 'legend',
          email: 'admin@mojhit.pl',
          name: 'Admin User',
          coins_balance: 100
        })
        .select('id, subscription_tier')
        .single();
      
      if (insertError || !newUser) {
        console.error('Failed to create admin user:', insertError);
        return res.status(500).json({ error: 'Nie udaĹ‚o siÄ™ utworzyÄ‡ uĹĽytkownika administracyjnego.' });
      }
      user = newUser;
    }
    
    // 2. Find audio task (kie_tasks) - must be completed
    const { data: audioTask, error: audioTaskError } = await supabase
      .from('kie_tasks')
      .select('id, task_id, audio_url, title, duration')
      .or(`id.eq.${audioTaskId},task_id.eq.${audioTaskId}`)
      .eq('status', 'completed')
      .single();
    
    if (audioTaskError || !audioTask) {
      return res.status(404).json({ error: 'Completed audio task not found' });
    }
    
    // 3. Create video task record
    const { data: videoTask, error: videoTaskError } = await supabase
      .from('video_tasks')
      .insert({
        user_id: user.id,
        audio_task_id: audioTask.id,
        status: 'pending'
      })
      .select()
      .single();
    
    if (videoTaskError || !videoTask) {
      console.error('Failed to create video_task:', videoTaskError);
      return res.status(500).json({ error: 'Nie udaĹ‚o siÄ™ utworzyÄ‡ zadania generacji wideo.' });
    }
    
    // 4. Determine audioId (Suno audio ID)
    let audioId = audioTask.task_id;
    // Hardcoded mapping for known test task
    if (audioTask.task_id === '37928fddb061b9fcc71018da636077d0') {
      audioId = '0ca0deac-8584-457b-9768-577c7c05b7cb';
    }
    // 5. Call Kie Video API
    const videoTaskId = await video.generate(audioTask.task_id, audioId, {
      author: 'mojhit.pl',
      domainName: 'mojhit.pl',
      callbackUrl: `${process.env.KIE_CALLBACK_BASE_URL || 'http://localhost:3000'}/api/webhooks/kie/video`
    });
    
    // 5. Update video task with video_task_id
    await supabase
      .from('video_tasks')
      .update({ video_task_id: videoTaskId })
      .eq('id', videoTask.id);
    
    res.json({
      success: true,
      videoTaskId,
      dbId: videoTask.id,
      message: 'Video generation started. Check /api/video/status/:id for progress.'
    });
  } catch (error) {
    console.error('Test video generate error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test Video Status Endpoint (no auth, uses admin user)
app.get('/api/test-video-status/:id', async (req, res) => {
  try {
    const { id } = req.params; // video_tasks.id or video_task_id
    
    // Use admin user from environment
    const adminClerkId = process.env.ADMIN_USER_IDS?.split(',')[0]?.trim();
    if (!adminClerkId) {
      return res.status(500).json({ error: 'ADMIN_USER_IDS not configured' });
    }
    
    // 1. Find user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', adminClerkId)
      .single();
    
    if (userError || !user) {
      return res.status(404).json({ error: 'Admin user not found' });
    }
    
    // 2. Find video task (must belong to admin user)
    const { data: videoTask, error: videoTaskError } = await supabase
      .from('video_tasks')
      .select('*')
      .eq('user_id', user.id)
      .or(`id.eq.${id},video_task_id.eq.${id}`)
      .single();
    
    if (videoTaskError || !videoTask) {
      return res.status(404).json({ error: 'Video task not found' });
    }
    
    // 3. If status pending and video_task_id exists, poll Kie API
    if (videoTask.status === 'pending' && videoTask.video_task_id &&
      new Date() - new Date(videoTask.created_at) > 30000) {
      try {
        console.log(`[TEST VIDEO STATUS] Polling kie.ai for video task ${videoTask.video_task_id}`);
        const status = await video.getTaskStatus(videoTask.video_task_id);
        
        if (status.status === 'completed' && status.video_url) {
          // Update video task
          const updates = {
            status: 'completed',
            video_url: status.video_url,
            thumbnail_url: status.thumbnail_url,
            duration_seconds: status.duration,
            expires_at: status.expires_at ? new Date(status.expires_at) : null,
            updated_at: new Date()
          };
          
          await supabase
            .from('video_tasks')
            .update(updates)
            .eq('id', videoTask.id);
          
          Object.assign(videoTask, updates);
        } else if (status.status === 'failed' || status.error) {
          await supabase
            .from('video_tasks')
            .update({
              status: 'failed',
              error_message: status.error || 'Unknown error',
              updated_at: new Date()
            })
            .eq('id', videoTask.id);
          
          videoTask.status = 'failed';
          videoTask.error_message = status.error || 'Unknown error';
        }
      } catch (e) {
        console.error('[TEST VIDEO STATUS] Polling error:', e.message);
        // Ignore polling errors
      }
    }
    
    res.json({
      status: videoTask.status,
      video_url: videoTask.video_url,
      thumbnail_url: videoTask.thumbnail_url,
      duration_seconds: videoTask.duration_seconds,
      expires_at: videoTask.expires_at,
      error_message: videoTask.error_message,
      created_at: videoTask.created_at,
      video_task_id: videoTask.video_task_id
    });
  } catch (error) {
    console.error('Test video status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------
// Auth Endpoints
// ----------------------------------------

app.get('/api/auth/me', requireAuth(), async (req, res) => {
  try {
    console.log('Auth object:', req.auth);
    console.log('Headers:', req.headers);
    // req.auth is populated by Clerk middleware
    res.json({ userId: req.auth.userId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/user/balance', requireAuth(), async (req, res) => {
  try {
    console.log('đź” Auth object:', req.auth);
    console.log('đź“¨ Headers:', req.headers);
    console.log('req.auth type:', typeof req.auth);

    if (typeof req.auth === 'function') {
      try {
        console.log('req.auth():', req.auth());
      } catch (err) {
        console.log('req.auth() failed:', err.message);
      }
    }

    const authData = typeof req.auth === 'function' ? req.auth() : req.auth;

    if (!authData || !authData.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const clerk_id = authData.userId;

    // Fetch user
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('coins, notes, subscription_tier')
      .eq('clerk_id', clerk_id)
      .single();

    if (fetchError && fetchError.code === 'PGRST116') {
      // Create new user if not found
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          clerk_id,
          email: '',
          coins: 0,
          notes: 20
        })
        .select('coins, notes, subscription_tier')
        .single();

      if (insertError) {
        console.error('Supabase error (insert):', insertError);
        throw insertError;
      }
      console.log('Created new user:', newUser);
      const tier = (newUser.subscription_tier || 'free').toLowerCase();
      const plan = tier === 'legend' ? 'Legend' : tier === 'vip' ? 'VIP' : 'Free';

      return res.json({
        ...newUser,
        plan
      });
    } else if (fetchError) {
      console.error('Supabase error (fetch):', fetchError);
      throw fetchError;
    }

    console.log('Returning user:', user);
    const tier = (user.subscription_tier || 'free').toLowerCase();
    const plan = tier === 'legend' ? 'Legend' : tier === 'vip' ? 'VIP' : 'Free';

    res.json({
      ...user,
      plan
    });
  } catch (error) {
    console.error('Balance error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});


// ----------------------------------------
// Users Endpoints
// ----------------------------------------

app.get('/api/users', async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', requireAuth(), async (req, res) => {
  try {
    const { email, clerk_id } = req.body;

    if (!email || !clerk_id) {
      return res.status(400).json({ error: 'Missing required fields: email, clerk_id' });
    }

    const { data, error } = await supabase
      .from('users')
      .insert([{ email, clerk_id }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ----------------------------------------
// Support Chat Endpoint
// ----------------------------------------

app.post('/api/support/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages array' });
    }
    
    const settings = await getApiSettings();
    const openRouterConfig = settings.openrouter || {};
    const apiKey = openRouterConfig.apiKey || process.env.OPENROUTER_API_KEY;
    const supportAgent = settings.supportAgent || {
      model: 'google/gemini-2.5-flash',
      systemPrompt: 'JesteĹ› asystentem wsparcia mojhit.pl.'
    };
    
    if (!apiKey) {
      return res.status(500).json({ error: 'OpenRouter API key missing' });
    }
    
    const requestMessages = [
      { role: 'system', content: supportAgent.systemPrompt },
      ...messages
    ];
    
    const response = await fetch(openRouterConfig.baseUrl || 'https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://mojhit.pl',
        'X-Title': 'MojHit Support'
      },
      body: JSON.stringify({
        model: supportAgent.model,
        messages: requestMessages,
      })
    });
    
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter Error: ${errText}`);
    }
    
    const data = await response.json();
    res.json({ reply: data.choices[0].message.content });
  } catch (error) {
    console.error('Support chat error:', error.message);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

// ----------------------------------------
// Lyrics Endpoints
// ----------------------------------------

app.get('/api/lyrics', async (req, res) => {
  try {
    const { category, limit = 50 } = req.query;
    let query = supabase.from('lyrics').select('id, slug, title, category, tags, is_premium, uses_count, created_at');
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false }).limit(limit);
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/lyrics/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { data, error } = await supabase
      .from('lyrics')
      .select('*')
      .eq('slug', slug)
      .single();
      
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Text not found' });
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/sitemap.xml', async (req, res) => {
  try {
    const { data, error } = await supabase.from('lyrics').select('slug, created_at');
    if (error) {
      console.error('Sitemap fetch error:', error);
      // Even if DB fails, return basic sitemap
    }
    
    const baseUrl = 'https://mojhit.pl';
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
    
    // Add static pages
    const staticPages = ['', '/browse', '/contests', '/biuro-producentow', '/cennik'];
    staticPages.forEach(page => {
      xml += `\n  <url>\n    <loc>${baseUrl}${page}</loc>\n    <changefreq>daily</changefreq>\n    <priority>${page === '' ? '1.0' : '0.8'}</priority>\n  </url>`;
    });
    
    // Add dynamic lyrics pages
    if (data) {
      data.forEach(lyric => {
        const date = new Date(lyric.created_at).toISOString().split('T')[0];
        xml += `\n  <url>\n    <loc>${baseUrl}/teksty/${lyric.slug}</loc>\n    <lastmod>${date}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`;
      });
    }
    
    xml += '\n</urlset>';
    
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    res.status(500).send('Error generating sitemap');
  }
});

// ----------------------------------------
// Tracks Endpoints
// ----------------------------------------

app.get('/api/tracks', async (req, res) => {
  try {
    const { data, error } = await supabase.from('tracks').select('*, producers(name)');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tracks', requireAuth(), async (req, res) => {
  try {
    console.log('đź” Track endpoint req.auth type:', typeof req.auth);
    let authData;
    if (typeof req.auth === 'function') {
      authData = req.auth();
      console.log('đź” Track endpoint req.auth():', authData);
    } else {
      authData = req.auth;
      console.log('đź” Track endpoint req.auth:', authData);
    }

    const clerk_id = authData?.userId;
    const { title, description, audio_url, currency_type = 'coins', kie_task_id } = req.body;

    console.log('Creating track with currency:', currency_type);
    console.log('Received clerk_id:', clerk_id);
    console.log('Request body:', { title, description, audio_url, currency_type });

    if (!title || !audio_url) {
      return res.status(400).json({ error: 'Missing required fields: title, audio_url' });
    }

    // Fetch user to check balance and get the internal UUID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, coins, notes')
      .eq('clerk_id', clerk_id)
      .single();

    console.log('Supabase user fetch result:', { user, userError });

    if (userError || !user) {
      console.log('User not found or error:', userError);
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify balance
    if (currency_type === 'coins') {
      if (user.coins < 1) {
        return res.status(400).json({ error: 'NiewystarczajÄ…ca liczba monet (potrzebujesz 1).' });
      }
    } else if (currency_type === 'notes') {
      const currentNotes = user.notes || 0;
      if (currentNotes < 10) {
        return res.status(400).json({ error: 'NiewystarczajÄ…ca liczba not (potrzebujesz 10).' });
      }
    } else {
      return res.status(400).json({ error: 'NieprawidĹ‚owa waluta.' });
    }

    // Sequential transaction
    // 1. Deduct currency
    let updates = {};
    if (currency_type === 'coins') {
      updates = { coins: user.coins - 1 };
    } else {
      updates = { notes: (user.notes || 0) - 10 };
    }

    const { error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('clerk_id', clerk_id);

    if (updateError) {
      throw updateError;
    }

    // 2. Insert track mapping user_id to internal DB user.id
    const { data: track, error: trackError } = await supabase
      .from('tracks')
      .insert({
        user_id: user.id,
        title,
        description,
        audio_url,
        kie_task_id
      })
      .select()
      .single();

    if (trackError) {
      // Basic rollback mechanism
      await supabase.from('users').update(currency_type === 'coins' ? { coins: user.coins } : { notes: user.notes }).eq('clerk_id', clerk_id);
      throw trackError;
    }

    res.status(201).json(track);
  } catch (error) {
    console.error('Track creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tracks/my', requireAuth(), async (req, res) => {
  try {
    const authData = typeof req.auth === 'function' ? req.auth() : req.auth;
    const clerk_id = authData?.userId;

    if (!clerk_id) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', clerk_id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found in mapping' });
    }

    // Get tracks
    const { data: tracks, error: tracksError } = await supabase
      .from('tracks')
      .select('id, title, description, audio_url, cover_image_url, created_at, producer_id, producers(name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (tracksError) throw tracksError;

    res.json(tracks);
  } catch (err) {
    console.error('Error fetching my tracks:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/tracks/:id', requireAuth(), async (req, res) => {
  try {
    const { id } = req.params;

    // Auth validation
    const authData = typeof req.auth === 'function' ? req.auth() : req.auth;
    const clerk_id = authData?.userId;
    if (!clerk_id) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Verify track visually
    const { data: track, error } = await supabase
      .from('tracks')
      .select('*, producers(id, name, badge, img, gradient, theme_config, init_msg, header_title, header_status, typing_msg, placeholder, tier, is_on_main_page), users(email, clerk_id)')
      .eq('id', id)
      .single();

    if (error || !track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    // Fetch variants if kie_task_id exists
    let variants = [];
    if (track.kie_task_id) {
      const { data: variantsData } = await supabase
        .from('kie_track_variants')
        .select('audio_url, stream_audio_url, image_url, title, tags, variant_index, prompt')
        .eq('task_id', track.kie_task_id)
        .order('variant_index');

      if (variantsData && variantsData.length > 0) {
        // Exclude current variant (the one being viewed)
        variants = variantsData.filter(v => v.variant_index !== track.variant_index);
      }
    }

    // Return track with variants
    res.json({
      ...track,
      variants
    });
  } catch (error) {
    console.error('Error fetching track details:', error);
    res.status(500).json({ error: error.message });
  }
});


// ----------------------------------------
// Transactions Endpoints
// ----------------------------------------

app.get('/api/transactions', async (req, res) => {
  try {
    const { data, error } = await supabase.from('transactions').select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/transactions', requireAuth(), async (req, res) => {
  try {
    const { user_id, type, amount } = req.body;

    if (!user_id || !type || amount === undefined) {
      return res.status(400).json({ error: 'Missing required fields: user_id, type, amount' });
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert([{ user_id, type, amount }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ----------------------------------------
// Producers Endpoints (Admin & Public)
// ----------------------------------------

// Public: GET all active producers
app.get('/api/producers', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('producers')
      .select('*')
      .eq('is_active', true)
      .order('price_coins', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Get API Settings
app.get('/api/admin/settings/api', async (req, res) => {
  try {
    const settings = await getApiSettings();
    if (!settings) throw new Error('Failed to load settings');
    res.json(settings);
  } catch (error) {
    console.error('Get API settings error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin: Update API Settings
app.put('/api/admin/settings/api', async (req, res) => {
  try {
    const success = await updateApiSettings(req.body);
    if (!success) throw new Error('Failed to save settings');
    res.json({ success: true, settings: req.body });
  } catch (error) {
    console.error('Update API settings error:', error);
    res.status(500).json({ error: error.message });
  }
});



// Admin: GET all producers (including inactive)
app.get('/api/admin/producers', requireAuth(), requireAdmin, async (req, res) => {
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
  });

// Admin: POST create a new producer
app.post('/api/admin/producers', requireAuth(), requireAdmin, async (req, res) => {
  try {
    const { id, name, badge, icon, img, init_msg, header_title, header_status, typing_msg, placeholder, gradient, button_gradient, theme_config, system_prompt, model_name, price_coins, is_active } = req.body;

    if (!id || !name) {
      return res.status(400).json({ error: 'Missing required fields: id, name' });
    }

    const { data, error } = await supabase
      .from('producers')
      .insert([{ id, name, badge, icon, img, init_msg, header_title, header_status, typing_msg, placeholder, gradient, button_gradient, theme_config, system_prompt, model_name, price_coins, is_active }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: PUT update an existing producer
app.put('/api/admin/producers/:id', requireAuth(), requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('producers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: DELETE a producer
app.delete('/api/admin/producers/:id', requireAuth(), requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('producers')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------
// Buy Producer Endpoints
// ----------------------------------------

app.post('/api/buy-producer', requireAuth(), async (req, res) => {
  try {
    const authData = typeof req.auth === 'function' ? req.auth() : req.auth;
    const clerk_id = authData?.userId;
    const { producer_id } = req.body;

    if (!clerk_id || !producer_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 1. Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, coins')
      .eq('clerk_id', clerk_id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 2. Get producer
    const { data: producer, error: producerError } = await supabase
      .from('producers')
      .select('id, price_coins')
      .eq('id', producer_id)
      .single();

    if (producerError || !producer) {
      return res.status(404).json({ error: 'Producer not found' });
    }

    // 3. Check if already purchased
    const { data: existing, error: checkError } = await supabase
      .from('user_producers')
      .select('id')
      .eq('user_id', user.id)
      .eq('producer_id', producer_id)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Producent zostaĹ‚ juĹĽ odblokowany!' });
    }

    // 4. Check balance and deduct
    if (producer.price_coins > 0) {
      if (user.coins < producer.price_coins) {
        return res.status(400).json({ error: 'NiewystarczajÄ…ca liczba monet' });
      }

      const { error: deductError } = await supabase
        .from('users')
        .update({ coins: user.coins - producer.price_coins })
        .eq('id', user.id);

      if (deductError) throw deductError;

      // Log transaction
      await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'buy_producer',
          amount: -producer.price_coins
        });
    }

    // 5. Unlock producer
    const { data: unlocked, error: unlockError } = await supabase
      .from('user_producers')
      .insert({
        user_id: user.id,
        producer_id: producer_id
      })
      .select()
      .single();

    if (unlockError) throw unlockError;

    res.json({ success: true, unlocked });
  } catch (error) {
    console.error('Buy producer error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/user-producers', requireAuth(), async (req, res) => {
  try {
    const authData = typeof req.auth === 'function' ? req.auth() : req.auth;
    const clerk_id = authData?.userId;

    if (!clerk_id) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get user id
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', clerk_id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get unlocked producers
    const { data, error } = await supabase
      .from('user_producers')
      .select('producer_id, unlocked_at, expires_at')
      .eq('user_id', user.id);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------
// Suno Endpoints
// ----------------------------------------

app.post('/api/suno/generate', async (req, res) => {
  try {
    const { prompt, tags, title, instrumental = false, model = 'V4', currency_type = 'notes', customMode = false, personaId, personaModel, email } = req.body;
    console.log('[SUNO GENERATE] Received personaId:', personaId, 'personaModel:', personaModel);

    // 1. ĐźĐľĐ»ŃƒŃ‡Đ¸Ń‚ŃŚ user_id Đ¸Đ· Clerk
    const authData = typeof req.auth === 'function' ? req.auth() : req.auth;
    const clerk_id = authData?.userId;
    let user = null;
    let guestSessionId = req.headers['x-guest-session'] || req.cookies?.guest_session || '';

    if (!clerk_id) {
      // GUEST LOGIC
      let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      if (ip && ip.includes(',')) ip = ip.split(',')[0].trim();
      
      let { data: guestLimit, error: limitError } = await supabase
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
      console.log(`[GUEST GENERATE] Allowed generation for IP ${ip}`);
    } else {
      // 2. ĐťĐ°ĐąŃ‚Đ¸ ĐżĐľĐ»ŃŚĐ·ĐľĐ˛Đ°Ń‚ĐµĐ»ŃŹ Đ˛ Đ‘Đ” Đ¸ ĐżŃ€ĐľĐ˛ĐµŃ€Đ¸Ń‚ŃŚ Đ±Đ°Đ»Đ°Đ˝Ń 
      let { data: dbUser, error: userError } = await supabase
        .from('users')
        .select('id, coins, notes')
        .eq('clerk_id', clerk_id)
        .single();

      if (userError || !dbUser) {
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            clerk_id,
            email: authData.email || '',
            coins: 0,
            notes: 20
          })
          .select('id, coins, notes')
          .single();

        if (insertError || !newUser) {
          console.error('Failed to create user:', insertError);
          return res.status(500).json({ error: 'Nie udało się utworzyć użytkownika.' });
        }
        dbUser = newUser;
      }
      user = dbUser;

      const cost = currency_type === 'coins' ? 1 : 10;
      if (currency_type === 'coins' && (user.coins || 0) < cost) {
        return res.status(400).json({ error: 'Niewystarczająca liczba monet.' });
      }
      if (currency_type === 'notes' && (user.notes || 0) < cost) {
        return res.status(400).json({ error: 'Niewystarczająca liczba not.' });
      }

      const updates = currency_type === 'coins'
        ? { coins: (user.coins || 0) - cost }
        : { notes: (user.notes || 0) - cost };

      const { error: deductError } = await supabase
        .from('users')
        .update(updates)
        .eq('clerk_id', clerk_id);

      if (deductError) {
        console.error('Failed to deduct currency:', deductError);
        return res.status(500).json({ error: 'Nie udało się pobrać opłaty.' });
      }

      console.log(`[PAYMENT] Deducted ${cost} ${currency_type} from user ${clerk_id}`);

      await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: currency_type === 'coins' ? 'deduct_coins' : 'deduct_notes',
          amount: -cost
        });
    }

    // 4. Utworz zadanie w bazie
    const { data: task, error: taskError } = await supabase
      .from('kie_tasks')
      .insert({
        user_id: user?.id || null,
        guest_session_id: guestSessionId,
        guest_email: email || null,
        prompt,
        model,
        persona_id: personaId || null,
        status: 'pending'
      })
      .select()
      .single();

    if (taskError || !task) {
      console.error('Failed to create kie_task:', taskError);
      return res.status(500).json({ error: 'Nie udaĹ‚o siÄ™ utworzyÄ‡ zadania generacji.' });
    }

    // 5. Đ’Ń‹Đ·Đ˛Đ°Ń‚ŃŚ API Ń ŃŃ‡ĐµŃ‚ĐľĐĽ fallback
    const apiSettings = await getApiSettings();
    const musicConfig = apiSettings?.music || { active: 'kie', fallback: 'suno_direct' };
    
    // Get enabled providers
    const enabledProviders = await getMusicProviders();
    if (enabledProviders.length === 0) {
      throw new Error('No music providers enabled in settings');
    }
    
    // Determine active provider (first enabled by priority, or from config)
    let activeProvider = musicConfig.active;
    // Check if active provider is enabled
    const activeProviderEnabled = enabledProviders.find(p => p.key === activeProvider);
    if (!activeProviderEnabled) {
      // Use first enabled provider
      activeProvider = enabledProviders[0].key;
      console.log(`[MUSIC GENERATION] Active provider from config not enabled, using ${activeProvider}`);
    }
    
    let taskId;
    let usedProvider = activeProvider;

    try {
      if (activeProvider === 'kie') {
        taskId = await kie.generate(prompt, tags, title, instrumental, model, customMode, personaId, personaModel);
      } else if (activeProvider === 'suno') {
        // Use Suno API via sunoapi.org
        // Set environment variables for API key and base URL
        const sunoProvider = enabledProviders.find(p => p.key === 'suno');
        if (sunoProvider) {
          process.env.SUNO_API_KEY = sunoProvider.apiKey || '';
          process.env.SUNO_API_BASE_URL = sunoProvider.baseUrl || 'https://api.sunoapi.org/api/v1';
        }
        taskId = await suno.generate(prompt, tags, title, instrumental, model, customMode, personaId, personaModel);
      } else {
        // Fallback to suno_direct (Local Python API)
        throw new Error("Local Suno API not fully implemented yet");
        // const response = await fetch('http://127.0.0.1:8000/generate', { ... });
      }
    } catch (primaryErr) {
      console.warn(`[MUSIC GENERATION] Primary provider (${activeProvider}) failed. Trying fallback. Error: ${primaryErr.message}`);
      
      // Try next enabled provider in order
      const currentIndex = enabledProviders.findIndex(p => p.key === activeProvider);
      const nextProvider = enabledProviders[currentIndex + 1];
      
      if (!nextProvider) {
        throw new Error(`All enabled providers failed. Last error: ${primaryErr.message}`);
      }
      
      usedProvider = nextProvider.key;
      console.log(`[MUSIC GENERATION] Switching to fallback provider: ${usedProvider}`);
      
      if (usedProvider === 'kie') {
        taskId = await kie.generate(prompt, tags, title, instrumental, model, customMode, personaId, personaModel);
      } else if (usedProvider === 'suno') {
        const sunoProvider = enabledProviders.find(p => p.key === 'suno');
        if (sunoProvider) {
          process.env.SUNO_API_KEY = sunoProvider.apiKey || '';
          process.env.SUNO_API_BASE_URL = sunoProvider.baseUrl || 'https://api.sunoapi.org/api/v1';
        }
        taskId = await suno.generate(prompt, tags, title, instrumental, model, customMode, personaId, personaModel);
      } else {
        console.log('[MUSIC GENERATION] Simulating fallback to local Python API...');
        taskId = `suno-fallback-${Date.now()}`;
        // Simulated local python api call
      }
    }

    // 6. ĐžĐ±Đ˝ĐľĐ˛Đ¸Ń‚ŃŚ task_id
    await supabase
      .from('kie_tasks')
      .update({ task_id: taskId, provider: usedProvider }) // Assuming provider column might exist, or just ignored if not
      .eq('id', task.id);

    res.json({ taskId, dbId: task.id, provider: usedProvider });
  } catch (error) {
    console.error('Kie generate error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/webhooks/kie', express.json(), async (req, res) => {
  console.log('[KIE WEBHOOK] Received callback headers:', req.headers);
  console.log('[KIE WEBHOOK] Received callback body:', JSON.stringify(req.body, null, 2));
  try {
    const { code, msg, data } = req.body;

    if (code !== 200) {
      console.error('Kie callback error:', msg);
      // ĐžĐ±Đ˝ĐľĐ˛Đ¸Ń‚ŃŚ ŃŃ‚Đ°Ń‚ŃŃ Đ·Đ°Đ´Đ°Ń‡Đ¸ ĐşĐ°Đş failed
      await supabase
        .from('kie_tasks')
        .update({
          status: 'failed',
          error_msg: msg,
          updated_at: new Date()
        })
        .eq('task_id', data?.task_id);
      return res.sendStatus(200); // Đ’ŃĐµĐłĐ´Đ° 200 Ń‡Ń‚ĐľĐ±Ń‹ kie.ai Đ˝Đµ ĐżĐľĐ˛Ń‚ĐľŃ€ŃŹĐ»
    }

    // ĐĐ·Đ˛Đ»ĐµĐşĐ°ĐµĐĽ task_id Đ¸Đ· Ń€Đ°Đ·Đ˝Ń‹Ń… Đ˛ĐľĐ·ĐĽĐľĐ¶Đ˝Ń‹Ń… ĐĽĐµŃŃ‚
    let taskId = data?.task_id || data?.taskId || data?.taskId;
    let callbackType = data?.callbackType || 'complete';

    // ĐŃ‰ĐµĐĽ ĐĽĐ°ŃŃĐ¸Đ˛ Ń‚Ń€ĐµĐşĐľĐ˛ Đ˛ Ń€Đ°Đ·Đ˝Ń‹Ń… Đ˛ĐľĐ·ĐĽĐľĐ¶Đ˝Ń‹Ń… ĐĽĐµŃŃ‚Đ°Ń…
    let tracks = null;
    if (data?.data && Array.isArray(data.data)) {
      tracks = data.data; // Đ¤ĐľŃ€ĐĽĐ°Ń‚ Đ¸Đ· Đ´ĐľĐşŃĐĽĐµĐ˝Ń‚Đ°Ń†Đ¸Đ¸
    } else if (data?.tracks && Array.isArray(data.tracks)) {
      tracks = data.tracks;
    } else if (data?.response?.sunoData && Array.isArray(data.response.sunoData)) {
      tracks = data.response.sunoData;
    } else if (Array.isArray(data)) {
      tracks = data;
    }

    // ĐžĐ±Đ˝ĐľĐ˛Đ¸Ń‚ŃŚ Đ·Đ°Đ´Đ°Ń‡Ń Đ˛ Đ‘Đ”
    const updates = {
      status: callbackType === 'complete' ? 'completed' : 'processing',
      updated_at: new Date()
    };

    // Đ•ŃĐ»Đ¸ ĐµŃŃ‚ŃŚ Ń‚Ń€ĐµĐşĐ¸ â€” ŃĐľŃ…Ń€Đ°Đ˝Đ¸Ń‚ŃŚ ĐżĐµŃ€Đ˛Ń‹Đą (ĐĽĐľĐ¶Đ˝Đľ Ń€Đ°ŃŃĐ¸Ń€Đ¸Ń‚ŃŚ Đ´Đ»ŃŹ multiple)
    if (tracks && tracks.length > 0) {
      const first = tracks[0];
      // ĐźĐľĐ´Đ´ĐµŃ€Đ¶Đ¸Đ˛Đ°ĐµĐĽ ĐľĐ±Đ° Đ˛Đ°Ń€Đ¸Đ°Đ˝Ń‚Đ° Đ˝Đ°Đ·Đ˛Đ°Đ˝Đ¸Đą ĐżĐľĐ»ĐµĐą (camelCase Đ¸ snake_case)
      updates.audio_url = first.audioUrl || first.audio_url || null;
      updates.image_url = first.imageUrl || first.image_url || null;
      updates.stream_audio_url = first.streamAudioUrl || first.stream_audio_url || null;
      updates.title = first.title || null;
      updates.tags = first.tags || null;
      updates.duration = first.duration || null;

      // Đ•ŃĐ»Đ¸ audio_url ĐżŃŃŃ‚ĐľĐą, Đ˝Đľ ĐµŃŃ‚ŃŚ stream_audio_url, Đ¸ŃĐżĐľĐ»ŃŚĐ·ŃĐµĐĽ ĐµĐłĐľ ĐşĐ°Đş ĐľŃĐ˝ĐľĐ˛Đ˝ĐľĐą audio_url
      if (!updates.audio_url && updates.stream_audio_url) {
        updates.audio_url = updates.stream_audio_url;
      }

      console.log('[KIE WEBHOOK] Updating task with audio URL:', updates.audio_url);
    }

    if (!taskId) {
      console.error('[KIE WEBHOOK] No task_id found in callback');
      return res.sendStatus(200); // Đ’ŃĐµĐłĐ´Đ° 200 Ń‡Ń‚ĐľĐ±Ń‹ kie.ai Đ˝Đµ ĐżĐľĐ˛Ń‚ĐľŃ€ŃŹĐ»
    }

    const { error: updateError } = await supabase
      .from('kie_tasks')
      .update(updates)
      .eq('task_id', taskId);

    if (updateError) {
      console.error('[KIE WEBHOOK] Supabase update error:', updateError);
    } else {
      console.log('[KIE WEBHOOK] Task updated successfully for task_id:', taskId);

      // ĐˇĐľŃ…Ń€Đ°Đ˝ŃŹĐµĐĽ Đ˛ŃĐµ Đ˛Đ°Ń€Đ¸Đ°Đ˝Ń‚Ń‹ Ń‚Ń€ĐµĐşĐľĐ˛, ĐµŃĐ»Đ¸ ĐµŃŃ‚ŃŚ
      if (tracks && tracks.length > 0) {
        // ĐźĐľĐ»ŃŃ‡Đ°ĐµĐĽ Đ˛Đ˝ŃŃ‚Ń€ĐµĐ˝Đ˝Đ¸Đą id Đ·Đ°Đ´Đ°Ń‡Đ¸ Đ¸ persona_id
        const { data: taskRecord } = await supabase
          .from('kie_tasks')
          .select('id, user_id, persona_id, guest_session_id, guest_email')
          .eq('task_id', taskId)
          .single();

        if (taskRecord) {
          console.log('[KIE WEBHOOK] Task record persona_id:', taskRecord.persona_id);
          const variantsToInsert = tracks.map((track, index) => ({
            task_id: taskRecord.id,
            variant_index: index,
            audio_url: track.audioUrl || track.audio_url || null,
            image_url: track.imageUrl || track.image_url || null,
            stream_audio_url: track.streamAudioUrl || track.stream_audio_url || null,
            title: track.title || null,
            tags: track.tags || null,
            prompt: track.prompt || null,
            duration: track.duration || null
          }));

          // ĐŁĐ´Đ°Đ»ŃŹĐµĐĽ ŃŃ‚Đ°Ń€Ń‹Đµ Đ˛Đ°Ń€Đ¸Đ°Đ˝Ń‚Ń‹ Đ´Đ»ŃŹ ŃŤŃ‚ĐľĐą Đ·Đ°Đ´Đ°Ń‡Đ¸ (ĐµŃĐ»Đ¸ Đ±Ń‹Đ»Đ¸)
          await supabase
            .from('kie_track_variants')
            .delete()
            .eq('task_id', taskRecord.id);

          // Đ’ŃŃ‚Đ°Đ˛Đ»ŃŹĐµĐĽ Đ˝ĐľĐ˛Ń‹Đµ Đ˛Đ°Ń€Đ¸Đ°Đ˝Ń‚Ń‹
          const { error: variantsError } = await supabase
            .from('kie_track_variants')
            .insert(variantsToInsert);

          if (variantsError) {
            console.error('[KIE WEBHOOK] Failed to insert variants:', variantsError);
          } else {
            console.log(`[KIE WEBHOOK] Inserted ${variantsToInsert.length} track variants`);
          }

          // ĐˇĐľĐ·Đ´Đ°Ń‘ĐĽ/ĐľĐ±Đ˝ĐľĐ˛Đ»ŃŹĐµĐĽ Ń‚Ń€ĐµĐşĐ¸ Đ´Đ»ŃŹ ĐşĐ°Đ¶Đ´ĐľĐłĐľ Đ˛Đ°Ń€Đ¸Đ°Đ˝Ń‚Đ°
          for (const [index, variant] of variantsToInsert.entries()) {
            const trackTitle = `${variant.title || 'Track'} V${index + 1}`;
            
            // ĐźŃ€ĐľĐ˛ĐµŃ€ŃŹĐµĐĽ, ŃŃŃ‰ĐµŃŃ‚Đ˛ŃĐµŃ‚ Đ»Đ¸ ŃĐ¶Đµ Ń‚Ń€ĐµĐş Ń Ń‚Đ°ĐşĐ¸ĐĽ kie_task_id Đ¸ variant_index
            const { data: existingTrack } = await supabase
              .from('tracks')
              .select('id')
              .eq('kie_task_id', taskRecord.id)
              .eq('variant_index', index)
              .single();
            
            const trackData = {
              user_id: taskRecord.user_id,
              guest_session_id: taskRecord.guest_session_id,
              guest_email: taskRecord.guest_email,
              is_paid: !!taskRecord.user_id,
              is_unlocked: !!taskRecord.user_id,
              title: trackTitle,
              description: variant.prompt || '',
              audio_url: variant.audio_url,
              cover_image_url: variant.image_url,
              kie_task_id: taskRecord.id,
              variant_index: index,
              producer_id: taskRecord.persona_id, // persona_id from kie_tasks (should match producers.id)
              likes: 0,
              plays: 0,
              expired: false
            };
            
            if (existingTrack) {
              // ĐžĐ±Đ˝ĐľĐ˛Đ»ŃŹĐµĐĽ ŃŃŃ‰ĐµŃŃ‚Đ˛ŃŃŽŃ‰Đ¸Đą Ń‚Ń€ĐµĐş
              const { error: updateError } = await supabase
                .from('tracks')
                .update(trackData)
                .eq('id', existingTrack.id);
              
              if (updateError) {
                console.error(`[KIE WEBHOOK] Failed to update track variant ${index}:`, updateError);
              } else {
                console.log(`[KIE WEBHOOK] Updated track variant ${index} (ID: ${existingTrack.id})`);
              }
            } else {
              // ĐˇĐľĐ·Đ´Đ°Ń‘ĐĽ Đ˝ĐľĐ˛Ń‹Đą Ń‚Ń€ĐµĐş
              const { data: newTrack, error: insertError } = await supabase
                .from('tracks')
                .insert(trackData)
                .select('id')
                .single();
              
              if (insertError) {
                console.error(`[KIE WEBHOOK] Failed to create track variant ${index}:`, insertError);
              } else {
                console.log(`[KIE WEBHOOK] Created track variant ${index} (ID: ${newTrack.id})`);
                
                // Send email notification for the first variant only
                if (index === 0) {
                  try {
                    // Get user email
                    const { data: userData } = await supabase
                      .from('users')
                      .select('email')
                      .eq('clerk_id', taskRecord.user_id)
                      .single();
                    
                    // Get producer name
                    let producerName = 'AI Wykonawca';
                    if (taskRecord.persona_id) {
                      const { data: producerData } = await supabase
                        .from('producers')
                        .select('name')
                        .eq('id', taskRecord.persona_id)
                        .single();
                      if (producerData) producerName = producerData.name;
                    }
                    
                    if (userData && userData.email) {
                      const trackTitle = variant.title || 'Twój hit';
                      const trackData = {
                        title: trackTitle,
                        audio_url: variant.audio_url || variant.stream_audio_url || '',
                        download_url: variant.audio_url || variant.stream_audio_url || '',
                        cover_image_url: variant.image_url || null,
                      };
                      
                      const userName = userData.email.split('@')[0];
                      const emailSent = await sendTrackEmail(
                        userData.email,
                        trackData,
                        producerName,
                        userName
                      );
                      
                      if (emailSent) {
                        console.log(`[KIE WEBHOOK] Track notification email sent to ${userData.email}`);
                      } else {
                        console.warn(`[KIE WEBHOOK] Failed to send email to ${userData.email}`);
                      }
                    }
                  } catch (emailError) {
                    console.error('[KIE WEBHOOK] Email sending error:', emailError);
                    // Don't fail the webhook because of email error
                  }
                }
              }
            }
          }
          
          // ĐŁĐ´Đ°Đ»ŃŹĐµĐĽ Đ˛ĐľĐ·ĐĽĐľĐ¶Đ˝Ń‹Đµ Đ»Đ¸ŃĐ˝Đ¸Đµ Ń‚Ń€ĐµĐşĐ¸ (ĐµŃĐ»Đ¸ Đ˛Đ°Ń€Đ¸Đ°Đ˝Ń‚ĐľĐ˛ ŃŃ‚Đ°Đ»Đľ ĐĽĐµĐ˝ŃŚŃĐµ, Ń‡ĐµĐĽ Đ±Ń‹Đ»Đľ Ń€Đ°Đ˝ĐµĐµ)
          const { data: allTracks } = await supabase
            .from('tracks')
            .select('id, variant_index')
            .eq('kie_task_id', taskRecord.id);
          
          if (allTracks) {
            const variantIndices = variantsToInsert.map((_, idx) => idx);
            const tracksToDelete = allTracks.filter(track => !variantIndices.includes(track.variant_index));
            for (const track of tracksToDelete) {
              await supabase
                .from('tracks')
                .delete()
                .eq('id', track.id);
              console.log(`[KIE WEBHOOK] Deleted obsolete track variant ${track.variant_index} (ID: ${track.id})`);
            }
          }
        }
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.sendStatus(200); // Đ’ŃĐµĐłĐ´Đ° 200 Ń‡Ń‚ĐľĐ±Ń‹ Đ˝Đµ Đ±Ń‹Đ»Đľ ĐżĐľĐ˛Ń‚ĐľŃ€Đ˝Ń‹Ń… ĐżĐľĐżŃ‹Ń‚ĐľĐş
  }
});

app.get('/api/suno/status/:id', requireAuth(), async (req, res) => {
  try {
    const { id } = req.params; // Đ­Ń‚Đľ taskId ĐľŃ‚ kie.ai Đ¸Đ»Đ¸ Đ˝Đ°Ń dbId

    // ĐˇĐ˝Đ°Ń‡Đ°Đ»Đ° Đ¸Ń‰ĐµĐĽ Đ˛ Đ‘Đ”
    const { data: task } = await supabase
      .from('kie_tasks')
      .select('*')
      .or(`task_id.eq.${id},id.eq.${id}`)
      .single();

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Đ•ŃĐ»Đ¸ ŃŃ‚Đ°Ń‚ŃŃ pending Đ¸ ĐżŃ€ĐľŃĐ»Đľ Đ±ĐľĐ»ŃŚŃĐµ 30 ŃĐµĐşŃĐ˝Đ´ â€” ĐżŃ€ĐľĐ˛ĐµŃ€Đ¸Ń‚ŃŚ Ń‡ĐµŃ€ĐµĐ· API
    if (task.status === 'pending' && task.task_id &&
      new Date() - new Date(task.created_at) > 30000) {
      try {
        console.log(`[STATUS] Polling kie.ai for task ${task.task_id}`);
        const status = await kie.getTaskStatus(task.task_id);

        // Đ•ŃĐ»Đ¸ Đ·Đ°ĐżŃ€ĐľŃ ŃŃĐżĐµŃĐµĐ˝ Đ¸ ĐµŃŃ‚ŃŚ Đ´Đ°Đ˝Đ˝Ń‹Đµ
        if (status.code === 200 && status.data) {
          const kieStatus = status.data.status;
          const sunoData = status.data.response?.sunoData;

          // ĐžĐżŃ€ĐµĐ´ĐµĐ»ŃŹĐµĐĽ ŃŃ‚Đ°Ń‚ŃŃ Đ´Đ»ŃŹ Đ‘Đ”
          let dbStatus = 'processing';
          if (kieStatus === 'SUCCESS') dbStatus = 'completed';
          else if (kieStatus === 'TEXT_SUCCESS' || kieStatus === 'FIRST_SUCCESS') dbStatus = 'processing';
          else if (kieStatus === 'PENDING') dbStatus = 'pending';
          else if (kieStatus === 'CREATE_TASK_FAILED' || kieStatus === 'GENERATE_AUDIO_FAILED' ||
            kieStatus === 'SENSITIVE_WORD_ERROR' || kieStatus === 'CALLBACK_EXCEPTION') {
            dbStatus = 'failed';
          }

          const updates = {
            status: dbStatus,
            updated_at: new Date()
          };

          // Đ•ŃĐ»Đ¸ ĐµŃŃ‚ŃŚ Ń‚Ń€ĐµĐşĐ¸ â€” ŃĐľŃ…Ń€Đ°Đ˝ŃŹĐµĐĽ Đ´Đ°Đ˝Đ˝Ń‹Đµ ĐżĐµŃ€Đ˛ĐľĐłĐľ
          if (sunoData && sunoData.length > 0) {
            const first = sunoData[0];
            updates.audio_url = first.audioUrl || first.audio_url || null;
            updates.image_url = first.imageUrl || first.image_url || null;
            updates.stream_audio_url = first.streamAudioUrl || first.stream_audio_url || null;
            updates.title = first.title || null;
            updates.tags = first.tags || null;
            updates.duration = first.duration || null;

            // Đ•ŃĐ»Đ¸ audio_url ĐżŃŃŃ‚ĐľĐą, Đ˝Đľ ĐµŃŃ‚ŃŚ stream_audio_url, Đ¸ŃĐżĐľĐ»ŃŚĐ·ŃĐµĐĽ ĐµĐłĐľ ĐşĐ°Đş ĐľŃĐ˝ĐľĐ˛Đ˝ĐľĐą audio_url
            if (!updates.audio_url && updates.stream_audio_url) {
              updates.audio_url = updates.stream_audio_url;
            }
          }

          // Đ•ŃĐ»Đ¸ ŃŃ‚Đ°Ń‚ŃŃ failed, ŃĐľŃ…Ń€Đ°Đ˝ŃŹĐµĐĽ ŃĐľĐľĐ±Ń‰ĐµĐ˝Đ¸Đµ ĐľĐ± ĐľŃĐ¸Đ±ĐşĐµ
          if (dbStatus === 'failed') {
            updates.error_msg = status.data.errorMessage || `Kie.ai status: ${kieStatus}`;
          }

          await supabase
            .from('kie_tasks')
            .update(updates)
            .eq('id', task.id);

          // ĐžĐ±Đ˝ĐľĐ˛Đ»ŃŹĐµĐĽ Đ»ĐľĐşĐ°Đ»ŃŚĐ˝Ń‹Đą ĐľĐ±ŃŠĐµĐşŃ‚ task Đ´Đ»ŃŹ ĐľŃ‚Đ˛ĐµŃ‚Đ°
          Object.assign(task, updates);
          console.log(`[STATUS] Task ${task.task_id} updated via polling to ${dbStatus}`);

          // ĐˇĐľŃ…Ń€Đ°Đ˝ŃŹĐµĐĽ Đ˛ŃĐµ Đ˛Đ°Ń€Đ¸Đ°Đ˝Ń‚Ń‹ Ń‚Ń€ĐµĐşĐľĐ˛, ĐµŃĐ»Đ¸ ĐµŃŃ‚ŃŚ
          if (sunoData && sunoData.length > 0) {
            const variantsToInsert = sunoData.map((track, index) => ({
              task_id: task.id,
              variant_index: index,
              audio_url: track.audioUrl || track.audio_url || null,
              image_url: track.imageUrl || track.image_url || null,
              stream_audio_url: track.streamAudioUrl || track.stream_audio_url || null,
              title: track.title || null,
              tags: track.tags || null,
              duration: track.duration || null
            }));

            try {
              // ĐŁĐ´Đ°Đ»ŃŹĐµĐĽ ŃŃ‚Đ°Ń€Ń‹Đµ Đ˛Đ°Ń€Đ¸Đ°Đ˝Ń‚Ń‹ Đ´Đ»ŃŹ ŃŤŃ‚ĐľĐą Đ·Đ°Đ´Đ°Ń‡Đ¸ (ĐµŃĐ»Đ¸ Đ±Ń‹Đ»Đ¸)
              await supabase
                .from('kie_track_variants')
                .delete()
                .eq('task_id', task.id);

              // Đ’ŃŃ‚Đ°Đ˛Đ»ŃŹĐµĐĽ Đ˝ĐľĐ˛Ń‹Đµ Đ˛Đ°Ń€Đ¸Đ°Đ˝Ń‚Ń‹
              const { error: variantsError } = await supabase
                .from('kie_track_variants')
                .insert(variantsToInsert);

              if (variantsError) {
                console.error('[STATUS] Failed to insert variants:', variantsError);
              } else {
                console.log(`[STATUS] Inserted ${variantsToInsert.length} track variants`);
              }
            } catch (err) {
              console.error('[STATUS] Error saving variants:', err.message);
              // ĐĐłĐ˝ĐľŃ€Đ¸Ń€ŃĐµĐĽ ĐľŃĐ¸Đ±ĐşĐ¸, Ń‡Ń‚ĐľĐ±Ń‹ Đ˝Đµ Đ»ĐľĐĽĐ°Ń‚ŃŚ ĐľŃĐ˝ĐľĐ˛Đ˝ĐľĐą ĐżĐľŃ‚ĐľĐş
            }
          }
        }
      } catch (e) {
        console.error('[STATUS] Polling error:', e.message);
        // ĐĐłĐ˝ĐľŃ€Đ¸Ń€ŃĐµĐĽ ĐľŃĐ¸Đ±ĐşĐ¸ polling
      }
    }

    // Đ—Đ°ĐżŃ€Đ°ŃĐ¸Đ˛Đ°ĐµĐĽ Đ˛Đ°Ń€Đ¸Đ°Đ˝Ń‚Ń‹ Ń‚Ń€ĐµĐşĐľĐ˛, ĐµŃĐ»Đ¸ ĐµŃŃ‚ŃŚ
    let variants = [];
    try {
      const { data: variantsData } = await supabase
        .from('kie_track_variants')
        .select('*')
        .eq('task_id', task.id)
        .order('variant_index');

      if (variantsData && variantsData.length > 0) {
        variants = variantsData;
      }
    } catch (err) {
      console.error('[STATUS] Error fetching variants:', err.message);
      // ĐĐłĐ˝ĐľŃ€Đ¸Ń€ŃĐµĐĽ ĐľŃĐ¸Đ±ĐşŃ
    }

    res.json({
      status: task.status,
      audio_url: task.audio_url,
      title: task.title,
      duration: task.duration,
      variants: variants
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------
// Video Generation Endpoints (PRO Tier Only)
// ----------------------------------------

app.post('/api/video/generate', requireAuth(), async (req, res) => {
  try {
    const { audioTaskId } = req.body; // kie_tasks.id (database ID) or kie_tasks.task_id
    
    if (!audioTaskId) {
      return res.status(400).json({ error: 'audioTaskId is required' });
    }
    
    // 1. Get user from Clerk
    const authData = typeof req.auth === 'function' ? req.auth() : req.auth;
    const clerk_id = authData?.userId;
    
    if (!clerk_id) {
      return res.status(401).json({ error: 'NieprawidĹ‚owa autoryzacja Clerk.' });
    }
    
    // 2. Find or create user and check subscription tier
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('id, subscription_tier')
      .eq('clerk_id', clerk_id)
      .single();
    
    // If user not found but is admin, create user with pro tier
    if (userError || !user) {
      if (ADMIN_USER_IDS.includes(clerk_id)) {
        // Create admin user with legend tier
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            clerk_id: clerk_id,
            subscription_tier: 'legend',
            coins_balance: 100,
            email: 'admin@mojhit.pl',
            name: 'Admin User'
          })
          .select('id, subscription_tier')
          .single();
        
        if (createError || !newUser) {
          console.error('Failed to create admin user:', createError);
          return res.status(500).json({ error: 'Nie udaĹ‚o siÄ™ utworzyÄ‡ uĹĽytkownika administracyjnego.' });
        }
        user = newUser;
      } else {
        return res.status(404).json({ error: 'User not found' });
      }
    }
    
    // VIP/Legend tier check (skip for admin users)
    if (!ADMIN_USER_IDS.includes(clerk_id) && user.subscription_tier !== 'vip' && user.subscription_tier !== 'legend') {
      return res.status(403).json({ 
        error: 'Video generation is available only for PRO and Enterprise subscribers. Upgrade your account.' 
      });
    }
    
    // 3. Find audio task (kie_tasks) and ensure it belongs to user and is completed
    const { data: audioTask, error: audioTaskError } = await supabase
      .from('kie_tasks')
      .select('id, task_id, audio_url, title, duration')
      .eq('user_id', user.id)
      .or(`id.eq.${audioTaskId},task_id.eq.${audioTaskId}`)
      .eq('status', 'completed')
      .single();
    
    if (audioTaskError || !audioTask) {
      return res.status(404).json({ error: 'Completed audio task not found or does not belong to you' });
    }
    
    // Extract audioId from audio_url or task_id
    // audioId is the Suno audio ID (e.g., 0ca0deac-8584-457b-9768-577c7c05b7cb)
    // We can extract from audio_url or use task_id as audioId? Kie expects audioId from their system.
    // For now, we'll use task_id as audioId (Kie task ID)
    const audioId = audioTask.task_id;
    
    // 4. Create video task record
    const { data: videoTask, error: videoTaskError } = await supabase
      .from('video_tasks')
      .insert({
        user_id: user.id,
        audio_task_id: audioTask.id,
        status: 'pending'
      })
      .select()
      .single();
    
    if (videoTaskError || !videoTask) {
      console.error('Failed to create video_task:', videoTaskError);
      return res.status(500).json({ error: 'Nie udaĹ‚o siÄ™ utworzyÄ‡ zadania generacji wideo.' });
    }
    
    // 5. Call Kie Video API
    const videoTaskId = await video.generate(audioTask.task_id, audioId, {
      author: 'mojhit.pl',
      domainName: 'mojhit.pl',
      callbackUrl: `${process.env.KIE_CALLBACK_BASE_URL || 'http://localhost:3000'}/api/webhooks/kie/video`
    });
    
    // 6. Update video task with video_task_id
    await supabase
      .from('video_tasks')
      .update({ video_task_id: videoTaskId })
      .eq('id', videoTask.id);
    
    res.json({
      success: true,
      videoTaskId,
      dbId: videoTask.id,
      message: 'Video generation started. Check /api/video/status/:id for progress.'
    });
  } catch (error) {
    console.error('Video generate error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/video/status/:id', requireAuth(), async (req, res) => {
  try {
    const { id } = req.params; // video_tasks.id or video_task_id
    
    // 1. Get user
    const authData = typeof req.auth === 'function' ? req.auth() : req.auth;
    const clerk_id = authData?.userId;
    
    if (!clerk_id) {
      return res.status(401).json({ error: 'NieprawidĹ‚owa autoryzacja Clerk.' });
    }
    
    // 2. Find user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', clerk_id)
      .single();
    
    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // 3. Find video task (must belong to user)
    const { data: videoTask, error: videoTaskError } = await supabase
      .from('video_tasks')
      .select('*')
      .eq('user_id', user.id)
      .or(`id.eq.${id},video_task_id.eq.${id}`)
      .single();
    
    if (videoTaskError || !videoTask) {
      return res.status(404).json({ error: 'Video task not found' });
    }
    
    // 4. If status pending and video_task_id exists, poll Kie API
    if (videoTask.status === 'pending' && videoTask.video_task_id &&
      new Date() - new Date(videoTask.created_at) > 30000) {
      try {
        console.log(`[VIDEO STATUS] Polling kie.ai for video task ${videoTask.video_task_id}`);
        const status = await video.getTaskStatus(videoTask.video_task_id);
        
        if (status.status === 'completed' && status.video_url) {
          // Update video task
          const updates = {
            status: 'completed',
            video_url: status.video_url,
            thumbnail_url: status.thumbnail_url,
            duration_seconds: status.duration,
            expires_at: status.expires_at ? new Date(status.expires_at) : null,
            updated_at: new Date()
          };
          
          await supabase
            .from('video_tasks')
            .update(updates)
            .eq('id', videoTask.id);
          
          Object.assign(videoTask, updates);
        } else if (status.status === 'failed' || status.error) {
          await supabase
            .from('video_tasks')
            .update({
              status: 'failed',
              error_message: status.error || 'Unknown error',
              updated_at: new Date()
            })
            .eq('id', videoTask.id);
          
          videoTask.status = 'failed';
          videoTask.error_message = status.error || 'Unknown error';
        }
      } catch (e) {
        console.error('[VIDEO STATUS] Polling error:', e.message);
        // Ignore polling errors
      }
    }
    
    res.json({
      status: videoTask.status,
      video_url: videoTask.video_url,
      thumbnail_url: videoTask.thumbnail_url,
      duration_seconds: videoTask.duration_seconds,
      expires_at: videoTask.expires_at,
      error_message: videoTask.error_message,
      created_at: videoTask.created_at
    });
  } catch (error) {
    console.error('Video status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------
// Admin Endpoints: Dashboard, Users, Tracks, RBAC
// ----------------------------------------

// Get system statistics

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

app.get('/api/admin/stats', async (req, res) => {
  try {
    console.log('[ADMIN STATS] Route hit');
    // Total tracks
    const { data: tracksData, error: tracksError } = await supabase
      .from('tracks')
      .select('id')
      .eq('expired', false);
    if (tracksError) throw tracksError;
    // Total users
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id');
    if (usersError) throw usersError;
    
    // Site settings for counter
    const { data: siteSettings, error: siteSettingsError } = await supabase
      .from('site_settings')
      .select('header_counter_manual_enabled, header_counter_manual_value')
      .eq('id', 1)
      .single();
    if (siteSettingsError && siteSettingsError.code !== 'PGRST116') throw siteSettingsError;
    
    res.json({
      totalTracks: tracksData?.length || 0,
      totalUsers: usersData?.length || 0,
      revenuePLN: 0, // placeholder
      headerCounterManualEnabled: siteSettings?.header_counter_manual_enabled || false,
      headerCounterManualValue: siteSettings?.header_counter_manual_value || 11381
    });
  } catch (error) {
    console.error('[ADMIN STATS] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get users with pagination and search
app.get('/api/admin/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    
    let query = supabase
      .from('users')
      .select('*, user_admin_roles!user_admin_roles_user_id_fkey(role_id)', { count: 'exact' });
    
    if (search) {
      query = query.or(`email.ilike.%${search}%,clerk_id.ilike.%${search}%`);
    }
    
    const sort_by = req.query.sort_by || 'created_at';
    const sort_dir = req.query.sort_dir === 'asc';

    const { data: users, error, count } = await query
      .order(sort_by, { ascending: sort_dir })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    // System economy totals
    const { data: economy } = await supabase
      .from('users')
      .select('coins, notes')
      .eq('status', 'active');
    
    const totalCoins = economy?.reduce((sum, u) => sum + (u.coins || 0), 0) || 0;
    const totalNotes = economy?.reduce((sum, u) => sum + (u.notes || 0), 0) || 0;
    const totalUsers = economy?.length || 0;
    
    res.json({
      users: users || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      systemEconomy: { totalCoins, totalNotes, totalUsers }
    });
  } catch (error) {
    console.error('[ADMIN USERS] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update user (coins, notes, status)
app.put('/api/admin/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    res.json({ success: true, user: data });
  } catch (error) {
    console.error('[ADMIN USER UPDATE] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get tracks with moderation options
app.get('/api/admin/tracks', async (req, res) => {
  try {
    console.log('[ADMIN TRACKS] Request received', req.query);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const expiredFilter = req.query.expired || 'all'; // 'all', 'true', 'false'
    
    let query = supabase
      .from('tracks')
      .select('*, producers(name)', { count: 'exact' });
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    if (expiredFilter !== 'all') {
      query = query.eq('expired', expiredFilter === 'true');
    }
    
    const sort_by = req.query.sort_by || 'created_at';
    const sort_dir = req.query.sort_dir === 'asc';

    const { data: tracks, error, count } = await query
      .order(sort_by, { ascending: sort_dir })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    // Calculate total likes and plays across all tracks
    const { data: allTracks } = await supabase
      .from('tracks')
      .select('likes, plays')
      .eq('expired', false);
    
    const totalLikes = allTracks?.reduce((sum, t) => sum + (t.likes || 0), 0) || 0;
    const totalPlays = allTracks?.reduce((sum, t) => sum + (t.plays || 0), 0) || 0;
    
    res.json({
      tracks: tracks || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      systemStats: {
        totalLikes,
        totalPlays,
        totalTracks: count || 0
      }
    });
  } catch (error) {
    console.error('[ADMIN TRACKS] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Moderate a track (delete/restore, update plays, moderation reason)
app.put('/api/admin/tracks/:id/moderate', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const { data, error } = await supabase
      .from('tracks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    res.json({ success: true, track: data });
  } catch (error) {
    console.error('[ADMIN TRACK MODERATE] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------
// RBAC Admin Endpoints (Role & Permission Management)
// ----------------------------------------

// Get all permissions (from database)
app.get('/api/admin/permissions', async (req, res) => {
  try { 
    console.log('[RBAC] GET /api/admin/permissions');
    const { data: permissions, error } = await supabase
      .from('admin_permissions')
      .select('code, description, category')
      .order('category, code');
    
    if (error) throw error;
    
    res.json({ permissions: permissions || [] });
  } catch (error) {
    console.error('Permissions list error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all roles with their permissions
app.get('/api/admin/roles', async (req, res) => {
  try {
    console.log('[RBAC] GET /api/admin/roles');
    // Fetch roles
    const { data: roles, error: rolesError } = await supabase
      .from('admin_roles')
      .select('id, name, description, is_system, created_at, updated_at')
      .order('name');
    
    if (rolesError) throw rolesError;
    
    // For each role, fetch its permissions and users
    const rolesWithDetails = [];
    for (const role of roles || []) {
      const { data: permissions, error: permError } = await supabase
        .from('role_permissions')
        .select('permission_id, admin_permissions(code, description, category)')
        .eq('role_id', role.id);
      
      if (permError) throw permError;

      const { data: assignments, error: assignError } = await supabase
        .from('user_admin_roles')
        .select('user_id, users!user_admin_roles_user_id_fkey(email, clerk_id)')
        .eq('role_id', role.id);

      if (assignError) throw assignError;
      
      rolesWithDetails.push({
        ...role,
        permissions: permissions?.map(p => p.admin_permissions) || [],
        assigned_users: assignments?.map(a => ({
          user_id: a.user_id,
          email: a.users?.email || '',
          clerk_id: a.users?.clerk_id || ''
        })) || []
      });
    }
    
    res.json({ roles: rolesWithDetails });
  } catch (error) {
    console.error('Roles list error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new role
app.post('/api/admin/roles', async (req, res) => {
  try {
    const { name, description, permissionCodes = [] } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Role name is required' });
    }
    // Insert role
    const { data: role, error: roleError } = await supabase
      .from('admin_roles')
      .insert({ name, description, is_system: false })
      .select()
      .single();
    
    if (roleError) throw roleError;
    
    // Assign permissions if any
    if (permissionCodes && permissionCodes.length > 0) {
      // Get permission IDs for the given codes
      const { data: permissions, error: permError } = await supabase
        .from('admin_permissions')
        .select('id, code')
        .in('code', permissionCodes);
      
      if (permError) throw permError;
      
      // Insert role_permissions
      const rolePermissions = permissions.map(p => ({
        role_id: role.id,
        permission_id: p.id
      }));
      
      if (rolePermissions.length > 0) {
        const { error: rpError } = await supabase
          .from('role_permissions')
          .insert(rolePermissions);
        if (rpError) throw rpError;
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Role created successfully',
      role: {
        ...role,
        permissions: permissionCodes.map(code => ({ code })) // Return simplified
      }
    });
  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update a role
app.put('/api/admin/roles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, permissionCodes = [] } = req.body;
    
    // Update role basic info
    const { data: role, error: roleError } = await supabase
      .from('admin_roles')
      .update({ name, description })
      .eq('id', id)
      .select()
      .single();
    
    if (roleError) throw roleError;
    
    // Update permissions: delete existing and insert new
    // First delete existing permissions for this role
    const { error: deleteError } = await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', id);
    
    if (deleteError) throw deleteError;
    
    // Insert new permissions if any
    if (permissionCodes && permissionCodes.length > 0) {
      // Get permission IDs for the given codes
      const { data: permissions, error: permError } = await supabase
        .from('admin_permissions')
        .select('id, code')
        .in('code', permissionCodes);
      
      if (permError) throw permError;
      
      // Insert role_permissions
      const rolePermissions = permissions.map(p => ({
        role_id: id,
        permission_id: p.id
      }));
      
      if (rolePermissions.length > 0) {
        const { error: rpError } = await supabase
          .from('role_permissions')
          .insert(rolePermissions);
        if (rpError) throw rpError;
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Role updated successfully',
      roleId: id
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a role
app.delete('/api/admin/roles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if it's a system role (cannot delete)
    const { data: role, error: roleError } = await supabase
      .from('admin_roles')
      .select('is_system, name')
      .eq('id', id)
      .single();
    
    if (roleError) throw roleError;
    
    if (role.is_system) {
      return res.status(403).json({ error: 'Cannot delete system role' });
    }
    
    // Delete role (will cascade delete role_permissions and user_admin_roles via foreign keys)
    const { error: deleteError } = await supabase
      .from('admin_roles')
      .delete()
      .eq('id', id);
    
    if (deleteError) throw deleteError;
    
    res.json({ 
      success: true, 
      message: 'Role deleted successfully',
      roleId: id
    });
  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get roles assigned to a user
app.get('/api/admin/users/:userId/roles', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data: assignments, error } = await supabase
      .from('user_admin_roles')
      .select(`
        role_id,
        assigned_at,
        admin_roles!inner(id, name, description, is_system)
      `)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    const roles = assignments?.map(a => ({
      id: a.admin_roles.id,
      name: a.admin_roles.name,
      description: a.admin_roles.description,
      is_system: a.admin_roles.is_system,
      assigned_at: a.assigned_at
    })) || [];
    
    res.json({ userId, roles });
  } catch (error) {
    console.error('User roles list error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Assign role to user
app.post('/api/admin/users/:userId/roles', async (req, res) => {
  try {
    const { userId } = req.params;
    const { roleId } = req.body;
    if (!roleId) {
      return res.status(400).json({ error: 'roleId is required' });
    }
    
    // Check if already assigned
    const { data: existing, error: checkError } = await supabase
      .from('user_admin_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('role_id', roleId)
      .maybeSingle();
    
    if (checkError) throw checkError;
    if (existing) {
      return res.status(409).json({ error: 'User already has this role assigned' });
    }
    
    const { data: assignment, error: insertError } = await supabase
      .from('user_admin_roles')
      .insert({ user_id: userId, role_id: roleId })
      .select()
      .single();
    
    if (insertError) throw insertError;
    
    res.json({ 
      success: true, 
      message: 'Role assigned successfully',
      assignment
    });
  } catch (error) {
    console.error('Assign role error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Remove role from user
app.delete('/api/admin/users/:userId/roles/:roleId', async (req, res) => {
  try {
    const { userId, roleId } = req.params;
    
    const { error: deleteError } = await supabase
      .from('user_admin_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role_id', roleId);
    
    if (deleteError) throw deleteError;
    
    res.json({ 
      success: true, 
      message: 'Role removed successfully'
    });
  } catch (error) {
    console.error('Remove role error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get my permissions (for frontend to show/hide UI)
app.get('/api/admin/my-permissions', async (req, res) => {
  try {
    console.log('[MY PERMISSIONS] Request');
    // Try to get auth data
    const authData = typeof req.auth === 'function' ? req.auth() : req.auth;
    
    // If no auth or local testing, return all permissions
    if (!authData?.userId) {
      console.log('[MY PERMISSIONS] No auth, returning all permissions for local testing');
      const { data: allPerms, error } = await supabase
        .from('admin_permissions')
        .select('code')
        .order('code');
      if (error) throw error;
      const permissions = allPerms?.map(p => p.code) || [];
      return res.json({ permissions });
    }
    
    console.log('[MY PERMISSIONS] User ID:', authData.userId);
    
    // Check if user is super admin via ADMIN_USER_IDS
    const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS || '').split(',').map(id => id.trim()).filter(Boolean);
    if (ADMIN_USER_IDS.includes(authData.userId)) {
      console.log('[MY PERMISSIONS] Super admin, returning all permissions');
      const { data: allPerms, error } = await supabase
        .from('admin_permissions')
        .select('code')
        .order('code');
      if (error) throw error;
      const permissions = allPerms?.map(p => p.code) || [];
      return res.json({ permissions });
    }
    
    // Get user's permissions via RBAC tables
    // 1. Find user by clerk_id
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', authData.userId)
      .single();
    
    if (userError) {
      console.warn('[MY PERMISSIONS] User not found in database:', authData.userId);
      return res.json({ permissions: [] });
    }
    
    // 2. Get permissions via user_admin_roles â†’ role_permissions â†’ admin_permissions
    const { data: permissions, error: permError } = await supabase
      .from('user_admin_roles')
      .select(`
        role_id,
        admin_roles!inner (
          role_permissions!inner (
            permission_id,
            admin_permissions!inner (code)
          )
        )
      `)
      .eq('user_id', user.id);
    
    if (permError) {
      console.error('[MY PERMISSIONS] Error fetching permissions:', permError);
      return res.json({ permissions: [] });
    }
    
    // Flatten permission codes
    const permissionCodes = [];
    permissions?.forEach(assignment => {
      assignment.admin_roles.role_permissions?.forEach(rp => {
        if (rp.admin_permissions?.code) {
          permissionCodes.push(rp.admin_permissions.code);
        }
      });
    });
    
    const uniquePermissions = [...new Set(permissionCodes)];
    console.log('[MY PERMISSIONS] User permissions:', uniquePermissions.length);
    
    res.json({ permissions: uniquePermissions });
  } catch (error) {
    console.error('My permissions error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------
// Admin Endpoints for cleanup (expired tracks)
// ----------------------------------------

app.post('/api/admin/mark-expired', requireAdmin, async (req, res) => {
  try {

    const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000); // 14 Đ´Đ˝ĐµĐą Đ˝Đ°Đ·Đ°Đ´

    // ĐźĐľĐĽĐµŃ‡Đ°ĐµĐĽ Ń‚Ń€ĐµĐşĐ¸ ŃŃ‚Đ°Ń€ŃĐµ 14 Đ´Đ˝ĐµĐą ĐşĐ°Đş expired
    const { error } = await supabase
      .from('tracks')
      .update({ expired: true })
      .lt('created_at', cutoff.toISOString());

    if (error) {
      console.error('[MARK-EXPIRED] Error marking expired tracks:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'Expired tracks marked successfully' });
  } catch (error) {
    console.error('[MARK-EXPIRED] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/cleanup-expired', requireAdmin, async (req, res) => {
  try {
    // ĐŁĐ´Đ°Đ»ŃŹĐµĐĽ Ń‚Ń€ĐµĐşĐ¸, ĐżĐľĐĽĐµŃ‡ĐµĐ˝Đ˝Ń‹Đµ ĐşĐ°Đş expired
    const { error } = await supabase
      .from('tracks')
      .delete()
      .eq('expired', true);

    if (error) {
      console.error('[CLEANUP-EXPIRED] Error deleting expired tracks:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'Expired tracks deleted successfully' });
  } catch (error) {
    console.error('[CLEANUP-EXPIRED] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------
// Track Actions Endpoints (Đ´Đ»ŃŹ ĐşĐ˝ĐľĐżĐľĐş Ń„Ń€ĐľĐ˝Ń‚ĐµĐ˝Đ´Đ°)
// ----------------------------------------

// ĐˇĐşĐ°Ń‡Đ°Ń‚ŃŚ MP3 Ń‚Ń€ĐµĐşĐ° (ĐżĐľĐ´Đ´ĐµŃ€Đ¶Đ¸Đ˛Đ°ĐµŃ‚ ?variant=N Đ´Đ»ŃŹ ŃĐşĐ°Ń‡Đ¸Đ˛Đ°Đ˝Đ¸ŃŹ ĐşĐľĐ˝ĐşŃ€ĐµŃ‚Đ˝ĐľĐłĐľ Đ˛Đ°Ń€Đ¸Đ°Đ˝Ń‚Đ°)
app.get('/api/tracks/:id/download', requireAuth(), async (req, res) => {
  try {
    const { id } = req.params;
    const variantIndex = req.query.variant ? parseInt(req.query.variant) : null;

    // ĐťĐ°Ń…ĐľĐ´Đ¸ĐĽ Ń‚Ń€ĐµĐş Đ˛ Ń‚Đ°Đ±Đ»Đ¸Ń†Đµ tracks
    const { data: track, error: trackError } = await supabase
      .from('tracks')
      .select('*')
      .eq('id', id)
      .single();

    if (trackError || !track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    // ĐźŃ€ĐľĐ˛ĐµŃ€ŃŹĐµĐĽ, Ń‡Ń‚Đľ Ń‚Ń€ĐµĐş ĐżŃ€Đ¸Đ˝Đ°Đ´Đ»ĐµĐ¶Đ¸Ń‚ Ń‚ĐµĐşŃŃ‰ĐµĐĽŃ ĐżĐľĐ»ŃŚĐ·ĐľĐ˛Đ°Ń‚ĐµĐ»ŃŽ
    const authData = typeof req.auth === 'function' ? req.auth() : req.auth;
    const clerk_id = authData?.userId;

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', clerk_id)
      .single();

    if (!user || track.user_id !== user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // ĐžĐżŃ€ĐµĐ´ĐµĐ»ŃŹĐµĐĽ URL Đ°ŃĐ´Đ¸ĐľŃ„Đ°ĐąĐ»Đ° Đ´Đ»ŃŹ ŃĐşĐ°Ń‡Đ¸Đ˛Đ°Đ˝Đ¸ŃŹ
    let audioUrl = null;

    // Đ•ŃĐ»Đ¸ ŃĐşĐ°Đ·Đ°Đ˝ variant Ń‡ĐµŃ€ĐµĐ· query â€” Đ¸Ń‰ĐµĐĽ Đ˛ kie_track_variants
    if (variantIndex !== null && track.kie_task_id) {
      const { data: variant } = await supabase
        .from('kie_track_variants')
        .select('audio_url, stream_audio_url')
        .eq('task_id', track.kie_task_id)
        .eq('variant_index', variantIndex)
        .single();

      if (variant) {
        audioUrl = variant.audio_url || variant.stream_audio_url || null;
      }
    }

    // 1. ĐźŃ€ĐľĐ±ŃĐµĐĽ audio_url ŃĐ°ĐĽĐľĐłĐľ Ń‚Ń€ĐµĐşĐ°
    if (!audioUrl && track.audio_url && track.audio_url.startsWith('http')) {
      audioUrl = track.audio_url;
    }

    // 2. Đ•ŃĐ»Đ¸ ĐµŃŃ‚ŃŚ kie_task_id â€” Đ¸Ń‰ĐµĐĽ Đ˛ kie_tasks / kie_track_variants
    if (!audioUrl && track.kie_task_id) {
      const { data: kieTask } = await supabase
        .from('kie_tasks')
        .select('audio_url, stream_audio_url')
        .eq('id', track.kie_task_id)
        .single();

      if (kieTask) {
        audioUrl = kieTask.audio_url || kieTask.stream_audio_url || null;
      }

      if (!audioUrl) {
        const { data: variant } = await supabase
          .from('kie_track_variants')
          .select('audio_url, stream_audio_url')
          .eq('task_id', track.kie_task_id)
          .order('variant_index')
          .limit(1)
          .single();

        if (variant) {
          audioUrl = variant.audio_url || variant.stream_audio_url || null;
        }
      }
    }

    if (!audioUrl) {
      return res.status(404).json({ error: 'Audio file not available' });
    }

    // ĐˇĐşĐ°Ń‡Đ¸Đ˛Đ°ĐµĐĽ Ń„Đ°ĐąĐ» ĐżŃ€ĐľĐşŃĐ¸ Ń Đ·Đ°ĐłĐľĐ»ĐľĐ˛ĐşĐľĐĽ Content-Disposition: attachment
    // (Ń‡Ń‚ĐľĐ±Ń‹ Đ±Ń€Đ°ŃĐ·ĐµŃ€ ĐżŃ€ĐµĐ´Đ»Đ°ĐłĐ°Đ» ŃĐľŃ…Ń€Đ°Đ˝Đ¸Ń‚ŃŚ, Đ° Đ˝Đµ Đ˛ĐľŃĐżŃ€ĐľĐ¸Đ·Đ˛ĐľĐ´Đ¸Đ»)
    console.log('[DOWNLOAD] Proxying download for:', audioUrl);

    const fetchResponse = await fetch(audioUrl);
    if (!fetchResponse.ok) {
      return res.status(502).json({ error: 'Failed to fetch audio file from source' });
    }

    const contentType = fetchResponse.headers.get('content-type') || 'audio/mpeg';
    const contentLength = fetchResponse.headers.get('content-length');

    res.setHeader('Content-Type', contentType);
    const filename = variantIndex !== null
      ? `${track.title || 'track'}_v${variantIndex + 1}.mp3`
      : `${track.title || 'track'}.mp3`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    if (contentLength) res.setHeader('Content-Length', contentLength);

    // ĐźĐ°ĐąĐżĐ¸ĐĽ ĐżĐľŃ‚ĐľĐş Đ˝Đ°ĐżŃ€ŃŹĐĽŃŃŽ
    const arrayBuffer = await fetchResponse.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error('[DOWNLOAD] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ĐźĐľŃŃ‚Đ°Đ˛Đ¸Ń‚ŃŚ Đ»Đ°ĐąĐş Ń‚Ń€ĐµĐşŃ
app.post('/api/tracks/:id/like', requireAuth(), async (req, res) => {
  try {
    const { id } = req.params;

    // ĐŁĐ˛ĐµĐ»Đ¸Ń‡Đ¸Đ˛Đ°ĐµĐĽ ŃŃ‡ĐµŃ‚Ń‡Đ¸Đş Đ»Đ°ĐąĐşĐľĐ˛ Đ˝Đ° 1
    const { error } = await supabase.rpc('increment_likes', { track_id: id });

    if (error) {
      // Đ•ŃĐ»Đ¸ Ń„ŃĐ˝ĐşŃ†Đ¸ŃŹ Đ˝Đµ ŃŃŃ‰ĐµŃŃ‚Đ˛ŃĐµŃ‚, Đ¸ŃĐżĐľĐ»ŃŚĐ·ŃĐµĐĽ ĐľĐ±Ń‹Ń‡Đ˝Ń‹Đą update
      const { data: track } = await supabase
        .from('tracks')
        .select('likes')
        .eq('id', id)
        .single();

      if (!track) {
        return res.status(404).json({ error: 'Track not found' });
      }

      const newLikes = (track.likes || 0) + 1;
      const { error: updateError } = await supabase
        .from('tracks')
        .update({ likes: newLikes })
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('[LIKE] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Đ—Đ°Ń€ĐµĐłĐ¸ŃŃ‚Ń€Đ¸Ń€ĐľĐ˛Đ°Ń‚ŃŚ ŃĐ°Ń€Đ¸Đ˝Đł Ń‚Ń€ĐµĐşĐ° (Đ»ĐľĐłĐ¸Ń€ĐľĐ˛Đ°Đ˝Đ¸Đµ)
app.post('/api/tracks/:id/share', requireAuth(), async (req, res) => {
  try {
    const { id } = req.params;
    const { platform } = req.body; // optional: 'facebook', 'twitter', 'copy_link', etc.

    // Đ›ĐľĐłĐ¸Ń€ŃĐµĐĽ Ń„Đ°ĐşŃ‚ ŃĐ°Ń€Đ¸Đ˝ĐłĐ° (ĐĽĐľĐ¶Đ˝Đľ ŃĐľŃ…Ń€Đ°Đ˝ŃŹŃ‚ŃŚ Đ˛ ĐľŃ‚Đ´ĐµĐ»ŃŚĐ˝ŃŃŽ Ń‚Đ°Đ±Đ»Đ¸Ń†Ń shares)
    console.log(`[SHARE] Track ${id} shared via ${platform || 'unknown'}`);

    // Đ’ĐľĐ·Đ˛Ń€Đ°Ń‰Đ°ĐµĐĽ ĐżŃĐ±Đ»Đ¸Ń‡Đ˝ŃŃŽ ŃŃŃ‹Đ»ĐşŃ Đ˝Đ° Ń‚Ń€ĐµĐş (ĐµŃĐ»Đ¸ Đ˝ŃĐ¶Đ˝Đľ)
    const publicUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/track/${id}`;

    res.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error('[SHARE] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Soft-delete Ń‚Ń€ĐµĐşĐ° (Ń‚ĐľĐ»ŃŚĐşĐľ Đ˛Đ»Đ°Đ´ĐµĐ»ĐµŃ†)
app.post('/api/tracks/:id/delete', requireAuth(), async (req, res) => {
  try {
    const { id } = req.params;
    const authData = req.auth;
    const clerkId = authData?.userId;
    if (!clerkId) return res.status(401).json({ error: 'Unauthorized' });

    // ĐźŃ€ĐľĐ˛ĐµŃ€Đ¸Ń‚ŃŚ, Ń‡Ń‚Đľ Ń‚Ń€ĐµĐş ĐżŃ€Đ¸Đ˝Đ°Đ´Đ»ĐµĐ¶Đ¸Ń‚ ĐżĐľĐ»ŃŚĐ·ĐľĐ˛Đ°Ń‚ĐµĐ»ŃŽ
    const { data: track, error: fetchErr } = await supabase
      .from('tracks')
      .select('id, user_id')
      .eq('id', id)
      .single();
    if (fetchErr || !track) return res.status(404).json({ error: 'Track not found' });
    if (track.user_id !== clerkId) return res.status(403).json({ error: 'Not your track' });

    // Soft-delete: ŃŃ‚Đ°Đ˛Đ¸ĐĽ expired = true
    const { error: updateErr } = await supabase
      .from('tracks')
      .update({ expired: true })
      .eq('id', id);
    if (updateErr) throw updateErr;

    res.json({ success: true });
  } catch (error) {
    console.error('[DELETE] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------
// AI Chat Composer
// ----------------------------------------
const { OpenAI } = require('openai');

app.post('/api/chat-composer', requireAuth(), async (req, res) => {
  try {
    const { messages, agent = 'cj_remi', regenerate = false } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const apiSettings = await getApiSettings();
    const llmConfig = apiSettings?.llm || { active: 'openrouter', fallback: 'openai' };
    
    let activeProvider = llmConfig.active;
    if (activeProvider === 'openrouter' && !process.env.OPENROUTER_API_KEY) {
      console.warn('[CHAT COMPOSER] OpenRouter key missing, falling back to', llmConfig.fallback);
      activeProvider = llmConfig.fallback;
    }

    let openai;
    if (activeProvider === 'openrouter') {
      openai = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENROUTER_API_KEY,
      });
    } else {
      // Fallback to standard OpenAI (or any custom baseURL)
      if (!process.env.OPENAI_API_KEY) {
        throw new Error("Missing both OPENROUTER_API_KEY and OPENAI_API_KEY");
      }
      openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }

    let systemPrompt = '';
    let modelSlug = 'anthropic/claude-3.7-sonnet';

    // Fetch producer config from Supabase
    const { data: producer, error: producerError } = await supabase
      .from('producers')
      .select('system_prompt, model_name')
      .eq('id', agent)
      .single();

    if (producerError || !producer || !producer.system_prompt) {
      console.warn(`[CHAT COMPOSER] Brak konfiguracji w DB dla agenta: ${agent}. Fallback na Marka z pliku.`);
      try {
        const fallback = require('./producers/cj_remi.js');
        systemPrompt = fallback.systemPrompt;
        modelSlug = fallback.modelSlug;
      } catch (e) {
        systemPrompt = 'JesteĹ› DJ Markiem, asystentem AI. Generujesz piosenki. (Awaryjny fallback)';
        modelSlug = 'google/gemini-2.5-flash';
      }
    } else {
      systemPrompt = producer.system_prompt;
      modelSlug = producer.model_name || 'google/gemini-2.5-flash';
    }

    // If regenerate flag is set, add instruction to generate alternative variant
    if (regenerate) {
      systemPrompt += '\n\nUWAGA: Wygeneruj alternatywną wersję tekstu (inne słowa, ten sam sens). Nie powtarzaj poprzedniej wersji.';
      console.log('[CHAT COMPOSER] Regenerate mode enabled for agent:', agent);
    }

    const userMessageCount = messages.filter(m => m.role === 'user').length;
    let finalMessages = [...messages];

    if (userMessageCount >= 10) {
      finalMessages.push({
        role: 'system',
        content: 'UWAGA: Limit wiadomoĹ›ci. Koniec zadawania pytaĹ„. Po prostu napisz krĂłtkie poĹĽegnanie i KONIECZNIE wygeneruj ---TITLE---, ---TAGS--- i ---LYRICS--- w ramach zgromadzonych informacji.'
      });
    }

    const response = await openai.chat.completions.create({
      model: modelSlug,
      messages: [{ role: 'system', content: systemPrompt }, ...finalMessages],
      max_tokens: 1500
    });

    // --- OCHRONA PRAW AUTORSKICH (warstwa serwerowa) ---
    // Druga linia obrony â€” skanuj output AI i usuĹ„ nazwiska artystĂłw
    const reply = response.choices[0].message;
    if (reply && reply.content) {
      // Lista znanych artystĂłw (globalni + polska scena)
      const artistRegex = /\b(ABBA|BeyoncĂ©|Beyonce|Taylor Swift|Rihanna|Drake|Eminem|Adele|Ed Sheeran|Justin Bieber|Ariana Grande|The Beatles|Rolling Stones|Michael Jackson|Madonna|Elton John|Queen|Pink Floyd|Led Zeppelin|U2|Coldplay|Maroon 5|Bruno Mars|Lady Gaga|Katy Perry|Shakira|Jennifer Lopez|Dua Lipa|The Weeknd|Post Malone|Billie Eilish|Olivia Rodrigo|Harry Styles|Sam Smith|Sia|Imagine Dragons|One Direction|Spice Girls|Backstreet Boys|NSYNC|Bon Jovi|Guns N'? Roses|Metallica|Nirvana|Iron Maiden|Black Sabbath|Deep Purple|Whitney Houston|Mariah Carey|Celine Dion|Frank Sinatra|Elvis Presley|Prince|David Bowie|Bob Dylan|Paul McCartney|Freddie Mercury|Skolim|Doda|SokĂłĹ‚|Quebonafide|Taco Hemingway|Sanah|Bayer Full|Zenek Martyniuk|Akcent|Top One|Slawomir|Majka JeĹĽowska|Maryla Rodowicz|CzesĹ‚aw Niemen|Krzysztof Krawczyk|Kayah|Justyna Steczkowska|Kasia Kowalska|Kult|Kazik|Republika|PidĹĽama Porno|Perfect|Maanam|Budka Suflera|Lady Pank|O\.S\.T\.R\.|VNM|Goral|Folia|Bovska|Dawid PodsiadĹ‚o|MÄ™skie Granie Orkiestra|Komitet Obrony Magii)(?!\.)\b/gi;

      if (artistRegex.test(reply.content)) {
        console.log('[COPYRIGHT] âš ď¸Ź Wykryto nazwisko artysta w output AI â€” sanitizacja');
        reply.content = reply.content.replace(artistRegex, '[artysta]');
      }
    }
    // --- KONIEC OCHRONY ---

    res.json(reply);
  } catch (error) {
    console.error('[CHAT COMPOSER] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------
// Persona Endpoints (AI Producer Voice Cloning)
// ----------------------------------------

/**
 * Create a Suno Persona from an existing track
 * Requires: user must own the track (check ownership)
 * Only available for Pro users (check subscription)
 */
app.post('/api/personas/create', requireAuth(), async (req, res) => {
  try {
    const { taskId, audioId, name, description, style, vocalStart, vocalEnd } = req.body;
    const authData = typeof req.auth === 'function' ? req.auth() : req.auth;
    const clerk_id = authData?.userId;

    if (!clerk_id) {
      return res.status(401).json({ error: 'NieprawidĹ‚owa autoryzacja Clerk.' });
    }

    // 1. Find user in DB
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, subscription_tier')
      .eq('clerk_id', clerk_id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'UĹĽytkownik nie znaleziony.' });
    }

    // 2. Check if user has VIP/Legend subscription
    if (user.subscription_tier !== 'vip' && user.subscription_tier !== 'legend') {
      return res.status(403).json({ 
        error: 'Tworzenie osobowoĹ›ci AI dostÄ™pne tylko w tarifie PRO.',
        upgradeRequired: true 
      });
    }

    // 3. Verify user owns the track (optional but recommended)
    // For now, we'll assume taskId/audioId belongs to user
    // In production, check tracks or kie_tasks table for ownership

    // 4. Create persona via Suno API
    const personaResult = await persona.createPersona(
      taskId,
      audioId,
      name,
      description,
      style,
      vocalStart || 0,
      vocalEnd || 30
    );

    // 5. Create producer record in database
    const producerId = 'suno_persona_' + personaResult.personaId.substring(0, 8);
    const { data: producer, error: producerError } = await supabase
      .from('producers')
      .insert({
        id: producerId,
        name: personaResult.name,
        avatar_url: null,
        system_prompt: personaResult.description,
        style_tags: style ? [style] : null,
        rental_price_coins: 0, // Free for owner
        type: 'suno',
        suno_persona_id: personaResult.personaId,
        suno_persona_model: 'V4_5ALL', // Default model
        source_audio_url: null, // Could store audio URL
        source_task_id: taskId,
        vocal_start: vocalStart || 0,
        vocal_end: vocalEnd || 30
      })
      .select()
      .single();

    if (producerError) {
      console.error('[PERSONA] Failed to create producer record:', producerError);
      // Continue anyway, persona was created
    }

    // 6. Link producer to user (unlock for free)
    if (producer) {
      await supabase
        .from('user_producers')
        .insert({
          user_id: user.id,
          producer_id: producer.id,
          unlocked_at: new Date().toISOString(),
          expires_at: null // Permanent
        })
        .onConflict('user_id,producer_id')
        .ignore();
    }

    res.status(201).json({
      success: true,
      persona: personaResult,
      producer: producer || null,
      message: 'OsobowoĹ›Ä‡ AI utworzona pomyĹ›lnie! MoĹĽesz jej teraz uĹĽywaÄ‡ w kolejnych generacjach.'
    });

  } catch (error) {
    console.error('[PERSONA CREATE] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get user's personas (AI producers)
 */
app.get('/api/personas', requireAuth(), async (req, res) => {
  try {
    const authData = typeof req.auth === 'function' ? req.auth() : req.auth;
    const clerk_id = authData?.userId;

    if (!clerk_id) {
      return res.status(401).json({ error: 'NieprawidĹ‚owa autoryzacja Clerk.' });
    }

    // Get user ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', clerk_id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'UĹĽytkownik nie znaleziony.' });
    }

    // Get user's producers via junction table
    const { data: userProducers, error: upError } = await supabase
      .from('user_producers')
      .select(`
        unlocked_at,
        expires_at,
        producers (
          id,
          name,
          avatar_url,
          system_prompt,
          style_tags,
          rental_price_coins,
          type,
          suno_persona_id,
          suno_persona_model,
          source_audio_url,
          vocal_start,
          vocal_end
        )
      `)
      .eq('user_id', user.id)
      .eq('producers.type', 'suno'); // Only Suno personas

    if (upError) {
      console.error('[PERSONAS LIST] Error:', upError);
      return res.status(500).json({ error: 'BĹ‚Ä…d pobierania osobowoĹ›ci.' });
    }

    // Transform response
    const personas = (userProducers || []).map(up => ({
      ...up.producers,
      unlocked_at: up.unlocked_at,
      expires_at: up.expires_at
    }));

    res.json({
      success: true,
      count: personas.length,
      personas
    });

  } catch (error) {
    console.error('[PERSONAS LIST] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Delete a persona (user's own)
 */
app.delete('/api/personas/:personaId', requireAuth(), async (req, res) => {
  try {
    const { personaId } = req.params;
    const authData = typeof req.auth === 'function' ? req.auth() : req.auth;
    const clerk_id = authData?.userId;

    if (!clerk_id) {
      return res.status(401).json({ error: 'NieprawidĹ‚owa autoryzacja Clerk.' });
    }

    // Get user ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', clerk_id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'UĹĽytkownik nie znaleziony.' });
    }

    // Find producer with this personaId
    const { data: producer, error: producerError } = await supabase
      .from('producers')
      .select('id, suno_persona_id')
      .eq('suno_persona_id', personaId)
      .single();

    if (producerError || !producer) {
      return res.status(404).json({ error: 'OsobowoĹ›Ä‡ nie znaleziona.' });
    }

    // Verify ownership
    const { data: ownership, error: ownError } = await supabase
      .from('user_producers')
      .select('user_id')
      .eq('producer_id', producer.id)
      .eq('user_id', user.id)
      .single();

    if (ownError || !ownership) {
      return res.status(403).json({ error: 'Nie masz uprawnieĹ„ do usuniÄ™cia tej osobowoĹ›ci.' });
    }

    // Try to delete from Suno API (if supported)
    try {
      await persona.deletePersona(personaId);
    } catch (apiError) {
      console.warn('[PERSONA DELETE] Suno API delete failed:', apiError.message);
      // Continue with local deletion
    }

    // Remove from user_producers (soft delete by removing link)
    const { error: deleteError } = await supabase
      .from('user_producers')
      .delete()
      .eq('producer_id', producer.id)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('[PERSONA DELETE] DB error:', deleteError);
      return res.status(500).json({ error: 'BĹ‚Ä…d usuwania linku.' });
    }

    // Optionally mark producer as inactive
    await supabase
      .from('producers')
      .update({ is_active: false })
      .eq('id', producer.id);

    res.json({
      success: true,
      message: 'OsobowoĹ›Ä‡ usuniÄ™ta pomyĹ›lnie.'
    });

  } catch (error) {
    console.error('[PERSONA DELETE] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Video generation webhook (Kie.ai MP4 API callback)
app.post('/api/webhooks/kie/video', express.json(), async (req, res) => {
  console.log('[KIE VIDEO WEBHOOK] Received callback headers:', req.headers);
  console.log('[KIE VIDEO WEBHOOK] Received callback body:', JSON.stringify(req.body, null, 2));
  try {
    const { code, msg, data } = req.body;

    if (code !== 200) {
      console.error('Kie video callback error:', msg);
      // Update video task as failed
      await supabase
        .from('video_tasks')
        .update({
          status: 'failed',
          error_message: msg,
          updated_at: new Date()
        })
        .eq('video_task_id', data?.task_id);
      return res.sendStatus(200); // Always 200 to prevent retries
    }

    // Extract task_id
    let taskId = data?.task_id || data?.taskId || data?.taskId;
    let callbackType = data?.callbackType || 'complete';

    // Extract video URL and metadata
    const videoUrl = data?.videoUrl || data?.video_url || data?.url;
    const thumbnailUrl = data?.thumbnailUrl || data?.thumbnail_url || data?.imageUrl;
    const duration = data?.duration;
    const expiresAt = data?.expiresAt || data?.expires_at;

    // Update video task in DB
    const updates = {
      status: callbackType === 'complete' ? 'completed' : 'processing',
      updated_at: new Date()
    };

    if (videoUrl) updates.video_url = videoUrl;
    if (thumbnailUrl) updates.thumbnail_url = thumbnailUrl;
    if (duration) updates.duration_seconds = duration;
    if (expiresAt) updates.expires_at = new Date(expiresAt);

    if (!taskId) {
      console.error('[KIE VIDEO WEBHOOK] No task_id found in callback');
      return res.sendStatus(200);
    }

    const { error: updateError } = await supabase
      .from('video_tasks')
      .update(updates)
      .eq('video_task_id', taskId);

    if (updateError) {
      console.error('[KIE VIDEO WEBHOOK] Supabase update error:', updateError);
    } else {
      console.log('[KIE VIDEO WEBHOOK] Video task updated successfully for task_id:', taskId);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Video webhook processing error:', error);
    res.sendStatus(200); // Always 200 to prevent retries
  }
});

// ----------------------------------------
// Referrals & Affiliate Endpoints
// ----------------------------------------

app.get('/api/referrals/stats', requireAuth(), async (req, res) => {
  try {
    const authData = typeof req.auth === 'function' ? req.auth() : req.auth;
    const clerk_id = authData.userId;

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, referral_code, is_affiliate')
      .eq('clerk_id', clerk_id)
      .single();

    if (userError || !user) return res.status(404).json({ error: 'User not found' });

    let referralCode = user.referral_code;
    if (!referralCode) {
      const { data: emailData } = await supabase.from('users').select('email').eq('id', user.id).single();
      const prefix = emailData?.email ? emailData.email.split('@')[0].substring(0, 4).toUpperCase() : 'USER';
      const suffix = user.id.substring(0, 4).toUpperCase();
      referralCode = `${prefix}_${suffix}`;
      
      await supabase.from('users').update({ referral_code: referralCode }).eq('id', user.id);
    }

    const { data: rewards } = await supabase
      .from('referral_rewards')
      .select('reward_notes')
      .eq('referrer_id', user.id);

    const referralsCount = rewards ? rewards.length : 0;
    const totalEarnedNotes = rewards ? rewards.reduce((sum, r) => sum + (r.reward_notes || 0), 0) : 0;

    let totalEarningsPLN = 0;
    let pendingEarningsPLN = 0;
    if (user.is_affiliate) {
      const { data: earnings } = await supabase
        .from('affiliate_earnings')
        .select('commission_amount, status')
        .eq('affiliate_id', user.id);
      
      if (earnings) {
        totalEarningsPLN = earnings.filter(e => e.status === 'paid' || e.status === 'available').reduce((sum, e) => sum + Number(e.commission_amount), 0);
        pendingEarningsPLN = earnings.filter(e => e.status === 'pending').reduce((sum, e) => sum + Number(e.commission_amount), 0);
      }
    }

    res.json({
      referralCode,
      referralsCount,
      totalEarnedNotes,
      isAffiliate: user.is_affiliate,
      totalEarningsPLN,
      pendingEarningsPLN
    });
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/referrals/claim', requireAuth(), async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Code is required' });

    const authData = typeof req.auth === 'function' ? req.auth() : req.auth;
    const clerk_id = authData.userId;

    const { data: currentUser, error: userErr } = await supabase
      .from('users')
      .select('id, referred_by')
      .eq('clerk_id', clerk_id)
      .single();

    if (userErr || !currentUser) return res.status(404).json({ error: 'User not found' });

    if (currentUser.referred_by) {
      return res.status(400).json({ error: 'You have already claimed a referral code' });
    }

    const { data: referrer, error: refErr } = await supabase
      .from('users')
      .select('id')
      .eq('referral_code', code.toUpperCase())
      .single();

    if (refErr || !referrer) return res.status(404).json({ error: 'Invalid referral code' });

    if (referrer.id === currentUser.id) {
      return res.status(400).json({ error: 'Cannot use your own code' });
    }

    const { error: updateErr } = await supabase
      .from('users')
      .update({ referred_by: referrer.id })
      .eq('id', currentUser.id);

    if (updateErr) throw updateErr;

    const { data: referrerUser } = await supabase.from('users').select('notes').eq('id', referrer.id).single();
    await supabase.from('users').update({ notes: (referrerUser.notes || 0) + 5 }).eq('id', referrer.id);

    const { data: refereeUser } = await supabase.from('users').select('notes').eq('id', currentUser.id).single();
    await supabase.from('users').update({ notes: (refereeUser.notes || 0) + 5 }).eq('id', currentUser.id);

    await supabase.from('referral_rewards').insert({
      referrer_id: referrer.id,
      referee_id: currentUser.id,
      reward_notes: 5
    });

    res.json({ success: true, message: 'Kod aktywowany! Otrzymujesz +5 not.' });
  } catch (error) {
    console.error('Error claiming referral:', error);
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------
// Admin Affiliate Endpoints
// ----------------------------------------

app.get('/api/admin/affiliates/users', requireAuth(), requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, clerk_id, referral_code, is_affiliate')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching affiliate users:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/affiliates/earnings', requireAuth(), requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('affiliate_earnings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching affiliate earnings:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/affiliates/payout/:id', requireAuth(), requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('affiliate_earnings')
      .update({ status: 'paid' })
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Error processing payout:', error);
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------
// Debug Endpoints
// ----------------------------------------

// Get pending KIE tasks and manually poll status
app.get('/api/debug/kie-tasks', async (req, res) => {
  try {
    const { data: tasks, error } = await supabase
      .from('kie_tasks')
      .select('id, task_id, status, created_at, user_id, persona_id, error_msg')
      .in('status', ['pending', 'processing'])
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (error) throw error;
    
    // Poll each task from KIE API
    const results = [];
    for (const task of tasks) {
      try {
        const status = await kie.getTaskStatus(task.task_id);
        const kieStatus = status.data?.status || 'UNKNOWN';
        
        // Determine DB status
        let dbStatus = task.status;
        if (kieStatus === 'SUCCESS') dbStatus = 'completed';
        else if (kieStatus === 'TEXT_SUCCESS' || kieStatus === 'FIRST_SUCCESS') dbStatus = 'processing';
        else if (kieStatus === 'PENDING') dbStatus = 'pending';
        else if (kieStatus === 'CREATE_TASK_FAILED' || kieStatus === 'GENERATE_AUDIO_FAILED' ||
                 kieStatus === 'SENSITIVE_WORD_ERROR' || kieStatus === 'CALLBACK_EXCEPTION') {
          dbStatus = 'failed';
        }
        
        // Update DB if status changed
        if (dbStatus !== task.status) {
          const updates = {
            status: dbStatus,
            updated_at: new Date().toISOString()
          };
          if (dbStatus === 'failed') {
            updates.error_msg = status.data?.errorMessage || `Kie.ai status: ${kieStatus}`;
          }
          
          const { error: updateError } = await supabase
            .from('kie_tasks')
            .update(updates)
            .eq('id', task.id);
          
          if (!updateError) {
            console.log(`[DEBUG] Task ${task.task_id} updated from ${task.status} to ${dbStatus}`);
          }
        }
        
        results.push({
          ...task,
          kie_status: kieStatus,
          db_status_updated: dbStatus !== task.status,
          audio_url: status.data?.audioUrl,
          image_url: status.data?.imageUrl,
          duration: status.data?.duration
        });
      } catch (err) {
        results.push({
          ...task,
          kie_status: 'ERROR',
          error: err.message
        });
      }
    }
    
    res.json({
      count: results.length,
      tasks: results
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Manually trigger webhook simulation for a task
app.post('/api/debug/kie-webhook-simulate', async (req, res) => {
  try {
    const { task_id } = req.body;
    if (!task_id) {
      return res.status(400).json({ error: 'task_id required' });
    }
    
    // Get task status from KIE
    const status = await kie.getTaskStatus(task_id);
    const kieData = status.data;
    
    if (!kieData) {
      return res.status(404).json({ error: 'Task not found in KIE' });
    }
    
    // Simulate webhook payload
    const webhookPayload = {
      taskId: task_id,
      status: kieData.status,
      tracks: kieData.tracks || []
    };
    
    // Call webhook handler directly
    const webhookReq = {
      body: webhookPayload,
      headers: {}
    };
    const webhookRes = {
      statusCode: 200,
      sendStatus: function(code) {
        this.statusCode = code;
        return this;
      },
      send: function() { return this; }
    };
    
    // Import the webhook handler function
    const webhookHandler = require('./kie').webhookHandler;
    await webhookHandler(webhookReq, webhookRes);
    
    res.json({
      success: true,
      task_id,
      kie_status: kieData.status,
      webhook_status: webhookRes.statusCode,
      message: 'Webhook simulated successfully'
    });
  } catch (error) {
    console.error('Webhook simulation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------
// Site Settings Endpoints
// ----------------------------------------
app.get('/api/settings/site', async (req, res) => {
  try {
    const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single();
    if (error && error.code !== 'PGRST116') throw error;
    
    // Also fetch the real track count
    const { data: tracksData, error: tracksError } = await supabase
      .from('tracks')
      .select('id')
      .eq('expired', false);
      
    const real_track_count = tracksData ? tracksData.length : 0;
    
    res.json({ ...(data || {}), real_track_count });
  } catch (err) {
    console.error('Error fetching site settings:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/settings/site', requireAdmin, async (req, res) => {
  try {
    const updates = req.body;
    const { data, error } = await supabase
      .from('site_settings')
      .update(updates)
      .eq('id', 1)
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, settings: data });
  } catch (err) {
    console.error('Error updating site settings:', err);
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------
// Stripe Promo Codes Endpoints
// ----------------------------------------

app.get('/api/admin/promo-codes', async (req, res) => {
  try {
    const promotionCodes = await stripe.promotionCodes.list({ limit: 100, expand: ['data.coupon'] });
    res.json({ promoCodes: promotionCodes.data });
  } catch (err) {
    console.error('Error fetching promo codes:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/promo-codes', async (req, res) => {
  try {
    const { code, type, value, maxRedemptions, expiresAt } = req.body;
    
    // 1. Create a coupon
    let couponParams = {
      name: `Kupon dla ${code}`,
      duration: 'once',
    };
    if (type === 'percent') {
      couponParams.percent_off = value;
    } else {
      couponParams.amount_off = value * 100;
      couponParams.currency = 'pln';
    }
    const coupon = await stripe.coupons.create(couponParams);

    const promoParams = {
      promotion: {
        type: 'coupon',
        coupon: coupon.id
      },
      code: code.toUpperCase(),
      active: true,
    };
    
    if (maxRedemptions) {
      promoParams.max_redemptions = parseInt(maxRedemptions, 10);
    }
    
    if (expiresAt) {
      // expiresAt expected as Unix timestamp in seconds
      promoParams.expires_at = Math.floor(new Date(expiresAt).getTime() / 1000);
    }

    const promoCode = await stripe.promotionCodes.create(promoParams);
    
    res.json({ success: true, promoCode });
  } catch (err) {
    console.error('Error creating promo code:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/promo-codes/:id', async (req, res) => {
  try {
    const { active } = req.body;
    const promoCode = await stripe.promotionCodes.update(req.params.id, { active });
    res.json({ success: true, promoCode });
  } catch (err) {
    console.error('Error updating promo code:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/promo/validate', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Brak kodu' });
    
    const promotionCodes = await stripe.promotionCodes.list({
      code: code.toUpperCase(),
      active: true,
      expand: ['data.coupon']
    });
    
    if (promotionCodes.data.length === 0) {
      return res.status(404).json({ error: 'Nieprawidłowy lub nieaktywny kod promocyjny.' });
    }
    
    const promo = promotionCodes.data[0];
    const coupon = promo.coupon;
    
    res.json({
      valid: true,
      id: promo.id,
      code: promo.code,
      type: coupon.percent_off ? 'percent' : 'amount',
      value: coupon.percent_off ? coupon.percent_off : (coupon.amount_off / 100)
    });
  } catch (err) {
    console.error('Error validating promo code:', err);
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------
// Start Server
// ----------------------------------------

const server = app.listen(port, () => {
  console.log(`đźš€ Server listening on port ${port}`);
// Log startup
systemLogger('info', 'SYSTEM_STARTUP', 'Backend zrestartowany i połączony z bazą danych.', { timestamp: new Date().toISOString() });

});

server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});


