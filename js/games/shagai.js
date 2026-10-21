/* All ages: traditional shagai (ankle-bone) horse race — the flagship family game */
(function (TG) {
  const { h, L } = TG;
  const SIDES = [
    { k: 'horse', e: '🐎', mn: 'Морь', en: 'Horse', w: 0.3 },
    { k: 'camel', e: '🐫', mn: 'Тэмээ', en: 'Camel', w: 0.14 },
    { k: 'sheep', e: '🐑', mn: 'Хонь', en: 'Sheep', w: 0.3 },
    { k: 'goat', e: '🐐', mn: 'Ямаа', en: 'Goat', w: 0.26 },
  ];
  const FACTS = [
    { mn: 'Шагай бол хонины шийрний яс. Монголчууд олон зууны турш шагайгаар тоглож ирсэн.', en: 'Shagai are sheep ankle bones. Mongolians have played with them for centuries.' },
    { mn: 'Шагай дөрвөн талтай: морь, тэмээ, хонь, ямаа.', en: 'A shagai has four sides: horse, camel, sheep and goat.' },
    { mn: 'Монгол шагай харваа 2014 онд ЮНЕСКО-гийн биет бус соёлын өвд бүртгэгдсэн.', en: 'Mongolian knuckle-bone shooting was inscribed on UNESCO\'s Intangible Cultural Heritage list in 2014.' },
    { mn: 'Цагаан сар, урт өвлийн оройгоор гэр бүлээрээ шагай тоглодог уламжлалтай.', en: 'Families traditionally play shagai during Tsagaan Sar and long winter evenings.' },
    { mn: 'Эмээ, өвөөгөөсөө шагайн өөр тоглоом асуугаарай. Шагай няслах, шагай мэргэлэх гэх мэт олон тоглоом бий!', en: 'Ask your grandparents for other shagai games: flicking, fortune telling and many more!' },
  ];
  const GOAL = 15;
  const rollOne = () => { let r = Math.random(), acc = 0; for (const s of SIDES) { acc += s.w; if (r < acc) return s; } return SIDES[0]; };

  TG.registerGame({
    id: 'shagai', icon: '🦴', pillar: 'edu', ages: ['3-6', '7-10', '11-14', '15-18'], flagship: true,
    title: { mn: 'Шагайн морь уралдаан', en: 'Shagai horse race' },
    desc: { mn: 'Уламжлалт тоглоом: гэр бүлээрээ морь уралдуул!', en: 'A Mongolian tradition: race horses as a family!' },
    realLife: { mn: 'Жинхэнэ шагайгаар гэр бүлээрээ тоглоорой. Өвөө, эмээгээсээ хүүхэд байхдаа ямар шагайн тоглоом тоглодог байсныг асуугаарай.', en: 'Play with real shagai as a family. Ask your grandparents which shagai games they played as kids.' },
    start(ctx) {
      const life = TG.lifecycle();
      const players = ctx.players.map((p) => ({ ...p }));
      if (players.length === 1) players.push({ name: L('Бүргэд', 'Eagle'), emoji: '🦅', color: TG.PCOLORS[1], bot: true });
      const T = TG.makeTurns(ctx, players);
      const pos = players.map(() => 0);
      let busy = false, over = false, rolls = 0, factI = 0;

      const lanes = players.map((p) => {
        const cells = Array.from({ length: GOAL + 1 }, (_, c) => h('div', { class: 'cell' + (c === GOAL ? ' finish' : '') }, c === GOAL ? '🏁' : ''));
        const token = h('div', { class: 'token' }, '🏇');
        return { row: h('div', { class: 'lane', style: { '--pc': p.color } }, h('div', { class: 'lane-name' }, p.emoji, ' ', p.name), h('div', { class: 'track' }, cells, token)), token };
      });
      const place = (i) => { lanes[i].token.style.left = `calc((100% - 30px) * ${pos[i] / GOAL})`; };
      const tiles = [0, 1, 2, 3].map(() => h('div', { class: 'shagai' }, h('span', { class: 'se' }, '🦴'), h('span', { class: 'sl' }, '?')));
      const msg = h('div', { class: 'shagai-msg', 'aria-live': 'polite' }, L('Шагайгаа шидээрэй! Морь буусан тоогоор урагшилна.', 'Roll the shagai! Move one step for every horse.'));
      const rollBtn = h('button', { class: 'btn primary big block', onclick: () => roll() });
      const fact = h('div', { class: 'fact' }, '💡 ', TG.tx(FACTS[0]));
      const rules = h('details', { class: 'rules' }, h('summary', null, L('Дүрэм', 'Rules')),
        h('ul', null,
          h('li', null, L('Ээлжээр 4 шагай шиднэ.', 'Take turns rolling 4 shagai.')),
          h('li', null, L('Морь буусан тоогоор морь чинь урагшилна.', 'Your horse moves one step per horse side.')),
          h('li', null, L('4 шагай бүгд ижил буувал дахин шиднэ!', 'If all 4 land the same, roll again!')),
          h('li', null, L(`Түрүүлж ${GOAL}-р алхамд хүрсэн нь ялна.`, `First to step ${GOAL} wins.`))));

      const setBtn = () => {
        const p = players[T.cur];
        rollBtn.disabled = busy || !!p.bot || over;
        rollBtn.textContent = p.bot ? L('Бүргэд шидэж байна…', 'Eagle is rolling…') : `🎲 ${L('Шид', 'Roll')}, ${p.name}!`;
      };

      async function roll() {
        if (busy || over) return;
        busy = true; setBtn(); TG.sfx.roll();
        tiles.forEach((t) => { t.classList.remove('horse'); t.classList.add('rolling'); });
        if (!(await life.wait(700))) return;
        const res = [rollOne(), rollOne(), rollOne(), rollOne()];
        tiles.forEach((t, k) => {
          t.classList.remove('rolling'); t.classList.toggle('horse', res[k].k === 'horse');
          t.querySelector('.se').textContent = res[k].e; t.querySelector('.sl').textContent = TG.tx(res[k]);
        });
        const horses = res.filter((r) => r.k === 'horse').length;
        const same = res.every((r) => r.k === res[0].k);
        const i = T.cur, p = players[i];
        pos[i] = Math.min(GOAL, pos[i] + horses); place(i);
        if (horses) TG.sfx.good();
        msg.textContent = (horses
          ? L(`${p.name}: ${horses} морь! ${horses} алхам урагшиллаа 🐎`, `${p.name}: ${horses} horse${horses > 1 ? 's' : ''}! Move ${horses} 🐎`)
          : L(`${p.name}: морь буусангүй… Дараагийн удаа!`, `${p.name}: no horses… next time!`))
          + (same ? L(' Бүгд ижил — дахин шид!', ' All the same — roll again!') : '');
        rolls++;
        if (rolls % 3 === 0) { factI = (factI + 1) % FACTS.length; fact.replaceChildren('💡 ', TG.tx(FACTS[factI])); }
        T.scores[i] = pos[i]; T.render();
        if (pos[i] >= GOAL) {
          over = true; setBtn();
          msg.textContent = `🏆 ${p.name} ${L('түрүүллээ!', 'wins the race!')}`;
          TG.sfx.win();
          const humanWon = !p.bot;
          life.later(() => ctx.finish({ stars: ctx.together ? 3 : humanWon ? 3 : 2, scores: pos, players }), 1600);
          return;
        }
        if (!(await life.wait(800))) return;
        busy = false;
        if (!same) T.next();
        setBtn();
        if (players[T.cur].bot) life.later(roll, 900);
      }

      ctx.root.replaceChildren(h('div', { class: 'race' }, lanes.map((l) => l.row)), h('div', { class: 'shagai-row' }, tiles), msg, rollBtn, fact, rules);
      players.forEach((_, i) => place(i));
      setBtn();
      return () => life.stop();
    },
  });
})(window.TG);
