/* 3–10: healthy or not? everyday habits, with the reason why */
(function (TG) {
  const { h, L } = TG;
  const I = (e, good, mn, en, wmn, wen) => ({ e, good, mn, en, why: { mn: wmn, en: wen } });
  const ITEMS = [
    I('🪥', true, 'Өдөрт 2 удаа шүдээ угаах', 'Brushing teeth twice a day', 'Шүд цоорохгүй, эрүүл байна.', 'Keeps teeth strong and free of cavities.'),
    I('🧼', true, 'Хоолны өмнө гараа савандаж угаах', 'Washing hands before meals', 'Савангаар угаавал нян үхэж, өвдөхгүй.', 'Soap removes germs so we stay well.'),
    I('🍭', false, 'Өдөр бүр олон чихэр идэх', 'Eating lots of candy every day', 'Шүд цоорч, эрч хүч хурдан унана.', 'It causes cavities and energy crashes.'),
    I('🥕', true, 'Ногоо идэх', 'Eating vegetables', 'Ногоо витаминаар баялаг, өсөлтөд тустай.', 'Vegetables are full of vitamins for growing.'),
    I('💧', true, 'Ус уух', 'Drinking water', 'Бие махбодь ажиллахад ус хэрэгтэй.', 'Our body needs water to work well.'),
    I('🥤', false, 'Өдөр бүр ундаа уух', 'Drinking soda every day', 'Ундаа маш их элсэн чихэртэй.', 'Soda has a lot of sugar.'),
    I('🏃', true, 'Гадаа гүйж тоглох', 'Running and playing outside', 'Зүрх, булчин хүчтэй болно.', 'It makes the heart and muscles strong.'),
    I('📱', false, 'Өдөржин утас оролдох', 'Looking at a phone all day', 'Нүд ядарч, хөдөлгөөн багасна.', 'Eyes get tired and we move too little.'),
    I('😴', true, 'Эрт унтах', 'Going to bed early', 'Унтаж байхад бие өсөж, тархи амардаг.', 'We grow and our brain rests while sleeping.'),
    I('🥛', true, 'Сүү, тараг уух', 'Drinking milk and yogurt', 'Яс, шүдийг бэхжүүлнэ.', 'It makes bones and teeth stronger.'),
    I('🍟', false, 'Шарсан хоол их идэх', 'Eating lots of fried food', 'Хэт их тос бие махбодид ачаалал өгнө.', 'Too much oil is hard on the body.'),
    I('🧣', true, 'Хүйтэнд дулаан хувцаслах', 'Dressing warmly in the cold', 'Монголын өвөл хүйтэн! Дулаан хувцас хөлдөлтөөс хамгаална.', 'Mongolian winters are cold! Warm clothes prevent frostbite.'),
    I('😷', true, 'Ханиахдаа тохойгоороо халхлах', 'Coughing into your elbow', 'Нян бусдад халдахгүй.', 'Germs do not spread to others.'),
    I('🌙', false, 'Шөнө орой болтол зурагт үзэх', 'Watching TV late at night', 'Нойр дутаж, маргааш ядарна.', 'We lose sleep and feel tired tomorrow.'),
    I('🥣', true, 'Өглөөний цайгаа уух', 'Eating breakfast', 'Өдрийг эрч хүчтэй эхлүүлнэ.', 'It gives energy to start the day.'),
    I('🤗', true, 'Гэр бүлээ тэврэх', 'Hugging your family', 'Тэврэлт сэтгэлийг тайвшруулж, баярлуулдаг.', 'Hugs calm us down and make us happy.'),
  ];

  TG.registerGame({
    id: 'healthy', icon: '🍎', pillar: 'health', ages: ['3-6', '7-10'],
    title: { mn: 'Эрүүл зуршил', en: 'Healthy habits' },
    desc: { mn: 'Сайн уу, муу юу? Яагаад гэдгийг нь сур', en: 'Good or not? Learn why' },
    realLife: { mn: 'Өнөөдөр гэр бүлээрээ нэг эрүүл зуршил сонгоод, 7 хоног хамт хэрэгжүүлээрэй!', en: 'Pick one healthy habit as a family today and keep it together for a week!' },
    start(ctx) {
      const life = TG.lifecycle();
      const T = TG.makeTurns(ctx);
      const rounds = TG.shuffle(ITEMS).slice(0, 10);
      let i = 0, right = 0;
      const draw = () => {
        const it = rounds[i];
        const why = h('div', { class: 'why hidden' });
        const choose = (ans) => {
          btns.forEach((b) => (b.disabled = true));
          const ok = ans === it.good;
          if (ok) { right++; T.add(1); TG.sfx.good(); } else TG.sfx.bad();
          (ans ? btns[0] : btns[1]).classList.add(ok ? 'right' : 'wrong');
          why.replaceChildren(
            h('b', null, ok ? L('Зөв! ', 'Correct! ') : L('Үгүй ээ. ', 'Not quite. '), it.good ? L('Энэ сайн зуршил. ', 'This is a good habit. ') : L('Үүнийг багасгая. ', "Let's do less of this. ")),
            TG.tx(it.why),
            h('button', { class: 'btn primary block', onclick: () => { i++; if (i >= rounds.length) end(); else { T.next(); draw(); } } }, L('Дараах →', 'Next →')));
          why.classList.remove('hidden');
        };
        const btns = [
          h('button', { class: 'choice yes', onclick: () => choose(true) }, '😀 ', L('Сайн', 'Good')),
          h('button', { class: 'choice no', onclick: () => choose(false) }, '😟 ', L('Муу', 'Not good')),
        ];
        ctx.root.replaceChildren(TG.progress(i, rounds.length),
          h('div', { class: 'pic-card pop' }, h('div', { class: 'pic' }, it.e), h('div', { class: 'card-text' }, L(it.mn, it.en))),
          h('div', { class: 'choices row2' }, btns), why);
      };
      const end = () => {
        const r = right / rounds.length;
        ctx.finish({ stars: r >= 0.8 ? 3 : r >= 0.5 ? 2 : 1, scores: T.scores, summary: L(`${right}/${rounds.length} зөв`, `${right}/${rounds.length} correct`) });
      };
      draw();
      return () => life.stop();
    },
  });
})(window.TG);
