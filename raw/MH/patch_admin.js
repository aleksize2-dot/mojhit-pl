const fs = require('fs');
const file = 'client/src/pages/AdminDashboard.tsx';
let data = fs.readFileSync(file, 'utf8');

// 1. Add import
if (!data.includes('SystemLogsManager')) {
  data = data.replace(/import \{ AffiliateManager \} from '\.\.\/components\/admin\/AffiliateManager';/, "import { AffiliateManager } from '../components/admin/AffiliateManager';\nimport { SystemLogsManager } from '../components/admin/SystemLogsManager';");
}

// 2. Update useState generic type
if (!data.includes("| 'logs'")) {
  data = data.replace(/\| 'affiliates'>/, "| 'affiliates' | 'logs'>");
}

// 3. Add sidebar button
const sidebarButton = `
        <button onClick={() => setActiveTab('logs')} className={\`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm \${activeTab === 'logs' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-on-surface-variant hover:bg-surface-bright'}\`}>
          <span className="material-symbols-outlined text-[20px]">history</span> Logi
        </button>
      </div>`;
if (!data.includes("setActiveTab('logs')")) {
  data = data.replace(/<\/div>\s*\{\/\* Główna Zawartość \*\/\}/, sidebarButton + '\n\n      {/* Główna Zawartość */}');
}

// 4. Add component render
const renderBlock = `
        {activeTab === 'logs' && <SystemLogsManager />}
      </div>
    </div>
  );
}`;
if (!data.includes("<SystemLogsManager />")) {
  data = data.replace(/<\/div>\s*<\/div>\s*\);\s*\}\s*$/, renderBlock);
}

fs.writeFileSync(file, data, 'utf8');
console.log('AdminDashboard patched successfully');
