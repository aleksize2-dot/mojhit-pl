const fs = require('fs');
const content = fs.readFileSync('client/src/components/Generator.tsx', 'utf8');

let newContent = content.replace(
    /\{p\.badge && <span className="text-\[7px\] text-on-surface-variant uppercase tracking-wider font-label bg-surface-container-high px-1 py-0\.5 rounded border border-outline-variant\/20">\{p\.badge\}<\/span>\}/g,
    `{p.badge && <span className={\`text-[7px] uppercase tracking-wider font-label px-1 py-0.5 rounded border \${p.colorText} \${p.colorBg10} \${p.colorBorder20}\`}>{p.badge}</span>}`
);

newContent = newContent.replace(
    /\{p\.badge && <span className="text-\[8px\] text-on-surface-variant uppercase tracking-wider font-label bg-surface-container-high px-1\.5 py-0\.5 rounded border border-outline-variant\/20">\{p\.badge\}<\/span>\}/g,
    `{p.badge && <span className={\`text-[8px] uppercase tracking-wider font-label px-1.5 py-0.5 rounded border \${p.colorText} \${p.colorBg10} \${p.colorBorder20}\`}>{p.badge}</span>}`
);

newContent = newContent.replace(
    /\{activeProducer\.badge && \(\s*<span className="text-\[9px\] text-on-surface-variant uppercase tracking-wider font-label bg-surface-container-highest px-1\.5 py-0\.5 rounded border border-outline-variant\/20">\{activeProducer\.badge\}<\/span>\s*\)\}/g,
    `{activeProducer.badge && (
                         <span className={\`text-[9px] uppercase tracking-wider font-label px-1.5 py-0.5 rounded border \${activeProducer.colorText} \${activeProducer.colorBg10} \${activeProducer.colorBorder20}\`}>{activeProducer.badge}</span>
                       )}`
);

newContent = newContent.replace(
    /\{activeProducer\.badge && \(\s*<span className="text-\[8px\] text-on-surface-variant uppercase tracking-wider font-label bg-surface-container-high px-1\.5 py-0\.5 rounded border border-outline-variant\/20">\{activeProducer\.badge\}<\/span>\s*\)\}/g,
    `{activeProducer.badge && (
                              <span className={\`text-[8px] uppercase tracking-wider font-label px-1.5 py-0.5 rounded border \${activeProducer.colorText} \${activeProducer.colorBg10} \${activeProducer.colorBorder20}\`}>{activeProducer.badge}</span>
                            )}`
);

fs.writeFileSync('client/src/components/Generator.tsx', newContent, 'utf8');
console.log('Replaced all.');
