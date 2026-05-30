const fs = require('fs');
const path = require('path');

function fixPaths(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixPaths(fullPath);
    } else if (fullPath.endsWith('.html') || fullPath.endsWith('.css') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Replace absolute paths with relative paths for Tauri
      // Note: This relies on the fact that Tauri app starts at index.html and does not do nested sub-routing in static mode,
      // but if it does (e.g. /logs/reas-1/index.html), we need relative paths to root.
      // A simple way is to replace `"/_next/` with `"/_next/` since Tauri 2 `http://tauri.localhost` handles absolute paths.
      // But wait! If we replace it with `"./_next/` it only works on the root page.
      // So instead, we determine the depth of the file and prefix accordingly.
      
      const depth = path.relative('out', path.dirname(fullPath)).split(path.sep).filter(p => p !== '').length;
      let prefix = './';
      if (depth > 0) {
        prefix = '../'.repeat(depth);
      }
      
      let modified = false;
      if (content.includes('="/_next/')) {
        content = content.replace(/=\"\/_next\//g, `="${prefix}_next/`);
        modified = true;
      }
      if (content.includes('=" /_next/')) {
        content = content.replace(/=\" \/_next\//g, `="${prefix}_next/`);
        modified = true;
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

console.log('Fixing Next.js absolute paths for Tauri...');
fixPaths('out');
console.log('Done fixing paths.');
