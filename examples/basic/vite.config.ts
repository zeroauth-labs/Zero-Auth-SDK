import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    server: {
        fs: {
            // Allow serving files from the SDK root
            allow: ['..', '../../../']
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@sdk': path.resolve(__dirname, '../../src')
        }
    }
});
