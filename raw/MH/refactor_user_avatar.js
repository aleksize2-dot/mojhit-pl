const fs = require('fs');
let content = fs.readFileSync('client/src/components/Generator.tsx', 'utf8');

const oldContainer = '<div key={idx} className={`flex ${m.role === \\'user\\' ? \\'gap-3 max-w-[90%] md:max-w-[80%] self-end flex-row-reverse\\' : \\'flex-col gap-2 w-full max-w-full\\'}`}>';
const newContainer = '<div key={idx} className="flex flex-col gap-2 w-full max-w-full">';
content = content.replace(oldContainer, newContainer);

const oldUserAvatar = `{m.role === 'user' && (
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
const newUserAvatar = `{m.role === 'user' && (
                      <div className="flex items-center gap-2 self-end">
                        <span className="text-sm font-bold text-on-surface-variant">{user?.firstName || 'Ty'}</span>
                        <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm border border-outline-variant/20 bg-surface-container-high flex items-center justify-center">
                          {user?.imageUrl ? (
                            <img src={user.imageUrl} alt={user.fullName || 'User'} className="w-full h-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-sm text-on-surface-variant">person</span>
                          )}
                        </div>
                      </div>
                    )}`;
content = content.replace(oldUserAvatar, newUserAvatar);

const oldBubble = '<div className={`p-4 rounded-2xl text-sm md:text-base font-body shadow-sm leading-relaxed ${m.role === \\'user\\' ? `${activeProducer.colorBg} text-white rounded-tr-sm` : \\'bg-surface-container-high text-on-surface rounded-tl-xl border border-outline-variant/10\\'}`}>';
const newBubble = '<div className={`p-4 rounded-2xl text-sm md:text-base font-body shadow-sm leading-relaxed w-full max-w-[90%] md:max-w-[85%] ${m.role === \\'user\\' ? `${activeProducer.colorBg} text-white rounded-tr-xl self-end` : \\'bg-surface-container-high text-on-surface rounded-tl-xl border border-outline-variant/10\\'}`}>';
content = content.replace(oldBubble, newBubble);

fs.writeFileSync('client/src/components/Generator.tsx', content);
console.log('Successfully refactored user message layout');
