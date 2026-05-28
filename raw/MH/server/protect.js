/**
 * Track Protection System — Phase 1
 * 
 * Logic:
 * - Free tracks: KIE deletes after 14 days → we track audio_expires_at
 * - Pro/VIP users: tracks are "protected" while subscription is active
 * - Viral tracks (>1000 plays OR >50 likes): auto-protected forever
 * - Daily cron: checks for near-expiry tracks and triggers R2 backup (Phase 2)
 */

const R2_ENABLED = false; // Flip to true when R2 credentials are set in .env
// Required env vars for R2: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME

/**
 * Check if a track should be viral-protected
 * Thresholds: >1000 plays OR >50 likes
 */
function isViral(track) {
  return (track.plays || 0) > 1000 || (track.likes || 0) > 50;
}

/**
 * Check and auto-mark viral tracks — call periodically (every 6h)
 */
async function checkViralTracks(supabase) {
  try {
    // Find tracks that crossed viral threshold but aren't marked yet
    const { data: candidates } = await supabase
      .from('tracks')
      .select('id, plays, likes, viral_protected')
      .eq('viral_protected', false)
      .eq('expired', false)
      .or('plays.gt.1000,likes.gt.50');

    if (candidates && candidates.length > 0) {
      const viralIds = candidates.filter(isViral).map(t => t.id);
      if (viralIds.length > 0) {
        const { error } = await supabase
          .from('tracks')
          .update({ viral_protected: true })
          .in('id', viralIds);
        
        if (!error) {
          console.log(`[PROTECT] Marked ${viralIds.length} tracks as viral-protected:`, viralIds);
        } else {
          console.error('[PROTECT] Failed to mark viral tracks:', error.message);
        }
      }
    }
  } catch (e) {
    console.error('[PROTECT] Viral check error:', e.message);
  }
}

/**
 * Find tracks near KIE expiry that need backup
 * @returns Array of tracks that are protected (viral or pro user) and expiring within `daysThreshold` days
 */
async function getNearExpiryTracks(supabase, daysThreshold = 3) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + daysThreshold);
  
  const { data, error } = await supabase
    .from('tracks')
    .select('id, audio_url, title, user_id, viral_protected')
    .eq('expired', false)
    .lt('audio_expires_at', cutoff.toISOString())
    .or('viral_protected.eq.true'); // Only protected tracks get backed up
  
  if (error) {
    console.error('[PROTECT] Near-expiry query error:', error.message);
    return [];
  }
  
  // Also get tracks from users with active subscription
  const { data: proTracks } = await supabase
    .from('tracks')
    .select('id, audio_url, title, user_id, viral_protected, users!inner(subscription_tier)')
    .eq('expired', false)
    .lt('audio_expires_at', cutoff.toISOString())
    .in('users.subscription_tier', ['basic', 'pro', 'vip', 'legend']);
  
  const allProtected = [...(data || []), ...(proTracks || [])];
  // Deduplicate
  const seen = new Set();
  return allProtected.filter(t => {
    if (seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });
}

/**
 * Backup a track's audio to R2 (Phase 2 — requires R2 credentials)
 * For now: logs the track and marks it for future backup
 */
async function backupToR2(supabase, track) {
  if (!R2_ENABLED) {
    console.log(`[PROTECT] R2 not configured — skipping backup for track ${track.id} (${track.title})`);
    return { success: false, reason: 'R2 not configured' };
  }
  
  // Phase 2 implementation:
  // 1. Fetch audio from KIE CDN via our CORS proxy: GET /api/proxy/audio?url={audio_url}
  // 2. Upload to R2 bucket using @aws-sdk/client-s3
  // 3. Update tracks.audio_url to R2 URL
  // 4. Set audio_expires_at to NULL (permanent)
  
  console.log(`[PROTECT] R2 backup requested for track ${track.id}`);
  return { success: false, reason: 'Not implemented yet' };
}

/**
 * Main protection cron — runs every 6 hours
 */
async function runProtectionCron(supabase) {
  console.log('[PROTECT] Running protection cron...');
  
  // 1. Check for new viral tracks
  await checkViralTracks(supabase);
  
  // 2. Find near-expiry protected tracks
  const nearExpiry = await getNearExpiryTracks(supabase, 3);
  
  if (nearExpiry.length > 0) {
    console.log(`[PROTECT] Found ${nearExpiry.length} protected tracks near KIE expiry`);
    
    for (const track of nearExpiry) {
      const result = await backupToR2(supabase, track);
      if (!result.success) {
        console.log(`[PROTECT] Track ${track.id} backup skipped: ${result.reason}`);
      }
    }
  } else {
    console.log('[PROTECT] No protected tracks near expiry');
  }
  
  // 3. Mark truly expired tracks (past 14 days, not protected) as expired
  const { data: expired } = await supabase
    .from('tracks')
    .select('id')
    .eq('expired', false)
    .eq('viral_protected', false)
    .lt('audio_expires_at', new Date().toISOString());
  
  if (expired && expired.length > 0) {
    // For now, just log. KIE handles the actual file deletion.
    console.log(`[PROTECT] ${expired.length} free tracks past KIE retention (will be deleted by KIE)`);
  }
}

module.exports = {
  isViral,
  checkViralTracks,
  getNearExpiryTracks,
  backupToR2,
  runProtectionCron,
  R2_ENABLED
};
