import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // Ensures relative assets work on GitHub Pages, Vercel, Netlify, and custom domains
});
