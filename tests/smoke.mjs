// Headless browser smoke test: registers a child, walks through Нутаг, Basar the AI
// dog (offline mode), every heritage lesson and the family screens. Fails on any
// JavaScript error or any request to an outside server. Needs puppeteer-core and Chrome.
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
  await check('register screen', '.auth .big-input');

  // register through the real screens: name -> age -> mascot -> picture password
  step = 'register';
  await page.type('.big-input', 'Тест');
  const next = () => page.evaluate(() => [...document.querySelectorAll('.auth-card .btn.primary')].pop().click());
  await next(); await sleep(200);
  await page.evaluate(() => document.querySelectorAll('.age-btn')[5].click()); await next(); await sleep(200);
  await check('mascot picker', '.mascot-grid');
  await page.evaluate(() => document.querySelectorAll('.mascot')[2].click()); await next(); await sleep(200);
  for (const k of [0, 4, 8]) await page.evaluate((k) => document.querySelectorAll('.pic-key')[k].click(), k);
  await sleep(900);
  await check('straight into Нутаг after register', '.village canvas');
  const prof = await page.evaluate(() => { const p = TG.store.active(); return p && { name: p.name, age: p.age, avatar: p.avatar, code: p.code }; });
  if (!prof || prof.name !== 'Тест' || prof.age !== 8 || !prof.code) errors.push(`register: profile not saved correctly: ${JSON.stringify(prof)}`);
  await page.evaluate(() => { TG.store.state.settings.screenLimit = 999; TG.store.state.settings.sound = false; document.querySelectorAll('.modal-x').forEach((x) => x.click()); });

  // modal accessibility: focus moves into the dialog, Escape closes it, focus returns
  step = 'modal accessibility';
  await sleep(400);
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
  const solo = await page.evaluate(() => { const L = TG._village.live(); return L && L.status; });
  if (solo !== 'solo') errors.push(`village: expected solo mode without a server, got "${solo}"`);
  if (!(await page.evaluate(() => !!TG._village.dog()))) errors.push('village: Basar the dog is not following the player');
  await page.evaluate(() => { const v = TG.store.active().village; v.seeds.carrot = 2; TG._village.act('plant', 0, 'carrot'); });
  await sleep(300);
  if (!(await page.evaluate(() => { const p = TG.store.active().village.garden[0]; return p && p.c === 'carrot'; }))) errors.push('village: planting in solo mode did not work');
  for (const btn of ['bag', 'talk', 'quests']) { await page.evaluate((b) => { document.querySelectorAll('.modal-x').forEach((x) => x.click()); document.querySelector(`.v-round[aria-label="${b}"]`).click(); }, btn); await sleep(300); await check(`village ${btn} panel`, '.modal'); }
  await page.evaluate(() => { document.querySelectorAll('.modal-x').forEach((x) => x.click()); document.querySelector('.v-pills .v-pill').click(); }); await sleep(250); await check('village shop', '.v-shop');
  await page.evaluate(() => { document.querySelectorAll('.modal-x').forEach((x) => x.click()); TG._village.arena(); }); await sleep(300); await check('village wrestling panel', '.v-wr-head');
  await page.evaluate(() => { document.querySelectorAll('.modal-x').forEach((x) => x.click()); TG._village.tournament(1); }); await sleep(400); await check('village wrestling match', '.v-wrestle canvas');
  await page.evaluate(() => document.querySelectorAll('.modal-x').forEach((x) => x.click())); await sleep(250);
  step = 'ger locked before the lesson';
  await page.evaluate(() => TG._village.lot(0)); await sleep(300);
  if (!(await page.evaluate(() => /сур|Learn/i.test((document.querySelector('.modal h2') || {}).textContent || '')))) errors.push('village: building a ger should ask to finish the ger lesson first');
  await page.evaluate(() => document.querySelectorAll('.modal-x').forEach((x) => x.click())); await sleep(250);

  // Basar: offline answers and a quiz (no server here, so the offline knowledge must answer)
  step = 'Basar chat (offline)';
  await page.evaluate(() => document.querySelector('.v-basar').click()); await sleep(300);
  await check('Basar chat', '.basar-chat');
  await page.evaluate(() => { const i = document.querySelector('.b-input'); i.value = 'Тараг яаж хийдэг вэ?'; [...document.querySelectorAll('.b-send .btn')].pop().click(); });
  await sleep(500);
  const answer = await page.evaluate(() => { const b = [...document.querySelectorAll('.b-row.basar .b-bubble')].pop(); return b ? b.textContent : ''; });
  if (!/хөрөнгө|бүлээн/.test(answer)) errors.push(`Basar: offline answer about yogurt was "${answer.slice(0, 80)}"`);
  await page.evaluate(() => document.querySelector('.b-tray .b-chips .chip').click()); await sleep(500);
  await check('Basar quiz', '.b-quiz .b-opt');
  await page.evaluate(() => document.querySelector('.b-opt').click()); await sleep(200);
  await check('Basar quiz explanation', '.b-exp:not(.hidden)');
  await page.evaluate(() => document.querySelectorAll('.modal-x').forEach((x) => x.click())); await sleep(250);

  // heritage school: play every lesson to the end
  await page.evaluate(() => TG.go('learn')); await sleep(300);
  await check('heritage school', '.l-grid .l-card');
  const ids = await page.evaluate(() => TG.learn.LESSONS.map((l) => l.id));
  for (const id of ids) {
    step = `lesson ${id}`;
    await page.evaluate((id) => TG.go('lesson', { id }), id); await sleep(300);
    let finished = false;
    for (let guard = 0; guard < 120 && !finished; guard++) {
      const st = await page.evaluate(() => {
        const panel = document.querySelector('.l-panel'); if (!panel) return 'none';
        if (panel.querySelector('.l-done')) return 'done';
        const solo = panel.querySelector('.with-opt'); if (solo) { solo.click(); return 'picker'; }
        const q = panel.querySelector('.b-opt:not(:disabled)'); if (q) { q.click(); return 'quiz'; }
        const nx = [...panel.querySelectorAll('.btn.primary')].find((b) => !b.classList.contains('hidden') && !b.disabled && !b.classList.contains('l-tap'));
        if (nx) { nx.click(); return 'next'; }
        const opt = panel.querySelector('.l-opt:not(:disabled)'); if (opt) { opt.click(); return 'opt'; }
        if (panel.querySelector('.l-gauge')) return 'gauge';
        const tap = panel.querySelector('.l-tap:not(:disabled)'); if (tap) { tap.click(); return 'tap'; }
        if (panel.querySelector('.l-hint')) return 'zones';
        return 'wait';
      });
      if (st === 'done') finished = true;
      else if (st === 'zones') {
        const z = await page.evaluate(() => { const t = document.querySelector('.l-panel h2').textContent; const s = TG.learn.byId('customs').steps.find((x) => TG.tx(x.title) === t); return s.zone; });
        const [zx, zy] = { khoimor: [60, 14], hearth: [60, 40], west: [22, 40], east: [98, 40], door: [60, 72] }[z];
        const box = await (await page.$('.l-scene')).boundingBox();
        await page.mouse.click(box.x + (zx / 120) * box.width, box.y + (zy / 80) * box.height);
      } else if (st === 'gauge') {
        const hold = await page.evaluate(() => document.querySelector('.l-tap').textContent.includes('🔥'));
        const box = await (await page.$('.l-tap')).boundingBox();
        const zone = await page.evaluate(() => { const b = document.querySelector('.l-gauge b'); return [parseFloat(b.style.left), parseFloat(b.style.left) + parseFloat(b.style.width)]; });
        if (hold) { await page.mouse.move(box.x + 20, box.y + 20); await page.mouse.down(); }
        for (let k = 0; k < 500; k++) { const v = await page.evaluate(() => parseFloat(document.querySelector('.l-gauge em').style.left)); if (v > zone[0] + 2 && v < zone[1] - 2) break; await sleep(10); }
        if (hold) await page.mouse.up(); else await page.mouse.click(box.x + 20, box.y + 20);
      }
      await sleep(st === 'quiz' ? 250 : 60);
    }
    if (!finished) errors.push(`lesson ${id}: could not be completed`);
    await check(`lesson ${id} family activity`, '.l-family');
  }
  const learned = await page.evaluate(() => TG.learn.LESSONS.every((l) => TG.learn.done(l.id)));
  if (!learned) errors.push('lessons: progress was not saved');
  // learn together: a lesson with family takes turns and counts for the parent dashboard
  step = 'lesson with family';
  await page.evaluate(() => TG.go('lesson', { id: 'nuuts' })); await sleep(300);
  await page.evaluate(() => [...document.querySelectorAll('.with-opt')][1].click()); await sleep(150);
  await page.evaluate(() => document.querySelector('.with-picker .fam-chip').click()); await sleep(150);
  await page.evaluate(() => [...document.querySelectorAll('.with-picker .btn.primary')].pop().click()); await sleep(250);
  await check('turn badge in a family lesson', '.l-panel .turn-badge');
  step = 'quiz party with a friend';
  await page.evaluate(() => TG.basar.quizParty('ger')); await sleep(250);
  await page.evaluate(() => [...document.querySelectorAll('.with-opt')][2].click()); await sleep(150);
  await page.evaluate(() => { const i = document.querySelector('.add-friend .input'); i.value = 'Ану'; document.querySelector('.add-friend .btn').click(); }); await sleep(150);
  await page.evaluate(() => [...document.querySelectorAll('.with-picker .btn.primary')].pop().click()); await sleep(400);
  for (let k = 0; k < 4; k++) { await page.evaluate(() => { const o = document.querySelector('.b-opt:not(:disabled)'); if (o) o.click(); }); await sleep(120); await page.evaluate(() => { const n = [...document.querySelectorAll('.basar-modal .btn.primary')].find((x) => !x.classList.contains('hidden')); if (n) n.click(); }); await sleep(250); }
  await check('quiz party scoreboard', '.basar-modal .l-score');
  if (!(await page.evaluate(() => (TG.store.active().together || {}).friends >= 1))) errors.push('learn together: the friends quiz was not recorded');
  await page.evaluate(() => document.querySelectorAll('.modal-x').forEach((x) => x.click())); await sleep(250);

  step = 'ger unlocked after the lesson';
  await page.evaluate(() => TG.go('village')); await sleep(700);
  await page.evaluate(() => { document.querySelectorAll('.modal-x').forEach((x) => x.click()); TG._village.lot(0); }); await sleep(300);
  await check('ger builder unlocked', '.modal .v-gerbox + .label, .modal .v-chips');
  await page.evaluate(() => document.querySelectorAll('.modal-x').forEach((x) => x.click())); await sleep(200);

  // horse riding and the Naadam horse race
  step = 'horse riding';
  await page.evaluate(() => { document.querySelectorAll('.modal-x').forEach((x) => x.click()); TG._village.mount('chestnut'); }); await sleep(200);
  if (!(await page.evaluate(() => TG.store.active().village.look.ride === 'horse'))) errors.push('horse: mounting did not work');
  step = 'horse race';
  await page.evaluate(() => TG._village.race()); await sleep(3300);
  if ((await page.evaluate(() => TG._village.raceState() && TG._village.raceState().phase)) !== 'go') errors.push('horse race: the race did not start after the countdown');
  for (let i = 1; i < 7; i++) { await page.evaluate((i) => { const L = TG._village.live(), q = TG.vworld.RACE[i]; L.me.px = q.x - 0.5; L.me.py = q.y - 0.82; }, i); await sleep(120); }
  await sleep(300);
  if (!(await page.evaluate(() => TG.store.active().village.horse.races === 1))) errors.push('horse race: finishing the race was not recorded');
  await page.evaluate(() => document.querySelectorAll('.modal-x').forEach((x) => x.click())); await sleep(250);
  await page.evaluate(() => TG._village.dismount()); await sleep(100);
  step = 'wrestling techniques';
  await page.evaluate(() => TG._village.tournament(8)); await sleep(400);
  const nMoves = await page.evaluate(() => document.querySelectorAll('.v-wr-moves .btn').length);
  if (nMoves !== 7) errors.push(`wrestling: expected 7 techniques, found ${nMoves}`);
  if (!(await page.evaluate(() => /3/.test(document.querySelector('.v-wrestle .eyebrow').textContent)))) errors.push('wrestling: late rounds should need 3 falls');
  await page.evaluate(() => document.querySelectorAll('.modal-x').forEach((x) => x.click())); await sleep(250);

  // Basar understands English and does simple maths offline
  step = 'Basar in English';
  await page.evaluate(() => TG.basar.open()); await sleep(250);
  for (const q of ['What is a ger?', '6 x 7']) { await page.evaluate((q) => { const i = document.querySelector('.b-input'); i.value = q; [...document.querySelectorAll('.b-send .btn')].pop().click(); }, q); await sleep(350); }
  const en = await page.evaluate(() => [...document.querySelectorAll('.b-row.basar .b-bubble')].slice(-2).map((b) => b.textContent));
  if (!/clever home|khana/.test(en[0] || '')) errors.push(`Basar: English question got "${(en[0] || '').slice(0, 60)}"`);
  if (!/42/.test(en[1] || '')) errors.push(`Basar: offline maths answer was "${(en[1] || '').slice(0, 60)}"`);
  await page.evaluate(() => document.querySelectorAll('.modal-x').forEach((x) => x.click())); await sleep(250);

  step = 'achievements';
  await page.evaluate(() => TG.go('achievements')); await sleep(300);
  await check('achievements screen', '.ach-grid .ach.on');
  const achs = await page.evaluate(() => Object.keys(TG.store.active().ach || {}));
  for (const id of ['first_lesson', 'all_lessons', 'ger_master', 'nuuts', 'with_friends']) if (!achs.includes(id)) errors.push(`achievements: "${id}" was not awarded`);
  step = 'parent report';
  await page.evaluate(() => TG.go('family')); await sleep(250);
  await page.evaluate(() => { const g = document.querySelector('.gate-q'); if (!g) return; const q = g.textContent.match(/(\d+) × (\d+)/); document.querySelector('.gate-input').value = q[1] * q[2]; [...document.querySelectorAll('.gate .btn')].pop().click(); }); await sleep(400);
  await check('parent sees badges', '.ach-earned .ach-chip');
  await check('parent sees what was learned', '.learned li');

  for (const screen of ['memories', 'about']) {
    await page.evaluate((s) => TG.go(s), screen); await sleep(250);
    await check(`screen ${screen}`, screen === 'about' ? '.about' : '.shell');
  }
  step = 'screen-break reminder';
  await page.evaluate(() => TG._timeout()); await sleep(200);
  await check('screen-break reminder suggests a family activity', '.timeout .l-say');
  await page.evaluate(() => document.querySelector('.timeout-back').remove());

  step = 'log out and log in with the picture password';
  await page.evaluate(() => { TG.store.state.loggedIn = false; TG.go('auth', { tab: 'login' }); }); await sleep(300);
  await page.evaluate(() => document.querySelector('.auth-prof').click()); await sleep(200);
  for (const k of [0, 4, 7]) await page.evaluate((k) => document.querySelectorAll('.pic-key')[k].click(), k); // wrong
  await sleep(400);
  if (await page.evaluate(() => !!document.querySelector('.village'))) errors.push('login: a wrong picture password let the child in');
  for (const k of [0, 4, 8]) await page.evaluate((k) => document.querySelectorAll('.pic-key')[k].click(), k); // right
  await sleep(700);
  await check('village after login', '.village canvas');
  console.log(`Checked register/login, the village, Basar, ${ids.length} lessons, the ger unlock and the family screens.`);
} catch (e) {
  errors.push(`crashed during "${step}": ${e.message}`);
}

await browser.close(); server.close();
if (external.length) errors.push(`requests to outside servers (app must work offline): ${[...new Set(external)].join(', ')}`);
if (errors.length) { console.error('Smoke test failed:\n- ' + errors.join('\n- ')); process.exit(1); }
console.log('Smoke test passed: no errors, no outside requests.');
