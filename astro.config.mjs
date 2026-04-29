import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import tailwind from '@astrojs/tailwind'
import solidJs from '@astrojs/solid-js'

export default defineConfig({
  site: 'https://byteofprash.com',
  integrations: [mdx(), sitemap(), tailwind(), solidJs()],
})
