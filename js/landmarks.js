/* Аймгийн үзвэрүүд: pixel-art sprites of each province's real landmarks (Turtle Rock in Terelj, the Chinggis Khaan
   statue, Erdene Zuu, Khövsgöl...). Every sprite fits a 64×48 box whose ground line is y = 46. */
(function (TG) {
  const OUT = '#2b1e2e';
  // which sprite each of a province's three landmarks uses (same order as TG.passport.J[id].marks)
  const KIND = {
    ub: ['palace', 'temple', 'gate'], tuv: ['statue', 'takhi', 'turtle'], khentii: ['sacredmtn', 'birthplace', 'lake'],
    dornod: ['lake', 'river', 'gazelle'], sukhbaatar: ['sacredmtn', 'swans', 'stupahill'], dornogovi: ['temple', 'stupas', 'train'],
    govisumber: ['train', 'rocks', 'mine'], dundgovi: ['cliffWhite', 'rocks', 'cave'], umnugovi: ['dunes', 'gorge', 'cliffRed'],
    bayankhongor: ['sacredmtn', 'lake', 'cave'], uvurkhangai: ['stoneturtle', 'stupawall', 'waterfall'], arkhangai: ['volcano', 'lake', 'bigrock'],
    bulgan: ['volcano', 'sacredmtn', 'ruins'], orkhon: ['city', 'mine', 'river'], darkhanuul: ['city', 'factory', 'fields'],
    selenge: ['temple', 'river', 'fort'], khuvsgul: ['lake', 'urts', 'deerstone'], zavkhan: ['snowpeak', 'dunes', 'fort'],
    govialtai: ['camel', 'sacredmtn', 'city'], khovd: ['lake', 'cave', 'fort'], bayanolgii: ['snowpeak', 'rockart', 'eagle'],
    uvs: ['lake', 'swans', 'snowpeak'],
  };
  const D = {};
  const P_ = () => TG.pixel;
  const hill = (x, X, Y, w, hgt, col, top) => { const { R, P } = P_(); for (let i = 0; i < w; i++) { const t = (i / (w - 1)) * 2 - 1, hh = Math.round(hgt * (1 - t * t)); P(x, X + i, Y - hh - 1, OUT); R(x, X + i, Y - hh, 1, hh, top && i % 3 === 0 ? top : col); } };
  const flag = (x, fx, fy, cols) => { const { R } = P_(); R(x, fx, fy, 1, 10, '#6b4220'); cols.forEach((c, i) => R(x, fx + 1, fy + i * 2, 6, 2, c)); };
  const khadag = (x, fx, fy) => { const { R, line } = P_(); R(x, fx, fy, 1, 9, '#6b4220'); line(x, fx, fy + 1, fx + 6, fy + 5, '#5a86d6'); line(x, fx, fy + 2, fx - 5, fy + 6, '#8fd0ff'); line(x, fx, fy + 3, fx + 4, fy + 8, '#ffffff'); };
  const stupa = (x, sx, by, s = 1) => { const { R, ell } = P_(); R(x, sx - 4 * s, by - 3 * s, 8 * s + 1, 3 * s, OUT); R(x, sx - 3 * s, by - 3 * s, 6 * s + 1, 2 * s, '#f6f2e9'); ell(x, sx, by - 6 * s, 3 * s, 3 * s, OUT); ell(x, sx, by - 6 * s, 2 * s, 2 * s, '#ffffff'); R(x, sx, by - 12 * s, 1, 4 * s, '#c98f22'); R(x, sx - 1, by - 13 * s, 3, 1, '#f7c646'); };
  const tree = (x, tx, by) => { const { R } = P_(); R(x, tx, by - 4, 2, 4, '#6b4220'); for (let r = 0; r < 8; r++) R(x, tx + 1 - Math.round(r / 2) - 1, by - 12 + r, Math.round(r / 2) * 2 + 2, 1, r < 2 ? '#5aaa6e' : '#2c6a44'); };

  D.palace = (x, X, Y) => { const { R, P } = P_(); // Government Palace with the seated Chinggis Khaan
    R(x, X + 2, Y + 42, 60, 5, OUT); R(x, X + 3, Y + 43, 58, 3, '#d9cdb5');
    R(x, X + 4, Y + 18, 56, 25, OUT); R(x, X + 5, Y + 19, 54, 23, '#e8e0d0'); R(x, X + 14, Y + 10, 36, 9, OUT); R(x, X + 15, Y + 11, 34, 8, '#d9d0bd');
    for (let i = 0; i < 9; i++) { R(x, X + 8 + i * 6, Y + 22, 2, 20, '#ffffff'); R(x, X + 9 + i * 6, Y + 22, 1, 20, '#c9c1ad'); }
    R(x, X + 3, Y + 17, 58, 3, '#b6a68a'); flag(x, X + 31, Y, ['#c4272f', '#0066b3', '#c4272f']);
    R(x, X + 26, Y + 32, 12, 11, OUT); R(x, X + 27, Y + 33, 10, 9, '#a5a5b0'); R(x, X + 29, Y + 26, 6, 7, '#5a4a3a'); R(x, X + 30, Y + 23, 4, 4, '#5a4a3a'); P(x, X + 31, Y + 22, '#5a4a3a');
  };
  D.temple = (x, X, Y) => { const { R, P } = P_(); // a monastery hall: white walls, dark red frieze, golden roof with green tiles
    R(x, X + 6, Y + 40, 52, 6, OUT); R(x, X + 7, Y + 41, 50, 4, '#d9cdb5');
    R(x, X + 9, Y + 20, 46, 21, OUT); R(x, X + 10, Y + 21, 44, 19, '#f6f2e9'); R(x, X + 10, Y + 21, 44, 4, '#7a2a20');
    for (const wx of [14, 44]) { R(x, X + wx, Y + 28, 6, 8, OUT); R(x, X + wx + 1, Y + 29, 4, 6, '#3a2a1e'); }
    R(x, X + 27, Y + 28, 10, 13, OUT); R(x, X + 28, Y + 29, 8, 12, '#c2302a'); P(x, X + 30, Y + 34, '#f7c646'); P(x, X + 33, Y + 34, '#f7c646');
    for (let i = 0; i < 52; i++) { const lift = i < 3 ? 3 - i : i > 48 ? i - 48 : 0, top = Y + 12 + Math.abs(i - 26) / 6 | 0; R(x, X + 6 + i, top - lift, 1, Y + 20 - top, i % 3 ? '#46a077' : '#2f7d5b'); P(x, X + 6 + i, Y + 19 - lift, '#f7c646'); }
    R(x, X + 18, Y + 4, 28, 9, OUT); R(x, X + 19, Y + 5, 26, 7, '#f7c646'); R(x, X + 19, Y + 9, 26, 1, '#c98f22'); R(x, X + 31, Y - 2, 2, 7, '#f7c646'); R(x, X + 30, Y - 3, 4, 2, '#c98f22');
  };
  D.gate = (x, X, Y) => { const { R } = P_(); // the painted wooden palace gate
    R(x, X + 10, Y + 20, 44, 26, OUT); for (const px of [12, 22, 40, 50]) { R(x, X + px, Y + 20, 3, 26, '#a8312a'); R(x, X + px, Y + 20, 1, 26, '#e14b3d'); }
    R(x, X + 25, Y + 26, 14, 20, '#3a2a1e'); R(x, X + 26, Y + 27, 12, 19, '#c2302a');
    for (const [rx, ry, w] of [[4, 14, 56], [14, 6, 36]]) { R(x, X + rx, Y + ry, w, 7, OUT); R(x, X + rx + 1, Y + ry + 1, w - 2, 4, '#2f7d5b'); R(x, X + rx + 1, Y + ry + 5, w - 2, 1, '#f7c646'); R(x, X + rx - 2, Y + ry - 2, 3, 3, '#2f7d5b'); R(x, X + rx + w - 1, Y + ry - 2, 3, 3, '#2f7d5b'); }
    R(x, X + 12, Y + 13, 40, 2, '#5a86d6');
  };
  D.statue = (x, X, Y) => { const { R, P, ell, blob } = P_(); // the 40 m silver Chinggis Khaan on horseback at Tsonjin Boldog
    ell(x, X + 32, Y + 42, 22, 5, OUT); ell(x, X + 32, Y + 41, 21, 4, '#d9cdb5'); R(x, X + 14, Y + 30, 36, 12, OUT); R(x, X + 15, Y + 31, 34, 10, '#ece3d0'); for (let i = 0; i < 6; i++) R(x, X + 18 + i * 5, Y + 33, 2, 6, '#b6a68a');
    const S = '#c9ccd6', SD = '#8a8e9c', SL = '#eef0f6';
    blob(x, X + 30, Y + 22, 9, 4, S, OUT); R(x, X + 22, Y + 24, 2, 7, OUT); R(x, X + 26, Y + 25, 2, 6, OUT); R(x, X + 34, Y + 25, 2, 6, OUT); R(x, X + 37, Y + 24, 2, 7, OUT);
    R(x, X + 38, Y + 13, 4, 9, OUT); R(x, X + 39, Y + 14, 2, 8, S); R(x, X + 39, Y + 11, 6, 4, OUT); R(x, X + 40, Y + 12, 4, 2, S); P(x, X + 43, Y + 12, SD);
    R(x, X + 27, Y + 10, 6, 10, OUT); R(x, X + 28, Y + 11, 4, 9, S); R(x, X + 28, Y + 11, 1, 9, SL); R(x, X + 28, Y + 6, 4, 5, OUT); R(x, X + 29, Y + 7, 2, 3, S);
    R(x, X + 32, Y + 13, 8, 2, OUT); R(x, X + 33, Y + 13, 6, 1, SL); R(x, X + 39, Y + 9, 1, 5, '#f7c646'); // the golden whip
    ell(x, X + 28, Y + 21, 6, 1, SL); R(x, X + 21, Y + 21, 2, 3, SD);
  };
  D.takhi = (x, X, Y) => { const { R, P } = P_(); // takhi wild horses: dun coat, dark upright mane, pale muzzle
    hill(x, X, Y + 46, 64, 14, '#6aa83f', '#5c9a36');
    const horse = (hx, hy, flip) => { const d = flip ? -1 : 1, c = '#c99a5a', cd = '#8a5a33';
      R(x, hx - 6, hy - 6, 13, 6, OUT); R(x, hx - 5, hy - 5, 11, 4, c); R(x, hx - 5, hy - 2, 11, 1, '#e8cfa0');
      for (const lx of [-5, -2, 2, 4]) R(x, hx + lx, hy, 1, 5, cd);
      R(x, hx + d * 6 - (flip ? 2 : 0), hy - 10, 3, 6, OUT); R(x, hx + d * 6 - (flip ? 1 : -1), hy - 9, 1, 5, c);
      R(x, hx + d * 7 - (flip ? 3 : 0), hy - 11, 4, 3, OUT); R(x, hx + d * 8 - (flip ? 2 : 0), hy - 10, 2, 1, '#f3e6c4');
      R(x, hx + d * 5, hy - 11, 1, 6, '#3a2516'); R(x, hx - d * 6, hy - 5, 1, 5, '#3a2516'); };
    horse(X + 20, Y + 38, false); horse(X + 44, Y + 40, true); P(x, X + 30, Y + 30, '#ffd34e'); P(x, X + 52, Y + 33, '#ff8fb1');
  };
  D.turtle = (x, X, Y) => { const { R, P, ell, blob, line } = P_(); // Мэлхий хад: the great granite Turtle Rock of Terelj
    tree(x, X + 4, Y + 46); tree(x, X + 58, Y + 46); tree(x, X + 9, Y + 44);
    blob(x, X + 33, Y + 30, 20, 13, '#a89a8a', OUT); ell(x, X + 30, Y + 26, 15, 9, '#b9ab9a'); ell(x, X + 27, Y + 22, 8, 4, '#cdbfae');
    for (const [a, b, c, d] of [[22, 22, 30, 30], [30, 30, 40, 24], [30, 30, 28, 40], [40, 24, 48, 30], [16, 32, 28, 40]]) line(x, X + a, Y + b, X + c, Y + d, '#8a7c6c');
    blob(x, X + 10, Y + 30, 6, 5, '#a89a8a', OUT); ell(x, X + 9, Y + 29, 4, 3, '#b9ab9a'); P(x, X + 7, Y + 28, OUT); R(x, X + 6, Y + 32, 4, 1, '#8a7c6c'); // the head
    blob(x, X + 22, Y + 42, 4, 3, '#9a8c7c', OUT); blob(x, X + 46, Y + 42, 4, 3, '#9a8c7c', OUT); R(x, X + 14, Y + 44, 40, 2, '#5c9a36');
  };
  D.sacredmtn = (x, X, Y) => { const { R } = P_(); // a sacred mountain with an ovoo and blue khadags on top
    hill(x, X, Y + 46, 64, 36, '#6f8f5a', '#5d7d4a'); hill(x, X + 18, Y + 46, 30, 26, '#7f9f68');
    for (let r = 0; r < 4; r++) R(x, X + 29 - r, Y + 10 + r * 2, 6 + r * 2, 2, ['#a5a5b0', '#d3d3dc', '#77778a', '#a5a5b0'][r]);
    khadag(x, X + 32, Y + 2);
  };
  D.snowpeak = (x, X, Y) => { const { R } = P_(); // high glacier peaks (Tavan Bogd, Otgontenger, Kharkhiraa)
    for (const [ox, w, hh] of [[0, 40, 30], [22, 42, 42], [40, 24, 24]]) for (let i = 0; i < w; i++) { const t = Math.abs(i - w / 2) / (w / 2), top = Y + 46 - Math.round(hh * (1 - t)); R(x, X + ox + i, top - 1, 1, 1, OUT); R(x, X + ox + i, top, 1, Y + 46 - top, i < w / 2 ? '#8aa0b8' : '#6f87a2'); R(x, X + ox + i, top, 1, Math.max(0, Math.round((Y + 46 - top) * 0.45)), i < w / 2 ? '#ffffff' : '#dce8f5'); }
  };
  D.birthplace = (x, X, Y) => { const { R } = P_(); // Delüün Boldog: the hill with a white memorial stone
    hill(x, X, Y + 46, 64, 18, '#6aa83f', '#5c9a36');
    R(x, X + 27, Y + 10, 10, 22, OUT); R(x, X + 28, Y + 11, 8, 20, '#f2eee4'); R(x, X + 28, Y + 11, 2, 20, '#ffffff');
    for (let i = 0; i < 4; i++) R(x, X + 30 + (i % 2) * 2, Y + 14 + i * 4, 1, 3, '#77778a');
    R(x, X + 24, Y + 31, 16, 3, OUT); R(x, X + 25, Y + 31, 14, 2, '#b6a68a'); khadag(x, X + 40, Y + 22);
  };
  const lake = (x, X, Y, swans) => { const { R, P, ell } = P_();
    ell(x, X + 32, Y + 34, 30, 11, '#5c9a36'); ell(x, X + 32, Y + 34, 27, 9, '#e8c994'); ell(x, X + 32, Y + 34, 25, 8, '#3a88c8'); ell(x, X + 30, Y + 32, 18, 5, '#4aa6e2');
    for (let i = 0; i < 6; i++) R(x, X + 12 + i * 8, Y + 30 + (i % 2) * 5, 4, 1, '#93d4f6');
    for (const rx of [6, 9, 55, 58]) { R(x, X + rx, Y + 32, 1, 6, '#357a28'); P(x, X + rx, Y + 31, '#8a5a33'); }
    if (swans) for (const [sx, sy] of [[22, 33], [32, 36], [40, 32]]) { R(x, X + sx, Y + sy, 4, 2, '#ffffff'); R(x, X + sx + 3, Y + sy - 3, 1, 3, '#ffffff'); P(x, X + sx + 4, Y + sy - 3, '#f39b2c'); }
    else { R(x, X + 40, Y + 30, 6, 2, '#8a5a33'); R(x, X + 42, Y + 27, 1, 3, '#6b4220'); R(x, X + 43, Y + 27, 2, 2, '#ffffff'); } // a little boat
  };
  D.lake = (x, X, Y) => lake(x, X, Y, false);
  D.swans = (x, X, Y) => lake(x, X, Y, true);
  D.river = (x, X, Y) => { const { R } = P_(); // a river bend with a wooden bridge
    for (let y = 10; y < 47; y++) { const cx = 32 + Math.round(Math.sin(y / 6) * 10); R(x, X + cx - 7, Y + y, 14, 1, '#3a88c8'); R(x, X + cx - 3, Y + y, 5, 1, '#4aa6e2'); R(x, X + cx - 9, Y + y, 2, 1, '#e8c994'); R(x, X + cx + 7, Y + y, 2, 1, '#e8c994'); }
    R(x, X + 14, Y + 28, 38, 7, OUT); R(x, X + 15, Y + 29, 36, 5, '#a46d3b'); for (let i = 0; i < 9; i++) R(x, X + 16 + i * 4, Y + 29, 1, 5, '#6b4220'); R(x, X + 15, Y + 26, 36, 1, '#6b4220'); R(x, X + 15, Y + 26, 1, 3, '#6b4220'); R(x, X + 50, Y + 26, 1, 3, '#6b4220');
  };
  D.gazelle = (x, X, Y) => { const { R, P } = P_(); // Mongolian gazelles on the open steppe
    R(x, X, Y + 40, 64, 6, '#a8c45a');
    for (const [gx, gy] of [[12, 36], [30, 40], [48, 34]]) { R(x, X + gx - 4, Y + gy - 4, 9, 4, OUT); R(x, X + gx - 3, Y + gy - 3, 7, 2, '#d8a868'); R(x, X + gx - 4, Y + gy - 3, 2, 2, '#ffffff'); for (const lx of [-3, -1, 2, 4]) R(x, X + gx + lx, Y + gy, 1, 5, '#8a5a33'); R(x, X + gx + 4, Y + gy - 8, 2, 5, '#d8a868'); R(x, X + gx + 5, Y + gy - 9, 3, 2, '#d8a868'); P(x, X + gx + 5, Y + gy - 11, '#3a2516'); }
  };
  D.stupahill = (x, X, Y) => { hill(x, X, Y + 46, 64, 24, '#7f9f68', '#6f8f5a'); stupa(x, X + 32, Y + 23, 2); };
  D.stupas = (x, X, Y) => { const { ell } = P_(); ell(x, X + 32, Y + 38, 30, 8, '#e2b86e'); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; stupa(x, X + 32 + Math.round(Math.cos(a) * 24), Y + 38 + Math.round(Math.sin(a) * 6)); } stupa(x, X + 32, Y + 38, 2); };
  D.train = (x, X, Y) => { const { R } = P_(); // a railway station and the trans-Mongolian train
    R(x, X + 4, Y + 14, 30, 20, OUT); R(x, X + 5, Y + 15, 28, 18, '#e8dfc8'); R(x, X + 2, Y + 11, 34, 4, '#a8312a'); for (let i = 0; i < 3; i++) R(x, X + 8 + i * 9, Y + 20, 5, 7, '#4aa6e2');
    R(x, X, Y + 42, 64, 1, '#77778a'); R(x, X, Y + 45, 64, 1, '#77778a'); for (let i = 0; i < 64; i += 4) R(x, X + i, Y + 42, 2, 4, '#6b4220');
    R(x, X + 30, Y + 30, 34, 12, OUT); R(x, X + 31, Y + 31, 32, 10, '#2e8a5a'); R(x, X + 31, Y + 31, 32, 2, '#f2eee4'); for (let i = 0; i < 5; i++) R(x, X + 34 + i * 6, Y + 34, 4, 3, '#93d4f6');
  };
  D.mine = (x, X, Y) => { const { R } = P_(); // an open-pit mine with terraces and a truck
    for (let r = 0; r < 5; r++) R(x, X + 4 + r * 5, Y + 22 + r * 5, 56 - r * 10, 5, ['#b9875a', '#a87648', '#c99a6a', '#9a6a3e', '#8a5a33'][r]);
    R(x, X + 40, Y + 18, 14, 6, OUT); R(x, X + 41, Y + 19, 8, 4, '#f7c646'); R(x, X + 49, Y + 20, 4, 3, '#e9a91f'); R(x, X + 42, Y + 23, 3, 2, OUT); R(x, X + 50, Y + 23, 3, 2, OUT);
  };
  D.factory = (x, X, Y) => { const { R } = P_(); // the steel plant
    R(x, X + 4, Y + 24, 56, 22, OUT); R(x, X + 5, Y + 25, 54, 20, '#9fb0c8'); for (let i = 0; i < 6; i++) R(x, X + 8 + i * 8, Y + 30, 5, 6, '#f7c646');
    for (const [cx2, hh] of [[14, 22], [26, 28], [46, 20]]) { R(x, X + cx2, Y + 24 - hh, 5, hh, OUT); R(x, X + cx2 + 1, Y + 25 - hh, 3, hh - 1, '#c9c1ad'); R(x, X + cx2 + 1, Y + 27 - hh, 3, 2, '#e14b3d'); R(x, X + cx2, Y + 18 - hh, 6, 4, '#dce8f5'); }
  };
  const cliff = (x, X, Y, cols) => { const { R } = P_(); for (let i = 0; i < 60; i++) { const top = Y + 10 + Math.round(Math.abs(Math.sin(i / 7)) * 8 + (i % 5 === 0 ? 2 : 0)); R(x, X + 2 + i, top - 1, 1, 1, OUT); for (let y = top; y < Y + 46; y++) R(x, X + 2 + i, y, 1, 1, cols[Math.floor((y - Y) / 5) % cols.length]); } };
  D.cliffRed = (x, X, Y) => { const { ell, P } = P_(); cliff(x, X, Y, ['#d8643a', '#c4502a', '#e2804a', '#b8462a']); for (const [ex, ey] of [[20, 42], [24, 43], [22, 40]]) { ell(x, X + ex, Y + ey, 2, 2, OUT); ell(x, X + ex, Y + ey, 1, 1, '#f3e6c4'); } P(x, X + 23, Y + 40, '#ffffff'); }; // Bayanzag + dinosaur eggs
  D.cliffWhite = (x, X, Y) => cliff(x, X, Y, ['#f2eee4', '#f0c9b8', '#e8dccc', '#d8a890']);
  D.rocks = (x, X, Y) => { const { ell, blob } = P_(); for (const [bx, by, r] of [[16, 36, 12], [36, 30, 15], [52, 38, 9], [28, 40, 8]]) { blob(x, X + bx, Y + by, r, Math.round(r * 0.8), '#b9a898', OUT); ell(x, X + bx - 2, Y + by - 3, Math.round(r * 0.6), Math.round(r * 0.4), '#d0c2b2'); } };
  D.dunes = (x, X, Y) => { const { R, P } = P_(); // the singing sand dunes, with a Bactrian camel
    for (let i = 0; i < 64; i++) { const top = Y + 18 + Math.round(Math.sin(i / 9) * 7 + Math.sin(i / 4) * 2); R(x, X + i, top, 1, Y + 46 - top, i % 20 < 10 ? '#f0c878' : '#e2b060'); P(x, X + i, top, '#fbe0a0'); }
    camelAt(x, X + 40, Y + 44);
  };
  function camelAt(x, cx, by) { const { R } = P_(); const c = '#c99a5a';
    R(x, cx - 7, by - 9, 14, 5, OUT); R(x, cx - 6, by - 8, 12, 3, c); R(x, cx - 4, by - 12, 3, 4, c); R(x, cx + 1, by - 12, 3, 4, c);
    for (const lx of [-6, -3, 3, 5]) R(x, cx + lx, by - 4, 1, 4, '#8a5a33'); R(x, cx + 6, by - 13, 2, 6, c); R(x, cx + 6, by - 14, 4, 2, c); }
  D.camel = (x, X, Y) => { const { R } = P_(); R(x, X, Y + 40, 64, 6, '#e2b86e'); camelAt(x, X + 20, Y + 44); camelAt(x, X + 44, Y + 42); };
  D.gorge = (x, X, Y) => { const { R } = P_(); // Yolyn Am: a deep gorge with ice in summer
    for (let i = 0; i < 64; i++) { const w = Math.abs(i - 32), top = Y + 6 + Math.round(Math.sin(i / 3) * 2); if (w > 8) R(x, X + i, top, 1, 40, w > 20 ? '#8a7c6c' : '#6f6458'); }
    R(x, X + 24, Y + 36, 16, 10, '#dce8f5'); R(x, X + 26, Y + 36, 12, 2, '#ffffff'); R(x, X + 28, Y + 20, 8, 16, '#4a3e3e');
  };
  D.cave = (x, X, Y) => { const { R, ell, blob } = P_(); // a cave in the rock, with ancient red paintings
    blob(x, X + 32, Y + 30, 28, 16, '#9a8a7a', OUT); ell(x, X + 28, Y + 24, 18, 8, '#ad9d8c'); ell(x, X + 32, Y + 38, 9, 8, OUT); ell(x, X + 32, Y + 39, 8, 7, '#2a1f1a');
    R(x, X + 12, Y + 28, 2, 3, '#b8462a'); R(x, X + 15, Y + 27, 3, 2, '#b8462a'); R(x, X + 46, Y + 26, 4, 2, '#b8462a'); R(x, X + 47, Y + 24, 1, 2, '#b8462a');
  };
  D.stoneturtle = (x, X, Y) => { const { R, P, ell, blob } = P_(); // the stone turtle of Karakorum that once held up a stele
    R(x, X + 2, Y + 42, 60, 4, '#a8c45a'); blob(x, X + 32, Y + 34, 16, 9, '#a5a5b0', OUT); ell(x, X + 30, Y + 31, 11, 5, '#c0c0ca');
    for (const [a, b] of [[24, 30], [32, 28], [38, 32], [28, 36]]) R(x, X + a, Y + b, 3, 1, '#77778a');
    blob(x, X + 13, Y + 36, 5, 4, '#a5a5b0', OUT); P(x, X + 11, Y + 35, OUT); R(x, X + 30, Y + 25, 5, 3, '#4a4a55');
    R(x, X + 50, Y + 30, 6, 12, OUT); R(x, X + 51, Y + 31, 4, 11, '#c0c0ca'); khadag(x, X + 53, Y + 20);
  };
  D.stupawall = (x, X, Y) => { const { R } = P_(); // Erdene Zuu: temple roofs behind a white wall lined with stupas
    for (let i = 0; i < 40; i++) R(x, X + 12 + i, Y + 8 + Math.abs(i - 20) / 4 | 0, 1, 14, i % 3 ? '#46a077' : '#2f7d5b'); R(x, X + 30, Y + 2, 4, 6, '#f7c646');
    R(x, X, Y + 26, 64, 20, OUT); R(x, X + 1, Y + 27, 62, 18, '#f6f2e9'); R(x, X + 1, Y + 40, 62, 5, '#d9cdb5');
    for (let i = 0; i < 6; i++) stupa(x, X + 5 + i * 11, Y + 27);
  };
  D.waterfall = (x, X, Y) => { const { R, ell } = P_(); // Orkhon waterfall over dark basalt
    R(x, X + 2, Y + 8, 60, 30, OUT); R(x, X + 3, Y + 9, 58, 28, '#4a3e3e'); for (let i = 0; i < 8; i++) R(x, X + 5 + i * 7, Y + 10, 1, 26, '#5a4e4e');
    R(x, X + 3, Y + 6, 58, 3, '#5c9a36'); R(x, X + 26, Y + 6, 12, 32, '#dff3ff'); for (let i = 0; i < 4; i++) R(x, X + 27 + i * 3, Y + 8, 1, 30, '#93d4f6');
    ell(x, X + 32, Y + 41, 22, 5, '#3a88c8'); ell(x, X + 32, Y + 39, 10, 2, '#ffffff');
  };
  D.volcano = (x, X, Y) => { const { R, ell } = P_(); // an extinct volcano with its crater (Khorgo, Uran-Togoo)
    for (let i = 0; i < 64; i++) { const t = Math.abs(i - 32) / 32, top = Y + 12 + Math.round(30 * t * t + (t < 0.25 ? 0 : 0)); R(x, X + i, top - 1, 1, 1, OUT); R(x, X + i, top, 1, Y + 46 - top, i < 32 ? '#6a5a5a' : '#5a4a4a'); if ((i * 7) % 5 === 0) R(x, X + i, Y + 40, 1, 6, '#3f7a2c'); }
    ell(x, X + 32, Y + 13, 9, 2, OUT); ell(x, X + 32, Y + 13, 8, 1, '#2a1f1a'); tree(x, X + 8, Y + 46); tree(x, X + 54, Y + 46);
  };
  D.bigrock = (x, X, Y) => { const { R, ell, blob } = P_(); // Taikhar rock: one huge granite boulder
    R(x, X, Y + 42, 64, 4, '#6aa83f'); blob(x, X + 32, Y + 28, 20, 16, '#b9a898', OUT); ell(x, X + 27, Y + 21, 12, 8, '#d0c2b2');
    for (let i = 0; i < 5; i++) R(x, X + 34 + (i % 2) * 3, Y + 24 + i * 3, 2, 1, '#8a3a2a');
  };
  D.ruins = (x, X, Y) => { const { R } = P_(); for (const [rx, rh] of [[6, 16], [16, 26], [30, 12], [42, 22], [54, 10]]) { R(x, X + rx, Y + 46 - rh, 8, rh, OUT); R(x, X + rx + 1, Y + 47 - rh, 6, rh - 1, '#a89878'); R(x, X + rx + 1, Y + 47 - rh, 6, 2, '#c9b898'); } };
  D.city = (x, X, Y) => { const { R } = P_(); // apartment blocks of a province centre
    for (const [bx, bw, bh, c] of [[2, 16, 30, '#e8dfc8'], [20, 14, 38, '#9fb0c8'], [36, 14, 26, '#f0c9b8'], [50, 12, 34, '#c9c1ad']]) { R(x, X + bx, Y + 46 - bh, bw, bh, OUT); R(x, X + bx + 1, Y + 47 - bh, bw - 2, bh - 1, c); for (let wy = Y + 50 - bh; wy < Y + 43; wy += 5) for (let wx = bx + 3; wx < bx + bw - 3; wx += 4) R(x, X + wx, wy, 2, 2, (wx + wy) % 3 ? '#4aa6e2' : '#f7c646'); }
  };
  D.fields = (x, X, Y) => { const { R } = P_(); for (let r = 0; r < 6; r++) R(x, X, Y + 18 + r * 5, 64, 4, r % 2 ? '#c9b34a' : '#e8d36a'); R(x, X + 40, Y + 20, 12, 7, OUT); R(x, X + 41, Y + 21, 10, 5, '#e14b3d'); R(x, X + 42, Y + 26, 4, 4, OUT); R(x, X + 48, Y + 25, 3, 3, OUT); };
  D.fort = (x, X, Y) => { const { R } = P_(); // old fortress walls with a gate
    R(x, X + 2, Y + 22, 60, 24, OUT); R(x, X + 3, Y + 23, 58, 22, '#b9a07a'); for (let i = 0; i < 8; i++) R(x, X + 3 + i * 8, Y + 18, 5, 5, '#b9a07a');
    R(x, X + 26, Y + 30, 12, 16, OUT); R(x, X + 27, Y + 31, 10, 15, '#3a2a1e'); R(x, X + 3, Y + 23, 58, 2, '#d0b890');
  };
  D.urts = (x, X, Y) => { const { R } = P_(); // a Tsaatan urts (cone tent) with a reindeer
    for (let r = 0; r < 30; r++) { const w = Math.round(r * 0.55); R(x, X + 22 - w - 1, Y + 16 + r, w * 2 + 3, 1, OUT); R(x, X + 22 - w, Y + 16 + r, w * 2 + 1, 1, r % 6 < 3 ? '#e8dcc0' : '#d8c8a8'); }
    for (const dx of [-3, 0, 3]) R(x, X + 22 + dx, Y + 10, 1, 7, '#6b4220'); R(x, X + 20, Y + 38, 5, 8, '#3a2a1e');
    R(x, X + 38, Y + 32, 14, 6, OUT); R(x, X + 39, Y + 33, 12, 4, '#8a6a4a'); for (const lx of [39, 42, 47, 50]) R(x, X + lx, Y + 38, 1, 7, '#5a3a22');
    R(x, X + 50, Y + 26, 3, 7, '#8a6a4a'); R(x, X + 50, Y + 25, 5, 2, '#8a6a4a'); R(x, X + 49, Y + 19, 1, 6, '#c9a87a'); R(x, X + 53, Y + 19, 1, 6, '#c9a87a'); R(x, X + 47, Y + 20, 3, 1, '#c9a87a'); R(x, X + 53, Y + 20, 3, 1, '#c9a87a');
  };
  D.deerstone = (x, X, Y) => { const { R, line } = P_(); // 3,000-year-old deer stones with flying deer carved on them
    R(x, X, Y + 42, 64, 4, '#6aa83f');
    for (const [sx, sh] of [[12, 30], [30, 36], [48, 26]]) { R(x, X + sx - 4, Y + 46 - sh, 9, sh, OUT); R(x, X + sx - 3, Y + 47 - sh, 7, sh - 2, '#a5a5b0'); for (let i = 0; i < 3; i++) line(x, X + sx - 2, Y + 50 - sh + i * 7, X + sx + 2, Y + 47 - sh + i * 7, '#5a5a66'); }
  };
  D.rockart = (x, X, Y) => { const { R, blob } = P_(); // rock carvings of ibex and hunters
    blob(x, X + 32, Y + 30, 28, 15, '#8a6a5a', OUT); R(x, X + 6, Y + 22, 52, 14, '#9a7a6a');
    for (const [ax, ay] of [[14, 26], [30, 24], [44, 28]]) { R(x, X + ax, Y + ay, 6, 2, '#e8d8c0'); R(x, X + ax, Y + ay + 2, 1, 3, '#e8d8c0'); R(x, X + ax + 5, Y + ay + 2, 1, 3, '#e8d8c0'); R(x, X + ax + 5, Y + ay - 3, 1, 3, '#e8d8c0'); R(x, X + ax + 4, Y + ay - 4, 1, 1, '#e8d8c0'); }
  };
  D.eagle = (x, X, Y) => { const { R, P } = P_(); // a Kazakh eagle hunter with a golden eagle on a perch
    R(x, X, Y + 42, 64, 4, '#a8c45a');
    x.drawImage(TG.pixel.char({ deel: 'brown', skin: '#D9A06E', hat: 'kazakh', neck: null, face: null, pet: null }, 0, 0), X + 12, Y + 18);
    R(x, X + 38, Y + 26, 2, 20, '#6b4220'); R(x, X + 33, Y + 25, 12, 2, '#6b4220');
    R(x, X + 34, Y + 14, 9, 11, OUT); R(x, X + 35, Y + 15, 7, 9, '#6b4220'); R(x, X + 36, Y + 10, 5, 5, OUT); R(x, X + 37, Y + 11, 3, 3, '#c99257'); P(x, X + 40, Y + 12, '#f7c646'); P(x, X + 41, Y + 13, '#2b1e2e');
    R(x, X + 30, Y + 16, 4, 8, '#5a3a22'); R(x, X + 43, Y + 16, 4, 8, '#5a3a22');
  };

  // ---- herd animals for the trips (about 20×16, facing right; frame 0/1 = legs)
  const CR = {};
  const legs = (x, f, xs, top, col, len = 4) => { const { R } = P_(); xs.forEach((lx, i) => R(x, lx + ((i + f) % 2 ? 1 : 0), top, 1, len - ((i + f) % 2), col)); };
  CR.horse = (x, f) => { const { R, P } = P_(); const c = '#8a5a33', d = '#5a3a1e';
    R(x, 4, 6, 11, 5, OUT); R(x, 5, 7, 9, 3, c); legs(x, f, [5, 7, 11, 13], 11, d); R(x, 14, 3, 3, 5, OUT); R(x, 15, 4, 2, 4, c); R(x, 15, 2, 4, 3, OUT); R(x, 16, 3, 3, 1, c); P(x, 18, 3, d);
    R(x, 13, 3, 2, 4, '#2b1e14'); R(x, 3, 7, 2, 4, '#2b1e14'); };
  CR.camel = (x, f) => { const { R, P } = P_(); const c = '#c99a5a', d = '#8a5a33';
    R(x, 3, 7, 12, 5, OUT); R(x, 4, 8, 10, 3, c); R(x, 5, 4, 3, 4, OUT); R(x, 6, 5, 1, 3, c); R(x, 10, 4, 3, 4, OUT); R(x, 11, 5, 1, 3, c);
    legs(x, f, [4, 6, 11, 13], 12, d, 4); R(x, 14, 4, 2, 6, OUT); R(x, 15, 5, 1, 4, c); R(x, 15, 3, 4, 2, OUT); R(x, 16, 3, 2, 1, c); P(x, 5, 6, '#a87648'); P(x, 11, 6, '#a87648'); };
  CR.yak = (x, f) => { const { R, P } = P_(); const c = '#3a2c2c';
    R(x, 3, 5, 13, 7, OUT); R(x, 4, 6, 11, 5, c); for (let i = 4; i < 15; i += 2) P(x, i, 11, '#5a4a4a'); R(x, 4, 11, 11, 1, '#2b1e2e');
    legs(x, f, [5, 7, 12, 14], 12, '#1e1616', 3); R(x, 15, 6, 4, 4, OUT); R(x, 16, 7, 2, 2, c); R(x, 16, 4, 1, 2, '#f2eee4'); R(x, 18, 4, 1, 2, '#f2eee4'); R(x, 2, 6, 2, 4, '#f2eee4'); };
  CR.goat = (x, f) => { const { R, P } = P_(); const c = '#f2eee4';
    R(x, 5, 7, 9, 4, OUT); R(x, 6, 8, 7, 2, c); legs(x, f, [6, 8, 11, 12], 11, '#8a7a64', 3); R(x, 13, 5, 3, 4, OUT); R(x, 14, 6, 2, 2, c); P(x, 14, 9, '#c9bda6'); P(x, 14, 10, '#c9bda6');
    P(x, 13, 4, '#8a7a64'); P(x, 12, 3, '#8a7a64'); P(x, 15, 6, OUT); };
  CR.reindeer = (x, f) => { const { R, P } = P_(); const c = '#8a6a4a';
    R(x, 4, 7, 11, 4, OUT); R(x, 5, 8, 9, 2, c); R(x, 12, 8, 3, 2, '#e8dcc0'); legs(x, f, [5, 7, 11, 13], 11, '#5a3a22', 4); R(x, 14, 4, 3, 5, OUT); R(x, 15, 5, 2, 3, c);
    R(x, 14, 0, 1, 4, '#c9a87a'); R(x, 17, 0, 1, 4, '#c9a87a'); P(x, 13, 1, '#c9a87a'); P(x, 18, 1, '#c9a87a'); P(x, 13, 2, '#c9a87a'); P(x, 18, 2, '#c9a87a'); };
  CR.gazelle = (x, f) => { const { R, P } = P_(); const c = '#d8a868';
    R(x, 5, 7, 9, 4, OUT); R(x, 6, 8, 7, 2, c); R(x, 5, 8, 2, 2, '#ffffff'); R(x, 7, 10, 5, 1, '#f3e6c4'); legs(x, f, [6, 8, 11, 12], 11, '#8a5a33', 4); R(x, 13, 4, 2, 5, c); R(x, 14, 3, 3, 2, c); P(x, 14, 1, '#3a2516'); P(x, 14, 2, '#3a2516'); };
  CR.sheep = (x, f) => { x.drawImage(TG.pixel.animal('sheep', f), 0, 0); };
  const crCache = new Map();
  function critter(kind, f) { return TG.pixel.beast(kind, f); }   // the detailed shared animal drawings

  function draw(x, kind, X, Y) { (D[kind] || D.sacredmtn)(x, X, Y); }
  TG.landmarks = { KIND, draw, kinds: Object.keys(D), critter, critters: Object.keys(CR), khadag, stupa };
})(window.TG);
