// Builds the white paper PDF and its share image from whitepaper/index.html.
//
//   node tools/whitepaper-pdf.mjs
//
// Needs Node 20+, python3 (to serve the repo locally), Playwright's Chromium and poppler's pdfunite.
// Set CHROME=/path/to/chrome to use another Chromium. Writes:
//   whitepaper/WAL-AL-Aqua-Insight-White-Paper-v1.0.pdf  (A4: cover, then numbered pages)
//   whitepaper/og-whitepaper.png                         (1200 x 630 share image)
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir, homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_PDF = join(ROOT, 'whitepaper', 'WAL-AL-Aqua-Insight-White-Paper-v1.0.pdf');
const OUT_OG = join(ROOT, 'whitepaper', 'og-whitepaper.png');
const CHROME = process.env.CHROME || join(homedir(), '.cache/ms-playwright/chromium-1140/chrome-linux/chrome');
const PORT = 8300 + Math.floor(Math.random() * 400);
const DBG = PORT + 1000;
const MM = 96 / 25.4;                      // CSS px per millimetre
const A4 = { w: 210, h: 297 };
const MARGIN = { top: 16, bottom: 18, side: 16 };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const tmp = mkdtempSync(join(tmpdir(), 'wp-pdf-'));
const server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1', '--directory', ROOT], { stdio: 'ignore' });
const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check',
  `--remote-debugging-port=${DBG}`, `--user-data-dir=${join(tmp, 'profile')}`, 'about:blank',
], { stdio: 'ignore' });

async function cdp() {
  for (let i = 0; i < 50; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${DBG}/json/list`)).json();
      const page = list.find((t) => t.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch { /* not up yet */ }
    await sleep(200);
  }
  throw new Error('Chromium did not start');
}

const ws = new WebSocket(await cdp());
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let id = 0;
const pending = new Map();
const waiters = [];
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    const { ok, no } = pending.get(m.id);
    pending.delete(m.id);
    m.error ? no(new Error(m.error.message)) : ok(m.result);
  } else if (m.method) {
    for (const w of [...waiters]) if (w.method === m.method) { waiters.splice(waiters.indexOf(w), 1); w.ok(m.params); }
  }
});
const send = (method, params = {}) => new Promise((ok, no) => { const n = ++id; pending.set(n, { ok, no }); ws.send(JSON.stringify({ id: n, method, params })); });
const once = (method) => new Promise((ok) => waiters.push({ method, ok }));
const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result.value;

async function load(width, height, media) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
  await send('Emulation.setEmulatedMedia', { media });
  const loaded = once('Page.loadEventFired');
  await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/whitepaper/?v=${Date.now()}` });
  await loaded;
  await evaluate('document.fonts.ready.then(() => true)');
  await sleep(900);                         // charts redraw after layout settles
}

try {
  await send('Page.enable');
  await send('Runtime.enable');

  // 1. Cover: full bleed, no footer
  await load(Math.round(A4.w * MM), Math.round(A4.h * MM), 'print');
  await evaluate("document.documentElement.classList.add('pdf-cover'); true");
  await sleep(300);
  const cover = await send('Page.printToPDF', {
    paperWidth: A4.w / 25.4, paperHeight: A4.h / 25.4,
    marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0,
    printBackground: true, pageRanges: '1', preferCSSPageSize: false,
  });
  writeFileSync(join(tmp, 'cover.pdf'), Buffer.from(cover.data, 'base64'));

  // 2. Body: laid out at the printable width so the charts are drawn at their final size
  const bodyW = Math.round((A4.w - 2 * MARGIN.side) * MM);
  await load(bodyW, 1100, 'print');
  await evaluate("document.documentElement.classList.add('pdf-body'); true");
  await sleep(900);
  const footer = `
    <div style="width:100%;margin:0 ${MARGIN.side}mm;display:flex;justify-content:space-between;align-items:center;
                font-family:Arial,Helvetica,sans-serif;font-size:7.5pt;color:#4D5B61;border-top:0.5pt solid #D3DBDA;padding-top:2.2mm">
      <span><b style="color:#0C1A20;letter-spacing:0.04em">WAL &amp; AL</b> &nbsp;·&nbsp; Measured, not assumed: Aqua Insight white paper &nbsp;·&nbsp; v1.0, November 2026</span>
      <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
    </div>`;
  const body = await send('Page.printToPDF', {
    paperWidth: A4.w / 25.4, paperHeight: A4.h / 25.4,
    marginTop: MARGIN.top / 25.4, marginBottom: MARGIN.bottom / 25.4,
    marginLeft: MARGIN.side / 25.4, marginRight: MARGIN.side / 25.4,
    printBackground: true, preferCSSPageSize: false,
    displayHeaderFooter: true, headerTemplate: '<span></span>', footerTemplate: footer,
  });
  writeFileSync(join(tmp, 'body.pdf'), Buffer.from(body.data, 'base64'));
  execFileSync('pdfunite', [join(tmp, 'cover.pdf'), join(tmp, 'body.pdf'), OUT_PDF]);
  console.log('wrote', OUT_PDF);

  // 3. Share image: the cover at 1200 x 630
  await load(1200, 630, 'screen');
  await evaluate("document.documentElement.classList.add('og-card'); window.scrollTo(0, 0); true");
  await sleep(500);
  const shot = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 1200, height: 630, scale: 1 } });
  writeFileSync(OUT_OG, Buffer.from(shot.data, 'base64'));
  console.log('wrote', OUT_OG);
} finally {
  ws.close();
  chrome.kill();
  server.kill();
  await sleep(300);
  rmSync(tmp, { recursive: true, force: true });
}
