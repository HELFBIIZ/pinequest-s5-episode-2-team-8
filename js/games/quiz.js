/* Quiz engine + 5 topic sets. First answer in each list is the correct one (shuffled at runtime).
   "Ask your family" lifeline: the hint only unlocks after talking to a real person. */
(function (TG) {
  const { h, L } = TG;
  const Q = (mn, en, answers, wmn, wen) => ({ q: { mn, en }, a: answers.map(([m, e]) => ({ mn: m, en: e })), why: { mn: wmn, en: wen } });

  function runQuiz(ctx, def) {
    const life = TG.lifecycle();
    const qs = TG.shuffle(def.qs).slice(0, 7).map((q) => {
      const order = TG.shuffle(q.a.map((_, i) => i));
      return { q: q.q, a: order.map((i) => q.a[i]), c: order.indexOf(0), why: q.why };
    });
    const team = ctx.players.length > 1;
    let i = 0, correct = 0, lifelines = 1;
    const pill = h('div', { class: 'hud-pill' });
    ctx.hud.replaceChildren(pill);
    const upd = () => (pill.textContent = `✓ ${correct}/${qs.length}` + (team ? ' · 🤝 ' + L('Баг', 'Team') : ''));

    const draw = () => {
      const q = qs[i], who = ctx.players[i % ctx.players.length];
      const why = h('div', { class: 'why hidden' });
      const lifeBtn = h('button', { class: 'lifeline', disabled: lifelines <= 0, onclick: () => askFamily() },
        '🗣️ ', L('Гэр бүлээсээ асуу', 'Ask your family'), ` (${lifelines})`);
      const btns = q.a.map((a, k) => h('button', { class: 'answer', onclick: () => choose(k) }, h('span', { class: 'ab' }, 'ABCD'[k]), TG.tx(a)));
      function choose(k) {
        btns.forEach((b) => (b.disabled = true)); lifeBtn.disabled = true;
        btns[q.c].classList.add('right');
        if (k === q.c) { correct++; TG.sfx.good(); } else { btns[k].classList.add('wrong'); TG.sfx.bad(); }
        upd();
        why.replaceChildren(h('b', null, k === q.c ? L('Зөв! ', 'Correct! ') : L('Зөв хариулт нь: ', 'The answer is: ') + TG.tx(q.a[q.c]) + '. '), TG.tx(q.why),
          h('button', { class: 'btn primary block', onclick: () => { i++; if (i >= qs.length) end(); else draw(); } }, L('Дараах →', 'Next →')));
        why.classList.remove('hidden');
      }
      function askFamily() {
        const close = TG.modal(h('div', { class: 'ask-family' },
          h('div', { class: 'big-emoji' }, '👵🗣️👦'),
          h('h2', null, L('Ойр байгаа хүнээсээ асуугаарай!', 'Ask someone near you!')),
          h('p', null, L('Ээж, аав, эмээ, өвөө эсвэл ах, эгчдээ асуултыг уншиж өгөөд, ярилц. Тэд юу гэж бодож байна?', 'Read the question to a parent, grandparent or sibling and talk about it. What do they think?')),
          h('blockquote', null, TG.tx(q.q)),
          h('button', { class: 'btn primary block', onclick: () => {
            close(); lifelines--; lifeBtn.disabled = true; lifeBtn.lastChild.textContent = ` (${lifelines})`;
            const wrong = TG.shuffle([0, 1, 2, 3].filter((x) => x !== q.c)).slice(0, 2);
            wrong.forEach((x) => { btns[x].disabled = true; btns[x].classList.add('gone'); });
            TG.toast(L('Хамтдаа бодсонд баярлалаа! 2 буруу хариулт хасагдлаа.', 'Thanks for thinking together! 2 wrong answers removed.'));
          } }, L('Бид ярилцлаа ✓', 'We talked about it ✓'))));
      }
      ctx.root.replaceChildren(TG.progress(i, qs.length),
        team ? h('div', { class: 'team-banner', style: { '--pc': who.color } }, `🎤 ${who.emoji} ${who.name} `, L('хариулна. Бусад нь туслаарай!', 'answers. Everyone else helps!')) : null,
        h('div', { class: 'quiz-card pop' }, TG.tx(q.q)),
        h('div', { class: 'answers' }, btns), lifeBtn, why);
    };
    const end = () => {
      const r = correct / qs.length;
      ctx.finish({ stars: r >= 0.85 ? 3 : r >= 0.55 ? 2 : 1, summary: L(`${qs.length} асуултаас ${correct} зөв`, `${correct} of ${qs.length} correct`) });
    };
    upd(); draw();
    return () => life.stop();
  }

  const SETS = [
    {
      id: 'quiz-geo', icon: '🗺️', pillar: 'edu', ages: ['7-10', '11-14'],
      title: { mn: 'Миний Монгол', en: 'My Mongolia' }, desc: { mn: 'Нутаг, түүх, соёлоо мэдэх үү?', en: 'Land, history and culture' },
      realLife: { mn: 'Эмээ, өвөөгөөсөө төрсөн аймгийнх нь тухай нэг сонирхолтой зүйл асуугаарай.', en: 'Ask your grandparents one interesting fact about the province they were born in.' },
      qs: [
        Q('Монгол Улсын нийслэл аль хот вэ?', 'What is the capital of Mongolia?', [['Улаанбаатар', 'Ulaanbaatar'], ['Дархан', 'Darkhan'], ['Эрдэнэт', 'Erdenet'], ['Чойбалсан', 'Choibalsan']], 'Монголын хүн амын бараг тал нь Улаанбаатарт амьдардаг.', 'Almost half of Mongolia\'s people live in Ulaanbaatar.'),
        Q('Монголын хамгийн өндөр оргил аль нь вэ?', 'What is the highest peak in Mongolia?', [['Хүйтэн оргил', 'Khüiten Peak'], ['Отгонтэнгэр', 'Otgontenger'], ['Богд хан уул', 'Bogd Khan'], ['Хан Хөхий', 'Khan Khökhii']], 'Хүйтэн оргил Алтай Таван Богдод оршдог, 4374 м өндөр.', 'Khüiten Peak is in the Altai Tavan Bogd range, 4,374 m high.'),
        Q('Монгол Улс хэдэн аймагтай вэ?', 'How many provinces (aimags) does Mongolia have?', [['21', '21'], ['18', '18'], ['25', '25'], ['12', '12']], 'Монгол Улс 21 аймаг, нийслэл Улаанбаатартай.', 'Mongolia has 21 aimags plus the capital city.'),
        Q('Монголын өмнөд хэсэгт орших алдарт цөл?', 'Which famous desert is in southern Mongolia?', [['Говь', 'Gobi'], ['Сахар', 'Sahara'], ['Атакама', 'Atacama'], ['Калахари', 'Kalahari']], 'Говьд үлэг гүрвэлийн олон олдвор олдсон.', 'Many dinosaur fossils have been found in the Gobi.'),
        Q('Хөвсгөл нуур юугаараа онцлог вэ?', 'What makes Lake Khövsgöl special?', [['Монголын хамгийн их цэнгэг устай нуур', 'Mongolia\'s largest body of fresh water'], ['Давстай нуур', 'It is salty'], ['Цөлийн дунд байдаг', 'It is in the desert'], ['Хамгийн жижиг нуур', 'It is the smallest lake']], 'Хөвсгөлийг "Монголын хөх сувд" гэж нэрлэдэг.', 'Khövsgöl is called the "Blue Pearl of Mongolia".'),
        Q('Эрийн гурван наадамд аль нь ордоггүй вэ?', 'Which is NOT one of the three manly games of Naadam?', [['Хөл бөмбөг', 'Football'], ['Бөх', 'Wrestling'], ['Сур харваа', 'Archery'], ['Морь уралдаан', 'Horse racing']], 'Наадмын гурван төрөл: бөх, морь уралдаан, сур харваа.', 'The three games are wrestling, horse racing and archery.'),
        Q('Морин хуур гэж юу вэ?', 'What is a morin khuur?', [['Хөгжмийн зэмсэг', 'A musical instrument'], ['Хоол', 'A food'], ['Гэрийн хэсэг', 'Part of a ger'], ['Шувуу', 'A bird']], 'Морин хуурын урлаг ЮНЕСКО-гийн биет бус соёлын өвд бүртгэгдсэн.', 'Morin khuur music is on UNESCO\'s Intangible Cultural Heritage list.'),
        Q('Их Монгол Улс хэдэн онд байгуулагдсан бэ?', 'In which year was the Great Mongol State founded?', [['1206', '1206'], ['1911', '1911'], ['1921', '1921'], ['1990', '1990']], 'Чингис хаан 1206 онд Их Монгол Улсыг байгуулсан.', 'Chinggis Khaan founded the Great Mongol State in 1206.'),
        Q('Монгол Улсын мөнгөн тэмдэгт юу вэ?', 'What is Mongolia\'s currency?', [['Төгрөг', 'Tögrög'], ['Юань', 'Yuan'], ['Рубль', 'Ruble'], ['Доллар', 'Dollar']], 'Төгрөгийн тэмдэг нь ₮.', 'The symbol for tögrög is ₮.'),
      ],
    },
    {
      id: 'quiz-aid', icon: '🩹', pillar: 'health', ages: ['7-10', '11-14', '15-18'],
      title: { mn: 'Анхны тусламж', en: 'First aid hero' }, desc: { mn: 'Яаралтай үед юу хийх вэ?', en: 'What to do in an emergency' },
      realLife: { mn: 'Яаралтай утасны дугааруудыг (101, 102, 103) гэр бүлээрээ цээжилж, хөргөгчин дээр наагаарай.', en: 'Memorize the emergency numbers (101, 102, 103) as a family and stick them on the fridge.' },
      qs: [
        Q('Түргэн тусламжийн утасны дугаар хэд вэ?', 'What is the ambulance number in Mongolia?', [['103', '103'], ['101', '101'], ['102', '102'], ['105', '105']], '101 — гал, 102 — цагдаа, 103 — түргэн тусламж.', '101 is fire, 102 is police, 103 is ambulance.'),
        Q('Гараа халуун юманд түлэхэд эхлээд юу хийх вэ?', 'You burn your hand. What first?', [['Хүйтэн урсгал усанд 10–20 минут барих', 'Hold it under cool running water for 10–20 minutes'], ['Тос түрхэх', 'Put butter on it'], ['Мөс шууд наах', 'Put ice directly on it'], ['Цэврүүг хагалах', 'Pop the blisters']], 'Урсгал ус түлэгдлийг хөргөнө. Тос, мөс арьсыг улам гэмтээнэ.', 'Running water cools the burn. Butter or ice damage skin further.'),
        Q('Хамраас цус гарвал яах вэ?', 'What do you do for a nosebleed?', [['Бага зэрэг урагш бөхийж, хамрын зөөлөн хэсгийг 10 минут чимхэх', 'Lean slightly forward and pinch the soft part of the nose for 10 minutes'], ['Толгойгоо хойш гэдийлгэх', 'Tilt your head back'], ['Шууд хэвтэх', 'Lie down flat'], ['Гүйх', 'Run around']], 'Хойш гэдийвэл цус хоолой руу урсдаг.', 'Tilting back makes blood run down the throat.'),
        Q('Хөлдөлтөд юу хийх вэ?', 'What do you do for frostbite?', [['Дулаан өрөөнд бүлээн усаар аажмаар дулаацуулах', 'Warm it slowly with lukewarm water in a warm room'], ['Цасаар үрэх', 'Rub it with snow'], ['Галд ойртуулж шарах', 'Hold it close to a fire'], ['Юу ч хийхгүй', 'Do nothing']], 'Цасаар үрэх нь арьсыг илүү гэмтээдэг. Монголын өвөлд үүнийг заавал мэдэх хэрэгтэй!', 'Rubbing with snow damages skin more. Essential for Mongolian winters!'),
        Q('Гэрт толгой өвдөж, дотор муухайраад байна. Зуухны утаа (дутуу исэл) байж магадгүй. Юу хийх вэ?', 'Headache and nausea in a ger with a stove. It may be carbon monoxide. What do you do?', [['Даруй гадаа цэвэр агаарт гарч, тусламж дуудах', 'Get outside into fresh air at once and call for help'], ['Унтах', 'Go to sleep'], ['Хаалга, цонхоо хаах', 'Close the door and windows'], ['Ус уугаад хүлээх', 'Drink water and wait']], 'Дутуу исэл өнгөгүй, үнэргүй боловч маш аюултай. Зуухны яндангаа үргэлж шалгаарай.', 'Carbon monoxide has no color or smell but is very dangerous. Always check the stove chimney.'),
        Q('Хүн хахаж, ярьж чадахгүй болвол?', 'Someone is choking and cannot speak. What do you do?', [['Нуруунд нь 5 удаа цохиж, хэвлийгээр нь 5 удаа түлхэх', 'Give 5 back blows, then 5 abdominal thrusts'], ['Ус уулгах', 'Give them water'], ['Хэвтүүлэх', 'Lay them down'], ['Хүлээх', 'Wait']], 'Нуруу, хэвлийгээр нь ээлжлэн тусалж, 103 руу залгана.', 'Alternate back blows and abdominal thrusts, and call 103.'),
        Q('Нохойд хазуулбал?', 'You are bitten by a dog. What do you do?', [['Шархыг савантай усаар сайн угааж, эмчид үзүүлэх', 'Wash the wound well with soap and water and see a doctor'], ['Боолт ороогоод мартах', 'Bandage it and forget it'], ['Юу ч хийхгүй', 'Do nothing'], ['Шарх руу шороо хийх', 'Put dirt on it']], 'Галзуу өвчнөөс сэргийлэхийн тулд эмчид заавал үзүүлнэ.', 'Always see a doctor to prevent rabies.'),
        Q('Ухаангүй унасан хүнийг харвал хамгийн түрүүнд юу хийх вэ?', 'You see someone collapse. What first?', [['Аюулгүй эсэхийг шалгаад, 103 руу залгах', 'Check it is safe, then call 103'], ['Зураг авах', 'Take a photo'], ['Нүүр рүү нь ус цацах', 'Splash water on their face'], ['Цааш явах', 'Walk away']], 'Эхлээд өөрийгөө аюулгүй байлгаж, дараа нь тусламж дууд.', 'Keep yourself safe first, then call for help.'),
      ],
    },
    {
      id: 'quiz-digital', icon: '🛡️', pillar: 'skills', ages: ['11-14', '15-18'],
      title: { mn: 'Дижитал баатар', en: 'Digital hero' }, desc: { mn: 'Интернэтэд аюулгүй байх ур чадвар', en: 'Skills to stay safe online' },
      realLife: { mn: 'Эцэг эх, эмээ өвөөдөө хуурамч мессеж, фишингийг хэрхэн танихыг зааж өгөөрэй.', en: 'Teach your parents or grandparents how to spot scam messages and phishing.' },
      qs: [
        Q('Аль нууц үг хамгийн хүчтэй вэ?', 'Which password is strongest?', [['Mongol!Tal2026#Nuur', 'Mongol!Tal2026#Nuur'], ['123456', '123456'], ['nuutsug', 'password'], ['Төрсөн он сар өдөр', 'Your birthday']], 'Урт, том жижиг үсэг, тоо, тэмдэгт холилдсон нууц үг хамгийн хүчтэй.', 'Long passwords mixing cases, numbers and symbols are strongest.'),
        Q('"Та iPhone хожлоо! Линк дээр дарж нэвтэрнэ үү" гэсэн мессеж ирвэл?', '"You won an iPhone! Click the link to log in." What do you do?', [['Дарахгүй, устгаад том хүнд хэлэх', 'Don\'t click, delete it and tell an adult'], ['Шууд дарах', 'Click right away'], ['Найзууддаа дамжуулах', 'Forward it to friends'], ['Нууц үгээ бичих', 'Enter your password']], 'Энэ бол фишинг буюу хууран мэхлэлт.', 'This is phishing, a scam.'),
        Q('Онлайнаар танилцсан хүн "уулзъя" гэвэл?', 'Someone you met online wants to meet up. What do you do?', [['Эцэг эхдээ хэлж, ганцаараа уулзахгүй', 'Tell your parents and never meet alone'], ['Ганцаараа уулзах', 'Meet them alone'], ['Гэрийн хаягаа өгөх', 'Give your home address'], ['Нууцлах', 'Keep it a secret']], 'Онлайн дахь хүн өөрийгөө хэн гэж хэлж байгаа нь худал байж болно.', 'People online may not be who they say they are.'),
        Q('Хоёр шатлалт баталгаажуулалт (2FA) юунд хэрэгтэй вэ?', 'What is two-factor authentication (2FA) for?', [['Нууц үг алдагдсан ч бүртгэлийг хамгаална', 'It protects your account even if your password leaks'], ['Интернэтийг хурдасгана', 'It speeds up the internet'], ['Зургийг гоё болгоно', 'It makes photos prettier'], ['Утсыг цэнэглэнэ', 'It charges your phone']], '2FA нь нууц үгнээс гадна хоёр дахь баталгаа шаарддаг.', '2FA asks for a second proof besides your password.'),
        Q('Найзыгаа онлайнаар доромжилж байгааг харвал?', 'You see a friend being bullied online. What do you do?', [['Найзыгаа дэмжиж, нотлох зургийг хадгалаад итгэлтэй том хүнд хэлэх', 'Support your friend, save screenshots and tell a trusted adult'], ['Лайк дарах', 'Like the post'], ['Үл тоох', 'Ignore it'], ['Хамт доромжлох', 'Join in']], 'Кибер дээрэлхэлтэй хамтдаа тэмцэнэ.', 'We fight cyberbullying together.'),
        Q('Сошиалд гайхалтай сенсаац мэдээ харвал?', 'You see shocking news on social media. What do you do?', [['Албан ёсны эх сурвалжаас шалгах', 'Check official sources first'], ['Шууд share хийх', 'Share it immediately'], ['Шууд итгэх', 'Believe it right away'], ['Найзуудаа айлгах', 'Scare your friends']], 'Хуурамч мэдээ маш хурдан тархдаг.', 'Fake news spreads very fast.'),
        Q('Тоглоомд "үнэгүй алмаз" өгнө гээд ээжийн картын дугаарыг асуувал?', 'A game offers "free diamonds" if you share your mom\'s card number. What do you do?', [['Хэзээ ч өгөхгүй, ээждээ хэлэх', 'Never share it, tell your mom'], ['Өгөх', 'Share it'], ['Хагасыг нь өгөх', 'Share half of it'], ['Найзынхаа картыг өгөх', 'Share a friend\'s card']], 'Картын мэдээлэл асуудаг "үнэгүй" санал бол луйвар.', '"Free" offers that ask for card details are scams.'),
        Q('Байршлаа олон нийтэд нээлттэй хуваалцах нь?', 'Sharing your location publicly is…', [['Аюултай. Зөвхөн итгэдэг хүмүүстэйгээ хуваалц', 'Risky. Only share with people you trust'], ['Үргэлж сайн', 'Always good'], ['Хамаагүй', 'Doesn\'t matter'], ['Заавал хийх ёстой', 'Required']], 'Танихгүй хүмүүс таны хаана байгааг мэдэх ёсгүй.', 'Strangers should not know where you are.'),
      ],
    },
    {
      id: 'quiz-money', icon: '💰', pillar: 'skills', ages: ['11-14', '15-18'],
      title: { mn: 'Ухаалаг мөнгө', en: 'Smart money' }, desc: { mn: 'Хадгаламж, төсөв, зээлийн анхны мэдлэг', en: 'Saving, budgeting and loans basics' },
      realLife: { mn: 'Гэр бүлээрээ "хадгаламжийн сав" эхлүүлж, хамтын нэг зорилгод (аялал, ном) мөнгө цуглуулаарай.', en: 'Start a family savings jar and collect money for a shared goal (a trip, books).' },
      qs: [
        Q('Аль нь "хэрэгцээ" вэ?', 'Which one is a "need"?', [['Хоол хүнс', 'Food'], ['Шинэ тоглоом', 'A new toy'], ['Брэнд пүүз', 'Brand-name sneakers'], ['Чихэр', 'Candy']], 'Хэрэгцээ гэдэг нь амьдрахад зайлшгүй шаардлагатай зүйл.', 'A need is something essential for living.'),
        Q('100,000₮-ийг жилийн 10% хүүтэй хадгалвал жилийн дараа хэд болох вэ?', '100,000₮ in savings at 10% per year becomes how much after one year?', [['110,000₮', '110,000₮'], ['100,000₮', '100,000₮'], ['101,000₮', '101,000₮'], ['200,000₮', '200,000₮']], '100,000-ийн 10% нь 10,000₮.', '10% of 100,000 is 10,000₮.'),
        Q('Сар бүр 5,000₮ хадгалбал нэг жилд хэд болох вэ?', 'Save 5,000₮ every month. How much after a year?', [['60,000₮', '60,000₮'], ['50,000₮', '50,000₮'], ['12,000₮', '12,000₮'], ['5,000₮', '5,000₮']], '12 сар × 5,000₮ = 60,000₮. Жижиг алхам том үр дүн өгнө!', '12 months × 5,000₮ = 60,000₮. Small steps add up!'),
        Q('Төсөв гэж юу вэ?', 'What is a budget?', [['Орлого, зарлагаа урьдчилан төлөвлөх', 'A plan for your income and spending'], ['Банкны нэр', 'A bank name'], ['Зээлийн төрөл', 'A type of loan'], ['Татвар', 'A tax']], 'Төсөвтэй байхад мөнгө хаашаа явж байгааг мэднэ.', 'A budget shows where your money goes.'),
        Q('Зээл авахын өмнө юуг заавал шалгах вэ?', 'What must you check before taking a loan?', [['Хүүгийн хэмжээ, нийт төлөх дүн', 'The interest rate and total amount to repay'], ['Банкны өнгө', 'The bank\'s colors'], ['Юу ч шалгахгүй', 'Nothing'], ['Найзын санал', 'What a friend thinks']], 'Зээл бол үнэгүй мөнгө биш. Нийт хэд төлөхөө үргэлж тооц.', 'A loan isn\'t free money. Always calculate the total cost.'),
        Q('Яаралтай үеийн сан гэж юу вэ?', 'What is an emergency fund?', [['Гэнэтийн зардалд зориулж хадгалсан мөнгө', 'Money saved for unexpected costs'], ['Тоглоомын мөнгө', 'Game money'], ['Зээл', 'A loan'], ['Бэлэг', 'A gift']], 'Өвчин, эвдрэл зэрэг гэнэтийн үед сан тусална.', 'It helps with illness, repairs and other surprises.'),
        Q('40,000₮-ийн цамц 50% хямдарвал хэд болох вэ?', 'A 40,000₮ shirt is 50% off. What is the new price?', [['20,000₮', '20,000₮'], ['30,000₮', '30,000₮'], ['35,000₮', '35,000₮'], ['10,000₮', '10,000₮']], '50% гэдэг нь тал хувь.', '50% means half.'),
        Q('Хүүгийн хүү гэдэг нь юу вэ?', 'What is compound interest?', [['Хуримтлагдсан хүү дээр дахин хүү бодогдох', 'Earning interest on interest you already earned'], ['Хүү огт байхгүй', 'No interest at all'], ['Зөвхөн нэг удаа бодох хүү', 'Interest paid only once'], ['Торгууль', 'A fine']], 'Эрт хадгалж эхэлбэл хүүгийн хүү илүү их өсдөг.', 'The earlier you save, the more compound interest grows.'),
      ],
    },
    {
      id: 'quiz-mind', icon: '🌱', pillar: 'health', ages: ['11-14', '15-18'],
      title: { mn: 'Сэтгэлийн эрүүл мэнд', en: 'Healthy mind' }, desc: { mn: 'Стресс, нойр, найрсаг харилцаа', en: 'Stress, sleep and kind relationships' },
      realLife: { mn: 'Өнөө орой гэр бүлээрээ "өнөөдрийн хамгийн гоё ба хамгийн хэцүү мөч" -өө ээлжлэн хуваалцаарай.', en: 'Tonight, take turns sharing the best and hardest moment of your day as a family.' },
      qs: [
        Q('Өсвөр насныхан шөнө хэдэн цаг унтах хэрэгтэй вэ?', 'How many hours of sleep do teenagers need?', [['8–10 цаг', '8–10 hours'], ['4–5 цаг', '4–5 hours'], ['6 цаг', '6 hours'], ['12-оос дээш цаг', 'Over 12 hours']], 'Нойр санах ой, сэтгэл санаа, өсөлтөд чухал.', 'Sleep is key for memory, mood and growth.'),
        Q('Стресстэй үед юу тус болох вэ?', 'What helps when you feel stressed?', [['Гүнзгий амьсгалж, итгэдэг хүнтэйгээ ярих', 'Breathe deeply and talk to someone you trust'], ['Бүгдийг дотроо хадгалах', 'Keep everything inside'], ['Шөнөжин тоглох', 'Game all night'], ['Хоол идэхгүй байх', 'Skip meals']], 'Ярилцах нь сэтгэлийн ачааг хөнгөлдөг.', 'Talking lightens the load.'),
        Q('Монголд хүүхэд, өсвөр үеийнхний тусламжийн утас хэд вэ?', 'What is the child helpline number in Mongolia?', [['108', '108'], ['103', '103'], ['111', '111'], ['100', '100']], '108 нь хүүхдийн тусламжийн утас. Тусламж хэрэгтэй үед залгаарай.', '108 is the child helpline. Call it when you need help.'),
        Q('Найз чинь удаан хугацаанд гунигтай, ганцаардмал байвал?', 'A friend has been sad and withdrawn for a long time. What do you do?', [['Сонсож, дэмжээд, том хүнд хэлэхийг уриалах', 'Listen, support them, and encourage them to tell an adult'], ['Шоолох', 'Make fun of them'], ['Үл тоох', 'Ignore them'], ['Бусдад хов ярих', 'Gossip about it']], 'Сонсох нь хамгийн том дэмжлэг.', 'Listening is the biggest support.'),
        Q('Сошиал медиаг хэт их хэрэглэх нь юунд нөлөөлж болох вэ?', 'Too much social media can…', [['Бусадтай харьцуулж, сэтгэл гутрахад', 'Make you compare yourself and feel down'], ['Үргэлж аз жаргал авчрах', 'Always make you happy'], ['Ямар ч нөлөөгүй', 'Have no effect'], ['Зөвхөн нүдэнд нөлөөлөх', 'Only affect your eyes']], 'Сошиалд хүмүүс зөвхөн гоё мөчөө харуулдаг.', 'People only post their best moments.'),
        Q('Бүтэлгүйтэл гэж юу вэ?', 'Failure is…', [['Суралцах боломж', 'A chance to learn'], ['Төгсгөл', 'The end'], ['Ичгүүр', 'A shame'], ['Нууцлах ёстой зүйл', 'Something to hide']], 'Амжилттай хүн бүр олон удаа бүтэлгүйтэж байсан.', 'Every successful person failed many times.'),
        Q('Биеийн хөдөлгөөн сэтгэл санаанд хэрхэн нөлөөлдөг вэ?', 'How does exercise affect your mood?', [['Сэтгэл санааг сайжруулдаг', 'It improves mood'], ['Нөлөөгүй', 'No effect'], ['Муугаар нөлөөлдөг', 'It makes it worse'], ['Зөвхөн тамирчдад нөлөөлдөг', 'Only for athletes']], 'Хөдөлгөөн сэтгэл сэргээх бодис ялгаруулдаг.', 'Movement releases feel-good chemicals.'),
        Q('Гэр бүлээрээ хамт хооллох нь юугаараа сайн бэ?', 'Why are family meals good?', [['Харилцааг бэхжүүлж, сэтгэлд тустай', 'They strengthen bonds and help wellbeing'], ['Цаг үрнэ', 'They waste time'], ['Ялгаагүй', 'No difference'], ['Хэрэггүй', 'Unnecessary']], 'Хамтын ширээ бол гэр бүлийн хамгийн энгийн уулзалт.', 'The family table is the simplest way to connect.'),
      ],
    },
  ];

  SETS.forEach((def) => TG.registerGame({
    id: def.id, icon: def.icon, pillar: def.pillar, ages: def.ages, title: def.title, desc: def.desc, realLife: def.realLife,
    start: (ctx) => runQuiz(ctx, def),
  }));
})(window.TG);
