// White paper page: draws each chart from the data table printed under it (one source of truth,
// and the table is the accessible twin), highlights the current section in the contents rail and
// shows reading progress. No libraries, no build step.

const NS = 'http://www.w3.org/2000/svg';
const root = getComputedStyle(document.documentElement);
const C = {
  accent: root.getPropertyValue('--c-accent').trim() || '#2438F5',
  accent2: root.getPropertyValue('--c-accent-2').trim() || '#8F9BFF',
  context: root.getPropertyValue('--c-context').trim() || '#8A979C',
  surface: '#FFFFFF',
};

function el(tag, attrs, parent) {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs || {})) if (v !== undefined && v !== null) n.setAttribute(k, v);
  if (parent) parent.appendChild(n);
  return n;
}
function label(parent, x, y, str, cls, anchor = 'start') {
  const t = el('text', { x, y, class: cls, 'text-anchor': anchor }, parent);
  t.textContent = str;
  return t;
}

// Numbers come from the table: a cell's data-v if present, otherwise its text.
function readTable(table) {
  const head = [...table.tHead.rows[0].cells].map((c) => c.textContent.trim());
  const rows = [...table.tBodies[0].rows].map((r) => {
    const cells = [...r.cells];
    return {
      label: cells[0].dataset.short || cells[0].textContent.trim(),
      full: cells[0].textContent.trim(),
      values: cells.slice(1).map((c) => parseFloat(String(c.dataset.v ?? c.textContent).replace(/[^0-9.\-]/g, ''))),
      shown: cells.slice(1).map((c) => c.dataset.show || c.textContent.trim()),
      flag: r.dataset.flag || '',
    };
  });
  return { head, rows };
}

function niceScale(max, count = 4) {
  if (!(max > 0)) return { top: 1, ticks: [0, 1] };
  const raw = max / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((s) => s * mag).find((s) => s >= raw);
  const top = Math.ceil(max / step - 1e-9) * step;
  const ticks = [];
  for (let v = 0; v <= top + step / 2; v += step) ticks.push(+v.toFixed(6));
  return { top, ticks };
}

function fmt(v, o) {
  const s = v.toLocaleString('en-IN', { maximumFractionDigits: o.decimals ?? 1 });
  return (o.prefix || '') + s + (o.suffix || '');
}

// A bar with a 4px rounded data end and a square baseline.
function colPath(x, y, w, h, r = 4) {
  r = Math.max(0, Math.min(r, w / 2, h));
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
}
function barPath(x, y, w, h, r = 4) {
  r = Math.max(0, Math.min(r, h / 2, w));
  return `M${x},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x}Z`;
}

// ---------- Tooltip (enhances; every value is also in the table) ----------
const tip = document.createElement('div');
tip.className = 'chart-tip';
tip.setAttribute('aria-hidden', 'true');
document.body.appendChild(tip);
function showTip(e, value, name) {
  tip.replaceChildren();
  const b = document.createElement('strong');
  b.textContent = value;
  const s = document.createElement('span');
  s.textContent = name;
  tip.append(b, s);
  let x, y;
  if (e.type === 'focus') {
    const r = e.target.getBoundingClientRect();
    x = r.left + r.width / 2; y = r.top;
  } else { x = e.clientX; y = e.clientY; }
  const w = tip.offsetWidth || 160, h = tip.offsetHeight || 48;
  tip.style.left = Math.min(window.innerWidth - w - 8, Math.max(8, x - w / 2)) + 'px';
  tip.style.top = Math.max(8, y - h - 14) + 'px';
  tip.classList.add('on');
}
function hideTip() { tip.classList.remove('on'); }
function hit(node, value, name, marks = []) {
  node.setAttribute('tabindex', '0');
  node.setAttribute('role', 'img');
  node.setAttribute('aria-label', `${name}: ${value}`);
  const lift = (on) => marks.forEach((m) => m.classList.toggle('is-hover', on));
  for (const ev of ['pointerenter', 'pointermove', 'focus']) node.addEventListener(ev, (e) => { lift(true); showTip(e, value, name); });
  for (const ev of ['pointerleave', 'blur']) node.addEventListener(ev, () => { lift(false); hideTip(); });
}

