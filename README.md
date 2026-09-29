# Hockey Knowledge

Statische Website mit Artikeln über Eishockey für U13-Spielerinnen, Spieler und ihre
Eltern. Aktuell: Stöcke und Schlittschuhschleifen. Später kommt der Theorieteil dazu.

Gebaut mit [Astro](https://astro.build) und [Svelte](https://svelte.dev). Das Ergebnis ist
reines HTML, CSS und JavaScript in `dist/` — es braucht keinen Server und läuft auf
GitHub Pages, in einem S3-Bucket oder bei jedem gewöhnlichen Webhoster.

## Entwickeln

```bash
npm install
npm run dev
```

→ http://localhost:4321/hockey-knowledge/

| Befehl | Zweck |
| --- | --- |
| `npm run dev` | Dev-Server mit Hot Reload |
| `npm run build` | Produktionsbuild nach `dist/` |
| `npm run preview` | `dist/` lokal servieren |
| `npx astro check` | Typen prüfen |

Wie ein Artikel oder eine interaktive Komponente hinzugefügt wird, steht in
[`AGENTS.md`](./AGENTS.md).

## Deployen

### GitHub Pages

`.github/workflows/deploy.yml` baut und deployt bei jedem Push auf `main`.

Einmalig einrichten:

1. In den Repository-Einstellungen unter **Settings → Pages** als Source
   **„GitHub Actions"** wählen.
2. In `astro.config.mjs` prüfen, dass `site` auf den eigenen GitHub-Benutzer zeigt und
   `base` dem Repository-Namen entspricht:

   ```js
   site: 'https://phuesler.github.io',
   base: '/hockey-knowledge',
   ```

Bei einer User-Page (`<benutzer>.github.io`) liegt die Seite im Wurzelverzeichnis; dann im
Workflow `SITE_BASE=/` setzen.

### S3 oder gewöhnlicher Webhoster

Dort liegt die Seite normalerweise im Wurzelverzeichnis, also ohne Base-Pfad bauen:

```bash
SITE_BASE=/ SITE_URL=https://meine-domain.ch npm run build
aws s3 sync dist/ s3://mein-bucket --delete    # oder dist/ per FTP hochladen
```

`SITE_URL` bestimmt nur die absoluten URLs in Sitemap und Canonical-Tags.

## Inhalt

Alle Angaben in den Artikeln sind Faustregeln aus der Praxis, keine Vorschriften.
