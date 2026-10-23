/* Guide Nomin in full (pixel art, animated in code) and the Aimag Travel Pass.
   The first four provinces on the passport route are free. Going further needs the Aimag Travel Pass (9,900₮, paid once
   by a grown-up): when a child tries, Nomin jumps in front of the road barrier, wags her finger and says "no no!". */
(function (TG) {
  const { h, L, tx } = TG;
  const S = TG.store;
  const T = (mn, en) => ({ mn, en });
  const FREE = 4, PRICE = 9900;
  const OUT = '#2b1e2e';

  // ------------------------------------------------------------ full-body Nomin (72×124, drawn every frame)
  const W = 72, H = 124;
  /** pose: 'no' (finger wag, head shake), 'yay' (hop, hands up), 'bye' (wave). talking: mouth moves. */
  function drawNomin(x, t, pose, talking) {
    const GP = TG.guidePalette, face = TG.guideFace; if (!GP || !face) return;
    x.clearRect(0, 0, W, H);
    const px = (X, Y, col) => { x.fillStyle = col; x.fillRect(Math.round(X), Math.round(Y), 1, 1); };
    const disc = (cx, cy, r, col) => { for (let Y = Math.floor(cy - r); Y <= Math.ceil(cy + r); Y++) for (let X = Math.floor(cx - r); X <= Math.ceil(cx + r); X++) if ((X + 0.5 - cx) ** 2 + (Y + 0.5 - cy) ** 2 <= r * r) px(X, Y, col); };
    const limb = (ax, ay, bx, by, r, col, outline = true) => { const n = Math.ceil(Math.hypot(bx - ax, by - ay)); for (const pass of outline ? [OUT, col] : [col]) for (let i = 0; i <= n; i++) { const q = i / (n || 1); disc(ax + (bx - ax) * q, ay + (by - ay) * q, pass === OUT ? r + 1 : r, pass); } };

    // timing: a playful rhythm, the head shakes in bursts
    const hop = pose === 'yay' ? -Math.round(Math.abs(Math.sin(t * 6)) * 7) : 0;
    const bob = Math.round(Math.sin(t * 3) * 0.8) + hop;
    const burst = (t % 1.6) < 0.9;
    const shake = pose === 'no' && burst ? Math.round(Math.sin(t * 22) * 1.6) : 0;
    const blink = (t % 3.3) > 3.15;
    const expr = pose === 'yay' ? 'laugh' : pose === 'bye' ? 'happy' : (Math.floor(t / 2.2) % 3 === 2 ? 'wink' : 'tease');
    const open = talking && Math.floor(t * 9) % 2 === 0;
    const hx = 12 + shake, hy = 2 + bob, cx = 36;

    // 1) long hair falling down her back
    for (let Y = hy + 30; Y < hy + 66; Y++) { const q = (Y - hy - 30) / 36, hw = 15.5 + Math.sin(q * Math.PI) * 1.5 - q * 3; const l = Math.round(cx - hw + shake), r = Math.round(cx + hw + shake);
      for (let X = l; X <= r; X++) px(X, Y, (X - l) % 3 === 0 ? GP.hair[0] : X < cx ? GP.hair[2] : GP.hair[1]); px(l - 1, Y, OUT); px(r + 1, Y, OUT); }
    for (let X = Math.round(cx - 12 + shake); X <= Math.round(cx + 12 + shake); X++) px(X, hy + 66 + ((X * 7) % 3 === 0 ? 1 : 0), OUT);    // wavy ends
    // 2) the deel: torso narrowing to the sash, then an A-line skirt
    const top = hy + 46, waist = hy + 70, hem = hy + 106;
    const half = (Y) => (Y < waist ? 23 - (Y - top) * (6 / (waist - top)) : 17 + (Y - waist) * (6 / (hem - waist)));
    for (let Y = top; Y <= hem + 1; Y++) {
      const hw = half(Math.min(Y, hem));
      for (let X = Math.round(cx - hw) - 1; X <= Math.round(cx + hw) + 1; X++) {
        const edge = X <= Math.round(cx - hw) - 1 || X >= Math.round(cx + hw) + 1 || Y === hem + 1;
        const rel = (X - (cx - hw)) / (2 * hw);
        px(X, Y, edge ? OUT : rel < 0.22 ? GP.deel[3] : rel < 0.62 ? GP.deel[2] : GP.deel[1]);
      }
      if (Y > waist + 4 && Y < hem - 2 && (Y - waist) % 9 === 0) for (let X = Math.round(cx - hw) + 3; X < Math.round(cx + hw) - 3; X += 7) px(X, Y, GP.deel[1]); // soft folds
    }
    for (let X = Math.round(cx - half(hem)); X <= Math.round(cx + half(hem)); X++) { px(X, hem - 1, GP.gold[1]); px(X, hem, GP.gold[2]); }   // gold hem
    // the overlap of the deel: a gold-trimmed edge from the collar across to the right, then straight down
    for (let i = 0; i < 16; i++) { px(cx + 2 + i * 0.55, top + i, GP.gold[2]); px(cx + 3 + i * 0.55, top + i, GP.gold[1]); }
    for (let Y = top + 16; Y < hem - 1; Y++) { px(cx + 11 + (Y - top - 16) * 0.12, Y, GP.gold[1]); }
    px(cx + 9, top + 10, GP.gold[2]); px(cx + 9, top + 11, GP.gold[0]);                                                  // a button
    // the sash (бүс), knotted on the side with its ends hanging down
    for (let Y = waist - 2; Y <= waist + 2; Y++) { const hw = half(Y); for (let X = Math.round(cx - hw); X <= Math.round(cx + hw); X++) px(X, Y, Y === waist - 2 ? GP.gold[2] : Y === waist + 2 ? GP.gold[0] : '#e9a91f'); }
    for (let i = 0; i < 12; i++) { const sw = Math.round(Math.sin(t * 3 + i * 0.3) * (i / 12) * 1.5); px(cx - 12 + sw, waist + 3 + i, '#e9a91f'); px(cx - 11 + sw, waist + 3 + i, GP.gold[0]); px(cx - 9 + sw, waist + 3 + i, '#e9a91f'); px(cx - 8 + sw, waist + 3 + i, GP.gold[0]); }
    // 3) Mongol boots (гутал) with upturned toes
    for (const bxx of [cx - 9, cx + 3]) {
      for (let Y = hem + 2; Y < hem + 13; Y++) for (let X = bxx; X < bxx + 7; X++) px(X, Y, Y === hem + 12 || X === bxx || X === bxx + 6 ? OUT : (X + Y) % 5 === 0 ? '#c0432c' : '#8e2b1d');
      for (let X = bxx + 1; X < bxx + 6; X++) px(X, hem + 5, GP.gold[2]);
      px(bxx - 1, hem + 10, OUT); px(bxx - 2, hem + 9, OUT); px(bxx - 1, hem + 11, '#8e2b1d');                         // the curled toe
    }
    // 4) her left arm: hand on the hip (a cheeky pose)
    const sL = [hx + 3, hy + 50];
    limb(sL[0], sL[1], 6, hy + 70, 3.6, GP.deel[2]); limb(6, hy + 70, 15, hy + 73, 3.4, GP.deel[2]);
    disc(15, hy + 73, 3.4, GP.gold[1]); disc(17, hy + 73, 2.6, OUT); disc(17, hy + 73, 1.8, GP.skin[3]);
    // 5) the head (her portrait art), with a blue khadag around the neck
    x.drawImage(face(expr, open, blink), hx, hy);
    for (const sx of [hx + 15, hx + 30]) for (let i = 0; i < 22; i++) { // the khadag: a pale-blue silk scarf hanging down both sides, with a fringe
      const wob = Math.round(Math.sin(t * 2.5 + i * 0.35 + sx) * 0.7), X = sx + wob, Y = hy + 41 + i;
      px(X - 1, Y, OUT); px(X, Y, '#ffffff'); px(X + 1, Y, '#bfe6fb'); px(X + 2, Y, i % 5 === 2 ? '#7fb8e6' : '#93d4f6'); px(X + 3, Y, OUT);
      if (i === 21) { px(X, Y + 1, '#bfe6fb'); px(X + 2, Y + 1, '#93d4f6'); px(X + 1, Y + 2, '#bfe6fb'); }
    }
    // 6) her right arm: the wagging finger (or a wave / a cheer)
    const sR = [hx + 45, hy + 50], el = [62 + (pose === 'yay' ? 3 : 0), hy + 68 - (pose === 'yay' ? 16 : 0)];
    const ang = pose === 'no' ? Math.sin(t * 11) * 0.42 : pose === 'bye' ? Math.sin(t * 6) * 0.5 : Math.sin(t * 8) * 0.15;
    const len = 18, hand = [el[0] + Math.sin(ang) * len, el[1] - Math.cos(ang) * len];
    limb(sR[0], sR[1], el[0], el[1], 3.6, GP.deel[1]); limb(el[0], el[1], hand[0], hand[1], 3.4, GP.deel[2]);
    const cuff = [el[0] + Math.sin(ang) * (len - 3), el[1] - Math.cos(ang) * (len - 3)]; disc(cuff[0], cuff[1], 3.4, GP.gold[1]);
    disc(hand[0], hand[1], 3.2, OUT); disc(hand[0], hand[1], 2.4, GP.skin[3]);
    if (pose === 'no') { // index finger up, the others curled
      for (let i = 1; i <= 7; i++) { const fx = hand[0] + Math.sin(ang) * (2 + i), fy = hand[1] - Math.cos(ang) * (2 + i); disc(fx, fy, 1.9, OUT); }
      for (let i = 1; i <= 7; i++) { const fx = hand[0] + Math.sin(ang) * (2 + i), fy = hand[1] - Math.cos(ang) * (2 + i); disc(fx, fy, 0.9, GP.skin[4]); }
    } else for (let f = -2; f <= 2; f++) { const a2 = ang + f * 0.28; for (let i = 1; i <= 4; i++) { const fx = hand[0] + Math.sin(a2) * (2 + i), fy = hand[1] - Math.cos(a2) * (2 + i); px(fx, fy, i === 4 ? OUT : GP.skin[4]); } }
    // 7) a little sparkle of mischief
    if (pose === 'no' && !burst) { const s0 = Math.floor(t * 4) % 2; px(hx + 50, hy + 8 - s0, '#f7c646'); px(hx + 49, hy + 9 - s0, '#f7c646'); px(hx + 51, hy + 9 - s0, '#f7c646'); px(hx + 50, hy + 10 - s0, '#f7c646'); }
  }
  /** A <canvas> with Nomin animating. Returns { el, set(pose), talk(on), stop() }. */
  function nominCanvas(pose = 'no', scale = 3) {
    const c = h('canvas', { class: 'nomin-full', width: W, height: H, style: { width: W * scale + 'px', height: H * scale + 'px' } }), x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    const st = { pose, talking: false, raf: 0, t0: performance.now() };
    const loop = () => { if (!c.isConnected && performance.now() - st.t0 > 500) return; drawNomin(x, (performance.now() - st.t0) / 1000, st.pose, st.talking); st.raf = requestAnimationFrame(loop); };
    loop();
    return { el: c, set: (p) => { st.pose = p; }, talk: (on) => { st.talking = on; }, stop: () => cancelAnimationFrame(st.raf) };
  }

  // ------------------------------------------------------------ the road barrier she stands in front of
  function barrier(c, up) {
    c = c || h('canvas', { class: 'nw-gate', width: 96, height: 44 }); const x = c.getContext('2d'); x.clearRect(0, 0, 96, 44);
    const R = (X, Y, w, hh, col) => { x.fillStyle = col; x.fillRect(X, Y, w, hh); };
    R(4, 14, 6, 30, OUT); R(5, 15, 4, 29, '#8a5a33'); R(86, 14, 6, 30, OUT); R(87, 15, 4, 29, '#8a5a33');   // posts
    if (!up) {
      R(2, 18, 92, 8, OUT); for (let i = 0; i < 11; i++) R(3 + i * 8.3 | 0, 19, 8, 6, i % 2 ? '#ffffff' : '#e14b3d'); // the striped bar, down
      R(36, 0, 24, 18, OUT); R(37, 1, 22, 16, '#f6dca8'); R(38, 2, 20, 1, '#ffffff');                                  // the sign with a lock
      const lock = TG.icons && TG.icons.canvas('lock'); if (lock) x.drawImage(lock, 40, 1);
    } else { R(83, 0, 8, 18, OUT); for (let i = 0; i < 3; i++) R(84, 1 + i * 6, 6, 5, i % 2 ? '#ffffff' : '#e14b3d'); } // lifted: the way is open
    return c;
  }

  // ------------------------------------------------------------ who has the pass, and which provinces it covers
  const pass = (p) => p && p.aimagPass;
  const route = () => (TG.passport ? TG.passport.ORDER : []);
  /** A province beyond the first four, not stamped before, and no pass yet. */
  function locked(p, id) {
    if (!p || pass(p)) return false;
    const i = route().indexOf(id); if (i < FREE) return false;
    return !(p.passport && p.passport.stamps && p.passport.stamps[id]);
  }
  /** Payment goes through here. A real payment provider (QPay, card) plugs in as TG.payments.charge; without one the
      purchase is recorded on this device only, after a grown-up has passed the parental gate. */
  async function charge() {
    if (TG.payments && TG.payments.charge) return TG.payments.charge({ sku: 'aimag-pass', amount: PRICE, currency: 'MNT' });
    return { ok: true, local: true };
  }
  const fmt = (n) => n.toLocaleString('en-US') + '₮';

  /** The paywall: Nomin says no-no in front of the barrier, with the pass and its price. */
  function show(id, after) {
    const a = TG.aimags && TG.aimags.byId(id), p = S.active();
    const nm = nominCanvas('no', 2), say = h('div', { class: 'nw-say', 'aria-live': 'polite' });
    const talk = (text) => { nm.talk(true); say.textContent = ''; const done = TG.voice ? TG.voice.type(say, TG.tx(text), 'guide') : (say.textContent = TG.tx(text), { done: Promise.resolve() }); Promise.resolve(done && done.done).then(() => nm.talk(false)); };
    const land = TG.passport && TG.passport.landCanvas ? TG.passport.landCanvas(id, 'nw-land', 160, 80) : h('div', { class: 'nw-land' });
    const gate = barrier(), stage = h('div', { class: 'nw-stage' }, land, gate, h('div', { class: 'nw-girl' }, nm.el), say);
    const stamps = p && p.passport ? Object.keys(p.passport.stamps || {}).length : 0, left = route().length - FREE;
    const buy = h('button', { class: 'btn primary big block nw-buy' }, L(`Том хүнээс зөвшөөрөл авах · ${fmt(PRICE)}`, `Ask a grown-up · ${fmt(PRICE)}`));
    const later = h('button', { class: 'btn ghost block' }, L('Дараа', 'Maybe later'));
    const card = h('div', { class: 'nw-card' },
      h('div', { class: 'nw-ticket' }, h('div', null, h('small', null, L('Аймгийн аяллын эрх', 'Aimag Travel Pass')), h('b', null, fmt(PRICE)), h('small', null, L('нэг удаа төлнө', 'one-time'))), h('span', { class: 'nw-stamp' }, '🛂')),
      h('ul', { class: 'nw-perks' },
        h('li', null, '🗺️ ', L(`Үлдсэн ${left} аймаг бүгд нээгдэнэ`, `Opens all ${left} remaining provinces`)),
        h('li', null, '👁 ', L('Аймаг бүрээр 3D-ээр аялна', 'Travel every province in 3D')),
        h('li', null, '🛂 ', L('Тамга бүрээр зоос, оноо', 'Coins and XP for every stamp')),
        h('li', null, '💛 ', L('Нэг худалдан авалт = хөдөөгийн нэг хүүхдэд үнэгүй эрх', 'Each pass = a free pass for one rural child'))),
      buy, later);
    const close = TG.modal(h('div', { class: 'nomin-wall' }, h('h2', null, a ? L(`${tx(a.name)} руу явах уу?`, `Off to ${tx(a.name)}?`) : L('Цааш аялах уу?', 'Travel further?')), stage, card),
      { cls: 'nw-modal', onClose: () => nm.stop() });
    TG.sfx.pop && TG.sfx.pop();
    talk(T(`Үгүй ээ, үгүй, үгүй! Чи ${stamps} аймгаар аялчихлаа, гоё байна! Харин цааш явахын тулд Аймгийн аяллын эрх хэрэгтэй шүү.`, `Nuh-uh, no no no! You’ve travelled ${stamps} provinces, amazing! But to go further you need the Aimag Travel Pass.`));
    later.addEventListener('click', () => { nm.set('bye'); talk(T('За за, дараа уулзъя! Би энд хүлээж байна.', 'Okay okay, see you later! I’ll wait right here.')); later.disabled = true; buy.disabled = true; setTimeout(close, 1500); });
    buy.addEventListener('click', () => TG.parentGate(() => confirm()));
    function confirm() {
      const pay = h('button', { class: 'btn primary big block' }, L(`${fmt(PRICE)} төлөх`, `Pay ${fmt(PRICE)}`));
      const no = h('button', { class: 'btn ghost block' }, L('Болих', 'Cancel'));
      const closeC = TG.modal(h('div', { class: 'nw-confirm' }, h('h2', null, L('Аймгийн аяллын эрх', 'Aimag Travel Pass')),
        h('p', null, L(`${p.name}-д бүх аймгаар аялах эрх нээгдэнэ. Нэг удаагийн төлбөр: ${fmt(PRICE)}.`, `Unlocks every province for ${p.name}. One-time payment: ${fmt(PRICE)}.`)), pay, no), { cls: 'v-modal' });
      no.addEventListener('click', () => closeC());
      pay.addEventListener('click', async () => {
        pay.disabled = true;
        let r; try { r = await charge(); } catch (e) { r = { ok: false }; }
        closeC();
        if (!r || !r.ok) { TG.toast(L('Төлбөр амжилтгүй боллоо. Дахин оролдоорой.', 'The payment did not go through. Please try again.')); return; }
        p.aimagPass = { at: Date.now(), amount: PRICE, currency: 'MNT', ref: r.ref || null, local: !!r.local }; S.save();
        S.logActivity && S.logActivity({ kind: 'pass', id: 'aimag' });
        celebrate();
      });
    }
    function celebrate() {
      nm.set('yay'); barrier(gate, true); TG.confetti(80); TG.sfx.win && TG.sfx.win();
      talk(T('Ура! Одоо бүх Монголоороо аялна! Явцгаая!', 'Hooray! Now you can travel all of Mongolia! Let’s go!'));
      card.replaceChildren(h('button', { class: 'btn primary big block', onclick: () => { close(); if (after) after(); else TG.go('aimag', { id }); } }, '🚌 ', a ? L(`${tx(a.name)} руу аялах`, `Travel to ${tx(a.name)}`) : L('Аялах', 'Travel')));
    }
  }
  /** Run go() if the province is open, otherwise show the paywall (and run go() after a purchase). */
  function guard(id, go) { const p = S.active(); if (locked(p, id)) { show(id, go); return false; } go(); return true; }

  TG.nomin = { drawNomin, nominCanvas, W, H };
  TG.aimagPass = { FREE, PRICE, locked, show, guard, has: (p) => !!pass(p || S.active()), price: () => fmt(PRICE) };
})(window.TG);
