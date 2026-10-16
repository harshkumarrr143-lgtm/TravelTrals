// Prebuild script: ensures index.html contains the source entry point before Vite runs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceTemplate = path.join(__dirname, 'index.source.html');
const targetIndex = path.join(__dirname, 'index.html');

if (fs.existsSync(sourceTemplate)) {
  fs.copyFileSync(sourceTemplate, targetIndex);
  console.log('✓ Restored source index.html for Vite build');
}
