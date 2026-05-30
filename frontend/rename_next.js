const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'out');
const nextDir = path.join(outDir, '_next');
const assetsDir = path.join(outDir, 'next_assets');

if (!fs.existsSync(outDir)) {
  console.log("No out dir found");
  process.exit(0);
}

if (fs.existsSync(nextDir)) {
  fs.renameSync(nextDir, assetsDir);
}

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('/_next/')) {
    content = content.replace(/\/_next\//g, '/next_assets/');
    fs.writeFileSync(filePath, content);
  }
}

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else {
      if (fullPath.endsWith('.html') || fullPath.endsWith('.js') || fullPath.endsWith('.css') || fullPath.endsWith('.json') || fullPath.endsWith('.txt')) {
        replaceInFile(fullPath);
      }
    }
  }
}

traverse(outDir);
console.log("Renamed _next to next_assets and updated references.");
