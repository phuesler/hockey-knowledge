import type { APIRoute } from 'astro';
import { absoluteUrl } from '../lib/href';

/** Lets every crawler in, search engines and AI assistants alike, and names the sitemap. */
export const GET: APIRoute = ({ site }) =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl('/sitemap-index.xml', site)}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
