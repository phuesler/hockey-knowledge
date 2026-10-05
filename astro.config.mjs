// @ts-check
import { defineConfig } from 'astro/config';

import svelte from '@astrojs/svelte';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync } from 'node:fs';

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
// Drafts are built (see src/lib/articles.ts) but must not show up in the sitemap. The
// config can't query content collections, so read the frontmatter flag directly:
// src/data/articles/de/bully.mdx -> "/de/bully/".
const articleDir = new URL('./src/data/articles/', import.meta.url);
const draftPaths = readdirSync(articleDir, { recursive: true, encoding: 'utf8' })
  .filter((file) => /\.mdx?$/.test(file))
  .filter((file) => /^draft:\s*true\s*$/m.test(readFileSync(new URL(file, articleDir), 'utf8')))
  .map((file) => `/${file.replace(/\\/g, '/').replace(/\.mdx?$/, '')}/`);

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://phuesler.github.io',
  base: process.env.SITE_BASE ?? '/hockey-knowledge',
  trailingSlash: 'ignore',
  integrations: [
    svelte(),
    mdx(),
    sitemap({ filter: (page) => !draftPaths.some((path) => page.endsWith(path)) }),
  ],
  markdown: {
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } },
  },
});
