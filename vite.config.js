import { defineConfig } from 'vite'
import monkey from 'vite-plugin-monkey'

export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.js',
      userscript: {
        name: 'TM Vite JS Template',
        namespace: 'https://example.com',
        match: ['*://*/*'],
        grant: ['GM_getValue', 'GM_setValue', 'GM_addStyle', 'GM_registerMenuCommand'],
        icon: 'https://raw.githubusercontent.com/tampermonkey/tampermonkey/master/logo/icon48.png',
      },
      server: {
        open: true // dev 时自动打开安装页面
      }
    })
  ]
})
