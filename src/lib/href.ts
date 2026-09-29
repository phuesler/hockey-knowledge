/**
 * Build an internal URL that survives being hosted under a sub-path.
 *
 * On GitHub Pages the site lives at /hockey-knowledge/, so a bare href="/de/schlaeger"
 * would 404. Always route internal links and asset paths through this helper.
 *
 *   href('/de/schlaeger')  ->  '/hockey-knowledge/de/schlaeger'
 *   href('/')              ->  '/hockey-knowledge/'
 */
export function href(path = '/'): string {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}/${path}`.replace(/\/{2,}/g, '/');
}

/** Absolute URL for canonical tags, Open Graph and the sitemap. */
export function absoluteUrl(path: string, site: URL | undefined): string {
  return new URL(href(path), site ?? 'http://localhost:4321').toString();
}
