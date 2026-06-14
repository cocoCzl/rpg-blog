import { defineConfig } from 'astro/config'
import vue from '@astrojs/vue'
import tailwind from '@astrojs/tailwind'
import node from '@astrojs/node'

export default defineConfig({
  site: process.env.SITE_URL || 'http://localhost:4321',
  integrations: [
    vue({
      appEntrypoint: '/src/pinia-vue-plugin.ts',
    }),
    tailwind(),
  ],
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  server: {
    port: 4321,
  },
})
