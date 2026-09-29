// @ts-check
import { defineConfig } from 'astro/config';

import svelte from '@astrojs/svelte';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// The site lives at https://<user>.github.io/<repo>/ on GitHub Pages, but must also
// work from the root of an S3 bucket or a plain web host. `SITE_BASE` switches between
// the two without touching code:
//
//   npm run build                 -> /hockey-knowledge/  (GitHub Pages)
//   SITE_BASE=/ npm run build     -> /                   (S3, any web host)
//
// Never hardcode an internal link: always build it with href() from src/lib/href.ts,
// which prefixes import.meta.env.BASE_URL for you.
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://phuesler.github.io',
  base: process.env.SITE_BASE ?? '/hockey-knowledge',
  trailingSlash: 'ignore',
  integrations: [svelte(), mdx(), sitemap()],
  markdown: {
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } },
  },
});
