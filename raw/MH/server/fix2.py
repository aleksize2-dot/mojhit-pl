import os

with open('index.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Add email to req.body destructuring and guest_email to kie_tasks insert
if "const { prompt, tags, title, instrumental = false, model = 'V4', currency_type = 'notes', customMode = false, personaId, personaModel } = req.body;" in content:
    content = content.replace(
        "const { prompt, tags, title, instrumental = false, model = 'V4', currency_type = 'notes', customMode = false, personaId, personaModel } = req.body;",
        "const { prompt, tags, title, instrumental = false, model = 'V4', currency_type = 'notes', customMode = false, personaId, personaModel, email } = req.body;"
    )

if """      .insert({
        user_id: user?.id || null,
        guest_session_id: guestSessionId,""" in content:
    content = content.replace(
        """      .insert({
        user_id: user?.id || null,
        guest_session_id: guestSessionId,""",
        """      .insert({
        user_id: user?.id || null,
        guest_session_id: guestSessionId,
        guest_email: email || null,"""
    )

# Fix 2: Select additional fields from kie_tasks in webhook
if ".select('id, user_id, persona_id')" in content:
    content = content.replace(
        ".select('id, user_id, persona_id')",
        ".select('id, user_id, persona_id, guest_session_id, guest_email')"
    )

# Fix 3: Add additional fields to trackData
track_data_search = """            const trackData = {
              user_id: taskRecord.user_id,
              title: trackTitle,"""
track_data_replace = """            const trackData = {
              user_id: taskRecord.user_id,
              guest_session_id: taskRecord.guest_session_id,
              guest_email: taskRecord.guest_email,
              is_paid: !!taskRecord.user_id,
              is_unlocked: !!taskRecord.user_id,
              title: trackTitle,"""

if track_data_search in content:
    content = content.replace(track_data_search, track_data_replace)

with open('index.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixes applied to index.js")
