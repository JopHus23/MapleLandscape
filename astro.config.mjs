import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://mapher.me',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    server: {
      fs: {
        allow: ['.'],
      },
    },
    esbuild: {
      tsconfigRaw: '{}',
    },
    resolve: {
      preserveSymlinks: true,
    },
  },
});
