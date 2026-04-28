const fs = require('fs');
let content = fs.readFileSync('client/src/components/Generator.tsx', 'utf8');

const userAvatarMarkup = `
                    {m.role === 'user' && (
                      <div className="relative flex-shrink-0 mt-1">
                        <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm border border-outline-variant/20 bg-surface-container-high flex items-center justify-center">
                          {user?.imageUrl ? (
                            <img src={user.imageUrl} alt={user.fullName || 'User'} className="w-full h-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-sm text-on-surface-variant">person</span>
                          )}
                        </div>
                      </div>
                    )}`;

content = content.replace(
  /<div className=\{`p-4 rounded-2xl text-sm md:text-base font-body shadow-sm leading-relaxed \$\{m.role === 'user' \? \`\$\{activeProducer.colorBg\} text-white rounded-tr-xl\` : 'bg-surface-container-high text-on-surface rounded-tl-xl border border-outline-variant\/10'\}`\}>/g,
  `${userAvatarMarkup}\n                    <div className={\`p-4 rounded-2xl text-sm md:text-base font-body shadow-sm leading-relaxed \${m.role === 'user' ? \`\${activeProducer.colorBg} text-white rounded-tr-sm\` : 'bg-surface-container-high text-on-surface rounded-tl-xl border border-outline-variant/10'}\`}>`
);

fs.writeFileSync('client/src/components/Generator.tsx', content);
console.log('Added user avatar.');
