// @ts-check
import { defineConfig } from 'astro/config';

import svelte from '@astrojs/svelte';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

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

// Drafts are built (see src/lib/articles.ts) but must not show up in the sitemap. The
// config can't query content collections, so read the frontmatter flag directly:
// src/data/articles/de/bully.mdx -> "/de/bully/".
const articleDir = new URL('./src/data/articles/', import.meta.url);
const draftPaths = readdirSync(articleDir, { recursive: true, encoding: 'utf8' })
  .filter((file) => /\.mdx?$/.test(file))
  .filter((file) => /^draft:\s*true\s*$/m.test(readFileSync(new URL(file, articleDir), 'utf8')))
  .map((file) => `/${file.replace(/\\/g, '/').replace(/\.mdx?$/, '')}/`);

// Offline reading: after the build, write dist/sw.js from src/lib/sw-template.js with a
// list of every page and asset, so the service worker can store the whole site on the
// device. Drafts and the sitemap are left out. Registered in BaseLayout.astro.
/** @returns {import('astro').AstroIntegration} */
function offline() {
  let base = '/';
  return {
    name: 'offline',
    hooks: {
      'astro:config:done': ({ config }) => {
        base = config.base.endsWith('/') ? config.base : `${config.base}/`;
      },
      'astro:build:done': ({ dir, logger }) => {
        const files = readdirSync(dir, { recursive: true, encoding: 'utf8' })
          .map((file) => file.replace(/\\/g, '/'))
          .filter((file) => !/^sitemap.*\.xml$/.test(file) && file !== 'sw.js')
          .filter((file) => statSync(new URL(file, dir)).isFile())
          .filter((file) => !draftPaths.some((path) => `/${file}` === `${path}index.html`))
          .sort();
        const hash = createHash('sha256');
        for (const file of files) hash.update(file).update(readFileSync(new URL(file, dir)));
        // de/schlaeger/index.html -> <base>de/schlaeger/ (the URL readers actually open)
        const urls = files.map((file) => base + file.replace(/(^|\/)index\.html$/, '$1'));
        const sw = readFileSync(new URL('./src/lib/sw-template.js', import.meta.url), 'utf8')
          .replace('__VERSION__', hash.digest('hex').slice(0, 12))
          .replace('__BASE__', base)
          .replace('[] /* __PRECACHE__ */', JSON.stringify(urls, null, 2));
        writeFileSync(new URL('sw.js', dir), sw);
        logger.info(`sw.js precaches ${urls.length} files`);
      },
    },
  };
}

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  integrations: [
    svelte(),
    mdx(),
    sitemap({
      filter: (page) => page !== rootPage && !draftPaths.some((path) => page.endsWith(path)),
      i18n: { defaultLocale: 'de', locales: { de: 'de', en: 'en' } },
    }),
    offline(),
  ],
  markdown: {
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } },
  },
});