// ---------- Column chart: one series over time or categories ----------
function columnChart(d, o, W) {
  const H = Math.round(Math.min(o.maxH || 330, Math.max(210, W * 0.44)));
  const m = { t: 30, r: 6, b: 32, l: o.left || 44 };
  const vals = d.rows.map((r) => r.values[o.col || 0]);
  const { top, ticks } = niceScale(o.yMax || Math.max(...vals, o.ref ? o.ref.v : 0), o.ticks || 4);
  const iw = W - m.l - m.r, ih = H - m.t - m.b;
  const y = (v) => m.t + ih - (v / top) * ih;
  const band = iw / d.rows.length;
  const bw = Math.min(o.barMax || 26, band * 0.58);
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H });
  ticks.forEach((t) => {
    el('line', { x1: m.l, x2: W - m.r, y1: y(t), y2: y(t), class: t === 0 ? 'axis' : 'grid' }, svg);
    label(svg, m.l - 8, y(t) + 4, fmt(t, { ...o, suffix: o.tickSuffix ?? o.suffix }), 'tick', 'end');
  });
  if (o.ref) {
    el('line', { x1: m.l, x2: W - m.r, y1: y(o.ref.v), y2: y(o.ref.v), class: 'ref' }, svg);
    label(svg, W - m.r, y(o.ref.v) - 7, o.ref.label, 'note-t', 'end');
  }
  const n = d.rows.length;
  const labelEvery = band < 46 ? Math.ceil(46 / band) : 1;
  d.rows.forEach((r, i) => {
    const v = r.values[o.col || 0];
    const cx = m.l + band * (i + 0.5);
    const yt = y(v);
    const isHl = r.flag.includes('hl') || (o.highlight === 'last' && i === n - 1);
    const fill = o.highlight ? (isHl ? C.accent : C.accent2) : C.accent;
    const mk = el('path', { d: colPath(cx - bw / 2, yt, bw, y(0) - yt), fill, class: 'datum' }, svg);
    if (i % labelEvery === 0 || i === n - 1) label(svg, cx, H - m.b + 19, r.label, 'cat', 'middle');
    const show = o.labels === 'all' || r.flag.includes('label') || (o.labels !== 'none' && (i === 0 || i === n - 1));
    if (show) label(svg, cx, yt - 9, r.shown[o.col || 0], 'val', 'middle');
    const h = el('rect', { x: cx - band / 2, y: m.t, width: band, height: ih, class: 'hit' }, svg);
    hit(h, r.shown[o.col || 0], r.full, [mk]);
  });
  return svg;
}

// ---------- Ranked horizontal bars ----------
function hbarChart(d, o, W) {
  const stacked = W < 520;              // narrow: the name sits above its bar
  const bh = 18;
  const rowH = stacked ? 52 : 40;
  const lw = stacked ? 0 : Math.min(o.labelW || 190, Math.round(W * 0.36));
  const valRoom = o.valRoom || 64;
  const m = { t: 6, b: o.axis ? 26 : 4 };
  const vals = d.rows.map((r) => r.values[o.col || 0]);
  const { top, ticks } = niceScale(o.xMax || Math.max(...vals, o.ref ? o.ref.v : 0), o.ticks || 4);
  const x0 = lw, iw = W - lw - valRoom;
  const x = (v) => x0 + (v / top) * iw;
  const H = m.t + d.rows.length * rowH + m.b;
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H });
  if (o.axis) {
    ticks.forEach((t) => {
      el('line', { x1: x(t), x2: x(t), y1: m.t, y2: H - m.b + 2, class: 'grid' }, svg);
      label(svg, x(t), H - 6, fmt(t, { ...o, suffix: o.tickSuffix ?? o.suffix }), 'tick', 'middle');
    });
  }
  el('line', { x1: x0, x2: x0, y1: m.t, y2: H - m.b, class: 'axis' }, svg);
  if (o.ref) {
    el('line', { x1: x(o.ref.v), x2: x(o.ref.v), y1: m.t, y2: H - m.b, class: 'ref' }, svg);
  }
  d.rows.forEach((r, i) => {
    const v = r.values[o.col || 0];
    const yTop = m.t + i * rowH;
    const by = stacked ? yTop + 26 : yTop + (rowH - bh) / 2;
    if (stacked) label(svg, 0, yTop + 16, r.label, 'cat');
    else label(svg, lw - 12, by + bh / 2 + 4, r.label, 'cat', 'end');
    const isHl = r.flag.includes('hl');
    const fill = o.highlight ? (isHl ? C.accent : C.accent2) : C.accent;
    const w = Math.max(1, x(v) - x0);
    const mk = el('path', { d: barPath(x0, by, w, bh), fill, class: 'datum' }, svg);
    label(svg, x0 + w + 8, by + bh / 2 + 4.5, r.shown[o.col || 0], 'val');
    const h = el('rect', { x: 0, y: yTop, width: W, height: rowH, class: 'hit' }, svg);
    hit(h, r.shown[o.col || 0], r.full, [mk]);
  });
  return svg;
}

