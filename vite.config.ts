/// <reference types="vitest" />
/// <reference types="vite/client" />
// @ts-ignore
import path from 'path';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
// @ts-ignore
const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);
export default defineConfig({
  plugins: [
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
  },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    lib: {
      entry:{
        background: path.resolve(__dirname, 'src/background.ts'),
        'content-scripts': path.resolve(__dirname, 'src/content-scripts.ts'),
        'interceptor':path.resolve(__dirname,'src/interceptor.ts')
        }
    },
  },
});
