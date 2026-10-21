/* 3–6: Mongolian Cyrillic alphabet — find the first letter of the picture */
(function (TG) {
  const { h, L } = TG;
  const WORDS = [
    ['А', 'Алим', '🍎', 'apple'], ['Б', 'Бөмбөг', '⚽', 'ball'], ['Г', 'Гахай', '🐷', 'pig'], ['Д', 'Дугуй', '🚲', 'bicycle'],
    ['З', 'Заан', '🐘', 'elephant'], ['Л', 'Лууван', '🥕', 'carrot'], ['М', 'Морь', '🐎', 'horse'], ['Н', 'Нар', '☀️', 'sun'],
    ['О', 'Од', '⭐', 'star'], ['Ө', 'Өндөг', '🥚', 'egg'], ['Р', 'Ракет', '🚀', 'rocket'], ['С', 'Сар', '🌙', 'moon'],
    ['Т', 'Тэмээ', '🐫', 'camel'], ['У', 'Ус', '💧', 'water'], ['Ү', 'Үхэр', '🐄', 'cow'], ['Х', 'Хонь', '🐑', 'sheep'],
    ['Ц', 'Цэцэг', '🌸', 'flower'], ['Ч', 'Чоно', '🐺', 'wolf'], ['Ш', 'Шувуу', '🐦', 'bird'], ['Я', 'Ямаа', '🐐', 'goat'],
    ['Э', 'Эмээ', '👵', 'grandma'], ['Ж', 'Жимс', '🍇', 'fruit'], ['Б', 'Баавгай', '🐻', 'bear'], ['Ү', 'Үнэг', '🦊', 'fox'],
  ];
  const LETTERS = [...new Set(WORDS.map((w) => w[0]))];

  TG.registerGame({
    id: 'letters', icon: '🔤', pillar: 'edu', ages: ['3-6'],
    title: { mn: 'Цагаан толгой', en: 'Mongolian ABC' },
    desc: { mn: 'Зургийг хараад эхний үсгийг нь ол', en: 'Look at the picture, find its first letter' },
    realLife: { mn: 'Гэрээсээ "М" үсгээр эхэлдэг 3 зүйлийг хамтдаа олоорой (мах, малгай...).', en: 'Find 3 things at home starting with "М" together (мах, малгай...).' },
    start(ctx) {
      const life = TG.lifecycle();
      const T = TG.makeTurns(ctx);
      const rounds = TG.shuffle(WORDS).slice(0, 8);
      let i = 0, firstTry = 0;

      const draw = () => {
        const [ch, word, emoji, en] = rounds[i];
        const opts = TG.shuffle([ch, ...TG.shuffle(LETTERS.filter((x) => x !== ch)).slice(0, 2)]);
        let tried = false;
        const blank = h('span', { class: 'blank' }, '?');
        const card = h('div', { class: 'pic-card pop' },
          h('div', { class: 'pic' }, emoji),
          h('div', { class: 'big-word' }, blank, word.slice(1), TG.speakBtn(word)),
          TG.lang() === 'en' ? h('div', { class: 'sub' }, en) : null);
        const btns = opts.map((o) => h('button', {
          class: 'choice letter',
          onclick: (e) => {
            if (o === ch) {
              if (!tried) { firstTry++; T.add(1); }
              blank.textContent = ch; blank.classList.add('ok');
              e.currentTarget.classList.add('right'); TG.sfx.good(); TG.speak(word);
              btns.forEach((b) => (b.disabled = true));
              life.later(() => { i++; if (i >= rounds.length) end(); else { T.next(); draw(); } }, 1300);
            } else { tried = true; e.currentTarget.classList.add('wrong'); e.currentTarget.disabled = true; TG.sfx.bad(); }
          },
        }, o));
        ctx.root.replaceChildren(TG.progress(i, rounds.length), card,
          h('p', { class: 'prompt' }, L('Аль үсгээр эхэлж байна?', 'Which letter does it start with?')),
          h('div', { class: 'choices row3' }, btns));
      };
      const end = () => {
        const r = firstTry / rounds.length;
        ctx.finish({ stars: r >= 0.8 ? 3 : r >= 0.5 ? 2 : 1, scores: T.scores, summary: L(`${firstTry}/${rounds.length} үсгийг анхны оролдлогоор олсон`, `${firstTry}/${rounds.length} letters found on first try`) });
      };
      draw();
      return () => life.stop();
    },
  });
})(window.TG);