// ---------- Dumbbell: before and after per item (one hue, two steps) ----------
function dumbbellChart(d, o, W) {
  const stacked = W < 520;
  const rowH = stacked ? 54 : 40;
  const lw = stacked ? 0 : Math.min(o.labelW || 170, Math.round(W * 0.34));
  const m = { t: 8, b: 26, r: 18 };
  const all = d.rows.flatMap((r) => r.values);
  const { top, ticks } = niceScale(o.xMax || Math.max(...all), o.ticks || 4);
  const x0 = lw + 6, iw = W - x0 - m.r;
  const x = (v) => x0 + (v / top) * iw;
  const H = m.t + d.rows.length * rowH + m.b;
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H });
  ticks.forEach((t) => {
    el('line', { x1: x(t), x2: x(t), y1: m.t, y2: H - m.b + 2, class: t === 0 ? 'axis' : 'grid' }, svg);
    label(svg, x(t), H - 6, fmt(t, { ...o, suffix: o.tickSuffix ?? o.suffix }), 'tick', 'middle');
  });
  d.rows.forEach((r, i) => {
    const [a, b] = r.values;
    const yTop = m.t + i * rowH;
    const cy = stacked ? yTop + 36 : yTop + rowH / 2;
    if (stacked) label(svg, 0, yTop + 16, r.label, 'cat');
    else label(svg, lw - 8, cy + 4, r.label, 'cat', 'end');
    el('line', { x1: x(a), x2: x(b), y1: cy, y2: cy, stroke: '#C9D1D0', 'stroke-width': 2, 'stroke-linecap': 'round' }, svg);
    const ma = el('circle', { cx: x(a), cy, r: 5.5, fill: C.accent2, stroke: C.surface, 'stroke-width': 2, class: 'datum' }, svg);
    const mb = el('circle', { cx: x(b), cy, r: 5.5, fill: C.accent, stroke: C.surface, 'stroke-width': 2, class: 'datum' }, svg);
    const right = b >= a;
    label(svg, x(b) + (right ? 12 : -12), cy + 4.5, r.shown[1], 'val', right ? 'start' : 'end');
    const h = el('rect', { x: 0, y: yTop, width: W, height: rowH, class: 'hit' }, svg);
    hit(h, `${d.head[1]}: ${r.shown[0]} · ${d.head[2]}: ${r.shown[1]}`, r.full, [ma, mb]);
  });
  return svg;
}

