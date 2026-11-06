# WAL & AL — Marketing Site

Single-page marketing site for **WAL & AL** (walandal.com), a deep-tech studio.

Vanilla **HTML + CSS + JavaScript**, no framework. Vite is used only as the local dev server.

---

## Quick start

```bash
npm install
npm run dev      # local dev server
npm run build    # optional production build into dist/
```

---

## Project structure

```
walandal/
├── index.html            ← all copy lives here
├── src/
│   ├── main.js           ← entry, boots everything
│   ├── lib/lenis.js      ← Lenis smooth scroll, copied in (no package import)
│   ├── scripts/
│   │   ├── header.js     ← header menu
│   │   ├── screens.js    ← one-screen sections: fit, header tone, section rail
│   │   ├── smooth.js     ← mouse/trackpad smooth scroll and settle-snap
│   │   ├── lens.js
│   │   ├── reveal.js     ← scroll reveals
│   │   └── form.js       ← contact form (Formspree)
│   └── styles/
│       ├── main.css      ← imports the four files below
│       ├── tokens.css    ← colours, fonts, spacing
│       ├── base.css
│       ├── layout.css
│       └── sections.css
├── whitepaper/           ← the Aqua Insight white paper, walandal.com/whitepaper/
│   ├── index.html
│   ├── whitepaper.css    ← reading, figure, chart and print styles (imports tokens.css and base.css)
│   ├── whitepaper.js     ← draws each chart from the data table under it
│   ├── WAL-AL-Aqua-Insight-White-Paper-v1.0.pdf
│   └── og-whitepaper.png ← share image
├── tools/
│   └── whitepaper-pdf.mjs ← rebuilds the white paper PDF and share image
├── assets/               ← logo, mark, favicons, og-image
├── CNAME                 ← custom domain for GitHub Pages
└── .nojekyll             ← serve files as they are, no Jekyll
```

---

## Deployment

walandal.com is served by **GitHub Pages** straight from the root of `main`, with no build step. Pushing to `main` publishes the site within a minute or two.

Because of that, the browser must be able to load every file as it is in the repo: use relative or `/`-rooted paths in imports, never bare package names like `import x from 'lenis'`.

The previous site is kept on the `v1` branch.

---

## White paper

`whitepaper/index.html` is plain HTML. Every figure in it cites an official source in the reference list at the end.

- **Charts** are drawn by `whitepaper.js` from the `table.chart-data` under each figure. To change a chart, edit its table.
- **PDF and share image:** after editing the page, rebuild them with `node tools/whitepaper-pdf.mjs`. It needs Node 20+, python3, Playwright's Chromium (in `~/.cache/ms-playwright`) and poppler's `pdfunite`.

---

## Editing brand

`src/styles/tokens.css` is the single source of truth for colour, type, spacing and easing.
