/* 7–18: guide the camel to the well — first steps in programming */
(function (TG) {
  const { h, L } = TG;
  const YOUNG = [
    { map: ['.....', '.....', 'C...W', '.....', '.....'] },
    { map: ['C....', '.....', '..W..', '.....', '.....'] },
    { map: ['C.#..', '..#..', '....W', '.....', '.....'] },
    { map: ['.....', '.C#W.', '..#..', '.....', '.....'] },
    { map: ['C#...', '.#.#.', '.#.#.', '...#W', '.....'] },
    { map: ['....W', '.###.', '.#...', '.#.#.', 'C..#.'] },
  ];
  const OLDER = [
    { map: ['.....', '.....', 'C...W', '.....', '.....'], limit: 1 },
    { map: ['..#..', 'C.#.W', '..#..', '.....', '.....'], limit: 3 },
    { map: ['C#...', '.#.#.', '.#.#.', '...#W', '.....'], limit: 5 },
    { map: ['....W', '.###.', '.#...', '.#.#.', 'C..#.'], limit: 4 },
    { map: ['C....', '####.', '.....', '.####', '....W'], limit: 5 },
    { map: ['W#...', '.#.#.', '...#.', '##.#.', 'C...#'], limit: 6 },
  ];
  const DIRS = { U: [-1, 0, '⬆️'], D: [1, 0, '⬇️'], L: [0, -1, '⬅️'], R: [0, 1, '➡️'] };

  TG.registerGame({
    id: 'coding', icon: '🐫', pillar: 'skills', ages: ['7-10', '11-14', '15-18'],
    title: { mn: 'Тэмээг худаг руу', en: 'Camel to the well' },
    desc: { mn: 'Тушаал дараалуулж програмчлалд суралц', en: 'Order commands, learn to program' },
    realLife: { mn: 'Нэг нь нүдээ боогоод, нөгөө нь "2 алхам урагш, баруун тийш эргэ" гэх мэт тушаалаар өрөөгөөр хөтлөөрэй. Энэ бол жинхэнэ програмчлал!', en: 'One person is blindfolded, the other guides them with commands like "2 steps forward, turn right". That is real programming!' },
    start(ctx) {
      const life = TG.lifecycle();
      const older = ctx.ageGroup === '11-14' || ctx.ageGroup === '15-18';
      const levels = older ? OLDER : YOUNG;
      const T = TG.makeTurns(ctx);
      let li = 0, fails = 0, prog = [], running = false;

      function parse(map) {
        let start, goal;
        const grid = map.map((row, r) => row.split('').map((ch, c) => { if (ch === 'C') start = [r, c]; if (ch === 'W') goal = [r, c]; return ch === '#' ? '#' : '.'; }));
        return { grid, start, goal };
      }

      function draw() {
        const lv = levels[li], { grid, start, goal } = parse(lv.map);
        const board = h('div', { class: 'board' });
        grid.forEach((row, r) => row.forEach((cell, c) => {
          const isGoal = r === goal[0] && c === goal[1];
          board.appendChild(h('div', { class: 'bcell' + (cell === '#' ? ' rock' : '') + (isGoal ? ' well' : '') }, cell === '#' ? ((r + c) % 2 ? '🌵' : '🪨') : isGoal ? '💧' : ''));
        }));
        const camel = h('div', { class: 'camel' }, '🐫');
        board.appendChild(camel);
        const placeCamel = (r, c) => { camel.style.transform = `translate(${c * 100}%, ${r * 100}%)`; };
        placeCamel(...start);

        const msg = h('div', { class: 'code-msg', 'aria-live': 'polite' }, older
          ? L(`Блок дээр дарж давталтыг (×2, ×3) өөрчил. Хамгийн ихдээ ${lv.limit} блок!`, `Tap a block to change its repeat (×2, ×3). Max ${lv.limit} blocks!`)
          : L('Сумнуудыг дараалуулж, ▶ дарж тэмээг хөдөлгө!', 'Line up arrows, then press ▶ to move the camel!'));
        const strip = h('div', { class: 'program' });
        const runBtn = h('button', { class: 'btn primary', onclick: () => run() }, '▶ ', L('Ажиллуул', 'Run'));
        const renderProg = () => {
          strip.replaceChildren(...(prog.length ? prog.map((b, k) => h('button', {
            class: 'pblock', 'aria-label': 'block',
            onclick: () => { if (running) return; if (older) { b.n = (b.n % 4) + 1; } else prog.splice(k, 1); renderProg(); },
          }, DIRS[b.d][2], b.n > 1 ? h('sub', null, '×' + b.n) : null)) : [h('span', { class: 'ph' }, L('Энд тушаалууд гарна…', 'Your program appears here…'))]));
          if (older) strip.appendChild(h('span', { class: 'limit' + (prog.length > lv.limit ? ' over' : '') }, `${prog.length}/${lv.limit}`));
          runBtn.disabled = running || !prog.length || (older && prog.length > lv.limit);
        };
        const palette = h('div', { class: 'palette' },
          ['U', 'L', 'D', 'R'].map((d) => h('button', { class: 'pal', 'aria-label': d, onclick: () => { if (running) return; prog.push({ d, n: 1 }); TG.sfx.tap(); renderProg(); } }, DIRS[d][2])),
          h('button', { class: 'pal ctrl', 'aria-label': 'undo', onclick: () => { if (!running) { prog.pop(); renderProg(); } } }, '⌫'),
          h('button', { class: 'pal ctrl', 'aria-label': 'clear', onclick: () => { if (!running) { prog = []; renderProg(); } } }, '🗑'));

        async function run() {
          if (running || !prog.length) return;
          running = true; renderProg();
          let [r, c] = start; placeCamel(r, c); camel.classList.remove('bump');
          if (!(await life.wait(250))) return;
          for (const b of prog) {
            for (let k = 0; k < b.n; k++) {
              const [dr, dc] = DIRS[b.d]; const nr = r + dr, nc = c + dc;
              if (nr < 0 || nc < 0 || nr > 4 || nc > 4 || grid[nr][nc] === '#') return fail(L('Ой! Тэмээ мөргөчихлөө 🌵 Тушаалаа засаад дахин оролдоорой.', 'Oops! The camel bumped into something 🌵 Fix the program and try again.'));
              r = nr; c = nc; placeCamel(r, c); TG.sfx.tap();
              if (!(await life.wait(340))) return;
            }
          }
          if (r === goal[0] && c === goal[1]) success();
          else fail(L('Тэмээ худагт хүрсэнгүй. Дахиад нэг оролдоё!', 'The camel did not reach the well. Try once more!'));
        }
        function fail(text) {
          fails++; TG.sfx.bad(); camel.classList.add('bump'); msg.textContent = text;
          life.later(() => { running = false; placeCamel(...start); camel.classList.remove('bump'); renderProg(); }, 1100);
        }
        function success() {
          TG.sfx.good(); T.add(1); msg.textContent = L('Тэмээ ус уулаа! 💧 Гайхалтай програмист!', 'The camel is drinking! 💧 Great programmer!');
          board.classList.add('solved');
          life.later(() => { li++; prog = []; running = false; if (li >= levels.length) end(); else { T.next(); draw(); } }, 1400);
        }
        ctx.root.replaceChildren(
          h('div', { class: 'level-tag' }, `${L('Түвшин', 'Level')} ${li + 1}/${levels.length}`),
          board, msg, strip, palette, h('div', { class: 'run-row' }, runBtn));
        renderProg();
      }
      function end() { ctx.finish({ stars: fails <= 2 ? 3 : fails <= 5 ? 2 : 1, scores: T.scores, summary: L(`${levels.length} түвшин, ${fails} алдаа`, `${levels.length} levels, ${fails} retries`) }); }
      draw();
      return () => life.stop();
    },
  });
})(window.TG);
