import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// El frontend habla a rutas /api/*, que este proxy reenvía al backend FastAPI
// (localhost:8000) quitando el prefijo /api. Así no hace falta configurar CORS.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
