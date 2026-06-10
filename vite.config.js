import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' makes the build portable: it works on GitHub Pages project URLs
// (username.github.io/sujit-portfolio) AND on a custom domain with no changes.
export default defineConfig({
  plugins: [react()],
  base: './',
});
