/* Аймагт аялах: a full-screen walkable map for every province, built from its real landscape, with its three famous
   landmarks drawn as they really look (Turtle Rock in Terelj, Erdene Zuu, Lake Khövsgöl...). Visit all three,
   then the local guide asks the stamp question. */
(function (TG) {
  const { h, L, tx } = TG;
  const S = TG.store;
  const TS = 16, MW = 28, MH = 18;
  const BLOCK = 'wtmrbLG';
  // landmark footprints (4×3 tiles) and the tile you stand on to visit each one
  const SLOTS = [{ x: 3, y: 7, fx: 5, fy: 10, to: 'down' }, { x: 19, y: 9, fx: 21, fy: 12, to: 'down' }, { x: 8, y: 2, fx: 10, fy: 5, to: 'right' }];
  const CAMP = [{ x: 7, y: 11 }, { x: 10, y: 11 }];

  function rng(seed) { let s = 0; for (const c of seed) s = (s * 31 + c.charCodeAt(0)) >>> 0; return () => ((s = (s * 1103515245 + 12345) >>> 0) / 4294967296); }

  /** Build the province's map: ground, blocking features, the arrival point, three landmarks, a ger camp and the guide. */
  function build(id) {
    const j = TG.passport.J[id], has = (k) => j.land.includes(k), rnd = rng(id);
    const desert = has('desert') || has('dunes'), snow = has('snow'), city = has('city');
    const g = Array.from({ length: MH }, () => Array(MW).fill('g'));   // g ground · w water · t tree · m mountain · r rock · b building · p path · s sand mound · f field · L landmark · G ger
    const set = (x, y, c) => { if (x >= 0 && y >= 0 && x < MW && y < MH) g[y][x] = c; };
    const inner = (x, y) => x > 0 && y > 0 && x < MW - 1 && y < MH - 1;
    for (let x = 0; x < MW; x++) { set(x, 0, has('forest') ? 't' : 'm'); set(x, 1, has('mountains') || snow ? 'm' : has('forest') ? 't' : g[1][x]); set(x, MH - 1, has('forest') ? 't' : 'm'); }
    for (let y = 0; y < MH; y++) { set(0, y, has('forest') ? 't' : 'm'); set(MW - 1, y, has('forest') ? 't' : 'm'); }
    for (let x = 1; x < MW - 1; x++) set(x, 14, 'p');                    // the road in from the bus stop
    for (let y = 3; y < 15; y++) set(14, y, 'p');
    if (has('lake')) for (let y = 3; y < 10; y++) for (let x = 17; x < 26; x++) if (((x - 21.5) / 4.6) ** 2 + ((y - 6.5) / 3.2) ** 2 <= 1) set(x, y, 'w');
    if (has('river')) for (let x = 1; x < MW - 1; x++) { const y = 10 + Math.round(Math.sin(x / 4)); set(x, y, x === 14 || x === 15 ? 'p' : 'w'); }
    if (city) for (let by = 3; by < 12; by += 4) for (let bx = 2; bx < 26; bx += 5) if (bx !== 12 && bx !== 13 && !(by < 9 && bx > 15 && has('lake'))) { set(bx, by, 'b'); set(bx + 1, by, 'b'); set(bx, by + 1, 'b'); set(bx + 1, by + 1, 'b'); }
    if (has('fields')) for (let y = 3; y < 9; y++) for (let x = 2; x < 12; x++) if (y % 2 && g[y][x] === 'g') set(x, y, 'f');
    const free = (x, y) => g[y] && g[y][x] === 'g';
    const scatter = (c, n) => { for (let i = 0; i < n; i++) { const x = 2 + Math.floor(rnd() * (MW - 4)), y = 2 + Math.floor(rnd() * (MH - 5)); if (free(x, y) && Math.abs(x - 14) > 1 && y !== 14 && y !== 13) set(x, y, c); } };
    if (has('forest') || has('valley')) scatter('t', 40);
    if (has('mountains') && !has('forest')) scatter('r', 10);
    if (desert || has('rocks') || has('volcano')) scatter('r', 14);
    if (has('dunes')) scatter('s', 24);
    if (has('steppe') || has('hills')) scatter('r', 5);
    // the three landmarks: clear the ground round each, stand them up, and lay a path from the road to each one
    const carve = (sl) => { if (sl.to === 'right') for (let x = sl.fx; x <= 14; x++) set(x, sl.fy, 'p'); else for (let y = sl.fy; y <= 14; y++) set(sl.fx, y, 'p'); };
    const marks = SLOTS.map((s, i) => {
      for (let y = s.y - 1; y <= s.y + 3; y++) for (let x = s.x - 1; x <= s.x + 4; x++) if (inner(x, y) && g[y][x] !== 'p') set(x, y, 'g');
      for (let y = s.y; y < s.y + 3; y++) for (let x = s.x; x < s.x + 4; x++) set(x, y, 'L');
      carve(s);
      return { x: s.fx, y: s.fy, sx: s.x, sy: s.y, i, m: j.marks[i], kind: (TG.landmarks.KIND[id] || [])[i] || 'sacredmtn' };
    });
    // a small tourist ger camp near the bus stop
    for (const c of CAMP) for (let y = c.y; y < c.y + 3; y++) for (let x = c.x; x < c.x + 3; x++) if (g[y][x] !== 'p') set(x, y, 'G');
    for (let y = 3; y < 14; y++) if (g[y][14] !== 'p') set(14, y, 'p');
    const near = (x, y) => { for (let r = 0; r < 6; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (free(x + dx, y + dy) || (g[y + dy] && g[y + dy][x + dx] === 'p')) return { x: x + dx, y: y + dy }; return { x, y }; };
    const guide = near(16, 13), start = { x: 3, y: 14 };
    return { id, j, g, desert, snow, city, has, marks, guide, start };
  }

  function paint(map) {
    const c = document.createElement('canvas'); c.width = MW * TS; c.height = MH * TS;
    const x = c.getContext('2d'), P = TG.pixel, k = P.K, { R, ell, blob } = P;
    const ground = map.snow ? ['#eef3f8', '#dbe5ef'] : map.desert ? ['#e2b86e', '#d4a55c'] : map.city ? ['#9ec46a', '#8ab45a'] : map.has('fields') ? ['#a8c45a', '#98b44c'] : ['#76b947', '#6aa83f'];
    for (let y = 0; y < MH; y++) for (let X = 0; X < MW; X++) {
      const t = map.g[y][X], px = X * TS, py = y * TS;
      R(x, px, py, TS, TS, ground[0]);
      for (let i = 0; i < 3; i++) P.P(x, px + Math.floor(P.hash(X * 3 + i, y) * 15), py + Math.floor(P.hash(y * 5 + i, X) * 15), ground[1]); // natural speckles, no checkerboard
      if (!map.snow && !map.desert && P.hash(X, y) < 0.12 && t === 'g') { P.P(x, px + 5, py + 7, ['#ffd34e', '#ff8fb1', '#ffffff'][Math.floor(P.hash(y, X) * 3)]); P.P(x, px + 5, py + 8, '#5c9a36'); }
      if (t === 'p') { R(x, px, py, TS, TS, map.city ? '#b8b0a0' : '#d8ab6c'); P.P(x, px + 4, py + 9, map.city ? '#a09888' : '#b78a4f'); P.P(x, px + 11, py + 3, map.city ? '#a09888' : '#b78a4f'); }
      else if (t === 'w') { R(x, px, py, TS, TS, '#4aa6e2'); if ((X + y) % 3 === 0) R(x, px + 4, py + 6, 4, 1, '#93d4f6'); }
      else if (t === 'f') { R(x, px, py, TS, TS, '#c9b34a'); for (let i = 0; i < 4; i++) R(x, px + 1 + i * 4, py + 3, 1, 10, '#e8d36a'); }
      else if (t === 'm') { const top = map.snow ? '#ffffff' : '#9fb4c8'; for (let r = 0; r < 14; r++) R(x, px + 7 - r / 2, py + 1 + r, r + 2, 1, r < 4 ? top : map.desert ? '#b9875a' : '#6f97b8'); }
      else if (t === 't') { R(x, px + 7, py + 11, 2, 5, k.woodD); for (let r = 0; r < 10; r++) R(x, px + 8 - r / 2 - 1, py + 1 + r, r + 2, 1, map.snow ? (r < 3 ? '#ffffff' : '#3f7a5c') : '#3f8a57'); }
      else if (t === 'r') { blob(x, px + 8, py + 10, 5, 3, map.desert ? '#c9845a' : map.has('volcano') ? '#5a4a4a' : k.rock); ell(x, px + 7, py + 9, 3, 1, map.desert ? '#e2a77a' : k.rockL); }
      else if (t === 's') { ell(x, px + 8, py + 11, 7, 3, '#f0c878'); ell(x, px + 7, py + 10, 5, 1, '#fbe0a0'); }
      else if (t === 'b') { R(x, px, py - 6, TS, TS + 6, ['#c9c1ad', '#9fb0c8', '#e8dfc8'][(X + y) % 3]); for (let wy = py - 3; wy < py + 12; wy += 5) R(x, px + 3, wy, 3, 2, '#f7c646'); R(x, px, py + TS - 2, TS, 2, '#7a7466'); }
    }
    // the landmarks, a tourist ger camp and the bus stop
    for (const m of map.marks) TG.landmarks.draw(x, m.kind, m.sx * TS, m.sy * TS);
    CAMP.forEach((cp, i) => x.drawImage(P.gerSprite(i ? '#e14b3d' : '#3f76db', i ? '#e9a91f' : '#e8892b'), cp.x * TS, cp.y * TS - 2));
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
    const prog = h('span', { class: 'scene-chip px-frame travel-prog' });
    const drawProg = () => { prog.textContent = `📍 ${seen.length}/3 · ${stamped() ? '🛂 ✓' : '🛂 …'}`; };
    const at = (tx0, ty0) => ({ x: tx0 * TS + 8, y: ty0 * TS + 12 });
    const things = [
      ...map.marks.map((m) => ({ kind: 'mark', i: m.i, m: m.m, ...at(m.x, m.y), label: () => `📍 ${tx(m.m.name)}`, run: () => run('mark', m) })),
      { kind: 'guide', ...at(map.guide.x, map.guide.y), label: () => L('🧑 Хөтөчтэй ярилцах', '🧑 Talk to the guide'), run: () => run('guide') },
      { kind: 'camp', ...at(CAMP[0].x + 1, CAMP[0].y + 3), label: () => L('⛺ Жуулчны бааз', '⛺ Tourist ger camp'), run: () => run('camp') },
      { kind: 'bus', ...at(map.start.x, map.start.y), label: () => L('🚌 Нутаг руу буцах', '🚌 Return to Nutag'), run: () => sc.close() },
    ];
    function run(kind, m) {
      if (kind === 'mark') {
        if (!seen.includes(m.i)) { seen.push(m.i); S.save(); TG.sfx.chime && TG.sfx.chime(); TG.villageReward && TG.villageReward(5, 10); }
        sc.say(h('b', null, '📍 ', tx(m.m.name)), h('p', null, tx(m.m.desc)), seen.length === 3 && !stamped() ? h('small', null, L('Гурван газраар аялчихлаа! Одоо хөтөч дээр очоорой.', 'You visited all three places! Now go to the guide.')) : null);
        drawProg();
      } else if (kind === 'camp') {
        sc.say(h('b', null, '⛺ ', L('Жуулчны гэр бааз', 'Tourist ger camp')), h('p', null, L('Монголд ирсэн жуулчид гэр баазад буудаллаж, малчин айлын амьдралтай танилцдаг. Гэрийн хаалга урагшаа хардаг!', 'Visitors to Mongolia stay in ger camps and get to know herding life. Every ger door faces south!')));
      } else if (kind === 'guide') {
        const greet = L(`Сайн байна уу! ${a.name.mn} нутагт тавтай морил. Би ${eth ? tx(eth.name) : ''} хүн байна.`, `Hello! Welcome to ${a.name.en}. I am ${eth ? tx(eth.name) : ''}.`);
        if (stamped()) return sc.say(h('b', null, '🧑 ', L('Нутгийн хөтөч', 'Local guide')), h('p', null, greet, ' ', tx(map.j.history)), h('small', null, '🛂 ', L('Тамга авсан', 'Already stamped')));
        if (seen.length < 3) return sc.say(h('b', null, '🧑 ', L('Нутгийн хөтөч', 'Local guide')), h('p', null, greet, ' ', L('Эхлээд манай нутгийн 3 алдартай газраар аялаад ир. Дараа нь тамга өгье!', 'First visit our 3 famous places, then I’ll give you the stamp!')));
        const q = map.j.q, opts = q.o.map((o, i2) => ({ o, ok: i2 === q.a })).sort(() => Math.random() - 0.5);
        sc.say(h('b', null, '🧑 ', L('Нутгийн хөтөч', 'Local guide')), h('p', null, tx(map.j.history)), h('p', { class: 'travel-q' }, '🛂 ', tx(q.q)),
          h('div', { class: 'l-opts' }, opts.map(({ o, ok }) => h('button', { class: 'l-opt', onclick: (e) => {
            if (!ok) { e.currentTarget.classList.add('wrong'); e.currentTarget.disabled = true; TG.sfx.bad(); return; }
            TG.passport.stamp(id); TG.confetti(60); drawProg();
            const nx = TG.passport.nextId(p);
            sc.say(h('div', { class: 'pp-stamped' }, h('span', { class: 'pp-stamp big' }, a.icon), h('b', null, L('Тамга авлаа!', 'Stamped!'))),
              nx ? h('button', { class: 'btn primary block', onclick: () => { sc.close(); setTimeout(() => open(nx), 250); } }, '🚌 ', L('Дараагийн аймаг: ', 'Next province: '), tx(TG.aimags.byId(nx).name), ' →') : h('p', null, '🏆 ', L('Бүх аймгаар аялсан!', 'You visited every province!')));
          } }, tx(o)))));
      }
    }
    const blocked = (px, py) => { const X = Math.floor(px / TS), Y = Math.floor(py / TS); const c = map.g[Y] && map.g[Y][X]; return !c || BLOCK.includes(c); };
    const free = (px, py) => !blocked(px - 4, py - 2) && !blocked(px + 4, py - 2) && !blocked(px - 4, py + 2) && !blocked(px + 4, py + 2);
    drawProg();
    const sc = TG.scene.open({
      cls: 'travel-scene', W: MW * TS, H: MH * TS, fit: 190, bg: '#2b1e2e', look: v.look || {}, start: at(map.start.x, map.start.y), speed: 72,
      title: `${a.icon} ${tx(a.name)}`, sub: tx(a.center), right: prog, free, things, reach: 24,
      hint: () => L('Шар тугтай газраар аялаарай', 'Visit the places with yellow flags'),
      drawBg: (b) => b.drawImage(terrain, 0, 0),
      ents: (t) => [
        ...things.filter((q) => q.kind === 'mark').map((q) => ({ y: q.y, f: (b) => { const done = seen.includes(q.i), X = Math.round(q.x), Y = Math.round(q.y); TG.pixel.R(b, X - 1, Y - 18, 2, 18, '#6b4220'); TG.pixel.R(b, X + 1, Y - 18, 8, 6, '#2b1e2e'); TG.pixel.R(b, X + 1, Y - 17, 7, 4, done ? '#5c9a36' : '#f7c646'); if (!done && Math.floor(t * 3) % 2) TG.pixel.R(b, X + 4, Y - 24, 2, 3, '#ffffff'); } })),
        { y: things[3].y, f: (b) => { const g0 = things[3]; b.drawImage(TG.pixel.char(guideLook, 0, 0), Math.round(g0.x - 8), Math.round(g0.y - 26)); if (!stamped()) { b.fillStyle = seen.length === 3 ? '#7fe07a' : '#f7c646'; const bob = Math.round(Math.sin(t * 5) * 1.5); b.fillRect(Math.round(g0.x - 1), Math.round(g0.y - 36) + bob, 2, 5); b.fillRect(Math.round(g0.x - 1), Math.round(g0.y - 30) + bob, 2, 2); } } },
      ],
      drawTop: (b, t) => { if (map.snow || TG.seasons.current().id === 'winter') for (let i = 0; i < 40; i++) { b.fillStyle = 'rgba(255,255,255,.8)'; b.fillRect(Math.round((i * 53 + Math.sin(t + i) * 6) % (MW * TS)), Math.round((i * 31 + t * 16 * (1 + (i % 3) * 0.3)) % (MH * TS)), 1, 1); } },
      mini: { img: terrain, w: MW * 4, h: MH * 4, dots: () => [...things.filter((q) => q.kind === 'mark').map((q) => ({ x: q.x, y: q.y, c: seen.includes(q.i) ? '#5c9a36' : '#f7c646' })), { x: things[3].x, y: things[3].y, c: stamped() ? '#ffffff' : seen.length === 3 ? '#7fe07a' : '#f492ba' }, { x: things[5].x, y: things[5].y, c: '#3f76db' }] },
      info: [h('b', null, '🚌 ', L(`${a.name.mn}-д ирлээ!`, `You arrived in ${a.name.en}!`)), h('p', null, L('Шар тугтай 3 үзвэрээр аялж, дараа нь нутгийн хөтөчтэй уулзаарай. WASD-аар алхаж, E дарж үзнэ, Space дарвал үсэрнэ. Баруун дээд буланд газрын зураг бий.', 'Visit the 3 sights with yellow flags, then meet the local guide. Walk with WASD, press E to look, Space to jump. The map is in the top-right corner.'))],
      onClose: () => { if (document.querySelector('.pp-grid, .pp-visit')) TG.go('passport'); },
    });
    TG.sfx.whoosh && TG.sfx.whoosh();
    TG.travel._cur = { me: sc.me, things, run: (t) => t.run(), seen, close: () => sc.close() }; // used by automated tests
  }
  TG.travel = { open, build };
})(window.TG);
