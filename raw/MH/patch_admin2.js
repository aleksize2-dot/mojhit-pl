const fs = require('fs');

// 1. Update server/index.js: Admin users endpoint
let serverIndex = fs.readFileSync('server/index.js', 'utf8');
serverIndex = serverIndex.replace(
  /\.select\('\*', \{ count: 'exact' \}\);/,
  ".select('*, user_admin_roles(role_id)', { count: 'exact' });"
);
fs.writeFileSync('server/index.js', serverIndex, 'utf8');

// 2. Update client/src/pages/AdminDashboard.tsx
let adminDash = fs.readFileSync('client/src/pages/AdminDashboard.tsx', 'utf8');
// Fix shield color
adminDash = adminDash.replace(
  /className="flex items-center gap-1 px-2 py-1 bg-surface-container-high rounded-lg border border-outline-variant\/20 hover:border-primary\/30 hover:bg-primary\/10 transition-all text-xs"/,
  "className={`flex items-center gap-1 px-2 py-1 rounded-lg border transition-all text-xs ${user.user_admin_roles && user.user_admin_roles.length > 0 ? 'bg-primary/20 border-primary/50 text-primary hover:bg-primary/30' : 'bg-surface-container-high border-outline-variant/20 hover:border-primary/30 hover:bg-primary/10'}`}"
);

// Remove duplicate buttons from "Akcje"
const btnMonety = `
                                <button
                                  onClick={() => {
                                    const amount = prompt('Ile hitów dodać? (Możesz użyć - aby odjąć)');
                                    if (amount && !isNaN(parseInt(amount))) {
                                      handleUserUpdate(user.id, { coins: (user.coins || 0) + parseInt(amount) });
                                    }
                                  }}
                                  className="material-symbols-outlined text-primary hover:text-primary-dark transition-all p-1.5 rounded-lg hover:bg-primary/10"
                                  title="Dodaj monety"
                                >
                                  monetization_on
                                </button>`;
const btnNoty = `
                                <button
                                  onClick={() => {
                                    const amount = prompt('Ile not dodać? (Możesz użyć - aby odjąć)');
                                    if (amount && !isNaN(parseInt(amount))) {
                                      handleUserUpdate(user.id, { notes: (user.notes || 0) + parseInt(amount) });
                                    }
                                  }}
                                  className="material-symbols-outlined text-tertiary hover:text-tertiary-dark transition-all p-1.5 rounded-lg hover:bg-tertiary/10"
                                  title="Dodaj noty"
                                >
                                  music_note
                                </button>`;

// Replace carefully by removing these buttons
if (adminDash.includes('Dodaj monety')) {
  adminDash = adminDash.replace(/<button[^>]+title="Dodaj monety"[\s\S]+?<\/button>/, '');
  adminDash = adminDash.replace(/<button[^>]+title="Dodaj noty"[\s\S]+?<\/button>/, '');
}

// Global coin to star replacement
adminDash = adminDash.replace(/monetization_on/g, 'star');
adminDash = adminDash.replace(/Monety/g, 'Hity');
adminDash = adminDash.replace(/monet/g, 'hitów');

fs.writeFileSync('client/src/pages/AdminDashboard.tsx', adminDash, 'utf8');

// 3. Update client/src/pages/KupMonety.tsx
let kupMonety = fs.readFileSync('client/src/pages/KupMonety.tsx', 'utf8');
kupMonety = kupMonety.replace(/monetization_on/g, 'star');
fs.writeFileSync('client/src/pages/KupMonety.tsx', kupMonety, 'utf8');

// 4. Update client/src/pages/BiuroProducentow.tsx
let biuro = fs.readFileSync('client/src/pages/BiuroProducentow.tsx', 'utf8');
biuro = biuro.replace(/monetization_on/g, 'star');
fs.writeFileSync('client/src/pages/BiuroProducentow.tsx', biuro, 'utf8');

// 5. Update client/src/components/Generator.tsx
let generator = fs.readFileSync('client/src/components/Generator.tsx', 'utf8');
generator = generator.replace(/monetization_on/g, 'star');
generator = generator.replace(/1 moneta/g, '1 Hit');
fs.writeFileSync('client/src/components/Generator.tsx', generator, 'utf8');

console.log('Admin Dashboard and Icons patched successfully');
