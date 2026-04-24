-- Create API Settings table for storing provider configurations and fallback order
CREATE TABLE IF NOT EXISTS api_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  settings JSONB NOT NULL DEFAULT '{
    "kie": {
      "enabled": true,
      "priority": 1,
      "apiKey": "",
      "baseUrl": "https://api.kie.ai/v1",
      "config": {}
    },
    "suno": {
      "enabled": false,
      "priority": 2,
      "apiKey": "",
      "baseUrl": "https://api.suno.ai/v1",
      "config": {}
    },
    "openrouter": {
      "enabled": true,
      "priority": 3,
      "apiKey": "",
      "baseUrl": "https://openrouter.ai/api/v1",
      "config": {}
    },
    "fallbackEnabled": true,
    "autoSwitchOnFailure": true,
    "lastTestedAt": null,
    "createdAt": null,
    "updatedAt": null
  }',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial row
INSERT INTO api_settings (id, settings)
VALUES ('00000000-0000-0000-0000-000000000000', '{
  "kie": {
    "enabled": true,
    "priority": 1,
    "apiKey": "",
    "baseUrl": "https://api.kie.ai/v1",
    "config": {}
  },
  "suno": {
    "enabled": false,
    "priority": 2,
    "apiKey": "",
    "baseUrl": "https://api.suno.ai/v1",
    "config": {}
  },
  "openrouter": {
    "enabled": true,
    "priority": 3,
    "apiKey": "",
    "baseUrl": "https://openrouter.ai/api/v1",
    "config": {}
  },
  "fallbackEnabled": true,
  "autoSwitchOnFailure": true,
  "lastTestedAt": null,
  "createdAt": null,
  "updatedAt": null
}')
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies (optional, can быть disabled for admin access)
ALTER TABLE api_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow admin service role full access" ON api_settings;
CREATE POLICY "Allow admin service role full access" ON api_settings
  FOR ALL USING (true) WITH CHECK (true);

-- Create index on id for faster lookups
CREATE UNIQUE INDEX IF NOT EXISTS api_settings_id_idx ON api_settings (id);