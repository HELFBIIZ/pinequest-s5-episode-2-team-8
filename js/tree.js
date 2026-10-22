/* Ургийн мод: "Долоон үеэ мэд" — know your seven generations. Children ask parents and grandparents and fill in
   the father's line and the mother's line up to the 7th generation. Each filled branch lights a star. */
(function (TG) {
  const { h, L, tx } = TG;
  const S = TG.store;
  const T = (mn, en) => ({ mn, en });
  const GENS = [
    { g: 2, name: T('Эцэг эх', 'Parents'), f: T('Аав', 'Father'), m: T('Ээж', 'Mother'), ask: T('Аав, ээжээсээ бүтэн нэрийг нь асуугаарай.', 'Ask your parents their full names.') },
    { g: 3, name: T('Өвөө, эмээ', 'Grandparents'), f: T('Аавын аав (өвөө)', 'Father’s father'), m: T('Ээжийн ээж (эмээ)', 'Mother’s mother'), ask: T('Аав, ээжээсээ: “Таны аав/ээж хэн бэ? Хаана төрсөн бэ?”', 'Ask your parents: “Who is your father/mother? Where were they born?”') },
    { g: 4, name: T('Элэнц', 'Great-grandparents'), f: T('Элэнц өвөө', 'Great-grandfather'), m: T('Элэнц эмээ', 'Great-grandmother'), ask: T('Өвөө, эмээгээсээ тэдний аав, ээжийн тухай асуугаарай.', 'Ask your grandparents about their own parents.') },
    { g: 5, name: T('Хуланц', 'Great-great-grandparents'), f: T('Хуланц өвөө', 'Great-great-grandfather'), m: T('Хуланц эмээ', 'Great-great-grandmother'), ask: T('Өвөө, эмээ чинь өөрсдийн өвөө, эмээгийн нэрийг санаж байж магадгүй.', 'Your grandparents may remember their own grandparents’ names.') },
    { g: 6, name: T('Улунц', '5th generation'), f: T('Улунц өвөө', '3×great-grandfather'), m: T('Улунц эмээ', '3×great-grandmother'), ask: T('Ахмад хамаатнууд, ургийн бичиг, хуучин зургаас хайгаарай.', 'Ask older relatives, or look in family records and old photos.') },
    { g: 7, name: T('Өлөнц', '7th generation'), f: T('Өлөнц өвөө', '4×great-grandfather'), m: T('Өлөнц эмээ', '4×great-grandmother'), ask: T('Энэ бол хамгийн хэцүү! Гэр бүлээрээ хамтдаа хайгаарай.', 'This is the hardest one! Search for it together as a family.') },
  ];
  const KEYS = GENS.flatMap((g) => ['f' + g.g, 'm' + g.g]);
  const tree = (p) => { p.tree = p.tree || { ovog: '', n: {} }; p.tree.n = p.tree.n || {}; return p.tree; };
  const filled = (p) => KEYS.filter((k) => tree(p).n[k] && tree(p).n[k].name).length;

  function editNode(p, key, onSave) {
    const g = GENS.find((x) => x.g === +key.slice(1)), side = key[0], t = tree(p), cur = t.n[key] || {};
    const inp = (ph, v, max = 40) => h('input', { class: 'input', placeholder: ph, value: v || '', maxlength: max, onkeydown: (e) => e.stopPropagation() });
    const name = inp(L('Нэр', 'Name'), cur.name), year = inp(L('Төрсөн он (мэдвэл)', 'Birth year (if known)'), cur.year, 4), place = inp(L('Төрсөн нутаг (аймаг, сум)', 'Birthplace (province, district)'), cur.place);
    const note = h('textarea', { class: 'input', rows: 3, maxlength: 300, placeholder: L('Тэдний тухай сонирхолтой түүх, ажил мэргэжил…', 'A story about them, their work…'), onkeydown: (e) => e.stopPropagation() }, cur.note || '');
    let by = cur.by || null;
    const byRow = h('div', { class: 'fam-chips' });
    const drawBy = () => byRow.replaceChildren(...S.state.family.map((f) => h('button', { class: 'fam-chip' + (by === tx(f.name) ? ' active' : ''), onclick: () => { by = tx(f.name); drawBy(); } }, f.emoji, ' ', tx(f.name))));
    drawBy();
    const err = h('div', { class: 'err' });
    const close = TG.modal(h('div', { class: 'form' },
      h('h2', null, '🌳 ', tx(side === 'f' ? g.f : g.m)),
      h('p', { class: 'muted' }, `${g.g}-${L('р үе', ' generation')} · ${tx(g.name)}`),
      h('div', { class: 'tree-ask' }, '💬 ', tx(g.ask)),
      h('label', null, L('Нэр', 'Name')), name,
      h('label', null, L('Төрсөн он', 'Birth year')), year,
      h('label', null, L('Нутаг', 'Birthplace')), place,
      h('label', null, L('Түүх', 'Story')), note,
      h('label', null, L('Хэнээс асууж мэдсэн бэ?', 'Who told you?')), byRow, err,
      h('button', { class: 'btn primary big block', onclick: () => {
        const n = name.value.trim(); if (!n) { err.textContent = L('Нэрийг нь бичээрэй 🙂', 'Please write their name 🙂'); return; }
        const wasNew = !(t.n[key] && t.n[key].name);
        t.n[key] = { name: n, year: year.value.trim().replace(/\D/g, '').slice(0, 4), place: place.value.trim(), note: note.value.trim(), by };
        let msg = L('Хадгаллаа!', 'Saved!');
        if (wasNew) {
          S.addFamilyStars(1); const r = TG.villageReward ? TG.villageReward(10, 15) : null;
          const both = t.n['f' + g.g] && t.n['f' + g.g].name && t.n['m' + g.g] && t.n['m' + g.g].name;
          if (both) S.addFamilyStars(2);
          msg = `⭐ ${L('Шинэ од гэрэлтлээ!', 'A new star lights up!')}` + (both ? ' ' + L(`${tx(g.name)} үе бүрэн боллоо! +2 ⭐`, `${tx(g.name)} complete! +2 ⭐`) : '') + (r ? ` · 🪙 +${r.coins}` : '');
          TG.sfx.chime && TG.sfx.chime(); S.logActivity && S.logActivity({ kind: 'tree', id: key });
        }
        S.save(); close(); TG.toast(msg); TG.achievements && TG.achievements.check(); onSave();
      } }, L('Хадгалах', 'Save')),
      cur.name ? h('button', { class: 'link-btn danger center-block', onclick: () => { delete t.n[key]; S.save(); close(); onSave(); } }, L('Устгах', 'Remove')) : null));
    setTimeout(() => name.focus(), 200);
  }

  function screen({ shell, rerender }) {
    const p = S.active(), t = tree(p), n = filled(p);
    const node = (key, label) => {
      const d = t.n[key];
      return h('button', { class: 'tree-node' + (d && d.name ? ' on' : ''), onclick: () => editNode(p, key, rerender) },
        h('span', { class: 'tn-star' }, d && d.name ? '⭐' : '☆'), h('small', null, tx(label)),
        d && d.name ? h('b', null, d.name) : h('b', { class: 'tn-add' }, '+ ', L('Нэмэх', 'Add')),
        d && (d.year || d.place) ? h('small', { class: 'tn-meta' }, [d.year, d.place].filter(Boolean).join(' · ')) : null);
    };
    const sky = h('div', { class: 'tree-sky', 'aria-label': `${n}/12` }, KEYS.map((k, i) => h('i', { class: t.n[k] && t.n[k].name ? 'on' : '', style: { left: (8 + ((i * 37) % 84)) + '%', top: (10 + ((i * 23) % 70)) + '%', animationDelay: (i % 5) * 0.5 + 's' } }, '★')));
    const ovog = h('input', { class: 'input', maxlength: 30, value: t.ovog || '', placeholder: L('ж: Боржигин', 'e.g. Borjigin'), onkeydown: (e) => e.stopPropagation(),
      onchange: (e) => { const had = !!t.ovog; t.ovog = e.target.value.trim(); S.save(); if (!had && t.ovog) { S.addFamilyStars(1); TG.toast(L('Ургийн овгоо бичлээ! +1 ⭐', 'Clan name saved! +1 ⭐')); } TG.achievements && TG.achievements.check(); } });
    return shell([
      h('section', { class: 'tree-hero px-card' }, sky,
        h('div', { class: 'tree-hero-b' }, h('div', { class: 'eyebrow' }, L('Ургийн мод', 'Family tree')), h('h1', null, L('Долоон үеэ мэд', 'Know your seven generations')),
          h('p', null, L('Монголчууд “долоон үеэ мэддэг байх ёстой” гэдэг. Аав, ээж, өвөө, эмээгээсээ асууж ургийн модоо бөглөөрэй. Мөчир бүр нэг од гэрэлтүүлнэ!', 'Mongolians say you should know your seven generations. Ask your parents and grandparents and fill in your tree. Every branch lights a star!')),
          h('div', { class: 'tree-count' }, `⭐ ${n} / 12`))),
      h('section', { class: 'card tree-ovog' }, h('label', null, '🏷️ ', L('Ургийн овог', 'Clan name (urgiin ovog)')), ovog,
        h('small', { class: 'muted' }, L('Монгол хүн бүр ургийн овогтой. Мэдэхгүй бол аав, ээж, өвөөгөөсөө асуугаарай.', 'Every Mongolian has a clan name. If you don’t know yours, ask your parents or grandparents.'))),
      h('div', { class: 'tree' },
        h('div', { class: 'tree-sides' }, h('b', null, L('Аавын тал', 'Father’s side')), h('span'), h('b', null, L('Ээжийн тал', 'Mother’s side'))),
        [...GENS].reverse().map((g) => h('div', { class: 'tree-row' }, node('f' + g.g, g.f), h('div', { class: 'tree-gen' }, h('b', null, g.g), h('small', null, tx(g.name))), node('m' + g.g, g.m))),
        h('div', { class: 'tree-row me' }, h('span'), h('div', { class: 'tree-me' }, h('span', { class: 'av big' }, p.avatar), h('b', null, p.name), h('small', null, L('1-р үе · Би', '1st generation · Me'))), h('span'))),
      h('p', { class: 'muted center' }, L('Ургийн мод зөвхөн энэ төхөөрөмж дээр хадгалагдана.', 'Your family tree is saved only on this device.')),
    ]);
  }
  TG.familyTree = { GENS, KEYS, filled: (p) => filled(p), screen };
})(window.TG);
