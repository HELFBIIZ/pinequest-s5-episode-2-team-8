/* 3–6: count the five kinds of Mongolian livestock (таван хошуу мал) */
(function (TG) {
  const { h, L } = TG;
  const ANIMALS = [
    { e: '🐎', mn: 'морь', en: 'horses' }, { e: '🐫', mn: 'тэмээ', en: 'camels' }, { e: '🐄', mn: 'үхэр', en: 'cows' },
    { e: '🐑', mn: 'хонь', en: 'sheep' }, { e: '🐐', mn: 'ямаа', en: 'goats' },
  ];
  const NUM_MN = ['тэг', 'нэг', 'хоёр', 'гурав', 'дөрөв', 'тав', 'зургаа', 'долоо', 'найм', 'ес', 'арав'];
  const NUM_EN = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

  TG.registerGame({
    id: 'counting', icon: '🐑', pillar: 'edu', ages: ['3-6'],
    title: { mn: 'Таван хошуу мал', en: 'Count the herd' },
    desc: { mn: 'Малаа нэг нэгээр нь хуруугаараа тоол', en: 'Tap each animal to count the herd' },
    realLife: { mn: 'Эмээ, өвөөгөөсөө таван хошуу малын нэр, дууг асууж, хамт дууриагаарай!', en: 'Ask your grandparents the names and sounds of the five livestock, and imitate them together!' },
    start(ctx) {
      const life = TG.lifecycle();
      const T = TG.makeTurns(ctx);
      const total = 8; let i = 0, firstTry = 0;

      const draw = () => {
        const a = TG.pick(ANIMALS), n = TG.rand(2, 10);
        let counted = 0, tried = false;
        const field = h('div', { class: 'field' });
        for (let k = 0; k < n; k++) {
          const b = h('button', {
            class: 'animal', style: { animationDelay: k * 40 + 'ms' }, 'aria-label': a.en,
            onclick: () => {
              if (b.dataset.n) return;
              counted++; b.dataset.n = counted;
              b.appendChild(h('span', { class: 'badge' }, counted));
              TG.sfx.tap(); TG.speak(NUM_MN[counted]);
            },
          }, a.e);
          field.appendChild(b);
        }
        const set = new Set([n]);
        while (set.size < 3) { const x = n + TG.pick([-3, -2, -1, 1, 2, 3]); if (x >= 1 && x <= 10) set.add(x); }
        const answer = h('div', { class: 'answer-line' });
        const btns = [...set].sort((x, y) => x - y).map((o) => h('button', {
          class: 'choice num',
          onclick: (e) => {
            if (o === n) {
              if (!tried) { firstTry++; T.add(1); }
              e.currentTarget.classList.add('right'); btns.forEach((b) => (b.disabled = true));
              answer.textContent = `${n} — ${L(NUM_MN[n], NUM_EN[n])}! 🎉`; TG.sfx.good(); TG.speak(NUM_MN[n]);
              life.later(() => { i++; if (i >= total) end(); else { T.next(); draw(); } }, 1500);
            } else { tried = true; e.currentTarget.classList.add('wrong'); e.currentTarget.disabled = true; TG.sfx.bad(); }
          },
        }, o));
        ctx.root.replaceChildren(TG.progress(i, total),
          h('p', { class: 'prompt' }, L(`Хэдэн ${a.mn} байна? Нэг нэгээр нь дарж тоол!`, `How many ${a.en}? Tap each one to count!`)),
          field, answer, h('div', { class: 'choices row3' }, btns));
      };
      const end = () => {
        const r = firstTry / total;
        ctx.finish({ stars: r >= 0.8 ? 3 : r >= 0.5 ? 2 : 1, scores: T.scores });
      };
      draw();
      return () => life.stop();
    },
  });
})(window.TG);
