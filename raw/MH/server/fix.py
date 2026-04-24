import os

with open('index.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if "let { data: dbUser, error: userError } = await supabase" in line:
        start_idx = i
        break

if start_idx != -1:
    for i in range(start_idx, len(lines)):
        if ".single();" in lines[i] and "const { data: task, error: taskError } = await supabase" not in lines[i-10:i]:
             # Wait, the broken code ends at `amount: -cost \n      });` and then `// 4. ...`
             pass
    
    for i in range(start_idx, len(lines)):
        if "if (taskError || !task) {" in lines[i]:
            end_idx = i
            break

if start_idx != -1 and end_idx != -1:
    print(f"Found block from {start_idx} to {end_idx}")
    
    replacement = """      let { data: dbUser, error: userError } = await supabase
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
        prompt,
        model,
        persona_id: personaId || null,
        status: 'pending'
      })
      .select()
      .single();

"""
    lines[start_idx:end_idx] = [replacement]
    
    with open('index.js', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Successfully replaced.")
else:
    print("Could not find start or end indices")
