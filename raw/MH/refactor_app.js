const fs = require('fs');

let content = fs.readFileSync('client/src/App.tsx', 'utf8');

// 1. Add Suspense to imports
content = content.replace(
  "import { useEffect } from 'react';",
  "import { useEffect, Suspense, lazy } from 'react';"
);

// 2. Replace static page imports with lazy ones (except Home)
content = content.replace(/import \{ ([^}]+) \} from '\.\/pages\/([^']+)';/g, (match, component, path) => {
  if (component === 'Home') {
    return match; // keep Home as static
  }
  return `const ${component} = lazy(() => import('./pages/${path}').then(module => ({ default: module.${component} })));`;
});

// 3. Wrap <Routes> with <Suspense fallback={...}>
content = content.replace(
  /<Routes>[\s\S]*?<\/Routes>/,
  match => `<Suspense fallback={<div className="flex items-center justify-center h-full min-h-[50vh]"><span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span></div>}>\n          ${match}\n        </Suspense>`
);

fs.writeFileSync('client/src/App.tsx', content);
console.log('App.tsx refactored with React.lazy');
