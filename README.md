```markdown
# Global Station Monitor (GitHub Pages)

Static station-grid for embedding live streams and showing headlines. Visitors can open the site in a browser — no downloads required.

## What this project contains
- `index.html` — main page
- `styles.css` — styling
- `script.js` — loads `feeds.json`, embeds media, fetches RSS headlines via AllOrigins proxy
- `feeds.json` — list of sources (edit this)

## How to deploy to GitHub Pages (fast)
1. Create a new repository named `<your-username>.github.io` or any repo for a project page.
2. Add these files to the repo root and push.
3. If repo name is `<your-username>.github.io`, GitHub Pages is enabled automatically.  
   For a project page, enable Pages in the repo settings and select the `main` branch and `/ (root)` folder.
4. Visit `https://<your-username>.github.io` (or `https://<your-username>.github.io/<repo>/` for project pages).

## Customize feeds
Edit `feeds.json`. Each entry supports:
- `type`: "youtube_channel" | "youtube_video" | "audio" | "embed" | "rss"
- `name`: display name
- `channelId` (for youtube_channel) OR `videoId` (for youtube_video)
- `url` (for audio/embed)
- `rss` (optional) — RSS feed URL to fetch headlines for that card
- `source` (optional) — subtitle text

Example entry:
```json
{
  "type": "youtube_channel",
  "name": "BBC News (live)",
  "channelId": "UC16niRr50-MSBwiO3YDb3RA",
  "rss": "http://feeds.bbci.co.uk/news/world/rss.xml",
  "source": "BBC"
}
```

## Notes & limitations
- RSS fetching uses https://api.allorigins.win as a free CORS proxy. If you need higher reliability or rate limits, consider:
  - Pre-fetching RSS in a GitHub Action at build time and committing JSON.
  - Using a serverless function (Cloudflare Worker, Netlify Function) to proxy RSS/API requests.
- Exposing private API keys client-side is insecure. Use serverless proxies for NewsAPI or other keyed services.
- YouTube live embeds work when a channel is currently live; otherwise the embed shows the channel or a placeholder.

## License
MIT — adapt as you wish.
```
