//@ts-ignore
import { resolve } from 'path'
//@ts-ignore
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
//@ts-ignore
import { viteStaticCopy } from 'vite-plugin-static-copy'
import vue from '@vitejs/plugin-vue'
import { normalizePath } from 'vite'
import path from 'node:path'
const resolvedPath = path.resolve(__dirname, './src/renderer/src/lib') + '/[!.]*'
//@ts-ignore
const normalizedPath = normalizePath(resolvedPath)
export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [
      vue()
      // viteStaticCopy({
      //   targets: [
      //     {
      //       src: normalizedPath,
      //       dest: 'src/lib'
      //     }
      //   ]
      // })
    ],
    server: {
      host: '0.0.0.0'
      //@ts-ignore
      // https: true
      //@ts-ignore
      // port: '3000'
      // proxy: {
      //   '/api': {
      //     target: 'https://virtual-exhibition.kingone-design.com:8111',
      //     changeOrigin: true
      //     // configure: (proxy, options) => {
      //     //   proxy.on('proxyReq', (proxyReq, req, _res) => {
      //     //     console.log(`Sending Request to the ${options.target}:`, req.method, req.url);
      //     //   });
      //     // }
      //   }
      // }
    }
  }
})