// ---------- Schematic: a month at one tank (illustration, not data) ----------
function schematicChart(_d, _o, W) {
  const narrow = W < 560;
  const H = narrow ? 296 : 244;
  const m = { l: 8, r: 8, t: 30, b: narrow ? 76 : 30 };
  const X0 = m.l, X1 = W - m.r, YT = m.t, YB = H - m.b;
  const val = (d) => 0.64 + 0.022 * Math.sin(d * 2 * Math.PI) + 0.018 * Math.sin(d * 0.55 + 0.8) - 0.5 * Math.exp(-(((d - 14.5) / 1.55) ** 2));
  const x = (d) => X0 + (X1 - X0) * d / 30;
  const y = (v) => YB - v * (YB - YT);
  const lim = y(0.3);
  const pts = [];
  for (let i = 0; i <= 600; i++) pts.push([x(i / 20), y(val(i / 20))]);
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H });
  el('line', { x1: X0, x2: X1, y1: YB, y2: YB, class: 'axis' }, svg);
  el('line', { x1: X0, x2: X0, y1: YT - 6, y2: YB, class: 'axis' }, svg);
  el('line', { x1: X0, x2: X1, y1: lim, y2: lim, class: 'ref' }, svg);
  const below = pts.filter((p) => p[1] > lim);
  el('path', { d: `M${below[0][0]},${lim} ` + below.map((p) => `L${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ') + ` L${below[below.length - 1][0]},${lim} Z`, fill: C.accent, 'fill-opacity': 0.14 }, svg);
  el('path', { d: 'M' + pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' L'), fill: 'none', stroke: C.accent, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, svg);
  [0, 30].forEach((d) => el('circle', { cx: x(d), cy: y(val(d)), r: 7, fill: C.context, stroke: C.surface, 'stroke-width': 2 }, svg));
  label(svg, X0 + 10, YT - 10, 'FREE RESIDUAL CHLORINE', 's-mono');
  const sy = Math.round((y(0.53) + lim) / 2) + 4;
  label(svg, X0 + 12, sy, 'Sample: passes', 's-lbl');
  label(svg, X1 - 12, sy, 'Next sample: passes', 's-lbl', 'end');
  label(svg, X1, lim + 16, 'IS 10500 MINIMUM', 's-mono', 'end');
  if (narrow) {
    label(svg, X0, YB + 16, 'DAY 1', 's-mono');
    label(svg, X1, YB + 16, 'DAY 30', 's-mono', 'end');
    label(svg, x(14.5), YB + 44, 'Below the minimum for days,', 's-acc', 'middle');
    label(svg, x(14.5), YB + 61, 'between the two samples', 's-acc', 'middle');
  } else {
    label(svg, x(15.9), lim + 31, 'Below the minimum for days,', 's-acc');
    label(svg, x(15.9), lim + 47, 'between the two samples', 's-acc');
    label(svg, X0, H - 10, 'DAY 1', 's-mono');
    label(svg, X1, H - 10, 'DAY 30', 's-mono', 'end');
  }
  return svg;
}

const CHARTS = { column: columnChart, hbar: hbarChart, dumbbell: dumbbellChart, schematic: schematicChart };

function options(box) {
  const ds = box.dataset;
  const o = {
    suffix: ds.suffix, prefix: ds.prefix, tickSuffix: ds.tickSuffix,
    decimals: ds.decimals !== undefined ? +ds.decimals : undefined,
    yMax: ds.max ? +ds.max : undefined, xMax: ds.max ? +ds.max : undefined,
    highlight: ds.highlight, labels: ds.labels, axis: ds.axis === 'true',
    labelW: ds.labelW ? +ds.labelW : undefined, left: ds.left ? +ds.left : undefined,
    ticks: ds.ticks ? +ds.ticks : undefined, valRoom: ds.valRoom ? +ds.valRoom : undefined,
  };
  if (ds.ref) { const [v, ...rest] = ds.ref.split('|'); o.ref = { v: +v, label: rest.join('|') }; }
  return o;
}

function legend(box, d) {
  if (box.dataset.chart !== 'dumbbell') return;
  const lg = document.createElement('div');
  lg.className = 'legend';
  [[d.head[1], C.accent2], [d.head[2], C.accent]].forEach(([name, col]) => {
    const s = document.createElement('span');
    const i = document.createElement('i');
    i.style.background = col;
    s.append(i, document.createTextNode(name));
    lg.append(s);
  });
  box.before(lg);
}

function draw(box) {
  const table = box.closest('figure').querySelector('table.chart-data');
  if (!table && box.dataset.chart !== 'schematic') return;
  const d = box._data || (box._data = table ? readTable(table) : null);
  const W = Math.round(box.clientWidth);
  if (!W || Math.abs((box._w || 0) - W) < 4) return;
  box._w = W;
  const svg = CHARTS[box.dataset.chart](d, options(box), W);
  svg.setAttribute('aria-hidden', 'false');
  svg.setAttribute('role', 'group');
  svg.setAttribute('aria-label', box.dataset.title || box.closest('figure').querySelector('.fig-title')?.textContent || 'Chart');
  box.replaceChildren(svg);
}

const boxes = [...document.querySelectorAll('.chart[data-chart]')];
boxes.forEach((b) => { const t = b.closest('figure').querySelector('table.chart-data'); if (t) legend(b, (b._data = readTable(t))); });
const ro = new ResizeObserver((entries) => entries.forEach((e) => draw(e.target)));
boxes.forEach((b) => { draw(b); ro.observe(b); });
window.addEventListener('beforeprint', () => boxes.forEach((b) => { b._w = 0; draw(b); }));
document.documentElement.classList.add('charts-ready');

// ---------- Contents rail: mark the section in view ----------
const links = new Map([...document.querySelectorAll('.toc a[href^="#"]')].map((a) => [a.getAttribute('href').slice(1), a]));
if (links.size && 'IntersectionObserver' in window) {
  const seen = new Map();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => seen.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0));
    let best = null;
    for (const [id] of links) if ((seen.get(id) || 0) > 0) { best = id; break; }
    if (best) links.forEach((a, id) => a.setAttribute('aria-current', id === best ? 'true' : 'false'));
  }, { rootMargin: '-80px 0px -55% 0px', threshold: [0, 0.01] });
  links.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
}

// ---------- Reading progress ----------
const bar = document.querySelector('.reading-bar');
if (bar) {
  let raf = 0;
  const update = () => {
    raf = 0;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.setProperty('--read-progress', max > 0 ? Math.min(1, window.scrollY / max).toFixed(4) : 0);
  };
  window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
  update();
}

