# Hockey Knowledge

Static website with articles about ice hockey for U13 players and their parents.
Currently: sticks and skate sharpening. The theory section will follow later.

Built with [Astro](https://astro.build) and [Svelte](https://svelte.dev). The output is
plain HTML, CSS and JavaScript in `dist/` — no server required. It runs on GitHub Pages,
in an S3 bucket or on any ordinary web host.

The articles themselves are written in German.

## Development

```bash
npm install
npm run dev
```

→ http://localhost:4321/hockey-knowledge/

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve `dist/` locally |
| `npx astro check` | Type check |

How to add an article or an interactive component is described in
[`AGENTS.md`](./AGENTS.md).

## Deployment

### GitHub Pages

`.github/workflows/deploy.yml` builds and deploys on every push to `main`.

The site is live at http://fass-u13-theorie.bagskate.com/ (custom domain, set under
**Settings → Pages**). Because a custom domain serves the site from the root, the
workflow builds with `SITE_BASE=/` and `SITE_URL` set to that domain.

One-time setup:

1. In the repository settings under **Settings → Pages**, choose
   **"GitHub Actions"** as the source and enter the custom domain.
2. Keep `SITE_URL` and `SITE_BASE` in `.github/workflows/deploy.yml` in sync with the
   domain. Without a custom domain the site lives at `https://<user>.github.io/<repo>/`;
   then remove both variables so the defaults from `astro.config.mjs` apply.

### S3 or an ordinary web host

There the site usually lives at the root, so build without a base path:

```bash
SITE_BASE=/ SITE_URL=https://my-domain.ch npm run build
aws s3 sync dist/ s3://my-bucket --delete    # or upload dist/ via FTP
```

`SITE_URL` only determines the absolute URLs in the sitemap, canonical tags, `robots.txt`
and the `llms*.txt` files.

## Search engines and AI assistants

The build generates, next to the pages:

- `/sitemap-index.xml` and `/robots.txt`, which points crawlers to the sitemap.
- `/llms.txt`: a link list of every article, after the [llms.txt](https://llmstxt.org)
  convention.
- `/de/llms-full.txt` and `/en/llms-full.txt`: every article of one language as plain
  Markdown in one file. A parent pastes this one URL into ChatGPT, Claude or Gemini, or
  attaches the file. The "Ask your AI" box on the overview page explains this to readers.
- JSON-LD (`Article`, `BreadcrumbList`, `WebSite`) and Open Graph tags with a share image
  (`public/og-image.png`, 1200×630).

New articles appear in all of these automatically; drafts never do.

One-time setup, outside the repository:

1. **Google Search Console**: add the site (a domain property verified through a DNS TXT
   record needs no file in the repo) and submit `sitemap-index.xml`.
2. **Bing Webmaster Tools**: import the site from Search Console. Bing also feeds
   DuckDuckGo and the web search of several AI assistants.
3. **Links**: ask the club to link the site from its U13 page. A link from a site that is
   already indexed is the fastest way to get discovered.
4. After about a week, search for `site:fass-u13-theorie.bagskate.com` to check what is
   indexed.

## Content

All figures in the articles are rules of thumb from practice, not regulations.
