/* Нутаг world: map layout, collision, path finding and all drawing (pure code, no image files). */
(function (TG) {
  const R = TG.vrules, W = R.W, H = R.H, T = 32;
  let seed = 20261021;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const hash = (x, y) => { let n = x * 374761393 + y * 668265263; n = (n ^ (n >> 13)) * 1274126177; return ((n ^ (n >> 16)) >>> 0) / 4294967295; };

  // ---------------------------------------------------------------- map
  // g grass · p path · s plaza · w water · d dock · o soil (garden plot) · f fence · T tree · B building · r rock
  const g = Array.from({ length: H }, () => Array(W).fill('g'));
  const set = (x, y, c) => { if (x >= 0 && y >= 0 && x < W && y < H) g[y][x] = c; };
  const rect = (x0, y0, x1, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, c); };
  for (let x = 0; x < W; x++) { set(x, 0, 'T'); set(x, 1, 'T'); set(x, H - 1, 'T'); }
  for (let y = 0; y < H; y++) { set(0, y, 'T'); set(W - 1, y, 'T'); }
  for (let y = 2; y < H - 1; y++) for (let x = 1; x < W - 1; x++) if (((x + 0.5 - 30) / 4.6) ** 2 + ((y + 0.5 - 5.5) / 3.3) ** 2 <= 1) set(x, y, 'w');
  rect(1, 12, W - 2, 13, 'p'); rect(17, 2, 18, H - 2, 'p');
  rect(15, 10, 20, 15, 's');
  rect(19, 5, 24, 5, 'p'); rect(25, 5, 26, 5, 'd');
  rect(4, 6, 4, 11, 'p'); rect(11, 6, 11, 11, 'p'); rect(22, 11, 23, 11, 'p');
  // garden (fenced) with 24 shared plots
  for (let x = 3; x <= 14; x++) { set(x, 15, 'f'); set(x, 23, 'f'); }
  for (let y = 15; y <= 23; y++) { set(3, y, 'f'); set(14, y, 'f'); }
  rect(9, 14, 10, 15, 'p');
  const plots = [];
  for (const y of [17, 18, 20, 21]) for (let x = 5; x <= 10; x++) { set(x, y, 'o'); plots.push({ x, y }); }
  // sheep pasture
  for (let x = 22; x <= 33; x++) { set(x, 18, 'f'); set(x, 24, 'f'); }
  for (let y = 18; y <= 24; y++) { set(22, y, 'f'); set(33, y, 'f'); }
  rect(27, 14, 27, 18, 'p');

  const objects = [
    { id: 'home', kind: 'ger', x: 3, y: 3, w: 3, h: 3, door: { x: 4, y: 6 }, accent: '#2F6BFF', sign: '🏠' },
    { id: 'arcade', kind: 'ger', x: 10, y: 3, w: 3, h: 3, door: { x: 11, y: 6 }, accent: '#7A5AF8', sign: '🎮' },
    { id: 'shop', kind: 'shop', x: 21, y: 8, w: 4, h: 3, door: { x: 22, y: 11 } },
    { id: 'board', kind: 'board', x: 19, y: 10, w: 2, h: 1, door: { x: 19, y: 11 } },
    { id: 'well', kind: 'well', x: 12, y: 17, w: 1, h: 1, door: { x: 12, y: 18 } },
    { id: 'lantern1', kind: 'lantern', x: 15, y: 10, w: 1, h: 1 },
    { id: 'lantern2', kind: 'lantern', x: 15, y: 15, w: 1, h: 1 },
    { id: 'lantern3', kind: 'lantern', x: 20, y: 15, w: 1, h: 1 },
  ];
  const occ = {};
  for (const o of objects) for (let y = o.y; y < o.y + o.h; y++) for (let x = o.x; x < o.x + o.w; x++) { set(x, y, 'B'); occ[x + ',' + y] = o; }
  const DOCK = { x: 26, y: 5 };

  // trees, flowers, rocks
  const trees = [], flowers = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (g[y][x] === 'T') trees.push({ x, y, pine: hash(x, y) > 0.7 });
  const clearAround = (x, y) => { for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const c = (g[y + dy] || [])[x + dx]; if (c && c !== 'g' && c !== 'T') return false; } return true; };
  const reserved = (x, y) => (x >= 13 && x <= 22 && y >= 9 && y <= 16) || (y >= 2 && y <= 7 && x >= 2 && x <= 14) || (x >= 22 && x <= 33 && y >= 18) || (x >= 3 && x <= 14 && y >= 14);
  for (let y = 2; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    if (g[y][x] !== 'g' || reserved(x, y) || !clearAround(x, y)) continue;
    const r = rnd();
    if (r < 0.1) { set(x, y, 'T'); trees.push({ x, y, pine: rnd() > 0.6 }); }
    else if (r < 0.13) set(x, y, 'r');
  }
  for (let y = 2; y < H - 1; y++) for (let x = 1; x < W - 1; x++) if (g[y][x] === 'g' && hash(x * 3, y * 7) < 0.09) flowers.push({ x, y, c: ['#FF8FB1', '#FFD34E', '#FFFFFF', '#B49CFF'][Math.floor(hash(x, y * 5) * 4)] });

  const blocked = (x, y) => x < 0 || y < 0 || x >= W || y >= H || 'TwfBr'.includes(g[y][x]);
  const plotAt = (x, y) => plots.findIndex((p) => p.x === x && p.y === y);

  /** Breadth-first path on the tile grid (4 directions). Returns tiles after the start, or null. */
  function findPath(sx, sy, tx, ty) {
    if (blocked(tx, ty)) return null;
    if (sx === tx && sy === ty) return [];
    const prev = new Map([[sx + ',' + sy, null]]), q = [[sx, sy]];
    while (q.length) {
      const [x, y] = q.shift();
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
        if (prev.has(k) || blocked(nx, ny)) continue;
        prev.set(k, x + ',' + y);
        if (nx === tx && ny === ty) {
          const path = []; let c = k;
          while (c && c !== sx + ',' + sy) { const [px, py] = c.split(',').map(Number); path.unshift({ x: px, y: py }); c = prev.get(c); }
          return path;
        }
        q.push([nx, ny]);
      }
    }
    return null;
  }
  /** Nearest walkable tile next to (x,y), preferring ones close to (fx,fy). */
  function nearestOpen(x, y, fx, fy) {
    let best = null, bd = 1e9;
    for (let r = 1; r <= 3 && !best; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      const nx = x + dx, ny = y + dy;
      if (blocked(nx, ny)) continue;
      const d = Math.abs(nx - fx) + Math.abs(ny - fy) + Math.abs(dx) + Math.abs(dy) * 1.01;
      if (d < bd) { bd = d; best = { x: nx, y: ny }; }
    }
    return best;
  }

  // ---------------------------------------------------------------- drawing helpers
  const C = { grass1: '#A6DA7B', grass2: '#9BD170', blade: '#86BF5D', path: '#EAD5A8', pathEdge: '#D8BC88', plaza: '#F0E4C8', plazaLine: '#E2D1AC',
    water: '#5DB7E9', waterDeep: '#4AA6DD', rim: '#EAD9AA', soil: '#A3734B', furrow: '#8A5D3B', wood: '#B88452', woodDark: '#8F6237' };
  const rr = (ctx, x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); };
  const circle = (ctx, x, y, r, fill) => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill(); };
  const at = (x, y) => (g[y] || [])[x];

  function tile(ctx, x, y) {
    const c = g[y][x], X = x * T, Y = y * T;
    const base = (col) => { ctx.fillStyle = col; ctx.fillRect(X, Y, T, T); };
    const grass = () => {
      base(hash(x, y) > 0.5 ? C.grass1 : C.grass2);
      ctx.strokeStyle = C.blade; ctx.lineWidth = 1.2;
      for (let i = 0; i < 3; i++) { const bx = X + 4 + hash(x + i, y) * 24, by = Y + 6 + hash(x, y + i) * 22; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + 1.5, by - 4); ctx.stroke(); }
    };
    if (c === 'g' || c === 'T' || c === 'r') grass();
    if (c === 'B') (occ[x + ',' + y] && occ[x + ',' + y].kind === 'board') || (x >= 15 && x <= 20 && y >= 10 && y <= 15) ? base(C.plaza) : grass();
    if (c === 'r') { circle(ctx, X + 16, Y + 19, 9, '#A9AEB8'); circle(ctx, X + 13, Y + 16, 5, '#C4C9D2'); }
    if (c === 'p') {
      base(C.path);
      ctx.fillStyle = C.pathEdge;
      const edge = (n) => !'psdB'.includes(n || 'g');
      if (edge(at(x, y - 1))) ctx.fillRect(X, Y, T, 2);
      if (edge(at(x, y + 1))) ctx.fillRect(X, Y + T - 2, T, 2);
      if (edge(at(x - 1, y))) ctx.fillRect(X, Y, 2, T);
      if (edge(at(x + 1, y))) ctx.fillRect(X + T - 2, Y, 2, T);
      for (let i = 0; i < 2; i++) circle(ctx, X + 6 + hash(x, y + i * 9) * 20, Y + 6 + hash(x + i * 5, y) * 20, 1.4, '#CDB283');
    }
    if (c === 's') { base(C.plaza); ctx.strokeStyle = C.plazaLine; ctx.lineWidth = 1; ctx.strokeRect(X + 0.5, Y + 0.5, 15, 15); ctx.strokeRect(X + 16.5, Y + 16.5, 15, 15); ctx.strokeRect(X + 16.5, Y + 0.5, 15, 15); ctx.strokeRect(X + 0.5, Y + 16.5, 15, 15); }
    if (c === 'w' || c === 'd') {
      base(hash(x, y) > 0.5 ? C.water : C.waterDeep);
      ctx.fillStyle = C.rim;
      const land = (n) => n && n !== 'w' && n !== 'd';
      if (land(at(x, y - 1))) ctx.fillRect(X, Y, T, 4);
      if (land(at(x, y + 1))) ctx.fillRect(X, Y + T - 4, T, 4);
      if (land(at(x - 1, y))) ctx.fillRect(X, Y, 4, T);
      if (land(at(x + 1, y))) ctx.fillRect(X + T - 4, Y, 4, T);
    }
    if (c === 'd') {
      ctx.fillStyle = C.wood; ctx.fillRect(X, Y + 6, T, 20);
      ctx.strokeStyle = C.woodDark; ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(X + i * 8, Y + 6); ctx.lineTo(X + i * 8, Y + 26); ctx.stroke(); }
      ctx.fillStyle = C.woodDark; ctx.fillRect(X + 2, Y + 24, 4, 6); ctx.fillRect(X + T - 6, Y + 24, 4, 6);
    }
    if (c === 'o') {
      base(C.soil);
      ctx.fillStyle = C.furrow;
      for (let i = 0; i < 3; i++) ctx.fillRect(X + 3, Y + 6 + i * 9, T - 6, 3);
      ctx.strokeStyle = 'rgba(0,0,0,.12)'; ctx.strokeRect(X + 0.5, Y + 0.5, T - 1, T - 1);
    }
    if (c === 'f') {
      grass();
      const fence = (n) => n === 'f';
      ctx.fillStyle = C.wood;
      if (fence(at(x - 1, y)) || fence(at(x + 1, y))) { ctx.fillRect(fence(at(x - 1, y)) ? X : X + 13, Y + 12, fence(at(x + 1, y)) ? (fence(at(x - 1, y)) ? T : T - 13) : 19, 3); ctx.fillRect(fence(at(x - 1, y)) ? X : X + 13, Y + 20, fence(at(x + 1, y)) ? (fence(at(x - 1, y)) ? T : T - 13) : 19, 3); }
      if (fence(at(x, y - 1)) || fence(at(x, y + 1))) { ctx.fillRect(X + 12, fence(at(x, y - 1)) ? Y : Y + 10, 3, fence(at(x, y + 1)) ? (fence(at(x, y - 1)) ? T : T - 10) : 18); ctx.fillRect(X + 18, fence(at(x, y - 1)) ? Y : Y + 10, 3, fence(at(x, y + 1)) ? (fence(at(x, y - 1)) ? T : T - 10) : 18); }
      ctx.fillStyle = C.woodDark; rr(ctx, X + 11, Y + 8, 10, 18, 2); ctx.fill();
    }
  }

  function tree(ctx, t) {
    const X = t.x * T, Y = t.y * T;
    ctx.fillStyle = 'rgba(0,0,0,.14)'; ctx.beginPath(); ctx.ellipse(X + 16, Y + 28, 13, 4.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#8B5A2B'; ctx.fillRect(X + 13, Y + 15, 6, 13);
    if (t.pine) {
      ctx.fillStyle = '#2F7D4E';
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(X + 16, Y - 6 + i * 7); ctx.lineTo(X + 3 + i, Y + 12 + i * 5); ctx.lineTo(X + 29 - i, Y + 12 + i * 5); ctx.closePath(); ctx.fill(); }
      ctx.fillStyle = '#3E9561'; ctx.beginPath(); ctx.moveTo(X + 16, Y - 6); ctx.lineTo(X + 10, Y + 6); ctx.lineTo(X + 16, Y + 4); ctx.closePath(); ctx.fill();
    } else {
      circle(ctx, X + 16, Y + 6, 13, '#3F8F3A'); circle(ctx, X + 8, Y + 12, 9, '#47993F'); circle(ctx, X + 24, Y + 12, 9, '#47993F');
      circle(ctx, X + 12, Y + 2, 6, '#5FB24E');
    }
  }

  function ger(ctx, o) {
    const X = o.x * T, Y = o.y * T;
    ctx.fillStyle = 'rgba(0,0,0,.15)'; ctx.beginPath(); ctx.ellipse(X + 48, Y + 92, 46, 8, 0, 0, Math.PI * 2); ctx.fill();
    rr(ctx, X + 6, Y + 46, 84, 44, 6); ctx.fillStyle = '#FBF8F1'; ctx.fill(); ctx.strokeStyle = '#D8CFBF'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = o.accent; ctx.fillRect(X + 6, Y + 54, 84, 6);
    ctx.fillStyle = '#FFFFFF'; for (let i = 0; i < 10; i++) ctx.fillRect(X + 10 + i * 8, Y + 56, 3, 2);
    ctx.beginPath(); ctx.moveTo(X + 1, Y + 50); ctx.quadraticCurveTo(X + 48, Y - 6, X + 95, Y + 50); ctx.closePath();
    ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.strokeStyle = '#D8CFBF'; ctx.stroke();
    ctx.strokeStyle = o.accent; ctx.globalAlpha = 0.45; ctx.lineWidth = 2;
    for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(X + 48, Y + 16); ctx.lineTo(X + 48 + i * 15, Y + 47); ctx.stroke(); }
    ctx.globalAlpha = 1;
    circle(ctx, X + 48, Y + 18, 7, '#F2B24A'); ctx.strokeStyle = '#9A5B25'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(X + 48, Y + 18, 7, 0, Math.PI * 2); ctx.stroke();
    rr(ctx, X + 39, Y + 62, 18, 28, 2); ctx.fillStyle = '#E8453C'; ctx.fill();
    ctx.strokeStyle = '#FDB022'; ctx.lineWidth = 1.5; ctx.strokeRect(X + 42, Y + 65, 12, 22);
    ctx.font = '14px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(o.sign, X + 72, Y + 74);
  }

  function shop(ctx, o) {
    const X = o.x * T, Y = o.y * T;
    ctx.fillStyle = 'rgba(0,0,0,.15)'; ctx.beginPath(); ctx.ellipse(X + 64, Y + 92, 62, 8, 0, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 10; i++) { ctx.fillStyle = i % 2 ? '#FFFFFF' : '#2F6BFF'; ctx.fillRect(X + 4 + i * 12, Y + 36, 12, 54); }
    ctx.beginPath(); ctx.moveTo(X - 2, Y + 40); ctx.lineTo(X + 64, Y + 4); ctx.lineTo(X + 130, Y + 40); ctx.closePath(); ctx.fillStyle = '#E8453C'; ctx.fill();
    ctx.fillStyle = '#C4291E'; for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.moveTo(X - 2 + i * 16.5, Y + 40); ctx.lineTo(X + 6 + i * 16.5, Y + 47); ctx.lineTo(X + 14.5 + i * 16.5, Y + 40); ctx.fill(); }
    ['#FDB022', '#12B76A', '#2F6BFF'].forEach((col, i) => { const fx = [X + 64, X + 4, X + 124][i], fy = [Y + 4, Y + 38, Y + 38][i]; ctx.fillStyle = '#6B4A2E'; ctx.fillRect(fx - 1, fy - 14, 2, 14); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(fx + 1, fy - 14); ctx.lineTo(fx + 11, fy - 10); ctx.lineTo(fx + 1, fy - 6); ctx.fill(); });
    rr(ctx, X + 18, Y + 70, 92, 22, 4); ctx.fillStyle = C.wood; ctx.fill();
    rr(ctx, X + 34, Y + 50, 60, 16, 4); ctx.fillStyle = '#FFF3D6'; ctx.fill();
    ctx.fillStyle = '#7A4B00'; ctx.font = 'bold 10px Rubik, Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(TG.L('ДЭЛГҮҮР', 'SHOP'), X + 64, Y + 58.5);
    ctx.font = '12px serif'; ['🥕', '🍅', '🎩', '🧣', '🐑'].forEach((e, i) => ctx.fillText(e, X + 32 + i * 16, Y + 80));
  }

  function board(ctx, o) {
    const X = o.x * T, Y = o.y * T;
    ctx.fillStyle = C.woodDark; ctx.fillRect(X + 8, Y + 4, 4, 26); ctx.fillRect(X + 52, Y + 4, 4, 26);
    rr(ctx, X + 2, Y - 10, 60, 30, 3); ctx.fillStyle = C.wood; ctx.fill(); ctx.strokeStyle = C.woodDark; ctx.lineWidth = 2; ctx.stroke();
    [[8, -6], [24, -4], [40, -7]].forEach(([dx, dy], i) => { ctx.fillStyle = '#FFFDF6'; ctx.fillRect(X + dx, Y + dy, 13, 16); ctx.fillStyle = ['#F04438', '#2F6BFF', '#12B76A'][i]; circle(ctx, X + dx + 6.5, Y + dy + 2, 1.8, ctx.fillStyle); ctx.fillStyle = '#C9C2B2'; ctx.fillRect(X + dx + 2, Y + dy + 7, 9, 1.5); ctx.fillRect(X + dx + 2, Y + dy + 11, 7, 1.5); });
  }

  function well(ctx, o) {
    const X = o.x * T, Y = o.y * T;
    circle(ctx, X + 16, Y + 20, 13, '#A6ADB8'); circle(ctx, X + 16, Y + 20, 9, '#4AA6DD');
    ctx.fillStyle = C.woodDark; ctx.fillRect(X + 3, Y - 4, 3, 24); ctx.fillRect(X + 26, Y - 4, 3, 24);
    ctx.beginPath(); ctx.moveTo(X - 1, Y - 2); ctx.lineTo(X + 16, Y - 12); ctx.lineTo(X + 33, Y - 2); ctx.closePath(); ctx.fillStyle = '#E8453C'; ctx.fill();
  }

  function lantern(ctx, o) {
    const X = o.x * T, Y = o.y * T;
    ctx.fillStyle = '#4A3B30'; ctx.fillRect(X + 15, Y - 2, 3, 30);
    rr(ctx, X + 10, Y - 10, 13, 12, 3); ctx.fillStyle = '#FDB022'; ctx.fill(); ctx.strokeStyle = '#4A3B30'; ctx.lineWidth = 1.5; ctx.stroke();
  }

  /** Pre-render the static world (ground, trees, buildings) once at the given pixel ratio. */
  function renderStatic(res) {
    const cv = document.createElement('canvas');
    cv.width = Math.ceil(W * T * res); cv.height = Math.ceil(H * T * res);
    const ctx = cv.getContext('2d'); ctx.scale(res, res);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) tile(ctx, x, y);
    for (const f of flowers) { const X = f.x * T + 8 + hash(f.x, f.y) * 14, Y = f.y * T + 10 + hash(f.y, f.x) * 12; for (let i = 0; i < 5; i++) circle(ctx, X + Math.cos(i * 1.256) * 2.4, Y + Math.sin(i * 1.256) * 2.4, 1.8, f.c); circle(ctx, X, Y, 1.4, '#FDB022'); }
    const draws = [...trees.map((t) => ({ y: t.y, f: () => tree(ctx, t) })),
      ...objects.map((o) => ({ y: o.y + o.h - 1, f: () => ({ ger, shop, board, well, lantern })[o.kind](ctx, o) }))];
    draws.sort((a, b) => a.y - b.y).forEach((d) => d.f());
    return cv;
  }

  TG.vworld = { W, H, T, g, plots, objects, occ, trees, DOCK, blocked, plotAt, findPath, nearestOpen, renderStatic, hash, circle, rr, C };
})(window.TG);
