/* Басар: the AI buddy. A Mongolian Bankhar dog who answers questions and gives heritage quizzes.
   Uses Claude through the Naadamy server (/api/basar) when it is available, and his offline knowledge otherwise. */
(function (TG) {
  const { h, L, tx } = TG;
  const S = TG.store, B = TG.BASAR;
  const api = (TG.basar = { ai: false, checked: false, history: [] });
  const online = () => location.protocol.startsWith('http');

  api.check = () => {
    if (api.checked || !online()) return Promise.resolve(api.ai);
    api.checked = true;
    return fetch('api/basar', { cache: 'no-store' }).then((r) => r.json()).then((d) => (api.ai = !!d.ai)).catch(() => (api.ai = false));
  };
  const post = (body) => {
    const p = S.active() || {};
    return fetch('api/basar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...body, name: p.name, age: p.age, lang: S.state.lang }) })
      .then((r) => r.json());
  };
  const stats = () => { const p = S.active(); if (!p) return {}; return (p.basar = p.basar || { asked: 0, right: 0, total: 0 }); };

  /** Ask Basar something. Resolves to { text, source: 'ai' | 'offline' }. */
  api.ask = async (question) => {
    api.history.push({ role: 'user', content: question });
    stats().asked = (stats().asked || 0) + 1; S.save();
    TG.villageQuest && TG.villageQuest('basar');
    let text = null, source = 'offline';
    if (api.ai) {
      try { const r = await post({ mode: 'chat', messages: api.history }); if (r.ok) { text = r.reply; source = 'ai'; } else if (r.reason === 'refusal') text = L('Вуф… Энэ талаар ээж аав, багшаасаа асуугаарай. Харин би чамд Монголын түүх, гэр, цагаан идээний тухай ярьж өгье!', 'Woof… please ask a parent or teacher about that. I can tell you about Mongolian history, gers and dairy foods!'); }
      catch (e) { /* network trouble: fall back below */ }
    }
    if (!text) {
      const a = B.localAnswer(question);
      text = a ? tx(a) : L('Вуф! Энэ асуултын хариуг би сайн мэдэхгүй байна. Эмээ, өвөөгөөсөө асуугаад надад хэлээрэй! Харин гэр, цагаан идээ, Нууц товчоо, наадмын тухай асуувал би хэлж чадна.',
        'Woof! I don’t know that one well. Ask your grandma or grandpa and tell me! I can tell you about gers, dairy foods, the Secret History and Naadam.');
    }
    api.history.push({ role: 'assistant', content: text });
    if (api.history.length > 20) api.history.splice(0, api.history.length - 20);
    return { text, source };
  };

  const asked = [];
  /** One quiz question: { question, options[4], answer, explain, source } with plain strings. */
  api.quiz = async (topic) => {
    if (api.ai) {
      try { const r = await post({ mode: 'quiz', topic, avoid: asked }); if (r.ok) { asked.push(r.quiz.question); return { ...r.quiz, source: 'ai' }; } }
      catch (e) { /* fall back */ }
    }
    const q = B.localQuiz(topic, asked);
    asked.push(q.question.mn); if (asked.length > 30) asked.shift();
    return { topic: q.topic, question: tx(q.question), options: q.options.map(tx), answer: q.answer, explain: tx(q.explain), source: 'offline' };
  };

  // ------------------------------------------------------------ UI pieces
  api.face = (mood = 0, size = 56) => {
    const c = h('canvas', { class: 'px-icon basar-face', width: 24, height: 22, style: { width: size + 'px', height: Math.round(size * 22 / 24) + 'px' } });
    c.getContext('2d').drawImage(TG.pixel.bankharFace(mood), 0, 0);
    return c;
  };
  const badge = (source) => h('span', { class: 'b-src ' + source }, source === 'ai' ? 'AI' : L('офлайн', 'offline'));

  /** A quiz card. onDone(correct) is called once after the child answers. */
  api.quizCard = (q, onDone) => {
    let done = false;
    const exp = h('div', { class: 'b-exp hidden' });
    const opts = q.options.map((o, i) => h('button', { class: 'b-opt', onclick: () => {
      if (done) return; done = true;
      const ok = i === q.answer;
      opts.forEach((b, j) => { b.disabled = true; if (j === q.answer) b.classList.add('right'); else if (j === i) b.classList.add('wrong'); });
      ok ? (TG.sfx.good(), TG.buzz && TG.buzz(20)) : TG.sfx.bad();
      const st = stats(); st.total = (st.total || 0) + 1; if (ok) st.right = (st.right || 0) + 1; S.save();
      exp.replaceChildren(h('b', null, ok ? L('Зөв! Вуф вуф! 🎉', 'Correct! Woof woof! 🎉') : L('Бараг л! Зөв хариулт: ', 'Almost! The answer is: ') + (ok ? '' : q.options[q.answer])), h('p', null, q.explain));
      exp.classList.remove('hidden');
      onDone && onDone(ok);
    } }, h('span', { class: 'b-letter' }, 'АБВГ'[i]), h('span', null, o)));
    return h('div', { class: 'b-quiz' }, h('div', { class: 'b-q' }, q.question, q.source ? badge(q.source) : null), h('div', { class: 'b-opts' }, opts), exp);
  };

  /** Run n quiz questions inside `host`; calls onFinish(right, n). */
  api.runQuiz = (host, topic, n, onFinish) => {
    let k = 0, right = 0;
    const next = async () => {
      if (k >= n) return onFinish && onFinish(right, n);
      host.replaceChildren(h('div', { class: 'b-think' }, api.face(2, 40), h('span', null, L('Басар бодож байна…', 'Basar is thinking…'))));
      const q = await api.quiz(topic);
      if (!host.isConnected) return;
      k++;
      const nextBtn = h('button', { class: 'btn primary block hidden', onclick: next }, k < n ? L('Дараагийн асуулт →', 'Next question →') : L('Дуусгах', 'Finish'));
      host.replaceChildren(h('div', { class: 'b-count' }, `${k} / ${n}`), api.quizCard(q, (ok) => { if (ok) right++; nextBtn.classList.remove('hidden'); }), nextBtn);
    };
    next();
  };

  /** The chat window. opts: { prompt, topic, context } */
  api.open = (opts = {}) => {
    api.check();
    const p = S.active() || { name: '' };
    const log = h('div', { class: 'b-log', 'aria-live': 'polite' });
    const say = (who, content, extra) => {
      const row = h('div', { class: 'b-row ' + who }, who === 'basar' ? api.face(1, 34) : null, h('div', { class: 'b-bubble' }, content, extra || null));
      log.appendChild(row); log.scrollTop = log.scrollHeight; return row;
    };
    const input = h('input', { class: 'input b-input', maxlength: 300, placeholder: L('Басараас асуух…', 'Ask Basar…'), 'aria-label': L('Асуулт', 'Question'),
      onkeydown: (e) => { e.stopPropagation(); if (e.key === 'Enter') send(); } });
    let busy = false;
    async function send(text) {
      const q = (text || input.value).trim(); if (!q || busy) return;
      busy = true; input.value = '';
      say('me', q);
      const wait = say('basar', h('span', { class: 'b-dots' }, h('i'), h('i'), h('i')));
      const r = await api.ask(q);
      wait.remove(); say('basar', r.text, badge(r.source)); TG.sfx.pop && TG.sfx.pop();
      busy = false; input.focus();
    }
    async function quizInChat(topic) {
      const holder = say('basar', h('span', { class: 'b-dots' }, h('i'), h('i'), h('i')));
      const q = await api.quiz(topic);
      holder.querySelector('.b-bubble').replaceChildren(api.quizCard(q, (ok) => {
        if (ok) { TG.villageReward && TG.villageReward(5, 8); TG.villageQuest && TG.villageQuest('quiz'); }
        setTimeout(() => say('basar', L('Дахиад нэг асуулт уу?', 'Another one?'), h('div', { class: 'b-chips' }, h('button', { class: 'chip', onclick: () => quizInChat(topic) }, L('Тийм! 🎯', 'Yes! 🎯')))), 500);
      }));
      log.scrollTop = log.scrollHeight;
    }
    const topics = h('div', { class: 'b-chips' }, Object.entries(B.TOPICS).map(([k, t]) => h('button', { class: 'chip', onclick: () => quizInChat(k) }, t.icon, ' ', tx(t.name))));
    const suggest = h('div', { class: 'b-chips' }, B.SUGGEST.map((s) => h('button', { class: 'chip', onclick: () => send(tx(s)) }, tx(s))));
    const status = h('span', { class: 'b-status' });
    const drawStatus = () => (status.textContent = api.ai ? L('● AI ухаантай', '● AI smart mode') : L('○ Офлайн мэдлэг', '○ Offline knowledge'));
    drawStatus(); api.check().then(drawStatus);

    TG.modal(h('div', { class: 'basar-chat' },
      h('div', { class: 'b-head' }, api.face(0, 64), h('div', null, h('h2', null, L('Басар', 'Basar')), h('small', null, L('Монгол банхар нохой · Таны сурах найз', 'Mongolian Bankhar · your learning buddy')), status)),
      log,
      h('div', { class: 'b-tray' },
        h('div', { class: 'b-tray-l' }, L('Асуулт хариулт:', 'Quiz me on:')), topics,
        h('div', { class: 'b-tray-l' }, L('Асууж болох зүйлс:', 'Try asking:')), suggest),
      h('div', { class: 'b-send' }, input, h('button', { class: 'btn primary', onclick: () => send(), 'aria-label': L('Илгээх', 'Send') }, '➤'))), { cls: 'v-modal basar-modal' });

    say('basar', opts.context || L(`Вуф! Сайн уу, ${p.name}! Би Басар. Монголын түүх, Нууц товчоо, гэр, цагаан идээ, наадмын тухай юу ч асуугаарай. Эсвэл доороос сэдэв сонгоод надтай асуулт хариулт тоглоорой!`,
      `Woof! Hi ${p.name}! I’m Basar. Ask me anything about Mongolian history, the Secret History, gers, dairy foods or Naadam. Or pick a topic below for a quiz!`));
    if (opts.topic) quizInChat(opts.topic);
    if (opts.prompt) send(opts.prompt);
    setTimeout(() => input.focus(), 250);
  };
})(window.TG);
