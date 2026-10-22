/* Аймагт аялах: a small walkable map for every province, built from its real landscape.
   Walk to the 3 famous places, then the local guide asks the stamp question. */
(function (TG) {
  const { h, L, tx } = TG;
  const S = TG.store;
  const TS = 16, MW = 28, MH = 18, VW = 240, VH = 150;
  const K = () => TG.pixel.K;

  function rng(seed) { let s = 0; for (const c of seed) s = (s * 31 + c.charCodeAt(0)) >>> 0; return () => ((s = (s * 1103515245 + 12345) >>> 0) / 4294967296); }

  /** Build the province's map: ground, blocking features, the arrival point, three landmarks and the guide. */
  function build(id) {
    const j = TG.passport.J[id], has = (k) => j.land.includes(k), rnd = rng(id);
    const desert = has('desert') || has('dunes'), snow = has('snow'), city = has('city');
    const g = Array.from({ length: MH }, () => Array(MW).fill('g'));   // g ground · w water · t tree · m mountain · r rock · b building · v volcano · p path · s sand mound · f field
    const set = (x, y, c) => { if (x >= 0 && y >= 0 && x < MW && y < MH) g[y][x] = c; };
    for (let x = 0; x < MW; x++) { set(x, 0, has('forest') ? 't' : 'm'); set(x, 1, has('mountains') || snow ? 'm' : has('forest') ? 't' : g[1][x]); set(x, MH - 1, has('forest') ? 't' : 'm'); }
    for (let y = 0; y < MH; y++) { set(0, y, has('forest') ? 't' : 'm'); set(MW - 1, y, has('forest') ? 't' : 'm'); }
    for (let x = 1; x < MW - 1; x++) set(x, 14, 'p');                    // the road in from the bus stop
    for (let y = 3; y < 15; y++) set(14, y, 'p');
    if (has('lake')) for (let y = 3; y < 10; y++) for (let x = 17; x < 26; x++) if (((x - 21.5) / 4.6) ** 2 + ((y - 6.5) / 3.2) ** 2 <= 1) set(x, y, 'w');
    if (has('river')) for (let x = 1; x < MW - 1; x++) { const y = 10 + Math.round(Math.sin(x / 4)); if (x !== 14 && x !== 15) { set(x, y, 'w'); } else set(x, y, 'p'); }
    if (has('volcano')) for (let y = 3; y < 8; y++) for (let x = 3; x < 10; x++) if (((x - 6) / 3.2) ** 2 + ((y - 5) / 2.3) ** 2 <= 1) set(x, y, 'v');
    if (city) for (let by = 3; by < 12; by += 4) for (let bx = 2; bx < 26; bx += 5) if (bx !== 12 && bx !== 13 && !(by < 9 && bx > 15 && has('lake'))) { set(bx, by, 'b'); set(bx + 1, by, 'b'); set(bx, by + 1, 'b'); set(bx + 1, by + 1, 'b'); }
    if (has('fields')) for (let y = 3; y < 9; y++) for (let x = 2; x < 12; x++) if (y % 2 && g[y][x] === 'g') set(x, y, 'f');
    const free = (x, y) => g[y] && g[y][x] === 'g';
    const scatter = (c, n) => { for (let i = 0; i < n; i++) { const x = 2 + Math.floor(rnd() * (MW - 4)), y = 2 + Math.floor(rnd() * (MH - 5)); if (free(x, y) && Math.abs(x - 14) > 1 && y !== 14 && y !== 13) set(x, y, c); } };
    if (has('forest') || has('valley')) scatter('t', 40);
    if (has('mountains') && !has('forest')) scatter('r', 10);
    if (desert || has('rocks')) scatter('r', 14);
    if (has('dunes')) scatter('s', 24);
    if (has('steppe') || has('hills')) scatter('r', 5);
    // landmarks: three spread-out reachable places; the guide stands by the road
    const near = (x, y) => { for (let r = 0; r < 6; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (free(x + dx, y + dy) || (g[y + dy] && g[y + dy][x + dx] === 'p')) return { x: x + dx, y: y + dy }; return { x, y }; };
    const marks = [near(6, 9), near(22, 11), near(20, 3)].map((p, i) => ({ ...p, i, m: j.marks[i] }));
    const guide = near(16, 13), start = { x: 3, y: 14 };
    return { id, j, g, desert, snow, city, has, marks, guide, start };
  }

  function paint(map) {
    const c = document.createElement('canvas'); c.width = MW * TS; c.height = MH * TS;
    const x = c.getContext('2d'), P = TG.pixel, k = K(), { R, ell, blob } = P;
    const ground = map.snow ? ['#eef3f8', '#dbe5ef'] : map.desert ? ['#e2b86e', '#d4a55c'] : map.city ? ['#9ec46a', '#8ab45a'] : map.has('fields') ? ['#a8c45a', '#98b44c'] : ['#76b947', '#6aa83f'];
    for (let y = 0; y < MH; y++) for (let X = 0; X < MW; X++) {
      const t = map.g[y][X], px = X * TS, py = y * TS;
      R(x, px, py, TS, TS, ground[0]);
      for (let i = 0; i < 3; i++) P.P(x, px + Math.floor(P.hash(X * 3 + i, y) * 15), py + Math.floor(P.hash(y * 5 + i, X) * 15), ground[1]); // natural speckles, no checkerboard
      if (!map.snow && !map.desert && P.hash(X, y) < 0.12) { P.P(x, px + 5, py + 7, ['#ffd34e', '#ff8fb1', '#ffffff'][Math.floor(P.hash(y, X) * 3)]); P.P(x, px + 5, py + 8, '#5c9a36'); }
      if (t === 'p') { R(x, px, py, TS, TS, map.city ? '#b8b0a0' : '#d8ab6c'); P.P(x, px + 4, py + 9, map.city ? '#a09888' : '#b78a4f'); }
      else if (t === 'w') { R(x, px, py, TS, TS, '#4aa6e2'); if ((X + y) % 3 === 0) R(x, px + 4, py + 6, 4, 1, '#93d4f6'); }
      else if (t === 'f') { R(x, px, py, TS, TS, '#c9b34a'); for (let i = 0; i < 4; i++) R(x, px + 1 + i * 4, py + 3, 1, 10, '#e8d36a'); }
      else if (t === 'm') { const top = map.snow ? '#ffffff' : '#9fb4c8'; for (let r = 0; r < 14; r++) R(x, px + 7 - r / 2, py + 1 + r, r + 2, 1, r < 4 ? top : map.desert ? '#b9875a' : '#6f97b8'); }
      else if (t === 't') { R(x, px + 7, py + 11, 2, 5, k.woodD); for (let r = 0; r < 10; r++) R(x, px + 8 - r / 2 - 1, py + 1 + r, r + 2, 1, map.snow ? (r < 3 ? '#ffffff' : '#3f7a5c') : '#3f8a57'); }
      else if (t === 'r') { blob(x, px + 8, py + 10, 5, 3, map.desert ? '#c9845a' : k.rock); ell(x, px + 7, py + 9, 3, 1, map.desert ? '#e2a77a' : k.rockL); }
      else if (t === 's') { ell(x, px + 8, py + 11, 7, 3, '#f0c878'); ell(x, px + 7, py + 10, 5, 1, '#fbe0a0'); }
      else if (t === 'v') { R(x, px, py, TS, TS, '#6a5a5a'); if ((X + y) % 2) R(x, px + 3, py + 4, 6, 3, '#4a3e3e'); }
      else if (t === 'b') { R(x, px, py - 6, TS, TS + 6, ['#c9c1ad', '#9fb0c8', '#e8dfc8'][(X + y) % 3]); for (let wy = py - 3; wy < py + 12; wy += 5) R(x, px + 3, wy, 3, 2, '#f7c646'); R(x, px, py + TS - 2, TS, 2, '#7a7466'); }
    }
    // bus stop at the arrival point
    const bx = map.start.x * TS, by = map.start.y * TS;
    R(x, bx - 4, by - 18, 2, 18, '#4a4a55'); R(x, bx - 10, by - 22, 14, 6, '#3f76db'); R(x, bx - 9, by - 21, 12, 1, '#ffffff');
    return c;
  }

  function open(id) {
    const a = TG.aimags.byId(id), p = S.active(); if (!a || !TG.passport.J[id]) return;
    const map = build(id), terrain = paint(map), v = p.village || {};
    p.travel = p.travel || {}; const seen = (p.travel[id] = p.travel[id] || []);
    const stamped = () => !!(p.passport && p.passport.stamps && p.passport.stamps[id]);
    const eth = (TG.ethnic && TG.ethnic.ETHNIC.find((e) => e.aimags[0] === id)) || (TG.ethnic && TG.ethnic.ETHNIC.find((e) => e.aimags.includes(id) && e.id !== 'khalkh')) || (TG.ethnic && TG.ethnic.byId('khalkh'));
    const guideLook = { deel: eth ? eth.deel : 'blue', skin: '#D9A06E', hat: eth ? eth.hat : 'mongol', neck: 'khadag', face: null, pet: null };
    const cv = h('canvas', { class: 'travel-cv', width: VW, height: VH }), x = cv.getContext('2d'); x.imageSmoothingEnabled = false;
    const info = h('div', { class: 'travel-info' }), act = h('button', { class: 'btn primary block', disabled: true }), prog = h('span', { class: 'travel-prog' });
    const me = { x: map.start.x * TS + 8, y: map.start.y * TS + 12, tx: 0, ty: 0, dir: 2, moving: false }; me.tx = me.x; me.ty = me.y;
    const dog = { x: me.x - 14, y: me.y };
    const blocked = (px, py) => { const X = Math.floor(px / TS), Y = Math.floor(py / TS); const c = map.g[Y] && map.g[Y][X]; return !c || 'wtmrvb'.includes(c); };
    const free = (px, py) => !blocked(px - 4, py - 2) && !blocked(px + 4, py - 2) && !blocked(px - 4, py + 2) && !blocked(px + 4, py + 2);
    const things = [
      ...map.marks.map((m) => ({ kind: 'mark', i: m.i, x: m.x * TS + 8, y: m.y * TS + 12, m: m.m })),
      { kind: 'guide', x: map.guide.x * TS + 8, y: map.guide.y * TS + 12 },
      { kind: 'bus', x: map.start.x * TS + 8, y: map.start.y * TS + 12 },
    ];
    const drawProg = () => { prog.textContent = `📍 ${seen.length}/3 · ${stamped() ? '🛂 ✓' : '🛂 …'}`; };
    const show = (...kids) => info.replaceChildren(...kids);
    function run(t) {
      if (t.kind === 'mark') {
        if (!seen.includes(t.i)) { seen.push(t.i); S.save(); TG.sfx.chime && TG.sfx.chime(); TG.villageReward && TG.villageReward(5, 10); }
        show(h('b', null, '📍 ', tx(t.m.name)), h('p', null, tx(t.m.desc)), seen.length === 3 && !stamped() ? h('small', null, L('Гурван газраар аялчихлаа! Одоо хөтөч дээр очоорой.', 'You visited all three places! Now go to the guide.')) : null);
        drawProg();
      } else if (t.kind === 'guide') {
        const greet = L(`Сайн байна уу! ${a.name.mn} нутагт тавтай морил. Би ${eth ? tx(eth.name) : ''} хүн байна.`, `Hello! Welcome to ${a.name.en}. I am ${eth ? tx(eth.name) : ''}.`);
        if (stamped()) return show(h('b', null, '🧑 ', L('Нутгийн хөтөч', 'Local guide')), h('p', null, greet, ' ', tx(map.j.history)), h('small', null, '🛂 ', L('Тамга авсан', 'Already stamped')));
        if (seen.length < 3) return show(h('b', null, '🧑 ', L('Нутгийн хөтөч', 'Local guide')), h('p', null, greet, ' ', L('Эхлээд манай нутгийн 3 алдартай газраар аялаад ир. Дараа нь тамга өгье!', 'First visit our 3 famous places, then I’ll give you the stamp!')));
        const q = map.j.q, opts = q.o.map((o, i2) => ({ o, ok: i2 === q.a })).sort(() => Math.random() - 0.5);
        show(h('b', null, '🧑 ', L('Нутгийн хөтөч', 'Local guide')), h('p', null, tx(map.j.history)), h('p', { class: 'travel-q' }, '🛂 ', tx(q.q)),
          h('div', { class: 'l-opts' }, opts.map(({ o, ok }) => h('button', { class: 'l-opt', onclick: (e) => {
            if (!ok) { e.currentTarget.classList.add('wrong'); e.currentTarget.disabled = true; TG.sfx.bad(); return; }
            TG.passport.stamp(id); TG.confetti(60); drawProg();
            const nx = TG.passport.nextId(p);
            show(h('div', { class: 'pp-stamped' }, h('span', { class: 'pp-stamp big' }, a.icon), h('b', null, L('Тамга авлаа!', 'Stamped!'))),
              nx ? h('button', { class: 'btn primary block', onclick: () => { close(); setTimeout(() => open(nx), 250); } }, '🚌 ', L('Дараагийн аймаг: ', 'Next province: '), tx(TG.aimags.byId(nx).name), ' →') : h('p', null, '🏆 ', L('Бүх аймгаар аялсан!', 'You visited every province!')));
          } }, tx(o)))));
      } else close();
    }
    let raf = 0, last = performance.now(), near = null;
    const keys = new Set();
    const loop = (ts) => {
      const dt = Math.min(0.05, (ts - last) / 1000); last = ts;
      const ix = (keys.has('r') ? 1 : 0) - (keys.has('l') ? 1 : 0), iy = (keys.has('d') ? 1 : 0) - (keys.has('u') ? 1 : 0);
      if (ix || iy) { const n = Math.hypot(ix, iy); me.tx = me.x + (ix / n) * 10; me.ty = me.y + (iy / n) * 10; }
      const dx = me.tx - me.x, dy = me.ty - me.y, d = Math.hypot(dx, dy);
      me.moving = d > 1;
      if (me.moving) {
        const sp = 70 * dt, mx = (dx / d) * Math.min(sp, d), my = (dy / d) * Math.min(sp, d);
        if (free(me.x + mx, me.y)) me.x += mx; if (free(me.x, me.y + my)) me.y += my;
        if (!free(me.x + mx, me.y) && !free(me.x, me.y + my)) { me.tx = me.x; me.ty = me.y; }
        me.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0);
      }
      dog.x += (me.x - 14 - dog.x) * Math.min(1, dt * 3); dog.y += (me.y + 2 - dog.y) * Math.min(1, dt * 3);
      near = null; let bd = 22; for (const t of things) { const dd = Math.hypot(t.x - me.x, t.y - me.y); if (dd < bd) { bd = dd; near = t; } }
      act.disabled = !near;
      act.textContent = !near ? L('Газар, хүн рүү ойртоорой', 'Walk up to a place or a person') : near.kind === 'mark' ? `📍 ${tx(near.m.name)}` : near.kind === 'guide' ? L('🧑 Хөтөчтэй ярилцах', '🧑 Talk to the guide') : L('🚌 Нутаг руу буцах', '🚌 Return to Nutag');
      const camX = Math.max(0, Math.min(MW * TS - VW, me.x - VW / 2)), camY = Math.max(0, Math.min(MH * TS - VH, me.y - VH / 2));
      x.drawImage(terrain, -Math.round(camX), -Math.round(camY));
      const ents = [];
      for (const t of things) {
        if (t.kind === 'mark') ents.push({ y: t.y, f: () => { const X = Math.round(t.x - camX), Y = Math.round(t.y - camY), done = seen.includes(t.i); TG.pixel.R(x, X - 1, Y - 18, 2, 18, '#6b4220'); TG.pixel.R(x, X - 7, Y - 22, 14, 9, '#2b1e2e'); TG.pixel.R(x, X - 6, Y - 21, 12, 7, done ? '#5c9a36' : '#f7c646'); TG.pixel.R(x, X - 1, Y - 20, 2, 5, '#2b1e2e'); if (!done && Math.floor(ts / 300) % 2) TG.pixel.R(x, X + 6, Y - 26, 2, 2, '#ffffff'); } });
        if (t.kind === 'guide') ents.push({ y: t.y, f: () => { x.drawImage(TG.pixel.char(guideLook, 0, 0), Math.round(t.x - 8 - camX), Math.round(t.y - 26 - camY)); if (!stamped()) { x.fillStyle = seen.length === 3 ? '#7fe07a' : '#f7c646'; x.fillRect(Math.round(t.x - 1 - camX), Math.round(t.y - 36 - camY + Math.sin(ts / 200) * 1.5), 2, 5); x.fillRect(Math.round(t.x - 1 - camX), Math.round(t.y - 30 - camY + Math.sin(ts / 200) * 1.5), 2, 2); } } });
      }
      ents.push({ y: dog.y, f: () => x.drawImage(TG.pixel.bankhar(Math.hypot(me.x - 14 - dog.x, me.y + 2 - dog.y) > 3 ? 1 + Math.floor(ts / 120) % 2 : 3), Math.round(dog.x - 11 - camX), Math.round(dog.y - 16 - camY)) });
      ents.push({ y: me.y, f: () => x.drawImage(TG.pixel.char({ ...v.look, ride: null }, me.dir, me.moving ? 1 + Math.floor(ts / 125) % 2 : 0), Math.round(me.x - 8 - camX), Math.round(me.y - 26 - camY)) });
      ents.sort((a2, b2) => a2.y - b2.y).forEach((e) => e.f());
      if (map.snow || TG.seasons.current().id === 'winter') for (let i = 0; i < 18; i++) { x.fillStyle = 'rgba(255,255,255,.75)'; x.fillRect(Math.round((i * 53 + Math.sin(ts / 900 + i) * 6) % VW), Math.round((i * 31 + ts / 60 * (1 + (i % 3) * 0.3)) % VH), 1, 1); }
      raf = requestAnimationFrame(loop);
    };
    cv.addEventListener('pointerdown', (e) => {
      const r = cv.getBoundingClientRect(), camX = Math.max(0, Math.min(MW * TS - VW, me.x - VW / 2)), camY = Math.max(0, Math.min(MH * TS - VH, me.y - VH / 2));
      const px = (e.clientX - r.left) / r.width * VW + camX, py = (e.clientY - r.top) / r.height * VH + camY;
      const hit = things.find((t) => Math.hypot(t.x - px, t.y - 10 - py) < 16);
      if (hit && Math.hypot(hit.x - me.x, hit.y - me.y) < 24) return run(hit);
      me.tx = hit ? hit.x : px; me.ty = hit ? hit.y + 6 : py;
    });
    act.addEventListener('click', () => near && run(near));
    const KEY = { ArrowDown: 'd', KeyS: 'd', ArrowLeft: 'l', KeyA: 'l', ArrowRight: 'r', KeyD: 'r', ArrowUp: 'u', KeyW: 'u' };
    const kd = (e) => { if (/INPUT|TEXTAREA/.test((e.target || {}).tagName || '')) return; if (KEY[e.code]) { e.preventDefault(); keys.add(KEY[e.code]); } else if (e.code === 'Space' || e.code === 'KeyE') { e.preventDefault(); e.stopPropagation(); if (!e.repeat && near) run(near); } };
    const ku = (e) => { if (KEY[e.code]) keys.delete(KEY[e.code]); };
    window.addEventListener('keydown', kd, true); window.addEventListener('keyup', ku, true);
    drawProg();
    show(h('b', null, '🚌 ', L(`${a.name.mn}-д ирлээ!`, `You arrived in ${a.name.en}!`)), h('p', null, L('Шар тэмдэгтэй 3 газраар аялж, дараа нь нутгийн хөтөчтэй уулзаарай. Дэлгэц дээр дарж эсвэл WASD-аар алхана.', 'Visit the 3 places with yellow signs, then meet the local guide. Tap the screen or use WASD to walk.')));
    TG.sfx.whoosh && TG.sfx.whoosh();
    const close = TG.modal(h('div', { class: 'travel' }, h('div', { class: 'travel-head' }, h('span', { class: 'pp-icon' }, a.icon), h('div', null, h('h2', null, tx(a.name)), h('small', null, tx(a.center))), prog), cv, act, info),
      { cls: 'v-modal travel-modal', onClose: () => { cancelAnimationFrame(raf); window.removeEventListener('keydown', kd, true); window.removeEventListener('keyup', ku, true); if (document.querySelector('.pp-grid, .pp-visit')) TG.go('passport'); } });
    TG.travel._cur = { me, things, run, seen, close: () => close() }; // used by automated tests
    raf = requestAnimationFrame(loop);
  }
  TG.travel = { open, build };
})(window.TG);
