# MundiOpus Website — Technical Spec

## Overview

Static website for the [Mundi Opus](https://mundiopus.com) YouTube channel (50k subs, ~700k-1M views/month).
Owner: Diego Fernandez Sanchez — mundiopuscontact@gmail.com

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Plain HTML + CSS, no framework, no build step |
| Fonts | Google Fonts: Playfair Display, Playfair Display SC, Cormorant Garamond |
| Backend | Cloudflare Worker (newsletter proxy) |
| Hosting | Cloudflare Workers — auto-deploys from `main` branch |
| Domain | mundiopus.com |
| Version control | Git → GitHub (`mundiopus/mundiopusweb`) |

No npm, no bundler, no local server needed. Open `index.html` directly in a browser to develop.

---

## Pages

| File | URL | Purpose |
|---|---|---|
| `index.html` | `/` | Main page — all primary content |
| `about.html` | `/about` | What is Mundi Opus |
| `contact.html` | `/contact` | Contact page |
| `privacy.html` | `/privacy` | Privacy policy (required by newsletter consent) |

---

## Design system

CSS custom properties defined in `:root` in `index.html`:

```css
--bg:       #f0e9d8   /* warm parchment background */
--bg-warm:  #e8dfc8   /* slightly darker parchment */
--ink:      #16100a   /* near-black text */
--ink-mid:  #4a3820   /* mid brown */
--ink-faint:#8a7256   /* faint brown */
--gold:     #7a5c20   /* primary gold accent */
--gold-pale:#b8964a   /* lighter gold */
```

All CSS is inline inside `<style>` tags in each HTML file. No external stylesheet.

---

## index.html — Section map

| Section | Description |
|---|---|
| **Nav** | Fixed top bar, height 72px, links to Home / About / Contact. Blurred backdrop. |
| **Scroll progress bar** | 1px gold line at top, scales X with scroll position via `requestAnimationFrame`. |
| **Hero** | Logo (circle image), title, subtitle, "What is Mundi Opus →" button. |
| **Newsletter** | Email signup form → Cloudflare Worker → Brevo. See Newsletter section below. |
| **Marquee** | Infinite scrolling text band (CSS `@keyframes mqLeft`). Seeded via JS clone loop. |
| **Links** | Buttons to YouTube, X/Twitter, and Gumroad store. |
| **Sponsor (Polymail)** | Affiliate section for Polymail email client. Has "More Info" button that opens a modal. |
| **Affiliate** | Gumroad affiliates program section. |
| **Contact** | Email link: mundiopuscontact@gmail.com |
| **Polymail modal** | Overlay with product info and affiliate CTA link. |
| **Store popup** | SessionStorage-gated modal on page load, links to Gumroad store. Shows once per session. |

---

## Animations

All implemented in pure CSS + minimal JS:

- `fadeUp` — elements fade in from 20px below on load
- `float` — logo floats up and down (7s cycle)
- `ringPulse` — logo ring pulses gold (5s cycle)
- `lineGrow` — decorative lines grow from left
- `starSpin` — star/ornament rotates
- `titleReveal` — title letter-spacing animates in
- `mqLeft` — marquee infinite scroll
- `.reveal` class — IntersectionObserver triggers fade-in when elements enter viewport

---

## Affiliate / external links

| Destination | URL |
|---|---|
| YouTube | `https://www.youtube.com/@mundiopus` |
| X / Twitter | `https://x.com/MundiOpus` |
| Gumroad store | `https://gumroad.com/a/348981651/uzaojs` |
| Polymail affiliate | `https://app.polymail.io/login?utm_campaign=polymail_affiliates_2026&utm_medium=referral&utm_source=affiliate&via=MundiOpus` |
| Gumroad affiliates | `https://mundiopus.gumroad.com/affiliates` |

---

## Newsletter system

### How it works

```
User submits email
  → fetch POST to https://newsletter.mundiopus.com
    → Cloudflare Worker (mundiopus-database)
      → Brevo API (api.brevo.com/v3/contacts)
        → subscriber added to Brevo contact list
```

### Why a Worker (not direct API call)

The Brevo API requires a secret API key. Putting it in client-side JS would expose it publicly in the browser. The Worker runs server-side on Cloudflare's edge, where the key is stored encrypted.

### Files

| File | Purpose |
|---|---|
| `worker/newsletter.js` | Cloudflare Worker source code |
| `C:\Users\diego\wrangler.jsonc` | Wrangler config (lives in home dir, not project root) |

### Worker: `worker/newsletter.js`

- Accepts `POST` requests with JSON body `{ email, updateEnabled }`
- Validates email is present
- Forwards to Brevo REST API with `api-key` header
- Returns Brevo's response to the frontend
- CORS restricted to `https://mundiopus.com`
- Handles `OPTIONS` preflight

### Cloudflare deployment

- **Worker name**: `mundiopus-database`
- **Custom domain**: `newsletter.mundiopus.com` → Worker
- **Secret**: `BREVO_API_KEY` — stored encrypted in Cloudflare (never in code or git)
- **Compatibility date**: `2026-08-15`

### Re-deploying the Worker

```powershell
# from C:\Users\diego (where wrangler.jsonc lives)
wrangler deploy

# to update the API key:
wrangler secret put BREVO_API_KEY --name mundiopus-database
```

### Frontend call (index.html ~line 704)

```js
const NEWSLETTER_ENDPOINT = 'https://newsletter.mundiopus.com';
fetch(NEWSLETTER_ENDPOINT, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email, updateEnabled: true })
})
```

---

## Static assets

| File | Purpose |
|---|---|
| `high-1777047088.jpg` | Hero background / logo photo (preloaded) |
| `cropped_circle_image.png` | Circular logo, favicon, og:image |
| `polymail.jpg` | Polymail sponsor logo |
| `Notion.webp` | Notion logo (used in a section) |
| `CNAME` | Contains `mundiopus.com` for Cloudflare custom domain |

---

## Deployment

Push to `main` → Cloudflare auto-deploys to `mundiopus.com`. No manual step needed.

```bash
git add .
git commit -m "description"
git push
```

Cloudflare typically deploys in under 60 seconds.

---

## Repository

- **GitHub**: `https://github.com/mundiopus/mundiopusweb`
- **Branch**: `main` (only branch, also the deploy target)
- **Git user**: Mundi Opus

---

## PlanUpgrades/

Folder for future feature specs:

| File | Status | Description |
|---|---|---|
| `SPEC_newsletter_google_sheets.md` | Superseded | Original plan to use Google Apps Script instead of Brevo. Not implemented — Brevo + Worker chosen instead. |

---

## Secrets inventory

| Secret | Where stored | How to rotate |
|---|---|---|
| `BREVO_API_KEY` | Cloudflare (encrypted) | Brevo dashboard → new key → `wrangler secret put BREVO_API_KEY --name mundiopus-database` |

**Nothing secret should ever appear in `index.html` or any committed file.**
