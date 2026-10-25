import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    esbuild: {
        loader: 'jsx',
        include: /src\/.*\.[jt]sx?$/,
        exclude: []
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: './src/testSetup.js'
    }
});