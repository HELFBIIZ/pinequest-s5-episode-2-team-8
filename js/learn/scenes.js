/* Animated pixel scenes for the heritage lessons (120×80 art pixels, drawn every frame). */
(function (TG) {
  const PX = TG.pixel, { R, P, ell, blob, line, K } = PX;
  const W = 120, H = 80;

  function bg(x, t) {
    R(x, 0, 0, W, 20, '#8fd0f5'); R(x, 0, 20, W, 20, '#a9dcf8'); R(x, 0, 40, W, 22, '#c6e9fb');
    blob(x, 104, 11, 5, 5, '#ffe27a', '#f7c646');
    for (let i = 0; i < 3; i++) { const cx = ((t * 3 + i * 55) % 170) - 25, cy = 8 + i * 7; ell(x, cx, cy, 7, 2, '#ffffff'); ell(x, cx + 5, cy - 1, 4, 2, '#ffffff'); }
    for (let X = 0; X < W; X++) { const top = Math.round(47 - 7 * Math.abs(Math.sin(X / 17)) - 3 * Math.sin(X / 7)); R(x, X, top, 1, 62 - top, '#86b1cf'); P(x, X, top, '#a8c9e0'); }
    for (let X = 0; X < W; X++) { const top = Math.round(55 - 3 * Math.sin(X / 11 + 1)); R(x, X, top, 1, 62 - top, '#5c9a36'); }
    R(x, 0, 60, W, 20, '#76b947');
    for (let i = 0; i < 14; i++) { const gx = (i * 37) % W, gy = 64 + (i * 13) % 14; P(x, gx, gy, '#5c9a36'); P(x, gx + 1, gy - 1, '#94d260'); }
  }
  const dog = (x, X, Y, f = 3) => x.drawImage(PX.bankhar(f), X, Y);

  // ------------------------------------------------------------ build a ger (stages 0–9)
  function ger(x, st, t) {
    bg(x, t);
    const s = st.stage || 0, q = st.sub || 0, felt = '#e8dfc8', white = '#fbfbf6', wood = '#c99257', woodD = '#8a5a33';
    if (s >= 1) { R(x, 27, 63, 66, 3, K.woodD); R(x, 28, 63, 64, 1, K.woodL); }
    if (s >= 4) { R(x, 56, 31, 2, 33, woodD); R(x, 62, 31, 2, 33, woodD); }
    if (s >= 2 && s < 6) {
      const w = s === 2 ? Math.round(60 * q) : 60;
      for (let X = 30; X < 30 + w; X += 5) { line(x, X, 63, Math.min(X + 5, 30 + w), 47, wood); line(x, X, 47, Math.min(X + 5, 30 + w), 63, wood); }
      R(x, 30, 46, w, 1, woodD); R(x, 30, 63, w, 1, woodD);
    }
    if (s >= 6) R(x, 30, 46, 60, 18, s >= 7 ? white : felt);
    if (s >= 5 && s < 6) {
      const order = [0, 8, 4, 2, 6, 1, 7, 3, 5], n = s === 5 ? Math.round(9 * q) : 9;
      for (let j = 0; j < n; j++) { const k = order[j]; line(x, Math.round(54 + 12 * k / 8), 31, Math.round(30 + 60 * k / 8), 46, '#e05a3a'); }
    }
    if (s >= 6) {
      for (let y = 31; y <= 46; y++) { const a = (y - 31) / 15, l = Math.round(54 - 24 * a), r = Math.round(66 + 24 * a); R(x, l, y, r - l, 1, s >= 7 ? white : felt); P(x, l, y, '#9a8f78'); P(x, r - 1, y, '#9a8f78'); }
      if (s >= 7) { R(x, 30, 46, 60, 2, '#3f76db'); for (let X = 31; X < 90; X += 4) P(x, X, 46, '#f7c646'); R(x, 30, 62, 60, 1, '#3f76db'); }
    }
    if (s >= 4) { R(x, 52, 28, 16, 3, K.woodD); R(x, 53, 29, 14, 1, K.gold); }
    if (s >= 3) { R(x, 54, 49, 12, 15, K.out); R(x, 55, 50, 10, 14, K.red); R(x, 56, 51, 8, 5, K.orange); R(x, 59, 51, 2, 13, K.redD); P(x, 57, 53, K.gold); P(x, 62, 53, K.gold); }
    if (s >= 8) { for (const y of [50, 55, 60]) { R(x, 30, y, 24, 1, woodD); R(x, 66, y, 24, 1, woodD); } line(x, 54, 31, 32, 46, woodD); line(x, 66, 31, 88, 46, woodD); }
    if (s >= 9) {
      R(x, 63, 20, 2, 9, '#5a5a66');
      for (let i = 0; i < 3; i++) { const ph = (t * 5 + i * 6) % 18; ell(x, 64 + Math.round(Math.sin(t + i) * 2), 19 - ph, 2, 1, `rgba(255,255,255,${0.9 - ph / 22})`); }
      if (Math.floor(t * 3) % 4 === 0) [[24, 40], [98, 36], [20, 56]].forEach(([a, b]) => P(x, a, b, '#fff7a8'));
    }
    dog(x, 94, 46, s >= 9 ? (Math.floor(t * 4) % 2 ? 0 : 3) : 3);
  }

  // ------------------------------------------------------------ dairy foods (stages 0–7)
  function cow(x) {
    blob(x, 26, 48, 11, 6, '#ffffff', K.out); blob(x, 22, 46, 3, 2, '#2b1e2e'); blob(x, 31, 50, 3, 2, '#2b1e2e');
    blob(x, 39, 42, 4, 4, '#ffffff', K.out); R(x, 41, 44, 3, 2, '#f2a0a0'); P(x, 40, 41, K.eye); P(x, 37, 37, '#d8cfba'); P(x, 42, 37, '#d8cfba');
    [17, 21, 30, 34].forEach((lx) => R(x, lx, 53, 2, 9, K.out)); R(x, 26, 54, 4, 2, '#f2a0a0');
  }
  function idee(x, st, t) {
    bg(x, t);
    const s = st.stage || 0, q = st.sub || 0;
    if (s === 0) {
      cow(x);
      R(x, 44, 52, 12, 11, K.out); R(x, 45, 53, 10, 9, '#a5a5b0'); const f = Math.round(8 * q); R(x, 45, 62 - f, 10, f, '#ffffff');
      if (q > 0 && Math.floor(t * 8) % 2) P(x, 50, 50, '#ffffff');
    } else if (s <= 5) {
      // stove + pot
      R(x, 46, 50, 28, 14, '#4a4a55'); R(x, 47, 51, 26, 2, '#6a6a77'); R(x, 66, 30, 3, 20, '#5a5a66');
      const hot = st.heat || s === 1 && (st.temp || 0) > 0.2;
      if (hot) for (let i = 0; i < 5; i++) { const fh = 2 + ((t * 9 + i * 3) % 3); R(x, 52 + i * 4, 60 - fh, 2, fh, i % 2 ? K.orange : K.gold); }
      if (s === 5) { R(x, 44, 36, 32, 14, '#3f76db'); R(x, 44, 41, 32, 2, K.gold); }
      else {
        R(x, 47, 38, 26, 12, K.out); R(x, 48, 39, 24, 10, '#c8c8d2'); R(x, 48, 39, 24, 2, '#ffffff');
        const temp = st.temp || 0;
        if (s === 1 && temp > 0.75) for (let i = 0; i < 4; i++) P(x, 50 + ((i * 7 + Math.floor(t * 6)) % 20), 38, '#ffffff');
        if (s === 1 && st.over) { R(x, 46, 36, 28, 3, '#ffffff'); R(x, 45, 39, 3, 8, '#ffffff'); R(x, 72, 39, 3, 6, '#ffffff'); }
        if (s >= 2) { const fh = s === 2 ? Math.round(4 * q) : 4; for (let i = 0; i < fh; i++) ell(x, 60, 38 - i, 11 - i * 2, 1, '#fffbe8'); }
        if (s === 2) { const ly = 18 + Math.round(Math.abs(Math.sin(t * 3)) * 10); line(x, 70, ly, 82, ly - 8, K.woodD); R(x, 66, ly, 6, 3, '#a5a5b0'); if (ly > 24) R(x, 68, ly + 3, 1, 34 - ly, '#ffffff'); }
        if (s >= 3 && s < 5) for (let i = 0; i < (s === 3 ? 3 - Math.round(3 * q) : 0); i++) ell(x, 54 + i * 6, 32 - ((t * 6 + i * 4) % 10), 1, 1, 'rgba(255,255,255,.7)');
        if (s === 4) { line(x, 64, 28, 58, 37, '#a5a5b0'); ell(x, 57, 37, 2, 1, '#fff6e0'); }
      }
      if (s === 5) { x.fillStyle = `rgba(20,24,70,${0.55 * (1 - Math.abs(q * 2 - 1))})`; x.fillRect(0, 0, W, H); if (q > 0.2 && q < 0.8) { blob(x, 20, 12, 4, 4, '#fff3c4', '#e6d8a0'); } }
    } else if (s === 6) {
      R(x, 40, 56, 40, 4, K.woodD); const sq = Math.round(5 * q);
      blob(x, 60, 50 + Math.round(sq / 2), 12, 6 - Math.round(sq / 2), '#f4efe3', '#b6a68a'); R(x, 46, 36 + sq, 28, 8, K.rock); R(x, 47, 37 + sq, 26, 2, K.rockL);
      if (q > 0 && Math.floor(t * 6) % 2) { P(x, 50, 61, K.light); P(x, 70, 62, K.light); }
    } else {
      R(x, 28, 44, 64, 3, K.woodD); R(x, 30, 47, 2, 16, K.woodD); R(x, 88, 47, 2, 16, K.woodD);
      for (let i = 0; i < 12; i++) { const ax = 32 + (i % 6) * 9, ay = 38 + Math.floor(i / 6) * 3; R(x, ax, ay, 6, 4, '#f3e6c4'); R(x, ax, ay + 3, 6, 1, '#d8c69c'); P(x, ax + 1, ay, '#ffffff'); }
      if (Math.floor(t * 2) % 2) P(x, 104, 20, '#fff7a8');
    }
    dog(x, 92, 46);
  }

  // ------------------------------------------------------------ inside the ger, from above (etiquette)
  const ZONES = { khoimor: [44, 6, 32, 15], hearth: [51, 31, 18, 18], door: [48, 64, 24, 14], west: [6, 22, 34, 36], east: [80, 22, 34, 36] };
  function zoneAt(ax, ay) {
    const d = Math.hypot(ax - 60, ay - 40);
    if (d > 39) return null;
    if (d < 9) return 'hearth';
    if (ay < 21 && Math.abs(ax - 60) < 18) return 'khoimor';
    if (ay > 62 && Math.abs(ax - 60) < 13) return 'door';
    if (ax < 48) return 'west';
    if (ax > 72) return 'east';
    return null;
  }
  function inside(x, st, t) {
    R(x, 0, 0, W, H, '#76b947');
    for (let i = 0; i < 30; i++) P(x, (i * 41) % W, (i * 23) % H, '#5c9a36');
    ell(x, 60, 40, 38, 38, K.out); ell(x, 60, 40, 37, 37, '#c99257'); ell(x, 60, 40, 34, 34, '#f4efe3');
    ell(x, 60, 40, 17, 17, '#c8483c'); ell(x, 60, 40, 14, 14, '#e9a24a'); ell(x, 60, 40, 11, 11, '#c8483c');
    R(x, 55, 35, 10, 10, K.out); R(x, 56, 36, 8, 8, '#5a5a66'); const fl = Math.floor(t * 8) % 2; R(x, 58, 38 + fl, 4, 3 - fl, K.orange); P(x, 59, 39, K.gold);
    R(x, 56, 31, 2, 2, K.woodD); R(x, 62, 31, 2, 2, K.woodD);
    R(x, 47, 8, 26, 9, K.out); R(x, 48, 9, 24, 7, K.orange); R(x, 48, 9, 24, 2, K.red); R(x, 52, 11, 4, 3, K.blue); R(x, 64, 11, 4, 3, K.blue); P(x, 60, 12, K.gold);
    R(x, 12, 32, 12, 8, K.out); R(x, 13, 33, 10, 6, K.wood); R(x, 15, 31, 6, 2, K.woodD); R(x, 12, 46, 10, 10, K.out); R(x, 13, 47, 8, 8, K.blue); R(x, 15, 49, 4, 4, K.gold);
    R(x, 96, 28, 12, 16, K.out); R(x, 97, 29, 10, 14, K.orange); R(x, 97, 35, 10, 1, K.redD); blob(x, 100, 52, 4, 3, '#a5a5b0', K.out); blob(x, 92, 58, 3, 2, '#c8483c', K.out);
    R(x, 54, 74, 12, 6, K.out); R(x, 55, 75, 10, 5, K.red); R(x, 53, 72, 14, 2, K.woodD);
    const hl = st.hl;
    if (hl && ZONES[hl]) { const [zx, zy, zw, zh] = ZONES[hl]; x.fillStyle = st.hlBad ? 'rgba(225,75,61,.45)' : `rgba(255,230,80,${0.35 + 0.2 * Math.sin(t * 6)})`; x.fillRect(zx, zy, zw, zh); }
    x.drawImage(PX.bankhar(3), 98, 62);
  }

  // ------------------------------------------------------------ Secret History story pictures
  function arrow(x, y, broken) {
    if (broken) { line(x, 25, y, 55, y + 3, K.wood); line(x, 62, y + 4, 95, y, K.wood); }
    else R(x, 25, y, 70, 1, K.wood);
    R(x, 95, y - 1, 3, 3, '#8a8a99'); P(x, 98, y, '#8a8a99'); R(x, 22, y - 1, 4, 1, K.red); R(x, 22, y + 1, 4, 1, K.red);
  }
  function story(x, st, t) {
    const ch = st.ch || 'wolf';
    if (ch === 'arrows') {
      R(x, 0, 0, W, H, '#f6dca8'); R(x, 0, 0, W, 3, '#c99257'); R(x, 0, 77, W, 3, '#c99257');
      if (st.broken) arrow(x, 16, true);
      for (let i = 0; i < 5; i++) arrow(x, 40 + i * 4, false);
      R(x, 50, 38, 3, 20, K.woodD); R(x, 68, 38, 3, 20, K.woodD);
      return;
    }
    bg(x, t);
    if (ch === 'wolf') {
      for (let X = 20; X < 100; X++) { const top = Math.round(26 + Math.abs(X - 60) * 0.7); R(x, X, top, 1, 60 - top, '#6f97b8'); if (top < 34) P(x, X, top, '#ffffff'); }
      blob(x, 40, 56, 7, 3, '#6f86a8', K.out); blob(x, 48, 52, 3, 3, '#6f86a8', K.out); P(x, 47, 48, K.out); P(x, 50, 48, K.out); P(x, 50, 52, K.eye); line(x, 33, 55, 30, 51, '#6f86a8');
      [35, 38, 42, 45].forEach((lx) => R(x, lx, 58, 1, 4, K.out));
      blob(x, 74, 56, 6, 3, '#c98a4b', K.out); blob(x, 80, 51, 2, 2, '#c98a4b', K.out); P(x, 81, 50, K.eye); P(x, 79, 48, '#8a5a33'); P(x, 82, 48, '#8a5a33');
      [70, 72, 76, 78].forEach((lx) => R(x, lx, 58, 1, 4, '#8a5a33'));
    } else if (ch === 'river') {
      for (let y = 62; y < 74; y++) { const off = Math.round(Math.sin(y / 2) * 4); R(x, 0, y, W, 1, y % 3 ? '#4aa6e2' : '#93d4f6'); P(x, (off + 60 + y * 5) % W, y, '#e6f7ff'); }
      const g = PX.gerSprite('#e8dfc8', '#e14b3d'); x.drawImage(g, 0, 0, g.width, g.height, 14, 42, 22, 22);
      const fx = (t * 20) % 140 - 10, fy = 62 - Math.round(Math.abs(Math.sin(t * 3)) * 8); ell(x, fx, fy, 3, 1, '#8fbf4a');
    } else {
      R(x, 59, 16, 2, 46, K.woodD); blob(x, 60, 15, 2, 2, K.gold, K.goldD);
      for (let i = 0; i < 9; i++) { const sw = Math.round(Math.sin(t * 3 + i) * 1.5); line(x, 60, 18, Math.round(46 + i * 3.5 + sw), 34 + (i % 3), '#ffffff'); }
      for (let i = 0; i < 26; i++) { const cx = 8 + i * 4.2, cy = 66 + (i % 3); R(x, cx, cy, 2, 4, ['#3f76db', '#e14b3d', '#2ea35f', '#9466e0', '#e9a91f'][i % 5]); R(x, cx, cy - 2, 2, 2, '#edbb93'); }
    }
  }

  TG.scenes = { bg, W, H, ger, idee, inside, story, zoneAt, ZONES };
})(window.TG);
