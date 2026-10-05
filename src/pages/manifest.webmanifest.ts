import type { APIRoute } from 'astro';
import { href } from '../lib/href';
import { defaultLocale, t } from '../lib/i18n';

/**
 * Web app manifest: lets readers add the site to their home screen, where it opens like
 * an app. On iOS that also keeps the offline copy (see src/lib/sw-template.js) from being
 * deleted after a week without a visit.
 *
 * A manifest can't read CSS variables, so the two colours mirror src/styles/tokens.css:
 * --c-header-bg (the black header bar) and --c-bg (light page background).
 */
export const GET: APIRoute = () => {
  const s = t(defaultLocale);
  const manifest = {
    name: s.siteName,
    short_name: s.brandShort,
    description: s.tagline,
    lang: defaultLocale,
    start_url: href(`/${defaultLocale}/`),
    scope: href('/'),
    display: 'standalone',
    theme_color: '#0a1214',
    background_color: '#f5f5f4',
    icons: [
      { src: href('/icon-192.png'), sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: href('/icon-512.png'), sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  };
  return new Response(JSON.stringify(manifest), {
    headers: { 'Content-Type': 'application/manifest+json' },
  });
};
