-- ============================================================================
-- Admin Roles & Permissions System
-- ============================================================================
-- This script creates tables for role‑based access control (RBAC) in the admin panel.
-- Super‑admin can create roles, assign permissions, and grant roles to users.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Admin Roles
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE, -- system roles (super_admin) cannot be deleted
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create default system roles
INSERT INTO admin_roles (name, description, is_system) VALUES
    ('super_admin', 'Full access to everything', TRUE),
    ('moderator', 'Can view users and moderate tracks', FALSE),
    ('support', 'Can view users and transactions', FALSE)
ON CONFLICT (name) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. Admin Permissions (granular actions)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT DEFAULT 'general',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert predefined permissions
INSERT INTO admin_permissions (code, description, category) VALUES
    -- Dashboard & general
    ('view_admin_panel', 'Access admin panel', 'general'),
    ('view_dashboard', 'View system statistics', 'general'),
    
    -- Users
    ('view_users', 'View user list and details', 'users'),
    ('edit_users', 'Edit user coins, notes, status', 'users'),
    ('reset_passwords', 'Reset user passwords', 'users'),
    
    -- Tracks
    ('view_tracks', 'View track list', 'tracks'),
    ('moderate_tracks', 'Delete/restore tracks, add moderation reason', 'tracks'),
    
    -- Transactions
    ('view_transactions', 'View transaction history', 'transactions'),
    
    -- Producers (future)
    ('manage_producers', 'Manage AI producers', 'producers'),
    
    -- Roles & permissions (meta)
    ('manage_roles', 'Create/edit roles and assign permissions', 'roles'),
    ('assign_roles', 'Assign roles to users', 'roles')
ON CONFLICT (code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 3. Role ↔ Permission mapping (many‑to‑many)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID NOT NULL REFERENCES admin_roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES admin_permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (role_id, permission_id)
);

-- Grant all permissions to super_admin
WITH super_role AS (SELECT id FROM admin_roles WHERE name = 'super_admin'),
     all_perms AS (SELECT id FROM admin_permissions)
INSERT INTO role_permissions (role_id, permission_id)
SELECT super_role.id, all_perms.id
FROM super_role, all_perms
ON CONFLICT DO NOTHING;

-- Grant basic permissions to moderator
WITH mod_role AS (SELECT id FROM admin_roles WHERE name = 'moderator'),
     mod_perms AS (
         SELECT id FROM admin_permissions 
         WHERE code IN ('view_admin_panel', 'view_dashboard', 'view_users', 'view_tracks', 'moderate_tracks')
     )
INSERT INTO role_permissions (role_id, permission_id)
SELECT mod_role.id, mod_perms.id
FROM mod_role, mod_perms
ON CONFLICT DO NOTHING;

-- Grant basic permissions to support
WITH sup_role AS (SELECT id FROM admin_roles WHERE name = 'support'),
     sup_perms AS (
         SELECT id FROM admin_permissions 
         WHERE code IN ('view_admin_panel', 'view_dashboard', 'view_users', 'view_transactions')
     )
INSERT INTO role_permissions (role_id, permission_id)
SELECT sup_role.id, sup_perms.id
FROM sup_role, sup_perms
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. User ↔ Role assignments
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_admin_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES admin_roles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id), -- who granted this role
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    UNIQUE(user_id, role_id)
);

-- ----------------------------------------------------------------------------
-- 5. Indexes for performance
-- ----------------------------------------------------------------------------
CREATE INDEX idx_admin_roles_name ON admin_roles(name);
CREATE INDEX idx_admin_permissions_code ON admin_permissions(code);
CREATE INDEX idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_perm ON role_permissions(permission_id);
CREATE INDEX idx_user_admin_roles_user ON user_admin_roles(user_id);
CREATE INDEX idx_user_admin_roles_role ON user_admin_roles(role_id);

-- ----------------------------------------------------------------------------
-- 6. RLS Policies (optional – enable if you want row‑level security)
-- ----------------------------------------------------------------------------
-- ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE admin_permissions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_admin_roles ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 7. Triggers for updated_at
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_roles_updated_at
    BEFORE UPDATE ON admin_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 8. Helper view: user permissions (all permissions a user has via roles)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW user_admin_permissions AS
SELECT 
    uar.user_id,
    ap.code AS permission_code,
    ap.category,
    ar.name AS role_name,
    uar.assigned_at
FROM user_admin_roles uar
JOIN admin_roles ar ON uar.role_id = ar.id
JOIN role_permissions rp ON ar.id = rp.role_id
JOIN admin_permissions ap ON rp.permission_id = ap.id;

-- ============================================================================
-- Migration notes:
-- 1. Run this script in Supabase SQL Editor.
-- 2. After tables are created, you can assign the super_admin role to your user.
-- 3. Use the following query to assign super_admin to a user (replace USER_ID):
--    INSERT INTO user_admin_roles (user_id, role_id) 
--    SELECT 'YOUR_USER_UUID', id FROM admin_roles WHERE name = 'super_admin';
-- ============================================================================