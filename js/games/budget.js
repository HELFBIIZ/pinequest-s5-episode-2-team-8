/* 7–18: plan a healthy weekly family food basket on a budget (money + health) */
(function (TG) {
  const { h, L } = TG;
  const GROUPS = {
    protein: { e: '🥩', mn: 'Уураг', en: 'Protein' }, grain: { e: '🌾', mn: 'Үр тариа', en: 'Grains' },
    veg: { e: '🥕', mn: 'Ногоо', en: 'Vegetables' }, fruit: { e: '🍎', mn: 'Жимс', en: 'Fruit' },
    dairy: { e: '🥛', mn: 'Цагаан идээ', en: 'Dairy' },
  };
  const I = (id, e, mn, en, price, g, junk) => ({ id, e, mn, en, price, g, junk: !!junk });
  const ITEMS = [
    I('meat', '🥩', 'Үхрийн мах 1кг', 'Beef 1kg', 22000, 'protein'), I('eggs', '🥚', 'Өндөг 10ш', 'Eggs ×10', 7000, 'protein'),
    I('sausage', '🌭', 'Хиам', 'Sausage', 12000, 'protein', true), I('flour', '🌾', 'Гурил 5кг', 'Flour 5kg', 13000, 'grain'),
    I('rice', '🍚', 'Будаа 2кг', 'Rice 2kg', 8000, 'grain'), I('bread', '🍞', 'Талх', 'Bread', 3000, 'grain'),
    I('veg', '🥔', 'Төмс, лууван, байцаа', 'Potato, carrot, cabbage', 9000, 'veg'), I('salad', '🥬', 'Салатны ногоо', 'Salad greens', 6000, 'veg'),
    I('apple', '🍎', 'Алим 1кг', 'Apples 1kg', 8000, 'fruit'), I('banana', '🍌', 'Гадил', 'Bananas', 6000, 'fruit'),
    I('milk', '🥛', 'Сүү 2л', 'Milk 2L', 7000, 'dairy'), I('aaruul', '🧀', 'Ааруул', 'Aaruul (dried curd)', 5000, 'dairy'),
    I('candy', '🍬', 'Чихэр', 'Candy', 8000, null, true), I('soda', '🥤', 'Ундаа 1.5л', 'Soda 1.5L', 4500, null, true),
    I('chips', '🍟', 'Чипс', 'Chips', 5000, null, true),
  ];

  TG.registerGame({
    id: 'budget', icon: '🛒', pillar: 'skills', ages: ['7-10', '11-14', '15-18'],
    title: { mn: 'Гэр бүлийн сагс', en: 'Family basket' },
    desc: { mn: 'Төсөвтөө багтаан 7 хоногийн эрүүл хоолоо төлөвлө', en: 'Plan a healthy week of food within budget' },
    realLife: { mn: 'Дараагийн удаа эцэг эхтэйгээ дэлгүүр орохдоо жагсаалтыг та хийж, төсвийг нь хамт тооцоолоорой.', en: 'Next time you shop with your parents, write the list yourself and keep track of the budget together.' },
    start(ctx) {
      const older = ctx.ageGroup === '15-18';
      const budget = older ? 45000 : 60000, saveGoal = older ? 8000 : 0;
      const cart = new Set();
      const head = h('div', { class: 'budget-head' });
      const grid = h('div', { class: 'shop-grid' });
      const doneBtn = h('button', { class: 'btn primary big block', onclick: () => finish() });
      const spent = () => [...cart].reduce((s, id) => s + ITEMS.find((x) => x.id === id).price, 0);
      const covered = () => new Set([...cart].map((id) => ITEMS.find((x) => x.id === id).g).filter(Boolean));
      const junk = () => [...cart].filter((id) => ITEMS.find((x) => x.id === id).junk).length;

      const render = () => {
        const s = spent(), left = budget - s, cov = covered(), j = junk();
        const pct = Math.min(100, (s / budget) * 100);
        head.replaceChildren(
          h('div', { class: 'wallet' + (left < 0 ? ' over' : '') },
            h('div', null, h('small', null, L('Төсөв', 'Budget')), h('b', null, TG.money(budget))),
            h('div', null, h('small', null, L('Зарсан', 'Spent')), h('b', null, TG.money(s))),
            h('div', null, h('small', null, L('Үлдсэн', 'Left')), h('b', null, TG.money(left)))),
          h('div', { class: 'meter' }, h('span', { style: { width: pct + '%' } })),
          h('div', { class: 'groups' }, Object.entries(GROUPS).map(([k, g]) => h('span', { class: 'grp' + (cov.has(k) ? ' ok' : '') }, g.e, ' ', L(g.mn, g.en), cov.has(k) ? ' ✓' : ''))),
          j > 1 ? h('div', { class: 'warn' }, L('⚠️ Чихэрлэг, тостой зүйл олон байна. Эрүүл мэндээ бодъё!', '⚠️ Lots of sugary or fatty foods. Think about health!')) : null);
        grid.querySelectorAll('.shop-item').forEach((b) => b.classList.toggle('in', cart.has(b.dataset.id)));
        doneBtn.disabled = left < 0 || cart.size === 0;
        doneBtn.textContent = left < 0 ? L('Төсөв хэтэрлээ! Зарим зүйлээ хас', 'Over budget! Remove something') : L('Сагсаа баталгаажуулах ✓', 'Check out ✓');
      };
      ITEMS.forEach((it) => grid.appendChild(h('button', {
        class: 'shop-item', 'data-id': it.id,
        onclick: () => { cart.has(it.id) ? cart.delete(it.id) : cart.add(it.id); TG.sfx.tap(); render(); },
      }, h('span', { class: 'si-e' }, it.e), h('span', { class: 'si-n' }, L(it.mn, it.en)), h('span', { class: 'si-p' }, TG.money(it.price)))));

      function finish() {
        const cov = covered(), j = junk(), left = budget - spent();
        const missing = Object.keys(GROUPS).filter((k) => !cov.has(k)).map((k) => L(GROUPS[k].mn, GROUPS[k].en));
        const stars = cov.size === 5 && j <= 1 && left >= saveGoal ? 3 : cov.size >= 4 ? 2 : 1;
        const parts = [L(`${cov.size}/5 хүнсний бүлэг`, `${cov.size}/5 food groups`), L(`${TG.money(left)} хэмнэсэн`, `${TG.money(left)} saved`)];
        if (missing.length) parts.push(L('Дутуу: ', 'Missing: ') + missing.join(', '));
        if (saveGoal && left < saveGoal) parts.push(L(`Зорилго: дор хаяж ${TG.money(saveGoal)} хэмнэх`, `Goal: save at least ${TG.money(saveGoal)}`));
        ctx.finish({ stars, summary: parts.join(' · ') });
      }

      ctx.hud.replaceChildren(h('div', { class: 'hud-pill' }, ctx.together ? '🤝 ' + L('Хамтдаа шийд', 'Decide together') : '🛒'));
      ctx.root.replaceChildren(
        h('p', { class: 'prompt' }, L(
          `Гэр бүлдээ 7 хоногийн хоол ав. 5 бүлгийг бүгдийг нь багтаа${saveGoal ? `, дор хаяж ${TG.money(saveGoal)} хэмнэ` : ''}!`,
          `Buy a week of food for your family. Cover all 5 food groups${saveGoal ? ` and save at least ${TG.money(saveGoal)}` : ''}!`)),
        head, grid, h('p', { class: 'note' }, L('* Үнэ нь жишээ төдий.', '* Prices are examples only.')), doneBtn);
      render();
    },
  });
})(window.TG);
