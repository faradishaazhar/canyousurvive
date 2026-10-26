// Bundles src/ into one self-contained HTML page: dist/real-life-simulator.html
// Usage: node tools/build.mjs [--standalone]
//   --standalone adds <!doctype html><html><head>…<body> so the file opens directly
//   in a browser or on GitHub Pages. Without it, the output is the body-only form
//   the Claude artifact host expects.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const standalone = process.argv.includes('--standalone');
const read = (p) => readFileSync(join(root, p), 'utf8');

const ICON_NAMES = ['Landmark', 'Home', 'Zap', 'Bus', 'ShoppingBasket', 'UtensilsCrossed', 'Shirt', 'Sparkles', 'Wifi', 'WifiOff', 'HeartPulse', 'Ticket', 'PiggyBank', 'Repeat', 'Briefcase', 'Receipt', 'CalendarDays', 'BarChart3', 'Scale', 'BookOpen', 'Settings', 'Signal', 'ChevronLeft', 'ChevronRight', 'AlertTriangle', 'Moon', 'Droplet', 'Search', 'Heart', 'HeartOff', 'Minus', 'Plus', 'ShoppingCart', 'ShieldCheck', 'Check'];
let icons = {};
try {
  const require = createRequire(import.meta.url);
  const lucide = require(join(root, 'node_modules/lucide/dist/umd/lucide.js'));
  for (const n of ICON_NAMES) {
    const node = lucide.icons[n];
    if (!node) throw new Error('Missing icon ' + n);
    icons[n] = node[2];
  }
} catch (e) {
  console.error('Icons: install lucide@0.344.0 (npm install) — ' + e.message);
  process.exit(1);
}

const JS_FILES = ['src/money.js', 'src/data/sources.js', 'src/data/indonesia.js', 'src/data/countries.js', 'src/data/catalog.js', 'src/data/baskets.js', 'src/engine.js'];
const js = [
  `(function(r){(r.RLS=r.RLS||{}).ICONS=${JSON.stringify(icons)};})(globalThis);`,
  ...JS_FILES.map((f) => `// ── ${f}\n` + read(f)),
  '// ── src/ui.js\n' + read('src/ui.js'),
].join('\n');

let html = read('src/shell.html').replace('/*__CSS__*/', () => read('src/styles.css')).replace('/*__JS__*/', () => js.replace(/<\/script/gi, '<\\/script'));
if (standalone) {
  html = `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n${html.replace('<div id="app"></div>', '</head>\n<body>\n<div id="app"></div>')}\n</body>\n</html>\n`;
}
mkdirSync(join(root, 'dist'), { recursive: true });
const out = join(root, 'dist', standalone ? 'index.html' : 'real-life-simulator.html');
writeFileSync(out, html);
console.log(`Wrote ${out} (${(html.length / 1024).toFixed(1)} KB)`);
