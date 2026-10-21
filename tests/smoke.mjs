// Headless browser smoke test: opens every screen, every game (solo and
// together) and every "Цэгцлэе!" level, and fails on any JavaScript error or
// any request to an outside server. Needs puppeteer-core and Chrome.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, dirname, resolve, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const root = process.env.ROOT || resolve(dirname(fileURLToPath(import.meta.url)), '..');
const chrome = process.env.CHROME_PATH || (process.platform === 'darwin'
  ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : '/usr/bin/google-chrome');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain' };

const server = createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
  try {
    const body = await readFile(join(root, path.endsWith('/') ? path + 'index.html' : path));
    res.writeHead(200, { 'content-type': TYPES[extname(path)] || 'application/octet-stream' }); res.end(body);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const errors = [], external = [];
const browser = await puppeteer.launch({ executablePath: chrome, headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844 });
await page.setRequestInterception(true);
page.on('request', (r) => { const u = new URL(r.url()); if (u.protocol.startsWith('http') && u.hostname !== 'localhost') { external.push(r.url()); r.abort(); } else r.continue(); });
let step = 'load';
page.on('pageerror', (e) => errors.push(`${step}: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error' && !/favicon|404/.test(m.text())) errors.push(`${step}: console error: ${m.text()}`); });
const check = async (label, selector) => {
  step = label;
  if (selector && !(await page.$(selector))) errors.push(`${label}: expected "${selector}" to render`);
};

try {
  await page.goto(`${base}/index.html`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });
  await check('welcome screen', '.onboard');

  const ages = { '3-6': 5, '7-10': 8, '11-14': 12, '15-18': 16 };
  await page.evaluate(() => { TG.store.addProfile({ name: 'Тест', age: 8, avatar: '🐎' }); TG.store.state.settings.screenLimit = 999; TG.store.state.settings.sound = false; });

  for (const screen of ['home', 'satis', 'missions', 'memories', 'about']) {
    await page.evaluate((s) => TG.go(s), screen); await sleep(250);
    await check(`screen ${screen}`, screen === 'about' ? '.about' : '.shell');
  }

  // modal accessibility: focus moves into the dialog, Escape closes it, focus returns
  step = 'modal accessibility';
  await page.evaluate(() => TG.go('home'));
  await sleep(200);
  await page.evaluate(() => {
    window.__before = document.activeElement;
    window.__close = TG.modal(TG.h('div', null, TG.h('button', { class: 'btn', id: 'inside-modal' }, 'inside')));
  });
  await sleep(150);
  const a11y = await page.evaluate(() => {
    const box = document.querySelector('.modal');
    const x = box && box.querySelector('.modal-x');
    return {
      inDialog: !!(box && box.contains(document.activeElement)),
      closeLabel: x ? x.getAttribute('aria-label') : null,
      toastRole: (() => { TG.toast('test'); const t = document.querySelector('.toast'); const r = t ? t.getAttribute('role') : null; t && t.remove(); return r; })(),
    };
  });
  if (!a11y.inDialog) errors.push('modal accessibility: focus did not move into the dialog');
  if (!a11y.closeLabel) errors.push('modal accessibility: close button has no aria-label');
  if (a11y.toastRole !== 'status') errors.push(`modal accessibility: toast role is "${a11y.toastRole}", expected "status"`);
  await page.keyboard.press('Escape');
  await sleep(320);
  if (await page.evaluate(() => !!document.querySelector('.modal-back'))) errors.push('modal accessibility: Escape did not close the modal');
  const restored = await page.evaluate(() => document.activeElement === window.__before);
  if (!restored) errors.push('modal accessibility: focus was not restored after closing');

  step = 'village (solo mode, no server)';
  await page.evaluate(() => TG.go('village')); await sleep(900);
  await check('village screen', '.village canvas');
  const solo = await page.evaluate(() => { const L = TG._village.live(); return L && L.status; });
  if (solo !== 'solo') errors.push(`village: expected solo mode without a server, got "${solo}"`);
  await page.evaluate(() => { document.querySelectorAll('.modal-x').forEach((x) => x.click()); const v = TG.store.active().village; v.seeds.carrot = 2; TG._village.act('plant', 0, 'carrot'); });
  await sleep(300);
  if (!(await page.evaluate(() => { const p = TG.store.active().village.garden[0]; return p && p.c === 'carrot'; }))) errors.push('village: planting in solo mode did not work');
  for (const btn of ['bag', 'talk', 'quests']) { await page.evaluate((b) => { document.querySelectorAll('.modal-x').forEach((x) => x.click()); document.querySelector(`.v-round[aria-label="${b}"]`).click(); }, btn); await sleep(300); await check(`village ${btn} panel`, '.modal'); }
  await page.evaluate(() => { document.querySelectorAll('.modal-x').forEach((x) => x.click()); document.querySelector('.v-pills .v-pill').click(); }); await sleep(250); await check('village shop', '.v-shop');
  await page.evaluate(() => document.querySelectorAll('.modal-x').forEach((x) => x.click())); await sleep(250);

  const games = await page.evaluate(() => TG.gameOrder.map((id) => ({ id, ages: TG.games[id].ages })));
  for (const g of games) {
    for (const together of [false, true]) {
      await page.evaluate((age) => { TG.store.active().age = age; }, ages[g.ages[0]]);
      await page.evaluate((id, together) => {
        document.querySelectorAll('.modal-back,.timeout-back').forEach((m) => m.remove());
        const players = [{ name: 'Тест', emoji: '🐎', color: TG.PCOLORS[0] }];
        if (together) players.push({ name: 'Ээж', emoji: '👩', color: TG.PCOLORS[1] });
        TG.go('play', { g: TG.games[id], players, together });
      }, g.id, together);
      step = `game ${g.id} (${together ? 'together' : 'solo'})`;
      await sleep(350);
      await check(`game ${g.id} (${together ? 'together' : 'solo'})`, '.play-screen');
      for (let k = 0; k < 6; k++) {   // poke a few buttons to exercise game logic
        await page.evaluate(() => { const b = [...document.querySelectorAll('.stage button:not(:disabled)')].filter((x) => x.offsetParent); if (b.length) b[Math.floor(Math.random() * b.length)].click(); });
        await sleep(120);
      }
    }
  }

  const levels = await page.evaluate(() => Object.fromEntries(Object.entries(TG.SATIS).map(([ag, l]) => [ag, l.length])));
  let count = 0;
  for (const [ag, n] of Object.entries(levels)) {
    for (let i = 0; i < n; i++) {
      step = `puzzle ${ag} #${i + 1}`;
      await page.evaluate((ag, i) => TG.go('satisLevel', { ag, i }), ag, i); await sleep(200);
      await check(`puzzle ${ag} #${i + 1}`, '.satis-stage > *');
      count++;
    }
  }

  await page.evaluate(() => TG.go('result', { g: TG.games.shagai, players: [{ name: 'A', emoji: '🐎', color: '#000' }, { name: 'B', emoji: '👩', color: '#111' }], together: true, res: { stars: 3, scores: [15, 9] } }));
  await sleep(250); await check('result screen', '.result');
  // together mode: breathing must show who is breathing with you, the move
  // break must not pay 3 stars for skipping everything, and collaborative
  // games must still show who took part on the result screen.
  step = 'together mode feedback';
  const together = await page.evaluate(async () => {
    const nap = (ms) => new Promise((r) => setTimeout(r, ms));
    const players = [{ name: 'Тест', emoji: '🐎', color: TG.PCOLORS[0] }, { name: 'Ээж', emoji: '👩', color: TG.PCOLORS[1] }];
    const out = {};

    // 1. breathing keeps the group visible in the HUD
    document.querySelectorAll('.modal-back,.timeout-back').forEach((m) => m.remove());
    TG.go('play', { g: TG.games.breathing, players, together: true });
    await nap(300);
    out.breathHud = (document.querySelector('.hud') || {}).textContent || '';
    out.breathHudHasBoth = out.breathHud.includes('🐎') && out.breathHud.includes('👩');

    // 2. skipping every move in the move break must not earn 3 stars
    document.querySelectorAll('.modal-back,.timeout-back').forEach((m) => m.remove());
    TG.go('play', { g: TG.games.move, players, together: true });
    await nap(300);
    for (let k = 0; k < 6; k++) {
      const skip = [...document.querySelectorAll('.stage button')].find((b) => b.textContent.includes('⏭'));
      if (skip) skip.click();
      await nap(120);
    }
    await nap(400);
    out.skipStars = document.querySelectorAll('.res-stars .on').length;
    out.skipSummary = (document.querySelector('.result .muted') || {}).textContent || '';

    // 3. a collaborative game shows the players on the result screen
    document.querySelectorAll('.modal-back,.timeout-back').forEach((m) => m.remove());
    TG.go('result', { g: TG.games.budget, players, together: true, res: { stars: 2, summary: 'test' } });
    await nap(250);
    out.participants = document.querySelectorAll('.together-row .tp').length;
    return out;
  });
  if (!together.breathHudHasBoth) errors.push(`together mode feedback: the breathing HUD does not show both players (got "${together.breathHud}")`);
  if (together.skipStars === 3) errors.push('together mode feedback: skipping every move in the move break still earned 3 stars');
  if (!/0\//.test(together.skipSummary)) errors.push(`together mode feedback: the move break summary does not count the skipped moves (got "${together.skipSummary}")`);
  if (together.participants !== 2) errors.push(`together mode feedback: the result screen shows ${together.participants} participants, expected 2`);

  console.log(`Checked 5 screens, the village, ${games.length} games x 2 modes, ${count} puzzle levels.`);
} catch (e) {
  errors.push(`crashed during "${step}": ${e.message}`);
}

await browser.close(); server.close();
if (external.length) errors.push(`requests to outside servers (app must work offline): ${[...new Set(external)].join(', ')}`);
if (errors.length) { console.error('Smoke test failed:\n- ' + errors.join('\n- ')); process.exit(1); }
console.log('Smoke test passed: no errors, no outside requests.');
