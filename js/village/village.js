/* Нутаг — the shared village: walk, garden together, fish, shop, dress up, quests, live multiplayer. */
(function (TG) {
  const { h, L, tx } = TG;
  const S = TG.store, R = TG.vrules, WD = TG.vworld, T = WD.T;
  const SPEED = 4.6;
  const DIRS = [[0, 1], [-1, 0], [1, 0], [0, -1]]; // down, left, right, up
  const PET_E = { lamb: '🐑', kitten: '🐈', puppy: '🐕', camel: '🐫', foal: '🐴' };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const Tx = (mn, en) => ({ mn, en });
  let live = null;

  // ================================================================ saved data (per child profile)
  function V() {
    const p = S.active(); if (!p) return null;
    const v = p.village || (p.village = {});
    const d = { id: 'u' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4), xp: 0, coins: 40, seeds: { carrot: 4, potato: 2 }, produce: {}, fish: {},
      owned: ['deel-blue'], look: { deel: 'blue', skin: R.SKINS[0], hat: null, face: null, neck: null, pet: null }, can: 5, water: 5, rod: 1, room: 'NUTAG',
      garden: [], quests: { d: '', list: [] }, pets: {}, seen: {}, tips: false, pos: null };
    for (const k in d) if (v[k] === undefined) v[k] = d[k];
    while (v.garden.length < R.PLOTS) v.garden.push(null);
    return v;
  }
  const garden = () => (live && live.online && live.plots ? live.plots : V().garden);
  const now = () => Date.now() + (live && live.online ? live.offset : 0);
  const lvl = () => R.level(V().xp).l;

  // ================================================================ rewards + quests (also used by the rest of Naadamy)
  function reward(coins, xp) {
    const v = V(); if (!v) return null;
    const before = R.level(v.xp).l;
    v.coins += coins; v.xp += xp; S.save();
    const after = R.level(v.xp).l;
    if (after > before) {
      setTimeout(() => { TG.sfx.win(); TG.confetti(80); TG.toast(`🎉 ${L('Түвшин ахилаа!', 'Level up!')} ${L('Түвшин', 'Level')} ${after}`); }, 400);
      net.send({ t: 'look', look: v.look, lvl: after });
    }
    if (live) hud();
    return { coins, xp, level: after > before ? after : 0 };
  }
  const QUESTS = {
    water: { n: 5, c: 20, x: 25, t: Tx('5 ургамал услах', 'Water 5 plants') },
    harvest: { n: 3, c: 25, x: 30, t: Tx('3 ургац хураах', 'Harvest 3 crops') },
    plant: { n: 4, c: 15, x: 20, t: Tx('4 үр тарих', 'Plant 4 seeds') },
    fish: { n: 2, c: 25, x: 30, t: Tx('2 загас барих', 'Catch 2 fish') },
    game: { n: 1, c: 20, x: 30, t: Tx('Naadamy-ийн 1 тоглоом тоглох', 'Play 1 Naadamy game') },
    together: { n: 1, c: 35, x: 45, t: Tx('Гэр бүлтэйгээ хамт 1 тоглоом тоглох', 'Play 1 game with family') },
    puzzle: { n: 2, c: 20, x: 30, t: Tx('Цэгцлэе!-ийн 2 түвшин дуусгах', 'Finish 2 puzzle levels') },
    pet: { n: 3, c: 10, x: 20, t: Tx('Хонийг 3 удаа илбэх', 'Pet the sheep 3 times') },
    sell: { n: 5, c: 15, x: 20, t: Tx('5 зүйл зарах', 'Sell 5 items') },
    help: { n: 2, c: 30, x: 40, t: Tx('Найзынхаа ургамлыг 2 удаа услах', "Water a friend's plants twice") },
  };
  const POOL = ['water', 'harvest', 'plant', 'fish', 'game', 'together', 'puzzle', 'pet', 'sell'];
  function quests() {
    const v = V(), d = S.dkey();
    if (v.quests.d !== d) {
      let hs = 0; for (const ch of d + v.id) hs = (hs * 31 + ch.charCodeAt(0)) >>> 0;
      const pool = [...POOL], pick = [];
      while (pick.length < 3) { hs = (hs * 1103515245 + 12345) >>> 0; pick.push(pool.splice(hs % pool.length, 1)[0]); }
      pick.push('help');
      v.quests = { d, list: pick.map((k) => ({ k, p: 0, done: false })) };
      v.pets = {};
      S.save();
    }
    return v.quests.list;
  }
  function quest(k, n = 1) {
    if (!V()) return;
    for (const q of quests()) if (q.k === k && !q.done) {
      const was = q.p; q.p = Math.min(QUESTS[k].n, q.p + n);
      if (q.p === QUESTS[k].n && was < q.p) TG.toast('📜 ' + L('Даалгавар биеллээ! Самбараас шагналаа аваарай.', 'Quest complete! Claim it at the board.'));
    }
    S.save();
  }
  TG.onGameRecorded = ({ stars, together, gameId }) => {
    const m = together ? 1.5 : 1;
    quest('game'); if (together) quest('together'); if (gameId === 'satis') quest('puzzle');
    return reward(Math.round(stars * 6 * m), Math.round(stars * 12 * m));
  };
  TG.onMissionDone = () => reward(15, 25);
  TG._village = { live: () => live, act: (...a) => act(...a), goTo: (...a) => goTo(...a) }; // used by automated tests
  TG.villageInfo = () => { const v = V(); return v ? { coins: v.coins, ...R.level(v.xp) } : null; };

  // ================================================================ avatar drawing (also used for the wardrobe preview)
  function drawAvatar(ctx, x, y, look, dir, t, moving) {
    const c = WD.circle, rr = WD.rr;
    const bob = moving ? Math.abs(Math.sin(t * 14)) * 1.8 : Math.sin(t * 2.2) * 0.6;
    const deel = R.DEELS[look.deel] || R.DEELS.blue, skin = look.skin || R.SKINS[0], step = moving ? Math.sin(t * 14) * 2 : 0;
    ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(x, y, 9, 3.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3A2A20'; rr(ctx, x - 6, y - 6 - (step > 0 ? 1 : 0), 5, 6, 2); ctx.fill(); rr(ctx, x + 1, y - 6 - (step < 0 ? 1 : 0), 5, 6, 2); ctx.fill();
    const by = y - 22 - bob;
    c(ctx, x - 10, by + 8 + step * 0.5, 3, deel); c(ctx, x + 10, by + 8 - step * 0.5, 3, deel);
    rr(ctx, x - 9, by, 18, 17, 6); ctx.fillStyle = deel; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x - 2, by + 1); ctx.quadraticCurveTo(x + 4, by + 4, x + 7, by + 9); ctx.stroke();
    ctx.fillStyle = '#FDB022'; ctx.fillRect(x - 9, by + 10, 18, 3);
    const hy = by - 7;
    if (look.neck === 'scarf') { ctx.fillStyle = '#F04438'; rr(ctx, x - 8, by - 1, 16, 4, 2); ctx.fill(); ctx.fillRect(x + 3, by + 2, 4, 8); }
    if (look.neck === 'khadag') { ctx.strokeStyle = '#8FD0FF'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 8, by + 1); ctx.quadraticCurveTo(x, by + 12, x + 8, by + 1); ctx.stroke(); ctx.fillStyle = '#8FD0FF'; ctx.fillRect(x - 9, by + 1, 3, 10); ctx.fillRect(x + 6, by + 1, 3, 10); }
    if (look.neck === 'medal') { ctx.strokeStyle = '#2F6BFF'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 5, by); ctx.lineTo(x, by + 7); ctx.lineTo(x + 5, by); ctx.stroke(); c(ctx, x, by + 9, 3.4, '#FDB022'); c(ctx, x, by + 9, 1.6, '#DC8B05'); }
    c(ctx, x, hy, 8.5, skin);
    ctx.fillStyle = '#2B1D14';
    if (dir === 3) { ctx.beginPath(); ctx.arc(x, hy, 8.8, 0, Math.PI * 2); ctx.fill(); }
    else {
      ctx.beginPath(); ctx.arc(x, hy - 0.5, 8.8, Math.PI * 1.03, Math.PI * 1.97); ctx.fill();
      const ex = dir === 1 ? -2.5 : dir === 2 ? 2.5 : 0;
      c(ctx, x - 3 + ex, hy + 1.6, 1.3, '#1F1A17'); c(ctx, x + 3 + ex, hy + 1.6, 1.3, '#1F1A17');
      c(ctx, x - 5 + ex, hy + 4, 1.7, 'rgba(240,110,110,.35)'); c(ctx, x + 5 + ex, hy + 4, 1.7, 'rgba(240,110,110,.35)');
      if (look.face === 'glasses') { ctx.strokeStyle = '#1F2A44'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x - 3 + ex, hy + 1.6, 2.6, 0, Math.PI * 2); ctx.moveTo(x + 5.6 + ex, hy + 1.6); ctx.arc(x + 3 + ex, hy + 1.6, 2.6, 0, Math.PI * 2); ctx.moveTo(x - 0.4 + ex, hy + 1.4); ctx.lineTo(x + 0.4 + ex, hy + 1.4); ctx.stroke(); }
      if (look.face === 'sun') { ctx.fillStyle = '#141B2D'; rr(ctx, x - 6 + ex, hy, 5, 3.4, 1.5); ctx.fill(); rr(ctx, x + 1 + ex, hy, 5, 3.4, 1.5); ctx.fill(); ctx.fillRect(x - 1 + ex, hy + 0.6, 2, 1); }
    }
    if (look.hat === 'mongol') { ctx.fillStyle = '#B32D24'; ctx.beginPath(); ctx.ellipse(x, hy - 5, 11, 3.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#E8453C'; ctx.beginPath(); ctx.arc(x, hy - 6, 7, Math.PI, 0); ctx.fill(); c(ctx, x, hy - 14, 2.3, '#FDB022'); }
    if (look.hat === 'flower') for (let i = 0; i < 6; i++) { const a = Math.PI * (1.08 + i * 0.168); c(ctx, x + Math.cos(a) * 8.5, hy - 1 + Math.sin(a) * 8.5, 2.5, ['#FF8FB1', '#FFD34E', '#FFFFFF', '#B49CFF'][i % 4]); }
    if (look.hat === 'cap') { ctx.fillStyle = '#2F6BFF'; ctx.beginPath(); ctx.arc(x, hy - 1, 9, Math.PI, 0); ctx.fill(); if (dir !== 3) { ctx.fillStyle = '#1E50D6'; ctx.beginPath(); ctx.ellipse(x + (dir === 1 ? -7 : dir === 2 ? 7 : 0), hy - 1.5, dir === 0 ? 9 : 6, 2.4, 0, 0, Math.PI * 2); ctx.fill(); } }
    if (look.hat === 'loovuuz') { ctx.fillStyle = '#8A5A33'; ctx.beginPath(); ctx.ellipse(x, hy - 6, 10, 7, 0, Math.PI, 0); ctx.fill(); for (let i = -2; i <= 2; i++) c(ctx, x + i * 4.2, hy - 4, 2.6, '#E3C29E'); ctx.fillStyle = '#E3C29E'; rr(ctx, x - 11, hy - 4, 4, 9, 2); ctx.fill(); rr(ctx, x + 7, hy - 4, 4, 9, 2); ctx.fill(); c(ctx, x, hy - 13, 2, '#E8453C'); }
    if (look.hat === 'crown') { ctx.fillStyle = '#FDB022'; ctx.strokeStyle = '#DC8B05'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - 7, hy - 6); ctx.lineTo(x - 7, hy - 13); ctx.lineTo(x - 3.5, hy - 9); ctx.lineTo(x, hy - 15); ctx.lineTo(x + 3.5, hy - 9); ctx.lineTo(x + 7, hy - 13); ctx.lineTo(x + 7, hy - 6); ctx.closePath(); ctx.fill(); ctx.stroke(); c(ctx, x, hy - 9, 1.5, '#F04438'); }
  }
  TG.drawAvatar = drawAvatar;
  function drawPet(ctx, pet, p, flip, t) {
    if (!pet || !PET_E[pet]) return;
    ctx.save(); ctx.translate(p.x * T + 16, p.y * T + 24 + Math.sin(t * 6) * 0.8);
    if (flip) ctx.scale(-1, 1);
    ctx.font = '15px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.fillText(PET_E[pet], 0, 0);
    ctx.restore();
  }

  // ================================================================ multiplayer connection
  const net = {
    ws: null, retry: 0, timer: 0, closed: true,
    async connect() {
      this.closed = false; setStatus('connecting');
      if (location.protocol === 'file:') return setStatus('solo');
      let ok = false;
      try { const r = await fetch('api/hello', { cache: 'no-store' }); ok = r.ok && (await r.json()).naadamy === true; } catch (e) { ok = false; }
      if (!live || this.closed) return;
      if (!ok) return setStatus('solo');
      this.open();
    },
    open() {
      if (!live) return;
      const v = V(), url = (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + location.pathname.replace(/[^/]*$/, '') + 'ws';
      let ws; try { ws = new WebSocket(url); } catch (e) { return setStatus('solo'); }
      this.ws = ws;
      ws.onopen = () => { this.retry = 0; ws.send(JSON.stringify({ t: 'join', room: v.room, id: v.id, name: live.name, look: v.look, lvl: lvl(), x: live.me.x, y: live.me.y, dir: live.me.dir })); };
      ws.onmessage = (e) => { let m; try { m = JSON.parse(e.data); } catch (err) { return; } if (live) handle(m); };
      ws.onclose = () => {
        if (this.ws !== ws) return;
        this.ws = null;
        if (!live) return;
        live.online = false; live.others.clear(); live.plots = null;
        if (this.closed) return setStatus('solo');
        setStatus('reconnecting');
        this.timer = setTimeout(() => this.open(), Math.min(10000, 1500 * ++this.retry));
      };
    },
    send(m) { if (this.ws && this.ws.readyState === 1 && live && live.online) this.ws.send(JSON.stringify(m)); },
    close() { this.closed = true; clearTimeout(this.timer); if (this.ws) { const w = this.ws; this.ws = null; try { w.close(); } catch (e) { /* closing */ } } },
    rejoin() { this.close(); if (!live) return; this.closed = false; live.online = false; live.others.clear(); live.plots = null; setStatus('connecting'); this.open(); },
  };
  function handle(m) {
    const v = V();
    switch (m.t) {
      case 'welcome':
        live.online = true; live.offset = m.now - Date.now(); live.plots = m.plots; live.room = m.room;
        live.others.clear(); (m.players || []).forEach(addOther);
        setStatus('online');
        TG.toast(`🟢 ${L('Нутагт холбогдлоо', 'Connected to village')} · ${m.room}` + (live.others.size ? ` · ${live.others.size} ${L('найз байна', 'friends here')}` : ''));
        break;
      case 'join': addOther(m.p); TG.toast(`👋 ${m.p.name} ${L('нутагт ирлээ', 'joined the village')}`); hud(); break;
      case 'leave': live.others.delete(m.id); hud(); break;
      case 'move': { const o = live.others.get(m.id); if (o) { o.x = m.x; o.y = m.y; o.dir = m.dir; } break; }
      case 'look': { const o = live.others.get(m.id); if (o) { o.look = m.look; o.lvl = m.lvl; } break; }
      case 'say': {
        const who = m.id === v.id ? live.me : live.others.get(m.id);
        if (who) who.bubble = { text: m.k === 'e' ? R.EMOTES[m.i] : tx(R.PHRASES[m.i]), t0: performance.now() };
        break;
      }
      case 'plot': onPlot(m); break;
      case 'deny': deny(m.why); break;
      case 'error': TG.toast(L('Өрөөнд нэвтэрч чадсангүй.', 'Could not join the room.')); break;
    }
  }
  function addOther(p) { live.others.set(p.id, { ...p, px: p.x, py: p.y, petPos: { x: p.x, y: p.y + 0.6 }, bubble: null, moving: false }); }
  function setStatus(s) { if (live) { live.status = s; hud(); } }

  // ================================================================ garden actions
  function act(a, i, c) {
    const v = V();
    if (a === 'plant' && !(v.seeds[c] > 0)) return;
    if (live.online) return net.send({ t: a, i, c });
    const res = R.applyAction(v.garden, a, i, { c }, { id: v.id, name: live.name }, now());
    if (res.ok) onPlot({ act: a, i, plot: res.plot, by: v.id, crop: res.crop, planter: res.planter || (res.plot && res.plot.by), helped: false });
    else deny(res.why);
  }
  function deny(why) {
    TG.sfx.bad();
    TG.toast({ taken: L('Энд аль хэдийн тарьчихсан байна.', 'Something is already planted here.'), 'no-need': L('Одоо услах шаардлагагүй.', 'No need to water right now.'), 'not-ready': L('Хараахан болоогүй байна.', 'Not ready yet.') }[why] || L('Болсонгүй.', "That didn't work."));
  }
  function onPlot(m) {
    const v = V();
    garden()[m.i] = m.plot;
    const tile = WD.plots[m.i];
    if (m.by === v.id) {
      if (m.act === 'plant') { const c = m.plot.c; v.seeds[c] = Math.max(0, (v.seeds[c] || 0) - 1); quest('plant'); TG.sfx.snap(); floatAt(tile, '🌱', '#12B76A'); reward(0, 2); }
      if (m.act === 'water') { v.water = Math.max(0, v.water - 1); quest('water'); if (m.helped) quest('help'); TG.sfx.pour(0.4); floatAt(tile, m.helped ? '💧 +3 XP 🤝' : '💧 +1 XP', '#2F6BFF'); reward(0, m.helped ? 3 : 1); }
      if (m.act === 'harvest') {
        const cr = R.CROPS[m.crop];
        v.produce[m.crop] = (v.produce[m.crop] || 0) + 1; quest('harvest'); TG.sfx.good(); floatAt(tile, `${cr.e} +${cr.xp} XP`, '#DC8B05'); reward(0, cr.xp);
        if (!v.seen[m.crop]) { v.seen[m.crop] = 1; factCard(cr.e, tx(cr.name), tx(cr.fact), L('Шинэ ургац!', 'New crop!')); }
        else TG.toast(`${cr.e} ${tx(cr.name)} · 💡 ${tx(cr.fact)}`);
      }
    } else if (m.planter === v.id && m.act === 'water') { TG.toast(`💧 ${m.byName} ${L('таны ургамлыг усаллаа!', 'watered your plant!')}`); }
    else if (m.planter === v.id && m.act === 'harvest') { reward(5, 5); TG.toast(`🧺 ${m.byName} ${L('таны тарьсныг хураалаа. Хамтын ургац +5 🪙', 'harvested your crop. Shared harvest +5 🪙')}`); }
    S.save(); if (live) { hud(); updateCtx(); }
  }
  function plotAction(i) {
    const v = V(), p = R.normalize(garden()[i], now());
    if (!p) return seedPicker(i);
    if (R.mature(p)) return act('harvest', i);
    if (R.needsWater(p)) {
      if (v.water <= 0) { TG.sfx.bad(); return TG.toast('🪣 ' + L('Усны сав хоосон. Худгаас ус аваарай!', 'Your can is empty. Refill at the well!')); }
      return act('water', i);
    }
    TG.toast(`${R.CROPS[p.c].e} ${tx(R.CROPS[p.c].name)} · ${L('ургаж байна', 'growing')} ${fmtLeft(R.stageLeft(p, now()))}` + (p.n ? ` · ${L('тарьсан', 'planted by')}: ${p.n}` : ''));
  }
  const fmtLeft = (ms) => { const s = Math.ceil(ms / 1000); return s >= 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : `${s}${L('с', 's')}`; };

  // ================================================================ screen
  TG.villageScreen = ({ setCleanup }) => {
    quests();
    const canvas = h('canvas', { class: 'v-canvas', 'aria-label': L('Нутаг: тоглоомын талбар', 'Village play area') });
    const els = {
      me: h('button', { class: 'v-me', onclick: () => wardrobe() }), coins: h('button', { class: 'v-pill', onclick: () => shopModal() }),
      water: h('div', { class: 'v-pill' }), net: h('button', { class: 'v-pill v-net', onclick: () => roomModal() }),
      ctx: h('button', { class: 'v-act hidden', onclick: () => { const a = contextAction(); if (a) doAction(a); } }),
    };
    const root = h('div', { class: 'village' }, canvas,
      h('div', { class: 'v-top' },
        h('button', { class: 'icon-btn v-back', 'aria-label': 'back', onclick: () => TG.go('home') }, TG.icon('arrowLeft')),
        els.me, h('div', { class: 'v-pills' }, els.coins, els.water, els.net)),
      h('div', { class: 'v-bottom' },
        h('button', { class: 'v-round', 'aria-label': 'bag', onclick: () => bag() }, '🎒'),
        h('button', { class: 'v-round', 'aria-label': 'talk', onclick: () => talk() }, '💬'),
        h('button', { class: 'v-round', 'aria-label': 'quests', onclick: () => questModal() }, '📜'),
        h('div', { class: 'v-spacer' }), els.ctx));
    setTimeout(() => start(root, canvas, els, setCleanup), 0);
    return root;
  };

  function start(root, canvas, els, setCleanup) {
    if (!root.isConnected) return;
    const v = V(), prof = S.active();
    const sp = v.pos && !WD.blocked(v.pos.x, v.pos.y) ? v.pos : { x: 17, y: 13 };
    live = { root, canvas, els, ctx: canvas.getContext('2d'), name: prof.name, status: 'connecting', online: false, offset: 0, plots: null, room: v.room,
      me: { x: sp.x, y: sp.y, px: sp.x, py: sp.y, path: [], dir: 0, moving: false, bubble: null, petPos: { x: sp.x, y: sp.y + 0.6 }, stepSent: null },
      others: new Map(), held: null, pending: null, floaters: [], sheep: [[24, 20], [28, 22], [31, 20], [26, 23]].map(([x, y], i) => ({ i, x, y, px: x, py: y, next: 1 + i, flip: false })),
      raf: 0, last: performance.now(), view: {}, terrain: null, res: 0, ctxTimer: 0 };
    resize();
    document.fonts && document.fonts.ready.then(() => { if (live) live.terrain = WD.renderStatic(live.res); });
    window.addEventListener('resize', resize);
    canvas.addEventListener('pointerdown', onTap);
    window.addEventListener('keydown', onKey); window.addEventListener('keyup', onKeyUp);
    net.connect(); hud(); updateCtx();
    live.raf = requestAnimationFrame(frame);
    if (!v.tips) tips();
    setCleanup(stop);
  }
  function stop() {
    if (!live) return;
    cancelAnimationFrame(live.raf);
    window.removeEventListener('resize', resize); window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKeyUp);
    net.close();
    const v = V(); if (v) { v.pos = { x: live.me.x, y: live.me.y }; S.save(); }
    live = null;
  }
  function resize() {
    if (!live) return;
    const w = live.root.clientWidth || innerWidth, hh = live.root.clientHeight || innerHeight, dpr = Math.min(2, devicePixelRatio || 1);
    live.canvas.width = Math.round(w * dpr); live.canvas.height = Math.round(hh * dpr);
    const pref = w < 640 ? Math.max(1.35, w / (8.5 * T)) : Math.min(2.4, Math.max(1.5, w / (17 * T)));
    const scale = Math.max(pref, w / (WD.W * T), hh / (WD.H * T));
    live.view = { w, h: hh, dpr, scale };
    const res = Math.min(2.5, Math.max(1, Math.round(scale * dpr * 2) / 2));
    if (res !== live.res) { live.res = res; live.terrain = WD.renderStatic(res); }
  }
  function cam() {
    const { w, h: hh, scale } = live.view;
    return { x: clamp((live.me.px + 0.5) * T * scale - w / 2, 0, WD.W * T * scale - w), y: clamp((live.me.py + 0.5) * T * scale - hh / 2, 0, WD.H * T * scale - hh) };
  }

  // ---------------------------------------------------------------- HUD
  function hud() {
    if (!live) return;
    const v = V(), L1 = R.level(v.xp), e = live.els;
    e.me.replaceChildren(h('span', { class: 'v-lvl' }, L1.l), h('span', { class: 'v-me-body' }, h('b', null, live.name), h('span', { class: 'v-xp' }, h('i', { style: { width: (L1.cur / L1.need) * 100 + '%' } }))));
    e.coins.textContent = `🪙 ${v.coins}`;
    e.water.textContent = `💧 ${v.water}/${v.can}`;
    const n = live.others.size + 1;
    e.net.className = 'v-pill v-net ' + live.status;
    e.net.textContent = live.status === 'online' ? `🟢 ${n} · ${live.room}` : live.status === 'solo' ? `⚪ ${L('Ганцаараа', 'Solo')}` : `🟡 ${L('Холбогдож байна', 'Connecting')}`;
  }
  function contextAction() {
    if (!live) return null;
    const m = live.me; if (m.path.length) return null;
    const pi = WD.plotAt(m.x, m.y); if (pi >= 0) return { type: 'plot', i: pi };
    for (const o of WD.objects) if (o.door && o.door.x === m.x && o.door.y === m.y) return { type: o.id };
    if (m.x === WD.DOCK.x && m.y === WD.DOCK.y) return { type: 'fish' };
    const sh = live.sheep.find((q) => Math.abs(q.x - m.x) <= 1 && Math.abs(q.y - m.y) <= 1); if (sh) return { type: 'sheep', s: sh };
    return null;
  }
  function labelFor(a) {
    switch (a.type) {
      case 'plot': { const p = R.normalize(garden()[a.i], now()); if (!p) return ['🌱', L('Тарих', 'Plant')]; if (R.mature(p)) return [R.CROPS[p.c].e, L('Хураах', 'Harvest')]; if (R.needsWater(p)) return ['💧', L('Услах', 'Water')]; return ['⏳', fmtLeft(R.stageLeft(p, now()))]; }
      case 'home': return ['👗', L('Хувцаслах', 'Wardrobe')];
      case 'arcade': return ['🎮', L('Тоглох', 'Play')];
      case 'shop': return ['🛒', L('Дэлгүүр', 'Shop')];
      case 'board': return ['📜', L('Даалгавар', 'Quests')];
      case 'well': return ['🪣', L('Ус авах', 'Get water')];
      case 'fish': return ['🎣', L('Загасчлах', 'Fish')];
      case 'sheep': return ['🤍', L('Илбэх', 'Pet')];
    }
    return ['', ''];
  }
  function updateCtx() {
    if (!live) return;
    const a = contextAction(), b = live.els.ctx;
    b.classList.toggle('hidden', !a);
    if (a) { const [e, t] = labelFor(a); b.replaceChildren(h('span', { class: 'v-act-e' }, e), h('span', null, t)); }
  }
  function doAction(a) {
    if (!a || !live) return;
    switch (a.type) {
      case 'plot': return plotAction(a.i);
      case 'home': return wardrobe();
      case 'arcade': return arcade();
      case 'shop': return shopModal();
      case 'board': return questModal();
      case 'well': { const v = V(); v.water = v.can; S.save(); TG.sfx.pour(0.7); floatAt(live.me, `💧 ${v.water}/${v.can}`, '#2F6BFF'); hud(); return; }
      case 'fish': return fishing();
      case 'sheep': return petSheep(a.s);
    }
  }

  // ---------------------------------------------------------------- input
  function onTap(e) {
    if (!live) return;
    e.preventDefault();
    const r = live.canvas.getBoundingClientRect(), c = cam(), s = live.view.scale;
    const wx = (e.clientX - r.left + c.x) / s / T, wy = (e.clientY - r.top + c.y) / s / T, tx0 = Math.floor(wx), ty0 = Math.floor(wy);
    for (const o of live.others.values()) if (Math.abs(o.px + 0.5 - wx) < 0.6 && wy > o.py - 0.7 && wy < o.py + 1) return playerCard(o);
    const sh = live.sheep.find((q) => Math.abs(q.px + 0.5 - wx) < 0.7 && Math.abs(q.py + 0.5 - wy) < 0.7);
    if (sh) { const n = WD.nearestOpen(sh.x, sh.y, live.me.x, live.me.y); return n ? goTo(n, { type: 'sheep', s: sh }) : null; }
    const pi = WD.plotAt(tx0, ty0); if (pi >= 0) return goTo({ x: tx0, y: ty0 }, { type: 'plot', i: pi });
    const o = WD.occ[tx0 + ',' + ty0]; if (o && o.door) return goTo(o.door, { type: o.id });
    if (tx0 === WD.DOCK.x && ty0 === WD.DOCK.y) return goTo(WD.DOCK, { type: 'fish' });
    if (!WD.blocked(tx0, ty0)) return goTo({ x: tx0, y: ty0 }, null);
    const n = WD.nearestOpen(tx0, ty0, live.me.x, live.me.y); if (n) goTo(n, null);
  }
  function goTo(t, action) {
    const m = live.me, from = m.path.length ? m.path[0] : { x: m.x, y: m.y };
    const path = WD.findPath(from.x, from.y, t.x, t.y);
    if (!path) return TG.toast(L('Тийшээ очих зам алга.', "Can't get there."));
    m.path = m.path.length ? [m.path[0], ...path] : path;
    live.pending = action; live.held = null;
    live.floaters.push({ x: t.x, y: t.y, ring: true, t0: performance.now() });
    if (!m.path.length && action) doAction(action);
    updateCtx();
  }
  const KEYS = { ArrowDown: 0, KeyS: 0, ArrowLeft: 1, KeyA: 1, ArrowRight: 2, KeyD: 2, ArrowUp: 3, KeyW: 3 };
  function onKey(e) {
    if (!live || document.querySelector('.modal-back') || /INPUT|TEXTAREA/.test((e.target || {}).tagName || '')) return;
    if (e.code in KEYS) { e.preventDefault(); live.held = KEYS[e.code]; live.pending = null; }
    else if (e.code === 'KeyE' || e.code === 'Enter' || e.code === 'Space') { e.preventDefault(); const a = contextAction(); if (a) doAction(a); }
  }
  function onKeyUp(e) { if (live && e.code in KEYS && live.held === KEYS[e.code]) live.held = null; }

  // ---------------------------------------------------------------- update + draw
  function frame(ts) {
    if (!live) return;
    const dt = Math.min(0.05, (ts - live.last) / 1000); live.last = ts;
    update(dt); draw(ts / 1000);
    live.raf = requestAnimationFrame(frame);
  }
  const follow = (p, x, y, dt) => { p.x += (x - p.x) * Math.min(1, dt * 4); p.y += (y - p.y) * Math.min(1, dt * 4); };
  function update(dt) {
    const m = live.me;
    if (!m.path.length && live.held != null) {
      const [dx, dy] = DIRS[live.held]; m.dir = live.held;
      if (!WD.blocked(m.x + dx, m.y + dy)) m.path = [{ x: m.x + dx, y: m.y + dy }];
    }
    if (m.path.length) {
      const t = m.path[0];
      if (m.stepSent !== t) { m.stepSent = t; const dx = t.x - m.x, dy = t.y - m.y; m.dir = dy > 0 ? 0 : dy < 0 ? 3 : dx < 0 ? 1 : 2; net.send({ t: 'move', x: t.x, y: t.y, dir: m.dir }); }
      const dx = t.x - m.px, dy = t.y - m.py, d = Math.hypot(dx, dy), step = SPEED * dt;
      m.moving = true;
      if (d <= step) {
        m.px = m.x = t.x; m.py = m.y = t.y; m.path.shift();
        if (!m.path.length) { m.moving = false; const a = live.pending; live.pending = null; if (a) doAction(a); }
        updateCtx();
      } else { m.px += (dx / d) * step; m.py += (dy / d) * step; }
    } else m.moving = false;
    follow(m.petPos, m.px - 0.45, m.py + 0.25, dt);
    for (const o of live.others.values()) {
      const dx = o.x - o.px, dy = o.y - o.py, d = Math.hypot(dx, dy);
      if (d > 4) { o.px = o.x; o.py = o.y; o.moving = false; }
      else if (d > 0.01) { const s = Math.min(d, SPEED * dt); o.px += (dx / d) * s; o.py += (dy / d) * s; o.moving = true; }
      else o.moving = false;
      follow(o.petPos, o.px - 0.45, o.py + 0.25, dt);
    }
    for (const q of live.sheep) {
      q.next -= dt;
      if (q.next <= 0) { q.next = 2 + Math.random() * 4; const [dx, dy] = DIRS[Math.floor(Math.random() * 4)], nx = q.x + dx, ny = q.y + dy; if (nx >= 23 && nx <= 32 && ny >= 19 && ny <= 23) { q.x = nx; q.y = ny; if (dx) q.flip = dx > 0; } }
      q.px += (q.x - q.px) * Math.min(1, dt * 2.5); q.py += (q.y - q.py) * Math.min(1, dt * 2.5);
    }
    live.ctxTimer -= dt; if (live.ctxTimer <= 0) { live.ctxTimer = 0.5; updateCtx(); }
  }

  function draw(t) {
    const ctx = live.ctx, { w, h: hh, dpr, scale } = live.view, c = cam(), nowMs = now(), pn = performance.now();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.fillStyle = '#86BF5D'; ctx.fillRect(0, 0, w, hh);
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, -c.x * dpr, -c.y * dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(live.terrain, 0, 0, WD.W * T, WD.H * T);
    const x0 = Math.max(0, Math.floor(c.x / scale / T) - 1), x1 = Math.min(WD.W - 1, Math.ceil((c.x + w) / scale / T) + 1);
    const y0 = Math.max(0, Math.floor(c.y / scale / T) - 1), y1 = Math.min(WD.H - 1, Math.ceil((c.y + hh) / scale / T) + 1);
    // water shimmer
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1.4;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      if (WD.g[y][x] !== 'w') continue;
      const ph = (t * 0.8 + WD.hash(x, y) * 6) % 3; if (ph > 1) continue;
      const X = x * T + 6 + WD.hash(y, x) * 14, Y = y * T + 10 + WD.hash(x + 1, y) * 14;
      ctx.globalAlpha = Math.sin(ph * Math.PI); ctx.beginPath(); ctx.moveTo(X, Y); ctx.quadraticCurveTo(X + 4, Y - 2, X + 8, Y); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // crops
    const gd = garden();
    for (let i = 0; i < R.PLOTS; i++) drawPlot(ctx, i, R.normalize(gd[i], nowMs), t);
    // characters (depth sorted)
    const ents = [];
    live.sheep.forEach((q) => ents.push({ y: q.py, f: () => { ctx.save(); ctx.translate(q.px * T + 16, q.py * T + 26); if (q.flip) ctx.scale(-1, 1); ctx.font = '20px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.fillText('🐑', 0, 0); ctx.restore(); } }));
    const person = (o, isMe) => {
      ents.push({ y: o.petPos.y, f: () => drawPet(ctx, o.look.pet, o.petPos, o.px > o.petPos.x + 0.05, t) });
      ents.push({ y: o.py, f: () => drawAvatar(ctx, o.px * T + 16, o.py * T + 28, o.look, o.dir, t, o.moving) });
    };
    for (const o of live.others.values()) person(o, false);
    const v = V(); person({ ...live.me, look: v.look }, true);
    ents.sort((a, b) => a.y - b.y).forEach((e) => e.f());
    // name tags and speech bubbles
    for (const o of live.others.values()) labels(ctx, o, o.name, o.lvl, false, pn);
    labels(ctx, live.me, live.name, R.level(v.xp).l, true, pn);
    // floating text
    live.floaters = live.floaters.filter((f) => pn - f.t0 < 1400);
    for (const f of live.floaters) {
      const k = (pn - f.t0) / 1400;
      if (f.ring) { ctx.strokeStyle = `rgba(255,255,255,${1 - k})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(f.x * T + 16, f.y * T + 24, 6 + k * 8, 3 + k * 4, 0, 0, Math.PI * 2); ctx.stroke(); continue; }
      ctx.globalAlpha = 1 - k; ctx.font = '800 11px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineWidth = 3; ctx.strokeStyle = '#fff'; ctx.strokeText(f.text, f.x * T + 16, f.y * T - 4 - k * 18); ctx.fillStyle = f.color; ctx.fillText(f.text, f.x * T + 16, f.y * T - 4 - k * 18);
      ctx.globalAlpha = 1;
    }
    // evening light
    const hr = new Date().getHours();
    if (hr >= 19 || hr < 6) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.fillStyle = 'rgba(16,24,70,.28)'; ctx.fillRect(0, 0, w, hh);
      ctx.globalCompositeOperation = 'lighter';
      for (const o of WD.objects.filter((q) => q.kind === 'lantern')) {
        const sx = (o.x * T + 16) * scale - c.x, sy = (o.y * T - 4) * scale - c.y, rad = 70 * scale;
        const gr = ctx.createRadialGradient(sx, sy, 0, sx, sy, rad); gr.addColorStop(0, 'rgba(255,200,90,.35)'); gr.addColorStop(1, 'rgba(255,200,90,0)');
        ctx.fillStyle = gr; ctx.fillRect(sx - rad, sy - rad, rad * 2, rad * 2);
      }
      ctx.globalCompositeOperation = 'source-over';
    }
  }
  function drawPlot(ctx, i, p, t) {
    if (!p) return;
    const { x, y } = WD.plots[i], X = x * T, Y = y * T, cx = X + 16, cy = Y + 20, cr = R.CROPS[p.c];
    if (p.w && p.s < 3) { ctx.fillStyle = 'rgba(60,32,14,.32)'; ctx.fillRect(X + 1, Y + 1, T - 2, T - 2); }
    const leaf = (lx, ly, rx, ry, rot, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(lx, ly, rx, ry, rot, 0, Math.PI * 2); ctx.fill(); };
    const sway = Math.sin(t * 2 + i) * 0.08;
    if (p.s === 0) [[-5, 2], [0, -2], [5, 3]].forEach(([dx, dy]) => WD.circle(ctx, cx + dx, cy + dy, 1.8, '#5A3A22'));
    if (p.s >= 1) { ctx.strokeStyle = '#3E8E3A'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, cy + 5); ctx.lineTo(cx, cy - (p.s === 1 ? 2 : 6)); ctx.stroke(); }
    if (p.s === 1) { leaf(cx - 3, cy - 2, 3.4, 1.8, -0.5 + sway, '#5DB04A'); leaf(cx + 3, cy - 2, 3.4, 1.8, 0.5 + sway, '#5DB04A'); }
    if (p.s >= 2) { leaf(cx - 5, cy, 5, 2.4, -0.4 + sway, '#4E9F3D'); leaf(cx + 5, cy, 5, 2.4, 0.4 + sway, '#4E9F3D'); leaf(cx - 4, cy - 5, 4, 2, -0.7 + sway, '#5DB04A'); leaf(cx + 4, cy - 5, 4, 2, 0.7 + sway, '#5DB04A'); }
    if (p.s === 2) WD.circle(ctx, cx, cy - 8, 2.4, cr.color);
    if (p.s >= 3) {
      const bob = Math.sin(t * 3 + i) * 1.2;
      if (p.c === 'seabuckthorn') { ctx.strokeStyle = '#8B5A2B'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(cx, cy + 4); ctx.lineTo(cx, cy - 12); ctx.moveTo(cx, cy - 4); ctx.lineTo(cx - 7, cy - 10); ctx.moveTo(cx, cy - 6); ctx.lineTo(cx + 7, cy - 12); ctx.stroke(); [[-6, -9], [-4, -6], [5, -11], [7, -8], [1, -12], [-1, -8], [2, -5]].forEach(([dx, dy]) => WD.circle(ctx, cx + dx, cy + dy + bob * 0.3, 2.1, '#F79009')); }
      else { ctx.font = '17px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(cr.e, cx, cy - 8 + bob); }
      const sp = (t * 1.5 + i * 0.37) % 2; if (sp < 1) { ctx.fillStyle = `rgba(255,255,255,${Math.sin(sp * Math.PI)})`; ctx.font = '9px serif'; ctx.fillText('✨', X + 26, Y + 6); }
    }
    if (R.needsWater(p)) { const by = Y + 3 + Math.sin(t * 3 + i) * 1.5; WD.circle(ctx, X + 25, by, 6, 'rgba(255,255,255,.92)'); ctx.font = '8px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('💧', X + 25, by + 0.5); }
  }
  function labels(ctx, o, name, level, isMe, pn) {
    const x = o.px * T + 16, y = o.py * T - 21;
    ctx.font = '800 8.5px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const tw = ctx.measureText(name).width + 22;
    WD.rr(ctx, x - tw / 2, y - 6.5, tw, 13, 6.5); ctx.fillStyle = isMe ? 'rgba(47,107,255,.92)' : 'rgba(20,27,45,.72)'; ctx.fill();
    WD.circle(ctx, x - tw / 2 + 6.5, y, 5, '#FDB022'); ctx.fillStyle = '#3A2600'; ctx.font = '900 7px Nunito, sans-serif'; ctx.fillText(level, x - tw / 2 + 6.5, y + 0.3);
    ctx.fillStyle = '#fff'; ctx.font = '800 8.5px Nunito, sans-serif'; ctx.fillText(name, x + 5, y + 0.3);
    if (o.bubble) {
      const age = (pn - o.bubble.t0) / 1000;
      if (age > 4.5) { o.bubble = null; return; }
      ctx.globalAlpha = age > 3.9 ? (4.5 - age) / 0.6 : 1;
      ctx.font = '800 10px Nunito, sans-serif';
      const bw = ctx.measureText(o.bubble.text).width + 16, by = y - 26;
      ctx.fillStyle = 'rgba(20,27,45,.15)'; WD.rr(ctx, x - bw / 2, by + 1.5, bw, 18, 9); ctx.fill();
      ctx.fillStyle = '#fff'; WD.rr(ctx, x - bw / 2, by, bw, 18, 9); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x - 4, by + 17); ctx.lineTo(x, by + 22); ctx.lineTo(x + 4, by + 17); ctx.fill();
      ctx.fillStyle = '#141B2D'; ctx.fillText(o.bubble.text, x, by + 9.5);
      ctx.globalAlpha = 1;
    }
  }
  function floatAt(p, text, color) { if (live) live.floaters.push({ x: p.x !== undefined ? (p.px !== undefined ? p.px : p.x) : 0, y: p.py !== undefined ? p.py : p.y, text, color, t0: performance.now() }); }

  // ================================================================ panels
  const icon = (e) => h('span', { class: 'v-ic' }, e);
  function factCard(e, title, fact, head) {
    const close = TG.modal(h('div', { class: 'center v-fact' }, h('div', { class: 'v-fact-e' }, e), head ? h('div', { class: 'eyebrow' }, head) : null, h('h2', null, title),
      h('div', { class: 'teach' }, h('b', null, '💡 ', L('Мэдсэн үү?', 'Did you know?')), h('p', null, fact)),
      h('button', { class: 'btn primary block', style: { marginTop: '14px' }, onclick: () => close() }, L('Гайхалтай!', 'Cool!'))));
  }
  function seedPicker(i) {
    const v = V(), owned = Object.entries(R.CROPS).filter(([k]) => v.seeds[k] > 0);
    const close = TG.modal(h('div', null,
      h('h2', null, '🌱 ', L('Юу тарих вэ?', 'What to plant?')),
      h('p', { class: 'muted' }, L('Тарьсан ургамлаа 3 удаа услах хэрэгтэй. Найзууд чинь ч усалж туслах боломжтой!', 'Plants need water 3 times. Your friends can help water too!')),
      owned.length ? h('div', { class: 'v-grid' }, owned.map(([k, c]) => h('button', { class: 'v-card', onclick: () => { close(); act('plant', i, k); } },
        h('span', { class: 'v-card-e' }, c.e), h('b', null, tx(c.name)), h('small', null, `×${v.seeds[k]} · ${c.stage * 3}${L('с', 's')}`))))
        : h('div', { class: 'empty-memory' }, h('p', null, L('Танд үр алга. Дэлгүүрээс аваарай!', "You don't have seeds. Get some at the shop!")),
          h('button', { class: 'btn primary', onclick: () => { close(); shopModal('seeds'); } }, '🛒 ', L('Дэлгүүр', 'Shop')))));
  }

  function shopModal(start) {
    const v = V(); let cur = start || 'seeds';
    const body = h('div', { class: 'v-shop' });
    const TABS = [['seeds', '🌱', L('Үр', 'Seeds')], ['wear', '👕', L('Хувцас', 'Clothes')], ['pet', '🐾', L('Тэжээвэр', 'Pets')], ['tool', '🛠️', L('Багаж', 'Tools')], ['sell', '💰', L('Зарах', 'Sell')]];
    const pay = (price) => { if (v.coins < price) { TG.sfx.bad(); TG.toast(L('Зоос хүрэлцэхгүй байна. Тоглож, ургац зарж цуглуулаарай!', 'Not enough coins. Play games or sell crops to earn more!')); return false; } v.coins -= price; TG.sfx.chime(); return true; };
    const ownedItem = (it) => (it.cat === 'tool' ? (it.slot === 'can' ? v.can >= it.val : v.rod >= it.val) : v.owned.includes(it.id));
    const draw = () => {
      const level = lvl();
      let list;
      if (cur === 'seeds') list = Object.entries(R.CROPS).map(([k, c]) => {
        const locked = level < c.lvl;
        return h('div', { class: 'v-row' + (locked ? ' locked' : '') }, icon(c.e), h('div', { class: 'v-row-b' }, h('b', null, tx(c.name)), h('small', null, `${L('Зарах үнэ', 'Sells for')} ${c.sell} 🪙 · ${L('Танд', 'You have')} ${v.seeds[k] || 0}`)),
          locked ? h('span', { class: 'v-lock' }, '🔒 ', L('Түвшин', 'Lv'), ' ', c.lvl) : h('div', { class: 'v-buy' },
            h('button', { class: 'btn sm', onclick: () => { if (pay(c.cost)) { v.seeds[k] = (v.seeds[k] || 0) + 1; save(); } } }, `+1 · ${c.cost}🪙`),
            h('button', { class: 'btn sm primary', onclick: () => { if (pay(c.cost * 5)) { v.seeds[k] = (v.seeds[k] || 0) + 5; save(); } } }, `+5 · ${c.cost * 5}🪙`)));
      });
      else if (cur === 'sell') {
        const goods = [...Object.entries(v.produce).filter(([, n]) => n > 0).map(([k, n]) => ({ k, n, kind: 'produce', e: R.CROPS[k].e, name: R.CROPS[k].name, price: R.CROPS[k].sell })),
          ...Object.entries(v.fish).filter(([, n]) => n > 0).map(([k, n]) => ({ k, n, kind: 'fish', e: R.FISH[k].e, name: R.FISH[k].name, price: R.FISH[k].sell }))];
        const sell = (g, n) => { v[g.kind][g.k] -= n; v.coins += g.price * n; quest('sell', n); TG.sfx.chime(); save(); };
        list = goods.length ? [h('button', { class: 'btn primary block', onclick: () => goods.forEach((g) => sell(g, g.n)) }, `💰 ${L('Бүгдийг зарах', 'Sell everything')} · +${goods.reduce((s, g) => s + g.n * g.price, 0)}🪙`),
          ...goods.map((g) => h('div', { class: 'v-row' }, icon(g.e), h('div', { class: 'v-row-b' }, h('b', null, `${tx(g.name)} ×${g.n}`), h('small', null, `${g.price} 🪙 ${L('ширхэг бүр', 'each')}`)),
            h('button', { class: 'btn sm', onclick: () => sell(g, 1) }, `${L('Зарах', 'Sell')} 1`)))]
          : [h('div', { class: 'empty-memory' }, h('p', null, L('Зарах зүйл алга. Ургац хурааж, загас бариарай!', 'Nothing to sell yet. Harvest crops or catch fish!')))];
      } else list = R.ITEMS.filter((it) => it.cat === cur).map((it) => {
        const owned = ownedItem(it), locked = level < it.lvl, worn = it.cat !== 'tool' && v.look[it.slot] === it.val;
        return h('div', { class: 'v-row' + (locked && !owned ? ' locked' : '') }, icon(it.e), h('div', { class: 'v-row-b' }, h('b', null, tx(it.name)), h('small', null, owned ? (worn ? L('Өмссөн', 'Wearing') : L('Танд байгаа', 'Owned')) : `${it.price} 🪙`)),
          owned ? (it.cat === 'tool' ? h('span', { class: 'v-owned' }, '✓') : h('button', { class: 'btn sm' + (worn ? ' done' : ''), onclick: () => equip(it.slot, worn && it.slot !== 'deel' ? null : it.val, draw) }, worn ? (it.slot === 'deel' ? '✓' : L('Тайлах', 'Remove')) : L('Өмсөх', 'Wear')))
            : locked ? h('span', { class: 'v-lock' }, '🔒 ', L('Түвшин', 'Lv'), ' ', it.lvl)
              : h('button', { class: 'btn sm primary', onclick: () => {
                if (!pay(it.price)) return;
                if (it.cat === 'tool') { if (it.slot === 'can') { v.can = it.val; v.water = it.val; } else v.rod = it.val; }
                else { v.owned.push(it.id); v.look[it.slot] = it.val; sendLook(); }
                TG.toast(`${it.e} ${tx(it.name)}: ${L('худалдаж авлаа!', 'purchased!')}`); save();
              } }, `${it.price} 🪙`));
      });
      body.replaceChildren(
        h('div', { class: 'v-shop-head' }, h('h2', null, '🛒 ', L('Наадмын дэлгүүр', 'Naadam Shop')), h('span', { class: 'v-pill dark' }, `🪙 ${v.coins}`)),
        h('div', { class: 'chips v-tabs' }, TABS.map(([k, e, t]) => h('button', { class: 'chip' + (cur === k ? ' active' : ''), onclick: () => { cur = k; draw(); } }, e, ' ', t))),
        h('div', { class: 'v-list' }, list));
    };
    const save = () => { S.save(); hud(); draw(); };
    draw();
    TG.modal(body, { cls: 'v-modal' });
  }
  const sendLook = () => net.send({ t: 'look', look: V().look, lvl: lvl() });
  function equip(slot, val, redraw) { const v = V(); v.look[slot] = val; S.save(); sendLook(); TG.sfx.tap(); if (redraw) redraw(); }

  function wardrobe() {
    const v = V(), body = h('div', { class: 'v-wardrobe' });
    const cv = h('canvas', { class: 'v-preview', width: 240, height: 240 });
    let raf = 0;
    const paint = (ts) => {
      const ctx = cv.getContext('2d'); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, 240, 240);
      const gr = ctx.createRadialGradient(120, 130, 10, 120, 130, 120); gr.addColorStop(0, '#EEF3FF'); gr.addColorStop(1, '#FFFFFF'); ctx.fillStyle = gr; ctx.fillRect(0, 0, 240, 240);
      ctx.setTransform(4, 0, 0, 4, 0, 0); drawAvatar(ctx, 30, 50, v.look, 0, ts / 1000, false);
      if (v.look.pet) { ctx.font = '14px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.fillText(PET_E[v.look.pet], 47, 52); }
      raf = requestAnimationFrame(paint);
    };
    const slot = (title, s, items) => h('div', { class: 'v-slot' }, h('div', { class: 'label' }, title), h('div', { class: 'v-chips' },
      s !== 'deel' ? h('button', { class: 'v-chip' + (!v.look[s] ? ' active' : ''), onclick: () => equip(s, null, draw) }, '∅') : null,
      items.map((it) => h('button', { class: 'v-chip' + (v.look[s] === it.val ? ' active' : ''), title: tx(it.name), onclick: () => equip(s, it.val, draw) }, it.e))));
    const draw = () => {
      const mine = (s) => R.ITEMS.filter((it) => it.slot === s && v.owned.includes(it.id));
      body.replaceChildren(h('h2', null, '👗 ', L('Миний хувцас', 'My wardrobe')), cv,
        h('div', { class: 'v-slot' }, h('div', { class: 'label' }, L('Арьсны өнгө', 'Skin tone')), h('div', { class: 'v-chips' }, R.SKINS.map((sk) => h('button', { class: 'v-chip v-skin' + (v.look.skin === sk ? ' active' : ''), style: { background: sk }, 'aria-label': 'skin', onclick: () => equip('skin', sk, draw) })))),
        slot(L('Дээл', 'Deel'), 'deel', mine('deel')), slot(L('Малгай', 'Hat'), 'hat', mine('hat')), slot(L('Нүүр', 'Face'), 'face', mine('face')),
        slot(L('Хүзүү', 'Neck'), 'neck', mine('neck')), slot(L('Тэжээвэр', 'Pet'), 'pet', mine('pet')),
        h('button', { class: 'btn block', onclick: () => { close(); shopModal('wear'); } }, '🛒 ', L('Дэлгүүрээс шинэ хувцас авах', 'Get more at the shop')));
    };
    draw();
    const close = TG.modal(body, { cls: 'v-modal', onClose: () => cancelAnimationFrame(raf) });
    raf = requestAnimationFrame(paint);
  }

  function bag() {
    const v = V();
    const sec = (title, obj, src) => { const items = Object.entries(obj).filter(([k, n]) => n > 0 && src[k]); return h('div', { class: 'v-slot' }, h('div', { class: 'label' }, title), items.length ? h('div', { class: 'v-chips' }, items.map(([k, n]) => h('span', { class: 'v-chip wide' }, src[k].e, ` ${tx(src[k].name)} ×${n}`))) : h('p', { class: 'muted' }, '—')); };
    const L1 = R.level(v.xp);
    const close = TG.modal(h('div', null, h('h2', null, '🎒 ', L('Цүнх', 'Bag')),
      h('div', { class: 'stat-cards' }, h('div', { class: 'stat' }, h('small', null, L('Түвшин', 'Level')), h('b', null, L1.l)), h('div', { class: 'stat' }, h('small', null, 'XP'), h('b', null, `${L1.cur}/${L1.need}`)), h('div', { class: 'stat' }, h('small', null, L('Зоос', 'Coins')), h('b', null, v.coins))),
      sec(L('Үр', 'Seeds'), v.seeds, R.CROPS), sec(L('Ургац', 'Harvest'), v.produce, R.CROPS), sec(L('Загас', 'Fish'), v.fish, R.FISH),
      h('div', { class: 'row-btns' }, h('button', { class: 'btn', onclick: () => { close(); wardrobe(); } }, '👗 ', L('Хувцас', 'Wardrobe')), h('button', { class: 'btn primary', onclick: () => { close(); shopModal('sell'); } }, '💰 ', L('Зарах', 'Sell')))), { cls: 'v-modal' });
  }

  function questModal() {
    const v = V(), body = h('div');
    const draw = () => body.replaceChildren(h('h2', null, '📜 ', L('Өнөөдрийн даалгавар', "Today's quests")),
      h('p', { class: 'muted' }, L('Даалгавар өдөр бүр шинэчлэгдэнэ.', 'Quests refresh every day.')),
      h('div', { class: 'v-list' }, quests().map((q) => {
        const d = QUESTS[q.k], ready = q.p >= d.n && !q.done;
        return h('div', { class: 'v-row' + (q.done ? ' done' : '') }, icon(q.done ? '✅' : q.k === 'help' ? '🤝' : '📌'),
          h('div', { class: 'v-row-b' }, h('b', null, tx(d.t), q.k === 'help' ? h('small', null, ` (${L('онлайн', 'online')})`) : null), h('div', { class: 'meter' }, h('span', { style: { width: (q.p / d.n) * 100 + '%' } })), h('small', null, `${q.p}/${d.n} · +${d.c}🪙 +${d.x} XP`)),
          ready ? h('button', { class: 'btn sm primary', onclick: () => { q.done = true; reward(d.c, d.x); TG.confetti(40); draw(); } }, L('Авах', 'Claim')) : q.done ? h('span', { class: 'v-owned' }, '✓') : null);
      })),
      h('button', { class: 'btn block', onclick: () => { close(); TG.go('missions'); } }, '🤝 ', L('Гэр бүлийн бодит даалгавар', 'Real-life family missions'), ' (+15🪙)'));
    draw();
    const close = TG.modal(body, { cls: 'v-modal' });
  }

  function arcade() {
    const prof = S.active(), ag = S.ageGroupOf(prof.age);
    const games = TG.gameOrder.map((id) => TG.games[id]).filter((g) => g.ages.includes(ag)).slice(0, 8);
    const close = TG.modal(h('div', null, h('h2', null, '🎮 ', L('Тоглоомын гэр', 'Game ger')),
      h('p', { class: 'muted' }, L('Тоглоом бүрээр зоос, XP цуглуулна. Гэр бүлтэйгээ хамт тогловол 1.5 дахин их!', 'Every game earns coins and XP. Play with family for 1.5× more!')),
      h('div', { class: 'v-grid' }, games.map((g) => h('button', { class: 'v-card', onclick: () => { close(); TG.launchGame(g); } }, h('span', { class: 'v-card-e' }, g.icon), h('b', null, tx(g.title))))),
      h('button', { class: 'btn primary block', style: { marginTop: '12px' }, onclick: () => { close(); TG.go('satis'); } }, '✨ ', L('Цэгцлэе! оньсого', 'Make it perfect! puzzles'))), { cls: 'v-modal' });
  }

  function talk() {
    const say = (k, i) => {
      if (live.online) net.send({ t: 'say', k, i });
      else live.me.bubble = { text: k === 'e' ? R.EMOTES[i] : tx(R.PHRASES[i]), t0: performance.now() };
      close();
    };
    const close = TG.modal(h('div', null, h('h2', null, '💬 ', L('Хэлэх үг', 'Say something')),
      h('p', { class: 'muted' }, '🛡️ ', L('Хүүхдийн аюулгүй байдлын үүднээс зөвхөн бэлэн үг, эможи ашиглана.', 'For child safety, only friendly preset phrases and emoji are allowed.')),
      h('div', { class: 'v-phrases' }, R.PHRASES.map((p, i) => h('button', { class: 'v-chip wide', onclick: () => say('p', i) }, tx(p)))),
      h('div', { class: 'v-chips v-emotes' }, R.EMOTES.map((e, i) => h('button', { class: 'v-chip', onclick: () => say('e', i) }, e)))));
  }

  function playerCard(o) {
    const close = TG.modal(h('div', { class: 'center' }, h('div', { class: 'v-fact-e' }, PET_E[o.look.pet] || '🧑'), h('h2', null, o.name), h('p', { class: 'muted' }, `${L('Түвшин', 'Level')} ${o.lvl}`),
      h('div', { class: 'row-btns' }, h('button', { class: 'btn', onclick: () => { net.send({ t: 'say', k: 'p', i: 0 }); close(); } }, '👋 ', L('Мэндлэх', 'Say hi')),
        h('button', { class: 'btn primary', onclick: () => { net.send({ t: 'say', k: 'p', i: 1 }); close(); } }, '🎮 ', L('Хамт тоглоё', "Let's play")))));
  }

  function roomModal() {
    const v = V(), body = h('div');
    const input = h('input', { class: 'input', maxlength: 8, value: v.room, placeholder: 'NUTAG', 'aria-label': 'room code', style: { textTransform: 'uppercase', letterSpacing: '.15em', textAlign: 'center', fontSize: '1.3rem' } });
    const join = (code) => {
      code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (!R.ROOM_RE.test(code)) return TG.toast(L('Код 3–8 үсэг, тоо байна.', 'A code is 3–8 letters or digits.'));
      v.room = code; S.save(); live.room = code; close();
      if (live.status !== 'solo') net.rejoin(); else TG.toast(L('Сервертэй холбогдоогүй тул ганцаараа горимд байна.', 'No server connection, so you are in solo mode.'));
    };
    const others = live ? [...live.others.values()] : [];
    body.append(h('h2', null, '🏘️ ', L('Хамт тоглох өрөө', 'Play-together room')),
      live.status === 'online'
        ? h('div', null, h('p', { class: 'muted' }, L(`"${live.room}" өрөөнд ${others.length + 1} хүн байна. Ижил кодтой хүмүүс нэг нутагт тоглож, нэг цэцэрлэгт тарина.`, `${others.length + 1} people in room "${live.room}". Everyone with the same code shares one village and garden.`)),
          h('div', { class: 'v-chips' }, h('span', { class: 'v-chip wide active' }, '⭐ ', live.name, ` (${L('та', 'you')})`), others.map((o) => h('span', { class: 'v-chip wide' }, PET_E[o.look.pet] || '🧑', ' ', o.name, ` · ${o.lvl}`))))
        : h('div', { class: 'hint' }, live.status === 'solo'
          ? L('Одоо ганцаараа горимд байна. Найзуудтайгаа хамт тоглохын тулд багш эсвэл эцэг эх компьютер дээр "node server.js" ажиллуулж, бүгд нэг Wi-Fi-аас тэр хаягаар нэвтэрнэ.', 'You are in solo mode. To play with friends, a teacher or parent runs "node server.js" on a computer and everyone on the same Wi-Fi opens its address.')
          : L('Холбогдож байна…', 'Connecting…')),
      h('label', { class: 'label', style: { display: 'block', marginTop: '14px' } }, L('Өрөөний код (гэр бүл, ангиараа нууц код сонгоорой)', 'Room code (pick a private code for your family or class)')), input,
      h('div', { class: 'row-btns' },
        h('button', { class: 'btn', onclick: () => { const c = Array.from({ length: 5 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join(''); input.value = c; } }, '🎲 ', L('Шинэ код', 'New code')),
        h('button', { class: 'btn primary', onclick: () => join(input.value) }, L('Орох', 'Join'))),
      h('p', { class: 'privacy' }, '🔒 ', L('Зөвхөн ижил кодтой хүмүүс таныг харна. Бичгээр чатлах боломжгүй.', 'Only people with the same code can see you. There is no free-text chat.')));
    const close = TG.modal(body, { cls: 'v-modal' });
  }

  function petSheep(s) {
    const m = live.me;
    if (Math.abs(s.x - m.x) > 1 || Math.abs(s.y - m.y) > 1) return TG.toast(L('Хонь холдчихлоо 🐑', 'The sheep wandered off 🐑'));
    const v = V(); TG.sfx.chime(); floatAt({ x: s.px, y: s.py }, '❤️', '#F04438');
    const k = 'sheep' + s.i;
    if (!v.pets[k]) { v.pets[k] = 1; quest('pet'); reward(0, 2); TG.toast('🐑 ' + L('Хонь баярлалаа! +2 XP', 'The sheep is happy! +2 XP')); }
  }

  function fishing() {
    const v = V(), keys = Object.keys(R.FISH);
    const weights = keys.map((k) => R.FISH[k].w * (v.rod > 1 && R.FISH[k].diff >= 3 ? 1.8 : 1));
    let r = Math.random() * weights.reduce((a, b) => a + b, 0), key = keys[0];
    for (let i = 0; i < keys.length; i++) { r -= weights[i]; if (r <= 0) { key = keys[i]; break; } }
    const f = R.FISH[key], zoneH = v.rod > 1 ? 0.32 : 0.25, speed = [0, 0.32, 0.46, 0.6, 0.75][f.diff];
    let zone = 0.5 - zoneH / 2, vel = 0, fish = 0.5, target = 0.5, retarget = 1, prog = 0.4, holding = false, raf = 0, last = performance.now(), over = false, grace = 1.2;
    const zoneEl = h('div', { class: 'fz' }), fishEl = h('div', { class: 'ff' }, '🐟'), progEl = h('span'), bar = h('div', { class: 'fbar' }, zoneEl, fishEl);
    const holdBtn = h('button', { class: 'btn primary big block' }, L('Дарж барь', 'Press & hold'));
    const wrap = h('div', { class: 'fishing' }, h('h2', null, '🎣 ', L('Загасчлах', 'Fishing')),
      h('p', { class: 'muted' }, L('Загасыг ногоон хэсэг дотор байлга. Дарж байхад ногоон хэсэг дээшилнэ.', 'Keep the fish inside the green zone. Hold to lift the zone.')),
      h('div', { class: 'frow' }, bar, h('div', { class: 'fprog' }, progEl)), holdBtn);
    const down = (e) => { e.preventDefault(); holding = true; }, up = () => { holding = false; };
    [holdBtn, bar].forEach((el) => { el.style.touchAction = 'none'; el.addEventListener('pointerdown', down); ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => el.addEventListener(ev, up)); });
    const key2 = (e) => { if (e.code === 'Space') { e.preventDefault(); holding = e.type === 'keydown'; } };
    window.addEventListener('keydown', key2); window.addEventListener('keyup', key2);
    const cleanup = () => { over = true; cancelAnimationFrame(raf); window.removeEventListener('keydown', key2); window.removeEventListener('keyup', key2); };
    const end = (win) => {
      cleanup();
      if (!win) { TG.sfx.bad(); wrap.replaceChildren(h('div', { class: 'center' }, h('div', { class: 'v-fact-e' }, '💨'), h('h2', null, L('Загас зугтлаа!', 'The fish got away!')), h('div', { class: 'row-btns' }, h('button', { class: 'btn', onclick: () => close() }, L('Хаах', 'Close')), h('button', { class: 'btn primary', onclick: () => { close(); fishing(); } }, '🎣 ', L('Дахин', 'Again'))))); return; }
      quest('fish'); TG.sfx.win();
      if (f.release) reward(f.coins, f.xp); else { v.fish[key] = (v.fish[key] || 0) + 1; reward(0, f.xp); }
      S.save(); hud();
      wrap.replaceChildren(h('div', { class: 'center' }, h('div', { class: 'v-fact-e' }, f.e), h('div', { class: 'eyebrow' }, L('Барьлаа!', 'Caught!')), h('h2', null, tx(f.name)),
        h('div', { class: 'teach' }, h('b', null, '💡 ', L('Мэдсэн үү?', 'Did you know?')), h('p', null, tx(f.fact))),
        h('p', { class: 'muted', style: { marginTop: '10px' } }, f.release ? `🌊 ${L('Буцааж тавилаа. Байгаль хамгаалсны шагнал', 'Released! Nature-protector reward')} +${f.coins}🪙 +${f.xp} XP` : `+${f.xp} XP · ${L('Дэлгүүрт', 'Sells for')} ${f.sell}🪙`),
        h('div', { class: 'row-btns' }, h('button', { class: 'btn', onclick: () => close() }, L('Хаах', 'Close')), h('button', { class: 'btn primary', onclick: () => { close(); fishing(); } }, '🎣 ', L('Дахин', 'Again')))));
    };
    const loop = (ts) => {
      if (over) return;
      const dt = Math.min(0.05, (ts - last) / 1000); last = ts;
      vel = clamp(vel + (holding ? -2.2 : 1.5) * dt, -0.95, 0.95); zone += vel * dt;
      if (zone < 0) { zone = 0; vel = Math.abs(vel) * 0.3; }
      if (zone > 1 - zoneH) { zone = 1 - zoneH; vel = -Math.abs(vel) * 0.3; }
      retarget -= dt; if (retarget <= 0) { target = 0.06 + Math.random() * 0.88; retarget = 0.45 + Math.random() * (1.5 - f.diff * 0.22); }
      const d = target - fish; fish += Math.sign(d) * Math.min(Math.abs(d), speed * dt);
      const inside = fish >= zone && fish <= zone + zoneH;
      grace -= dt;
      prog = clamp(prog + (inside ? 0.28 : grace > 0 ? 0 : -0.13) * dt, 0, 1);
      zoneEl.style.top = zone * 100 + '%'; zoneEl.style.height = zoneH * 100 + '%'; fishEl.style.top = `calc(${fish * 100}% - 14px)`;
      zoneEl.classList.toggle('on', inside); progEl.style.height = prog * 100 + '%';
      if (prog >= 1) return end(true);
      if (prog <= 0) return end(false);
      raf = requestAnimationFrame(loop);
    };
    const close = TG.modal(wrap, { cls: 'v-modal', onClose: cleanup });
    raf = requestAnimationFrame(loop);
  }

  function tips() {
    const close = TG.modal(h('div', null, h('div', { class: 'v-fact-e' }, '🏡'), h('h2', null, L('Нутагт тавтай морил!', 'Welcome to the village!')),
      h('div', { class: 'v-list' }, [
        ['👆', L('Газар дээр дарж алх. Компьютер дээр сум эсвэл WASD товч.', 'Tap the ground to walk. On a computer use arrows or WASD.')],
        ['🌱', L('Цэцэрлэгт үр тарьж, 3 удаа усалж, ургацаа хураа. Худгаас ус аваарай.', 'Plant seeds in the garden, water 3 times, then harvest. Refill water at the well.')],
        ['🎮', L('Тоглоомын гэрт тоглож зоос, XP цуглуул. Дэлгүүрээс хувцас, тэжээвэр ав.', 'Play in the game ger to earn coins and XP. Buy clothes and pets at the shop.')],
        ['🤝', L('Нэг өрөөний найзууд нэг цэцэрлэгт хамт тарьж, бие биеийнхээ ургамлыг усална.', 'Friends in the same room share one garden and can water each other\'s plants.')],
      ].map(([e, t]) => h('div', { class: 'v-row' }, icon(e), h('div', { class: 'v-row-b' }, t)))),
      h('button', { class: 'btn primary big block', style: { marginTop: '14px' }, onclick: () => close() }, L('Эхлэх', "Let's go"))), { cls: 'v-modal', onClose: () => { const v = V(); if (v) { v.tips = true; S.save(); } } });
  }
})(window.TG);
