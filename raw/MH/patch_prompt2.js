const fs = require('fs');
let content = fs.readFileSync('client/src/pages/AdminDashboard.tsx', 'utf8');

// 3a. Coins
content = content.replace(
    /const newCoins = prompt\(`Nowa liczba hitów dla \${user\.email \|\| user\.clerk_id}:`, user\.coins \|\| 0\);\s*if \(newCoins !== null && !isNaN\(parseInt\(newCoins\)\)\) \{\s*handleUserBalance\(user\.id, parseInt\(newCoins\), user\.notes \|\| 0\);\s*\}/s,
    `setPromptDialog({
                                      isOpen: true,
                                      title: \`Nowa liczba hitów dla \${user.email || user.clerk_id}:\`,
                                      value: String(user.coins || 0),
                                      inputType: 'number',
                                      onSubmit: (newCoins) => {
                                        if (newCoins !== null && !isNaN(parseInt(newCoins))) {
                                          handleUserBalance(user.id, parseInt(newCoins), user.notes || 0);
                                        }
                                      }
                                    });`
);

// 3b. Notes
content = content.replace(
    /const newNotes = prompt\(`Nowa liczba not dla \${user\.email \|\| user\.clerk_id}:`, user\.notes \|\| 0\);\s*if \(newNotes !== null && !isNaN\(parseInt\(newNotes\)\)\) \{\s*handleUserBalance\(user\.id, user\.coins \|\| 0, parseInt\(newNotes\)\);\s*\}/s,
    `setPromptDialog({
                                      isOpen: true,
                                      title: \`Nowa liczba not dla \${user.email || user.clerk_id}:\`,
                                      value: String(user.notes || 0),
                                      inputType: 'number',
                                      onSubmit: (newNotes) => {
                                        if (newNotes !== null && !isNaN(parseInt(newNotes))) {
                                          handleUserBalance(user.id, user.coins || 0, parseInt(newNotes));
                                        }
                                      }
                                    });`
);

// 3e. Moderation reason
content = content.replace(
    /const reason = prompt\('Powód moderacji \(opcjonalnie\):'\);\s*if \(!reason && reason !== ''\) return;\s*handleTrackModerate\(track\.id, \{\s*is_public: !track\.is_public,\s*moderation_reason: reason\s*\}\);/s,
    `setPromptDialog({
                                      isOpen: true,
                                      title: 'Powód moderacji (opcjonalnie):',
                                      value: '',
                                      inputType: 'text',
                                      onSubmit: (reason) => {
                                        if (reason !== null) {
                                          handleTrackModerate(track.id, { 
                                            is_public: !track.is_public,
                                            moderation_reason: reason
                                          });
                                        }
                                      }
                                    });`
);

content = content.replace(
    /const reason = prompt\('Powód moderacji \(opcjonalnie\):'\);\s*handleTrackModerate\(track\.id, \{\s*is_public: !track\.is_public\s*\}\);/s,
    `setPromptDialog({
                                      isOpen: true,
                                      title: 'Powód moderacji (opcjonalnie):',
                                      value: '',
                                      inputType: 'text',
                                      onSubmit: (reason) => {
                                        if (reason !== null) {
                                          handleTrackModerate(track.id, { is_public: !track.is_public });
                                        }
                                      }
                                    });`
);

fs.writeFileSync('client/src/pages/AdminDashboard.tsx', content, 'utf8');
console.log('AdminDashboard updated again');
