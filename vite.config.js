import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

export default defineConfig({
    root: './code/frontend', // Entry point for index.html
    publicDir: false,        // Disable default public/ folder

    resolve: {
        alias: {
            // Add path aliases here if needed
        }
    },

    optimizeDeps: {
        include: ['three'], // Pre-bundle three.js
    },

    server: {
        https: {
            key: fs.readFileSync(path.resolve(__dirname, 'certs/key.pem')),
            cert: fs.readFileSync(path.resolve(__dirname, 'certs/cert.pem')),
        },
        port: 8080,
        open: true,
        fs: {
            allow: ['..'], // Allow Vite to access root-level node_modules
        }
    },

    build: {
        outDir: './dist', // Output directory
        emptyOutDir: true     // Clean output directory before build
    }
});
