import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const api = 'http://127.0.0.1:' + (process.env.PORT || 5174);

export default defineConfig({
  root: 'web',
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    // The preview player imports the Remotion composition from ../video.
    fs: { allow: ['..'] },
    proxy: Object.fromEntries(['/api', '/media', '/uploads', '/brand', '/music', '/videos'].map((p) => [p, api])),
  },
  build: { outDir: '../dist', emptyOutDir: true, chunkSizeWarningLimit: 2000 },
});
