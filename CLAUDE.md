# CLAUDE.md — MundiOpus Web

Claude-specific guidance for this repo. For full technical details see `SPEC.md`.

---

## What this is

Static website for the [Mundi Opus](https://mundiopus.com) YouTube channel.  
Owner: Diego Fernandez Sanchez — mundiopuscontact@gmail.com

---

## Hard rules

- **Never run `git commit`** — Diego commits manually on his own terms.
- **Never put secrets in any HTML or JS file** — the Brevo API key lives encrypted in Cloudflare only.
- **No em dashes ( — ) in visible text** — use commas, colons, or periods instead.

---

## Stack constraints

- Plain HTML + CSS only. No framework, no npm, no build step, no bundler.
- All CSS is inline inside `<style>` tags in each HTML file — no external stylesheet.
- Open `index.html` directly in a browser to develop; no local server needed.
- Deployment: push to `main` → Cloudflare auto-deploys to `mundiopus.com` in ~60 seconds.

---

## Design system

CSS custom properties defined in `:root` in `index.html`:

```
--bg:       #f0e9d8   warm parchment background
--bg-warm:  #e8dfc8   slightly darker parchment
--ink:      #16100a   near-black text
--ink-mid:  #4a3820   mid brown
--ink-faint:#8a7256   faint brown
--gold:     #7a5c20   primary gold accent
--gold-pale:#b8964a   lighter gold
```

Fonts: Playfair Display, Playfair Display SC, Cormorant Garamond (all from Google Fonts).

---

## Pages

| File | URL | Purpose |
|---|---|---|
| `index.html` | `/` | Main page — all primary content |
| `about.html` | `/about` | What is Mundi Opus |
| `contact.html` | `/contact` | Contact page |
| `privacy.html` | `/privacy` | GDPR privacy policy (required by newsletter consent) |

---

## Newsletter system

Email form → `POST https://newsletter.mundiopus.com` → Cloudflare Worker (`mundiopus-database`) → Brevo API.  
The Worker is deployed separately; its source is at `worker/newsletter.js`. Config at `C:\Users\diego\wrangler.jsonc`.

---

## After making changes

Update `SPEC.md` with any new sections, CSS classes, affiliate links, or system details added.

---

## Key reference

Full technical spec (sections, animations, affiliate links, secrets inventory): `SPEC.md`
