import {defineConfig} from 'vite';
export default defineConfig({esbuild:{jsx:'automatic'},server:{port:5173,proxy:{'/api':'http://127.0.0.1:3000','/uploads':'http://127.0.0.1:3000'}},build:{outDir:'dist'}});
