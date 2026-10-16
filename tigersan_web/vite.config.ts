import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import vueSetupExtend from 'vite-plugin-vue-setup-extend'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import { viteSingleFile } from 'vite-plugin-singlefile'

// unplugin:
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig({
  // base: './',
  plugins: [
    vue(),
    vueSetupExtend(),
    // vueDevTools(),
    // viteSingleFile(),
    AutoImport({
      imports: ['vue'], // 自动导入Vue相关函数，如：ref、reactive、toRef等
      resolvers: [
        ElementPlusResolver({}),
      ]
    }),
    Components({
      resolvers: [
        ElementPlusResolver(),
      ]
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://localhost:7777',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
