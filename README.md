# WAL & AL — Marketing Site

Single-page, agency-grade marketing site for **WAL & AL** (walandal.com), a deep-tech engineering studio.

Vanilla **HTML + CSS + JavaScript**. No framework, no UI kit, no bundler beyond Vite for dev. Animation libraries (GSAP, ScrollTrigger, SplitText, Lenis, three.js) load from CDN.

---

## Quick start

```bash
npm install
npm run dev      # local dev server
npm run build    # production build into dist/
npm run preview  # serve the production build locally
```

The site is fully static — drop `dist/` on Netlify, Vercel, GitHub Pages, S3, anywhere.

---

## Project structure

```
walandal-site/
├── index.html
├── styles/
│   ├── reset.css
│   ├── tokens.css        ← brand colors, fonts, spacing (edit me!)
│   ├── base.css
│   ├── nav.css
│   ├── hero.css
│   ├── sections.css
│   ├── domains.css
│   ├── systems.css
│   ├── capabilities.css
│   ├── founder.css
│   ├── contact.css
│   ├── footer.css
│   └── utilities.css
├── scripts/
│   ├── main.js           ← entry, boots everything
│   ├── lenis-smooth.js
│   ├── cursor.js
│   ├── nav.js
│   ├── hero-webgl.js     ← three.js displaced icosahedron + particles
│   ├── reveals.js        ← SplitText hero, scroll reveals, manifesto scrub
│   ├── counters.js
│   ├── systems-pin.js    ← pinned horizontal scroll
│   ├── tilt.js           ← 3D card tilt
│   ├── marquee.js
│   ├── form.js           ← Formspree handler (CONFIGURE BEFORE LAUNCH)
│   └── utils.js
├── assets/
│   ├── logo.svg          ← REPLACE WITH YOUR LOGO
│   ├── favicon.svg
│   └── og-image.svg
├── netlify.toml
├── vercel.json
├── .gitignore
└── package.json
```

---

## TODOs before going live

1. **Logo** — replace `assets/logo.svg` and `assets/favicon.svg` with your real marks. Keep the SVGs transparent (no background) so they sit cleanly on the dark UI. The favicon link in `index.html` points at `/assets/favicon.svg`.
2. **OG image** — `assets/og-image.svg` is a generated placeholder. For maximum compatibility, export a 1200×630 PNG and update the `og:image` and `twitter:image` `<meta>` tags in `index.html`.
3. **Formspree** — open `scripts/form.js` and replace `REPLACE_WITH_FORM_ID` in `FORMSPREE_ENDPOINT` with your real Formspree endpoint (e.g. `https://formspree.io/f/abcd1234`). Until then, the form will show a clear "not configured" error on submit.
4. **Canonical URL / OG URL** — `index.html` uses `https://walandal.com/`. Change if your domain differs.

---

## Accessibility & motion

- All animations honour `prefers-reduced-motion: reduce` — smooth scroll, parallax, WebGL hero, magnetic cursor, and SplitText reveals all degrade gracefully.
- Focus styles are visible (2px teal outline).
- Semantic landmarks: `header`, `nav`, `main`, `section`, `footer`.
- Form inputs have associated labels and `aria-live` status.

---

## Deployment

- **Netlify** — drop the folder; `netlify.toml` handles build + headers.
- **Vercel** — drop the folder; `vercel.json` handles build + headers.
- **GitHub Pages / S3 / Cloudflare Pages** — run `npm run build` and upload the contents of `dist/`.

---

## Editing copy

All copy lives in `index.html` — search for the section you want and edit in place. The brand framework (Domains / Systems / Capabilities / Founder / Contact) follows the canonical strings shipped in the original brief.

---

## Editing brand

`styles/tokens.css` is the single source of truth for color, type, scale, and easing. Tweak the CSS variables there and the entire site re-themes.

---

Made with vanilla HTML, CSS, JS — and a lot of attention to detail.
