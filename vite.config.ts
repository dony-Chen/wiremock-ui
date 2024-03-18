import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vitejs.dev/config/
export default ({ mode }: { mode: any }) => {
    //process.env = {...process.env, ...loadEnv(mode, process.cwd())};
    process.env = { ...process.env, ...loadEnv(mode, process.cwd(), '') };
    const port = process.env.VITE_PORT ? parseInt(process.env.VITE_PORT) : 5173;
    return defineConfig({
        server: {
            port: port,
            host: process.env.VITE_HOST,
        },
        plugins: [vue(), vueJsx()],
        // base: './',           //..................... http://localhost:5173/
        base: '/wiremock',   //...........................http://localhost:5173/wiremock
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url))
            }
        }
    })
}