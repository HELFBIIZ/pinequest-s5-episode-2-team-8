/* Building your own ger by hand, on your plot in Нутаг: you choose what comes next, do every step yourself,
   and Grandpa Craftsman laughs kindly and gives a hint when the order is wrong. Nothing is ever lost. */
(function (TG) {
  const { L, tx } = TG, R = TG.vrules;
  const T = (mn, en) => ({ mn, en });
  let api = null; // village.js hands over what this needs: V, live, net, reward, factCard, lotsArr, enterGer, colours, save

  const STEP = {
    shal: T('Шалаа тавих', 'Lay the floor'), khana: T('Ханаа дэлгэх', 'Unfold the walls'), khaalga: T('Хаалгаа уях', 'Tie the door'),
    toono: T('Тоноо өргөх', 'Lift the toono'), uni: T('Униа хатгах', 'Push in the roof poles'), esgii: T('Эсгий бүрэх', 'Wrap the felt'),
    buurees: T('Бүрээс хучих', 'Pull on the cover'), buslvvr: T('Бүслүүр чангалах', 'Tighten the ropes'), tulga: T('Тулга тавих', 'Set up the stove'),
  };
  const PART = {
    khana: T('хана', 'wall lattices'), khaalga: T('хаалга', 'a door'), toono: T('тооно', 'a toono'), bagana: T('багана', 'posts'), uni: T('унь', 'roof poles'),
    esgii: T('эсгий', 'felt'), buurees: T('бүрээс', 'a cover'), buslvvr: T('бүслүүр', 'ropes'),
  };
  // where a missing part comes from
  const FROM = { esgii: T('Хонио хяргаж, ноосоор эсгий хий.', 'Shear sheep and make felt from the wool.'), buurees: T('Дэлгүүрээс авна.', 'The shop sells it.') };
  const FROM_GRANDPA = T('Мужаан өвөөгөөс авна.', 'Grandpa Craftsman makes it.');
  // grandpa's hint: what comes next, and why (from the ger lesson)
  const WHY = {
    shal: T('Эхлээд тэгш газар шалаа тавина. Тэгш шал гэрийг тэгш, бат бөх болгоно.', 'First lay the floor on flat ground: a level floor keeps the ger straight and strong.'),
    khana: T('Шалан дээр ханаа тойруулан дэлгэнэ. Хана бол эвхэгддэг тор.', 'Next, stand the folding lattice walls in a circle on the floor.'),
    khaalga: T('Хоёр ханын дунд хаалгаа уяна. Хаалга урагшаа харна.', 'Tie the door between two walls, facing south.'),
    toono: T('Одоо тоноо хоёр баганаар тулж өргөнө. Үүнийг хоёр хүн хамт хийдэг.', 'Now lift the toono up on its two posts. Two people do this together.'),
    uni: T('Униа тоононд хатгаад ханын толгойд уяна, дөрвөн зүгт ээлжлэн.', 'Push the roof poles into the toono and tie them to the walls, taking turns all around.'),
    esgii: T('Хана, униа ноосон эсгийгээр бүрнэ. Эсгий өвлийн хүйтнээс хамгаална.', 'Wrap the walls and roof in wool felt to keep out the winter cold.'),
    buurees: T('Эсгийн гадуур цагаан бүрээс хучина: бороо, нарнаас хамгаална.', 'Pull the white cover over the felt: it keeps out rain and sun.'),
    buslvvr: T('Гурван бүслүүрээр бүсэлбэл гэр хүчтэй салхинд ч хөдлөхгүй.', 'Three ropes around the ger keep it steady even in strong wind.'),
    tulga: T('Сүүлд нь голд тулгаа тавьж, анхны цайгаа чанана.', 'Last, set the stove in the middle and make the first tea.'),
  };

  const g = () => api.V().ger;
  const young = () => ((TG.store.active() || {}).age || 99) < 9;

  // ---------------------------------------------------------------- the stage art: the lesson's ger, at this point of the build
  function gerArt(stage) {
    return (x, t, st) => {
      x.save(); x.translate(20, 20);
      const q = st && st.n ? st.progress / st.n : 0, sub = R.GER_STEPS[stage] === 'khana' || R.GER_STEPS[stage] === 'uni';
      if (sub && st && st.kind !== 'choose') TG.scenes.ger(x, { stage: stage + 1, sub: q }, t); // walls and poles go up one by one
      else {
        TG.scenes.ger(x, { stage }, t);
        if (q > 0 && st.kind !== 'choose') { x.globalAlpha = q; TG.scenes.ger(x, { stage: stage + 1 }, t); x.globalAlpha = 1; }
      }
      x.restore();
    };
  }
  /** The hands-on task for one building step. */
  function stepSpec(step) {
    const stage = g().stage, art = gerArt(stage), title = STEP[step], spec = (o) => ({ title, art, ...o });
    const uniSpots = Array.from({ length: 9 }, (_, i) => { const a = (i / 9) * Math.PI * 2; return [Math.round(80 + Math.cos(a) * 30), Math.round(62 + Math.sin(a) * 9)]; });
    const sideOf = ([x, y]) => (x > 96 ? 0 : x < 64 ? 2 : y > 62 ? 1 : 3);
    switch (step) {
      case 'shal': return spec({ kind: 'spots', hint: T('Шалны банзнуудыг нэг нэгээр нь тавь.', 'Lay the floor boards one by one.'), spots: [[52, 84], [68, 85], [92, 85], [108, 84]] });
      case 'khana': return spec({ kind: 'drag', n: 5, hint: T('Хана бүрийг шараар нь чирж дэлгэ. 5 хана!', 'Drag each lattice open by its gold handle. 5 walls!'), path: [[52, 74], [108, 74]] });
      case 'khaalga': return spec({ kind: 'turn', start: Math.PI, target: Math.PI / 2, tol: 0.35, hint: T('Хаалгыг эргүүлж урд зүг (доош) харуулаад тавь.', 'Turn the door to face south (down), then let go.'),
        onMiss: () => TG.tasks.say(T('Өвөө: Урд зүгээс нар тусдаг, хойд зүгээс хүйтэн салхи үлээдэг. Хаалгаа урагш харуулъя!', 'Grandpa: The sun comes from the south and cold winds from the north. Face the door south!')) });
      case 'toono': return spec({ kind: 'hold', holders: 2, two: 'help', ms: 1500, hint: TG.tasks.players() === 2 ? T('Хоёулаа зэрэг дарж байгаад тоноо өргө!', 'Both hold at the same time to lift the toono!') : T('Дарж байгаад өргө. Нөгөө баганыг өвөө барьж байна.', 'Hold to lift. Grandpa is holding the other post.') });
      case 'uni': return spec({ kind: 'spots', spots: uniSpots, side: uniSpots.map(sideOf), rule: R.unisTilt, hint: T('Униа дөрвөн зүгт ээлжлэн хатга, тооно тэгш байх ёстой.', 'Push the poles in all around, so the toono stays level.'),
        onMiss: () => TG.tasks.say(T('Өвөө: Тооно хазайчихлаа! Нөгөө талд нь унь хатга.', 'Grandpa: The toono is tilting! Put a pole on the other side.')) });
      case 'esgii': return spec({ kind: 'drag', n: 2, hint: T('Эсгийг гэрийн эргэн тойронд ороо.', 'Wrap the felt around the ger.'), path: [[52, 60], [108, 60]] });
      case 'buurees': return spec({ kind: 'drag', n: 1, hint: T('Цагаан бүрээсийг дээрээс доош тат.', 'Pull the white cover down over the felt.'), path: [[80, 36], [80, 84]] });
      case 'buslvvr': return spec({ kind: 'hold', holders: 1, ms: 900, n: 3, hint: T('Бүслүүр бүрийг дарж байгаад чангал.', 'Hold to pull each rope tight.') });
      case 'tulga': return spec({ kind: 'spots', hint: T('Голд нь тулгаа тавьж, анхны цайгаа чана.', 'Set the stove in the middle and make the first tea.'), spots: [[80, 78]] });
    }
    return null;
  }

  // ---------------------------------------------------------------- the plot
  /** Keep the local copy of my plot (solo play) in step with my build, and tell the room when online. */
  function putLot(i, stage, first) {
    const v = api.V(), live = api.live(), local = v.lots;
    const mine = local[i] && local[i].by === v.id ? local[i] : null;
    local[i] = Object.assign(mine || { by: v.id, n: live ? live.name : '', roof: 'blue', door: 'red', furn: [] }, { stage });
    if (live && live.online) {
      if (first || !(live.lots || []).some((l) => l && l.by === v.id)) api.net.send({ t: 'ger-claim', i, roof: local[i].roof, door: local[i].door, stage });
      else api.net.send({ t: 'ger-stage', stage });
    }
    api.save(); api.refresh();
  }
  /** On joining a room (or starting solo): a ger part-way up comes along to a free plot. */
  function sync() {
    const v = api.V(), live = api.live(), G = g();
    if (!live || G.stage < 1) return;
    if (!live.online) { if (!(v.lots[G.lot] && v.lots[G.lot].by === v.id)) { const i = v.lots.findIndex((l) => !l); if (i >= 0) { G.lot = i; putLot(i, G.stage); } } return; }
    const lots = live.lots || [], at = lots.findIndex((l) => l && l.by === v.id);
    if (at >= 0) { G.lot = at; if (R.lotStage(lots[at]) < G.stage) api.net.send({ t: 'ger-stage', stage: G.stage }); return; }
    const i = !lots[G.lot] ? G.lot : lots.findIndex((l) => !l);
    if (i < 0) return TG.toast(L('Энэ өрөөнд сул газар алга. Гэр чинь зөвхөн чамд харагдана.', 'No free plot in this room. Your ger shows only for you.'));
    G.lot = i; const l = v.lots[i] || {};
    api.net.send({ t: 'ger-claim', i, roof: l.roof || 'blue', door: l.door || 'red', stage: G.stage }); api.save();
  }

  // ---------------------------------------------------------------- building
  let busy = false, together = false;
  /** Build (or keep building) a ger on plot i, one hands-on step at a time. */
  async function build(i) {
    const v = api.V(), G = g();
    if (busy || G.stage >= R.GER_DONE) return;
    if (G.stage > 0) i = G.lot; // your ger is already going up on its own plot
    busy = true; together = false;
    let wrongHere = 0, say = null;
    try {
      while (G.stage < R.GER_DONE) {
        const options = R.GER_STEPS.filter((s, k) => k >= G.stage && Object.entries(R.GER_NEEDS[s]).every(([p, n]) => (G.parts[p] || 0) >= n))
          .map((s) => ({ id: s, icon: TG.pixel.iconCanvas(s === 'shal' || s === 'tulga' ? 'part:' + s : 'part:' + Object.keys(R.GER_NEEDS[s])[0]), label: STEP[s] }));
        const r = await TG.tasks.run({ kind: 'choose', title: T('Дараа нь юу хийх вэ?', 'What comes next?'), hint: T('Гэрийнхээ дараагийн хэсгийг сонго.', 'Choose the next part of your ger.'), options, art: gerArt(G.stage), say, shake: !!say });
        say = null;
        if (!r.done) return;
        const res = R.gerTry(G.stage, r.pick, G.parts);
        if (!res.ok && res.why === 'order') { // a gentle sag: grandpa laughs and helps, nothing is lost
          G.mistakes++; wrongHere++; api.save();
          const name = wrongHere >= (young() ? 1 : 2);
          say = TG.learn && TG.learn.done('ger') ? T(`Өвөө: Дараа нь “${STEP[res.next].mn}”.`, `Grandpa: Next comes “${STEP[res.next].en}”.`)
            : name ? T(`Өвөө: Хэ хэ, гэр унжчихлаа! ${WHY[res.next].mn}`, `Grandpa: Ha ha, the ger is sagging! ${WHY[res.next].en}`)
              : T('Өвөө: Хэ хэ, гэр унжчихлаа! Юуг нь эхэлж хийдэг билээ?', 'Grandpa: Ha ha, the ger is sagging! What comes first?');
          continue;
        }
        if (!res.ok) { // parts missing: say what, and who has them
          const miss = Object.keys(res.missing || {});
          TG.toast('🧰 ' + L('Дутуу: ', 'Missing: ') + miss.map((p) => tx(PART[p])).join(', ') + '. ' + tx(FROM[miss[0]] || FROM_GRANDPA));
          return;
        }
        wrongHere = 0;
        const step = r.pick, sr = await TG.tasks.run(stepSpec(step));
        if (!sr.done) return;
        if (sr.together) together = true;
        G.parts = R.gerUse(G.parts, step); G.stage++; G.mistakes += sr.mistakes || 0;
        if (G.stage === 1) G.lot = i;
        putLot(G.lot, G.stage, G.stage === 1);
      }
      finish(G.lot);
    } finally { busy = false; }
  }
  function finish(i) {
    const v = api.V(), G = g(), p2 = (api.live() || {}).p2;
    v.gerBuilt = true; G.perfect = G.mistakes === 0;
    api.reward(0, 30); TG.sfx.win(); TG.confetti(70);
    if (together && p2) TG.store.logActivity && TG.store.logActivity({ kind: 'together', id: 'ger|family|' + p2.name });
    api.save(); TG.achievements && TG.achievements.check();
    const lesson = TG.learn && TG.learn.byId('ger'), { h } = TG;
    const close = TG.modal(h('div', { class: 'center v-fact' },
      h('div', { class: 'v-fact-e' }, TG.pixel.icon('ui:ger', 72)),
      h('h2', null, L('Гэр бэлэн боллоо! 🎉', 'Your ger is ready! 🎉')),
      h('div', { class: 'teach' }, h('b', null, '💡 ', L('Мэдсэн үү?', 'Did you know?')), h('p', null, G.perfect ? L('Нэг ч алдаагүй барилаа! Монгол гэрийг гэр бүлээрээ 1–2 цагт барьдаг.', 'Built without a single slip! A family puts up a Mongol ger in 1–2 hours.') : L('Монгол гэрийг гэр бүлээрээ 1–2 цагт барьж, буулгаж болдог. Хаалга нь урагшаа харна.', 'A family can put up or take down a Mongol ger in 1–2 hours. Its door faces south.'))),
      lesson && lesson.family ? TG.learn.familyCard(lesson) : null,
      h('button', { class: 'btn primary block', style: { marginTop: '14px' }, onclick: () => { close(); api.colours(i); } }, L('Өнгийг нь сонгох', 'Choose its colours'))), { cls: 'v-modal' });
  }

  TG.gerwork = { init: (a) => { api = a; }, build, stepSpec, sync, busy: () => busy };
})(window.TG);
