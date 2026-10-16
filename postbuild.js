// Postbuild script for GitHub Pages compatibility
// Ensures assets, index.html, and 404.html exist both in root and dist/
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = __dirname;
const distDir = path.join(rootDir, 'dist');
const distAssetsDir = path.join(distDir, 'assets');
const rootAssetsDir = path.join(rootDir, 'assets');

// 1. Copy dist/index.html to root index.html
if (fs.existsSync(path.join(distDir, 'index.html'))) {
  const htmlContent = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');
  fs.writeFileSync(path.join(rootDir, 'index.html'), htmlContent, 'utf-8');
  fs.writeFileSync(path.join(rootDir, '404.html'), htmlContent, 'utf-8');
  console.log('✓ Copied dist/index.html to root index.html and 404.html');
}

// 2. Copy dist/assets to root assets/
if (fs.existsSync(distAssetsDir)) {
  if (!fs.existsSync(rootAssetsDir)) {
    fs.mkdirSync(rootAssetsDir, { recursive: true });
  }
  const files = fs.readdirSync(distAssetsDir);
  for (const file of files) {
    fs.copyFileSync(path.join(distAssetsDir, file), path.join(rootAssetsDir, file));
  }
  console.log(`✓ Copied ${files.length} asset files to root assets/`);
}

// 3. Ensure .nojekyll exists
fs.writeFileSync(path.join(rootDir, '.nojekyll'), '', 'utf-8');
if (fs.existsSync(distDir)) {
  fs.writeFileSync(path.join(distDir, '.nojekyll'), '', 'utf-8');
}
console.log('✓ .nojekyll verified for GitHub Pages');
