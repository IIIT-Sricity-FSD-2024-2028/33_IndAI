import { defineConfig,loadEnv } from 'vite';
import { fileURLToPath } from 'node:url';
const frontend = fileURLToPath(new URL('./',import.meta.url));
const project = fileURLToPath(new URL('../',import.meta.url));
export default defineConfig(({mode,command})=>{
  const env = loadEnv(mode,project,'');
  const publicUrl = new URL(env.PUBLIC_URL || 'http://localhost:5173');
  return {
    root:frontend,
    define:{'process.env.NODE_ENV':JSON.stringify(command==='build'?'production':'development')},
    server:{host:publicUrl.hostname,port:Number(publicUrl.port || 5173),strictPort:true,proxy:{'/api':'http://127.0.0.1:'+(env.PORT || 3000)}},
    build:{rollupOptions:{output:{manualChunks(id){if(id.includes('node_modules/lightweight-charts'))return 'charts';if(id.includes('node_modules'))return 'vendor';}}}},
    esbuild:{jsx:'automatic',jsxDev:command!=='build'}
  };
});
