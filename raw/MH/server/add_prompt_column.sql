-- Add prompt column to kie_track_variants table to store song lyrics
ALTER TABLE public.kie_track_variants 
ADD COLUMN IF NOT EXISTS prompt TEXT;

-- Comment
COMMENT ON COLUMN public.kie_track_variants.prompt IS 'Original prompt/lyrics text from KIE/Suno API';
