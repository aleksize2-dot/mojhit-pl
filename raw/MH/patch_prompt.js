const fs = require('fs');
let content = fs.readFileSync('client/src/pages/AdminDashboard.tsx', 'utf8');

// 1. Add state for the dialog
const stateSnippet = `
  // Custom Prompt Dialog State
  const [promptDialog, setPromptDialog] = useState<{
    isOpen: boolean;
    title: string;
    value: string;
    inputType: 'text' | 'number';
    onSubmit: (val: string | null) => void;
  }>({ isOpen: false, title: '', value: '', inputType: 'text', onSubmit: () => {} });

`;

// Add after the last state variable definition (e.g. users management state)
if (!content.includes('promptDialog')) {
    content = content.replace(
        'const [statsLoading, setStatsLoading] = useState(false);',
        'const [statsLoading, setStatsLoading] = useState(false);\n' + stateSnippet
    );
}

// 2. Add the modal JSX just before the final </div> of the component return
const modalJsx = `
      {/* Custom Prompt Dialog */}
      {promptDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-surface border border-outline-variant/20 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold font-headline mb-4 text-on-surface">{promptDialog.title}</h3>
            <input 
              autoFocus
              type={promptDialog.inputType}
              value={promptDialog.value}
              onChange={(e) => setPromptDialog({...promptDialog, value: e.target.value})}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  promptDialog.onSubmit(promptDialog.value);
                  setPromptDialog(prev => ({...prev, isOpen: false}));
                } else if (e.key === 'Escape') {
                  promptDialog.onSubmit(null);
                  setPromptDialog(prev => ({...prev, isOpen: false}));
                }
              }}
              className="w-full bg-surface-container-low border border-outline-variant/30 focus:border-primary p-3 rounded-xl outline-none text-on-surface mb-6 font-medium"
            />
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => {
                  promptDialog.onSubmit(null);
                  setPromptDialog(prev => ({...prev, isOpen: false}));
                }}
                className="px-5 py-2.5 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                Anuluj
              </button>
              <button 
                onClick={() => {
                  promptDialog.onSubmit(promptDialog.value);
                  setPromptDialog(prev => ({...prev, isOpen: false}));
                }}
                className="px-5 py-2.5 rounded-xl font-bold bg-primary text-on-primary hover:bg-primary-dark shadow-md transition-all active:scale-95"
              >
                Potwierdź
              </button>
            </div>
          </div>
        </div>
      )}
`;

if (!content.includes('Custom Prompt Dialog')) {
    content = content.replace(
        / {4}\}\n {2}<\/div>\n\);\n\}/g,
        '  }\n\n' + modalJsx + '\n  </div>\n);\n}'
    );
}

// 3. Replace the prompt() calls
// 3a. Coins
content = content.replace(
    /const newCoins = prompt\(`Nowa liczba hitów dla \${user\.email \|\| user\.clerk_id}:`, user\.coins \|\| 0\);\s*if \(newCoins !== null && !isNaN\(parseInt\(newCoins\)\)\) \{\s*handleUserBalance\(user\.id, parseInt\(newCoins\), user\.notes \|\| 0\);\s*\}/,
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
    /const newNotes = prompt\(`Nowa liczba not dla \${user\.email \|\| user\.clerk_id}:`, user\.notes \|\| 0\);\s*if \(newNotes !== null && !isNaN\(parseInt\(newNotes\)\)\) \{\s*handleUserBalance\(user\.id, user\.coins \|\| 0, parseInt\(newNotes\)\);\s*\}/,
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

// 3c. Likes
content = content.replace(
    /const newLikes = prompt\(`Nowa liczba lajków dla "\${track\.title}":`, track\.likes \|\| 0\);\s*if \(newLikes !== null && !isNaN\(parseInt\(newLikes\)\)\) \{\s*handleTrackModerate\(track\.id, \{ likes: parseInt\(newLikes\) \}\);\s*\}/,
    `setPromptDialog({
                                      isOpen: true,
                                      title: \`Nowa liczba lajków dla "\${track.title}":\`,
                                      value: String(track.likes || 0),
                                      inputType: 'number',
                                      onSubmit: (newLikes) => {
                                        if (newLikes !== null && !isNaN(parseInt(newLikes))) {
                                          handleTrackModerate(track.id, { likes: parseInt(newLikes) });
                                        }
                                      }
                                    });`
);

// 3d. Plays
content = content.replace(
    /const newPlays = prompt\(`Nowa liczba odtworzeń dla "\${track\.title}":`, track\.plays \|\| 0\);\s*if \(newPlays !== null && !isNaN\(parseInt\(newPlays\)\)\) \{\s*handleTrackModerate\(track\.id, \{ plays: parseInt\(newPlays\) \}\);\s*\}/,
    `setPromptDialog({
                                      isOpen: true,
                                      title: \`Nowa liczba odtworzeń dla "\${track.title}":\`,
                                      value: String(track.plays || 0),
                                      inputType: 'number',
                                      onSubmit: (newPlays) => {
                                        if (newPlays !== null && !isNaN(parseInt(newPlays))) {
                                          handleTrackModerate(track.id, { plays: parseInt(newPlays) });
                                        }
                                      }
                                    });`
);

// 3e. Moderation reason
content = content.replace(
    /const reason = prompt\('Powód moderacji \(opcjonalnie\):'\);\s*handleTrackModerate\(track\.id, \{ is_public: !track\.is_public \}\);/,
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
console.log('AdminDashboard updated');
