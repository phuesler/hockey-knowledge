// @ts-check
import { defineConfig } from 'astro/config';

import svelte from '@astrojs/svelte';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// By default the site builds for https://<user>.github.io/<repo>/, but it must also
// work from the root of a custom domain, an S3 bucket or a plain web host. `SITE_BASE`
// switches between the two without touching code:
//
//   npm run build                 -> /hockey-knowledge/  (local default)
//   SITE_BASE=/ npm run build     -> /                   (custom domain, S3, any host)
//
// The deploy workflow sets SITE_BASE=/ and SITE_URL for the custom domain.
//
// Never hardcode an internal link: always build it with href() from src/lib/href.ts,
// which prefixes import.meta.env.BASE_URL for you.
const site = process.env.SITE_URL ?? 'https://phuesler.github.io';
const base = process.env.SITE_BASE ?? '/hockey-knowledge';
// The root page only redirects to /de/ and is marked noindex, so it stays out of the sitemap.
const rootPage = new URL(`${base}/`.replace(/\/{2,}/g, '/'), site).href;

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  integrations: [
    svelte(),
    mdx(),
    sitemap({
      filter: (page) => page !== rootPage,
      i18n: { defaultLocale: 'de', locales: { de: 'de', en: 'en' } },
    }),
  ],
  markdown: {
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } },
  },
});
