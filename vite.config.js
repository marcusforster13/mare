import {defineConfig} from 'vite';
export default defineConfig({base:'/mare/',build:{target:'es2022',chunkSizeWarningLimit:1100},server:{strictPort:true}});
