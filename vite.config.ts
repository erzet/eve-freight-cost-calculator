/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import pkg from './package.json' with { type: 'json' };

// Project GitHub Pages serve under /<repo>/. The deploy workflow sets
// GITHUB_PAGES=true; local dev/build stay at the root path.
const base = process.env.GITHUB_PAGES === 'true' ? '/eve-freight-cost-calculator/' : '/';

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  test: {
    globals: true,
    environment: 'node',
  },
});
