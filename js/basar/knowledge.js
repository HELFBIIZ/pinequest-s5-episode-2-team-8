/* Басарын мэдлэг: offline heritage knowledge so Basar still teaches with no internet or no AI key.
   Topics: history, nuuts (Secret History), ger, idee (dairy), naadam, customs. */
(function (TG) {
  const B = (TG.BASAR = TG.BASAR || {});

  B.TOPICS = {
    history: { icon: '🏹', name: { mn: 'Монголын түүх', en: 'Mongolian history' } },
    nuuts: { icon: '📜', name: { mn: 'Нууц товчоо', en: 'The Secret History' } },
    ger: { icon: '⛺', name: { mn: 'Монгол гэр', en: 'The Mongol ger' } },
    idee: { icon: '🥛', name: { mn: 'Цагаан идээ', en: 'Dairy foods' } },
    naadam: { icon: '🐎', name: { mn: 'Наадам', en: 'Naadam' } },
    customs: { icon: '🙏', name: { mn: 'Ёс заншил', en: 'Customs' } },
  };

  // Q(topic, question mn, question en, [4 options mn], [4 options en], correct index, explanation mn, explanation en)
  const Q = (t, qm, qe, om, oe, a, em, ee) => ({ t, q: { mn: qm, en: qe }, o: om.map((m, i) => ({ mn: m, en: oe[i] })), a, e: { mn: em, en: ee } });
  B.QUIZ = [
    // ---- history
    Q('history', 'Тэмүжинийг Чингис хаан хэмээн өргөмжилсөн Их хурилдай хэдэн онд болсон бэ?', 'In which year did the Great Khuriltai proclaim Temüjin as Chinggis Khaan?',
      ['1206', '1162', '1227', '1911'], ['1206', '1162', '1227', '1911'], 0,
      '1206 онд Онон голын эхэнд Их хурилдай хуралдаж, Их Монгол Улс байгуулагдсан.', 'In 1206 the Great Khuriltai met at the source of the Onon river and the Great Mongol State was founded.'),
    Q('history', 'Тэмүжин хэдэн онд төрсөн гэж ихэвчлэн үздэг вэ?', 'In which year is Temüjin usually said to have been born?',
      ['1162', '1206', '1100', '1240'], ['1162', '1206', '1100', '1240'], 0,
      'Ихэнх түүхчид 1162 онд Онон голын Дэлүүн болдогт төрсөн гэж үздэг.', 'Most historians say he was born in 1162 at Delüün Boldog by the Onon river.'),
    Q('history', 'Их Монгол Улсын нийслэл Хархорум аль голын хөндийд байдаг вэ?', 'Karakorum, capital of the Mongol Empire, lies in which river valley?',
      ['Орхон', 'Туул', 'Сэлэнгэ', 'Хэрлэн'], ['Orkhon', 'Tuul', 'Selenge', 'Kherlen'], 0,
      'Хархорум Орхон голын хөндийд оршдог. Өгөдэй хаан 1235 онд хэрмийг нь бариулжээ.', 'Karakorum is in the Orkhon valley. Ögedei Khaan had its walls built in 1235.'),
    Q('history', 'Монголын нутагт байгуулагдсан анхны төр гэж аль улсыг үздэг вэ?', 'Which state is considered the first state founded on Mongolian land?',
      ['Хүннү', 'Түрэг', 'Уйгур', 'Кидан'], ['Xiongnu (Hunnu)', 'Turkic Khaganate', 'Uyghur', 'Khitan'], 0,
      'Хүннү гүрэн МЭӨ 209 онд Модун шаньюйгийн үед хүчирхэгжсэн. Тиймээс Монгол төр 2200 гаруй жилийн түүхтэй.', 'The Xiongnu grew strong under Modun Chanyu in 209 BC, so Mongolian statehood is over 2,200 years old.'),
    Q('history', 'Чингис хааны үед монголчууд ямар бичиг хэрэглэж эхэлсэн бэ?', 'Which script did Mongols begin using in Chinggis Khaan’s time?',
      ['Уйгаржин монгол бичиг', 'Кирилл үсэг', 'Латин үсэг', 'Соёмбо үсэг'], ['Uyghur-Mongol script', 'Cyrillic', 'Latin', 'Soyombo script'], 0,
      'Уйгаржин монгол бичгийг 1204 оноос төрийн хэрэгт хэрэглэх болсон. Дээрээс доош бичдэг.', 'The Uyghur-Mongol script was used for state affairs from 1204. It is written top to bottom.'),
    Q('history', 'Соёмбо үсгийг хэн зохиосон бэ?', 'Who created the Soyombo script?',
      ['Өндөр гэгээн Занабазар', 'Чингис хаан', 'Хубилай хаан', 'Өгөдэй хаан'], ['Zanabazar', 'Chinggis Khaan', 'Khubilai Khaan', 'Ögedei Khaan'], 0,
      '1686 онд Өндөр гэгээн Занабазар зохиосон. Соёмбо тэмдэг манай төрийн далбаан дээр бий.', 'Zanabazar created it in 1686. The Soyombo symbol is on our national flag.'),
    Q('history', 'Хубилай хаан 1271 онд ямар улс байгуулсан бэ?', 'Which state did Khubilai Khaan found in 1271?',
      ['Их Юань улс', 'Мин улс', 'Хүннү гүрэн', 'Алтан Орд'], ['The Yuan dynasty', 'The Ming dynasty', 'The Xiongnu', 'The Golden Horde'], 0,
      'Чингис хааны ач Хубилай 1271 онд Их Юань улсыг байгуулсан.', 'Chinggis Khaan’s grandson Khubilai founded the Yuan dynasty in 1271.'),
    Q('history', 'Монгол Улсын төрийн далбаан дээрх алтан шар тэмдгийг юу гэдэг вэ?', 'What is the golden symbol on the Mongolian flag called?',
      ['Соёмбо', 'Тамга', 'Хас', 'Өлзий'], ['Soyombo', 'Tamga', 'Khas', 'Ölzii'], 0,
      'Соёмбо бол эрх чөлөө, тусгаар тогтнолын бэлгэдэл.', 'The Soyombo symbolises freedom and independence.'),
    // ---- Secret History
    Q('nuuts', '“Монголын нууц товчоо” хэдэн онд бичигдсэн гэж ихэнх эрдэмтэд үздэг вэ?', 'In which year do most scholars say the Secret History was written?',
      ['1228', '1162', '1911', '1500'], ['1228', '1162', '1911', '1500'], 0,
      'Төгсгөлд нь хулгана жил Хэрлэн голын Хөдөө аралд бичиж дуусгав гэжээ. Ихэнх эрдэмтэд 1228 он гэдэг, 1240 гэж үзэх нь ч бий.', 'Its ending says it was finished in a Rat year at Khödöö Aral on the Kherlen. Most say 1228; some say 1240.'),
    Q('nuuts', 'Нууц товчоо монголчуудын ямар домогт өвгөөр эхэлдэг вэ?', 'The Secret History begins with which legendary ancestors?',
      ['Бөртэ чоно ба Гуа марал', 'Есүхэй ба Өэлүн', 'Тэмүжин ба Бөртэ', 'Жамуха ба Тоорил'], ['Börte Chino (the blue-grey wolf) and Gua Maral (the doe)', 'Yesükhei and Hö’elün', 'Temüjin and Börte', 'Jamukha and To’oril'], 0,
      '“Дээр тэнгэрээс заяат төрсөн Бөртэ чоно, гэргий нь Гуа марал” гэж эхэлдэг.', 'It opens: “Born with destiny from Heaven above was Börte Chino, and his wife was Gua Maral.”'),
    Q('nuuts', 'Алан гуа эх хүүхдүүддээ эв нэгдлийн тухай юугаар сургасан бэ?', 'What did mother Alan Gua use to teach her sons about unity?',
      ['Сумаар', 'Морьдоор', 'Чулуугаар', 'Номоор'], ['Arrows', 'Horses', 'Stones', 'Books'], 0,
      'Нэг сумыг амархан хугалдаг ч багцалсан сумыг хугалж чаддаггүй. Ах дүүс эв нэгдэлтэй бол хүчтэй гэж сургасан.', 'One arrow breaks easily but a bundle does not. Brothers who stay united are strong.'),
    Q('nuuts', 'Тэмүжиний аав хэн бэ?', 'Who was Temüjin’s father?',
      ['Есүхэй баатар', 'Тоорил хан', 'Жамуха', 'Бодончар'], ['Yesükhei Baatar', 'To’oril Khan', 'Jamukha', 'Bodonchar'], 0,
      'Есүхэй баатар Хиад Боржигин овгийн удирдагч байсан.', 'Yesükhei Baatar was a leader of the Kiyad Borjigin clan.'),
    Q('nuuts', 'Аавыгаа нас барсны дараа хүүхдүүдээ ганцаараа өсгөсөн Тэмүжиний ээж хэн бэ?', 'Who raised the children alone after Temüjin’s father died?',
      ['Өэлүн эх', 'Бөртэ үжин', 'Алан гуа', 'Гуа марал'], ['Mother Hö’elün', 'Börte', 'Alan Gua', 'Gua Maral'], 0,
      'Өэлүн эх хүүхдүүдээ Онон голын загас, жимс, ургамлын үндсээр хооллож өсгөсөн.', 'Hö’elün fed her children with fish, berries and wild roots from the Onon river.'),
    Q('nuuts', 'Тэмүжиний бага насны анд нь хэн байсан бэ?', 'Who was Temüjin’s childhood anda (sworn brother)?',
      ['Жамуха', 'Боорчи', 'Зэв', 'Сүбээдэй'], ['Jamukha', 'Bo’orchu', 'Jebe', 'Sübe’etei'], 0,
      'Тэд хүүхэд байхдаа шагай, сум солилцож анд болсон.', 'As boys they swapped knucklebones and arrows and became anda.'),
    Q('nuuts', 'Нууц товчоонд Тэмүжин төрөхдөө гартаа юу атгасан байсан гэдэг вэ?', 'According to the Secret History, what was Temüjin holding when he was born?',
      ['Шагайн чинээ нөж (цус)', 'Жижиг сум', 'Алтан зоос', 'Цагаан чулуу'], ['A blood clot the size of a knucklebone', 'A tiny arrow', 'A gold coin', 'A white stone'], 0,
      'Баруун гартаа шагайн чинээ нөж атгаж төрсөн гэж бичсэн байдаг.', 'It says he was born clutching a blood clot the size of a knucklebone in his right hand.'),
    Q('nuuts', 'Тэмүжинийг Тайчуудын олзноос зугтахад хэн тусалсан бэ?', 'Who helped Temüjin escape from the Tayichi’ud?',
      ['Сорхон шар', 'Жамуха', 'Тоорил хан', 'Хасар'], ['Sorkhan Shira', 'Jamukha', 'To’oril Khan', 'Khasar'], 0,
      'Сорхон шарын гэр бүл түүнийг ноосон тэргэнд нууж аварсан.', 'Sorkhan Shira’s family hid him in a cart of wool.'),
    Q('nuuts', 'Нууц товчоо хэдэн бүлэгтэй вэ?', 'How many chapters does the Secret History have?',
      ['12', '5', '30', '100'], ['12', '5', '30', '100'], 0,
      '12 бүлэг, 282 зүйлтэй.', '12 chapters with 282 sections.'),
    Q('nuuts', 'Чингис хааныг өргөмжлөхөд ямар туг мандуулсан бэ?', 'Which banner was raised when Chinggis Khaan was proclaimed?',
      ['Есөн хөлт цагаан туг', 'Улаан далбаа', 'Хар туг', 'Ногоон туг'], ['The nine-footed white banner', 'A red flag', 'A black banner', 'A green banner'], 0,
      'Есөн хөлт цагаан туг бол энх тайвны, төрийн бэлгэдэл.', 'The nine-footed white banner symbolises peace and the state.'),
    // ---- ger
    Q('ger', 'Гэрийн дээд талын дугуй цонхыг юу гэдэг вэ?', 'What is the round crown window at the top of a ger called?',
      ['Тооно', 'Унь', 'Хана', 'Багана'], ['Toono', 'Uni', 'Khana', 'Bagana'], 0,
      'Тооноор гэрэл орж, утаа гардаг. Нарны гэрлээр цагийг нь ч мэддэг байсан.', 'Light comes in and smoke goes out through the toono. People even told time by its sunlight.'),
    Q('ger', 'Гэрийн эвхэгддэг, тор хэлбэртэй ханыг юу гэдэг вэ?', 'What are the folding lattice walls of a ger called?',
      ['Хана', 'Тооно', 'Өрх', 'Бүслүүр'], ['Khana', 'Toono', 'Örkh', 'Büslüür'], 0,
      'Ханыг дэлгэж тойруулан тавина. 5 ханатай гэр гэр бүлд хамгийн түгээмэл.', 'The khana unfold and stand in a circle. A 5-khana ger is the most common family size.'),
    Q('ger', 'Тооноос хана руу тавьдаг урт шонг юу гэдэг вэ?', 'What are the long poles from the crown to the walls called?',
      ['Унь', 'Багана', 'Хана', 'Хаалга'], ['Uni', 'Bagana', 'Khana', 'Door'], 0,
      'Униа дөрвөн зүгт ээлжлэн хатгаж тэнцвэрийг хадгална.', 'The uni are placed in turns on all four sides to keep balance.'),
    Q('ger', 'Тоонг тулж барьдаг хоёр шонг юу гэдэг вэ?', 'What are the two posts holding up the crown called?',
      ['Багана', 'Унь', 'Хана', 'Тулга'], ['Bagana', 'Uni', 'Khana', 'Tulga'], 0,
      'Хоёр баганын дундуур гарахгүй байх нь ёс юм.', 'It is custom not to walk between the two bagana.'),
    Q('ger', 'Монгол гэрийн хаалга ихэвчлэн аль зүг рүү харсан байдаг вэ?', 'Which direction does a ger door usually face?',
      ['Урд (өмнө)', 'Хойд', 'Баруун', 'Зүүн'], ['South', 'North', 'West', 'East'], 0,
      'Нар сайн тусаж, хойд зүгийн хүйтэн салхинаас хамгаалагдана.', 'It gets the most sun and is sheltered from cold northern winds.'),
    Q('ger', 'Гэрийг өвөл дулаахан байлгадаг ноосон давхаргыг юу гэдэг вэ?', 'What wool layer keeps a ger warm in winter?',
      ['Эсгий', 'Цаас', 'Шил', 'Төмөр'], ['Felt', 'Paper', 'Glass', 'Metal'], 0,
      'Хонины ноосыг дэвтээж, өнхрүүлж эсгий хийдэг.', 'Felt is made by wetting and rolling sheep’s wool.'),
    Q('ger', 'Тооног шөнө хучдаг бүтээлгийг юу гэдэг вэ?', 'What is the cover that closes the crown at night called?',
      ['Өрх', 'Хаяавч', 'Туурга', 'Хошлон'], ['Örkh', 'Khayaavch', 'Tuurga', 'Khoshlon'], 0,
      'Өрхийг өглөө нээж, орой хаадаг. “Өрх гэр” гэдэг үг эндээс гаралтай.', 'The örkh is opened in the morning and closed at night. The word “household” (örkh) comes from it.'),
    Q('ger', 'Монгол гэр урлах уламжлалт ур ухааныг ЮНЕСКО хэдэн онд бүртгэсэн бэ?', 'In which year did UNESCO list the traditional craft of the Mongol ger?',
      ['2013', '1990', '2020', '1206'], ['2013', '1990', '2020', '1206'], 0,
      '2013 онд Хүн төрөлхтний соёлын биет бус өвийн жагсаалтад бүртгэгдсэн.', 'It was inscribed on the Intangible Cultural Heritage list in 2013.'),
    // ---- dairy
    Q('idee', '“Цагаан идээ” гэж юуг хэлдэг вэ?', 'What does “tsagaan idee” (white food) mean?',
      ['Сүүгээр хийсэн хүнс', 'Гурилан хоол', 'Махан хоол', 'Жимс'], ['Foods made from milk', 'Flour dishes', 'Meat dishes', 'Fruit'], 0,
      'Тараг, өрөм, ааруул, бяслаг, шар тос, айраг бүгд цагаан идээ.', 'Yogurt, clotted cream, aaruul, cheese, butter and airag are all white foods.'),
    Q('idee', 'Тараг исгэхэд нэмдэг хуучин тарагийг юу гэдэг вэ?', 'What is the bit of old yogurt added to start new yogurt called?',
      ['Хөрөнгө', 'Өрөм', 'Ээдэм', 'Шар тос'], ['Khöröngö (starter)', 'Öröm', 'Eedem', 'Butter'], 0,
      'Хөрөнгө дэх сайн бактери сүүг тараг болгодог.', 'Good bacteria in the starter turn milk into yogurt.'),
    Q('idee', 'Сүүг буцалгаж хөргөхөд дээр нь тогтдог зузаан тосон давхаргыг юу гэдэг вэ?', 'What is the thick cream layer that forms on boiled, cooled milk?',
      ['Өрөм', 'Ааруул', 'Айраг', 'Хуруут'], ['Öröm', 'Aaruul', 'Airag', 'Khuruut'], 0,
      'Сүүг самарч хөөсрүүлбэл өрөм зузаан тогтдог.', 'Ladling the milk to make foam gives a thicker öröm.'),
    Q('idee', 'Ааруулыг хэрхэн хатаадаг вэ?', 'How is aaruul dried?',
      ['Нар, салхинд', 'Зууханд шатааж', 'Хөлдөөж', 'Усанд дэвтээж'], ['In the sun and wind', 'By burning in a stove', 'By freezing', 'By soaking in water'], 0,
      'Гэрийн дээвэр эсвэл тавиур дээр наранд хатаадаг.', 'It is dried in the sun on the ger roof or a rack.'),
    Q('idee', 'Айргийг ямар малын сүүгээр хийдэг вэ?', 'Airag is made from which animal’s milk?',
      ['Гүүний (адуу)', 'Үхрийн', 'Тэмээний', 'Ямааны'], ['Mare (horse)', 'Cow', 'Camel', 'Goat'], 0,
      'Тэмээний сүүгээр хийсэн исгэлэн ундааг хоормог гэдэг.', 'The fermented drink made from camel milk is called khoormog.'),
    Q('idee', 'Айргийг хөхүүрт хэрхэн исгэдэг вэ?', 'How is airag fermented in the leather bag (khökhüür)?',
      ['Олон мянган удаа бүлж', 'Буцалгаж', 'Хөлдөөж', 'Давслаж'], ['By churning it thousands of times', 'By boiling', 'By freezing', 'By salting'], 0,
      'Хүүхэд, том хүн ээлжлэн бүлдэг. Сайн айраг хэдэн мянган бүлүүр шаарддаг.', 'Children and adults take turns churning. Good airag takes thousands of strokes.'),
    Q('idee', 'Холын замд гарах хүний араас ээж, эмээ нь юу цацдаг вэ?', 'What do mothers and grandmothers sprinkle after someone leaving on a long journey?',
      ['Сүү', 'Ус', 'Будаа', 'Элс'], ['Milk', 'Water', 'Rice', 'Sand'], 0,
      'Сүүний дээжийг цацаж аян замыг нь өлзийтэй байхыг ерөөдөг.', 'They sprinkle the first of the milk to wish a lucky, safe journey.'),
    Q('idee', 'Тараг исгэхийн өмнө буцалсан сүүг ямар болтол хөргөх вэ?', 'Before adding the starter, how warm should the boiled milk be?',
      ['Бүлээн (хуруу тэвчихүйц)', 'Мөс шиг хүйтэн', 'Буцалж байх', 'Хөлдсөн'], ['Lukewarm (finger-warm)', 'Ice cold', 'Still boiling', 'Frozen'], 0,
      'Хэт халуун бол бактери үхнэ, хүйтэн бол исэхгүй.', 'Too hot kills the bacteria; too cold and it won’t ferment.'),
    // ---- Naadam
    Q('naadam', '“Эрийн гурван наадам”-д аль нь ордог вэ?', 'Which are the “three games of men” at Naadam?',
      ['Бөх, морь уралдаан, сур харваа', 'Бөх, хөл бөмбөг, сур', 'Морь, шатар, усанд сэлэлт', 'Шагай, сагс, бөх'], ['Wrestling, horse racing, archery', 'Wrestling, football, archery', 'Horses, chess, swimming', 'Knucklebones, basketball, wrestling'], 0,
      'Эдгээрт одоо эмэгтэйчүүд, хүүхдүүд ч оролцдог. Шагай харваа ч алдартай.', 'Today women and children take part too. Knucklebone shooting is also popular.'),
    Q('naadam', 'Улсын баяр наадам жил бүр хэдэн сарын хэдэнд эхэлдэг вэ?', 'On what date does the national Naadam start each year?',
      ['7-р сарын 11', '1-р сарын 1', '12-р сарын 29', '3-р сарын 8'], ['July 11', 'January 1', 'December 29', 'March 8'], 0,
      '7-р сарын 11–13-нд Ардын хувьсгалын ойгоор тэмдэглэдэг.', 'It runs July 11–13, marking the 1921 People’s Revolution.'),
    Q('naadam', 'Ялсан бөх барилдааны дараа ямар бүжиг хийдэг вэ?', 'What dance does a winning wrestler perform?',
      ['Гарьдын (шонхорын) бүжиг', 'Биелгээ', 'Ёохор', 'Вальс'], ['The eagle (garuda) dance', 'Biyelgee', 'Yookhor', 'Waltz'], 0,
      'Гараа далавч шиг дэлгэж, шувуу шиг нисэх мэт бүжиглэдэг.', 'He spreads his arms like wings and “flies” like a bird.'),
    Q('naadam', 'Бөхийн цолонд аль нь хамгийн дээд вэ?', 'Which wrestling title is the highest?',
      ['Аварга', 'Начин', 'Харцага', 'Заан'], ['Avarga (Titan)', 'Nachin (Falcon)', 'Khartsaga (Hawk)', 'Zaan (Elephant)'], 0,
      'Начин, харцага, заан, гарьд, арслан, аварга гэж ахина.', 'The titles rise: Nachin, Khartsaga, Zaan, Garid, Arslan, Avarga.'),
    Q('naadam', 'Наадмын хурдан морины уралдаанд ихэвчлэн хэн унадаг вэ?', 'Who usually rides in Naadam horse races?',
      ['Хүүхэд унаачид', 'Өвөө нар', 'Цэргүүд', 'Бөхчүүд'], ['Child jockeys', 'Grandfathers', 'Soldiers', 'Wrestlers'], 0,
      'Хөнгөн хүүхэд унаачид 10–30 км хүртэл давхидаг.', 'Light child jockeys race distances up to 10–30 km.'),
    Q('naadam', 'Наадмыг ЮНЕСКО-гийн биет бус өвийн жагсаалтад хэдэн онд бүртгэсэн бэ?', 'In which year was Naadam added to UNESCO’s intangible heritage list?',
      ['2010', '1921', '2000', '2023'], ['2010', '1921', '2000', '2023'], 0,
      '2010 онд бүртгэгдсэн. Морин хуур, уртын дуу, хөөмий ч бүртгэлтэй.', 'It was listed in 2010. The morin khuur, long song and khöömii are listed too.'),
    // ---- customs
    Q('customs', 'Гэрт орохдоо юуг гишгэж болохгүй вэ?', 'What must you never step on when entering a ger?',
      ['Босго', 'Шал', 'Хивс', 'Ширдэг'], ['The threshold', 'The floor', 'The rug', 'The felt mat'], 0,
      'Босгыг гишгэх нь ёс бус. Алхаж давна.', 'Stepping on the threshold is bad manners. Step over it.'),
    Q('customs', 'Гэр дотор ямар чиглэлээр явдаг вэ?', 'Which way do you move around inside a ger?',
      ['Нар зөв (цагийн зүүний дагуу)', 'Нар буруу', 'Шууд дундуур', 'Хамаагүй'], ['Sunwise (clockwise)', 'Against the sun', 'Straight through the middle', 'Any way'], 0,
      'Нарны явахтай адил нар зөв эргэдэг.', 'You move the way the sun travels.'),
    Q('customs', 'Хоймор гэж гэрийн аль хэсэг вэ?', 'Where in the ger is the khoimor?',
      ['Хаалганы эсрэг талын хүндэт хэсэг', 'Хаалганы дэргэд', 'Зуухны дотор', 'Гэрийн гадна'], ['The place of honour opposite the door', 'Next to the door', 'Inside the stove', 'Outside the ger'], 0,
      'Хойморт ахмад настан, хүндтэй зочин суудаг.', 'Elders and honoured guests sit in the khoimor.'),
    Q('customs', 'Уламжлалаар гэрийн баруун тал (орохдоо зүүн гар тал) хэний тал вэ?', 'Traditionally, whose side is the west side of the ger (your left as you enter)?',
      ['Эрэгтэй хүн, зочны тал', 'Гал тогооны тал', 'Хүүхдийн тоглоомын тал', 'Нохойн тал'], ['Men and guests', 'The kitchen', 'Children’s toys', 'The dog’s side'], 0,
      'Баруун талд эмээл, хазаар, эрэгтэйчүүдийн эд зүйл байдаг. Зүүн талд гал тогоо, эмэгтэйчүүдийн эд зүйл.', 'Saddles and men’s things are on the west; the kitchen and women’s things are on the east.'),
    Q('customs', 'Ахмад хүнд юм өгөхдөө яах вэ?', 'How do you hand something to an elder?',
      ['Баруун гараараа эсвэл хоёр гараараа', 'Зүүн гараараа шидэж', 'Ширээн дээр хаяж', 'Хөлөөрөө түлхэж'], ['With your right hand or both hands', 'Throw it with your left hand', 'Drop it on the table', 'Push it with your foot'], 0,
      'Хүндэтгэл илэрхийлж баруун гар эсвэл хоёр гараараа өгдөг.', 'Using your right hand or both hands shows respect.'),
    Q('customs', 'Цагаан сараар золгохдоо залуу хүн гараа яаж байрлуулах вэ?', 'At Tsagaan Sar, how does a younger person hold their arms when greeting an elder?',
      ['Ахмадын тохойг доороос нь түшнэ', 'Дээрээс нь дарна', 'Гар барина', 'Алга ташина'], ['Support the elder’s elbows from below', 'Press down from above', 'Shake hands', 'Clap'], 0,
      'Залуу хүн доороос түшиж, ахмадаа хүндэлж байгаагаа харуулдаг.', 'Supporting from below shows respect for the elder.'),
    Q('customs', 'Морин хуурын толгой ямар амьтны дүрстэй вэ?', 'The morin khuur fiddle has the head of which animal?',
      ['Морь', 'Луу', 'Арслан', 'Тэмээ'], ['A horse', 'A dragon', 'A lion', 'A camel'], 0,
      'Хөөрхөн Намжилын домогт хайртай хурдан морио дурсаж анхны морин хуурыг хийсэн гэдэг.', 'In the legend of Khökhöö Namjil, the first fiddle was made in memory of a beloved horse.'),
  ];

  // Offline answers: keywords (lower case, Cyrillic or English stems) -> answer.
  const A = (k, mn, en) => ({ k, a: { mn, en } });
  B.FAQ = [
    A(['басар', 'чи хэн', 'нэр чинь', 'who are you', 'your name', 'basar'], 'Вуф! Би Басар, монгол банхар нохой. Банхар нохой мянга мянган жил малчдын гэр, малыг чоно, хүйтнээс хамгаалж ирсэн. Би чамд Монголын өв соёлыг заана!', 'Woof! I’m Basar, a Mongolian Bankhar dog. Bankhars have guarded herders’ gers and herds from wolves and cold for thousands of years. I’ll teach you about Mongolian heritage!'),
    A(['банхар', 'нохой', 'bankhar', 'dog'], 'Банхар бол монгол нутгийн уугуул том, үслэг нохой. Нүдний дээрх шаргал толбыг “дөрвөн нүд” гэдэг. Шөнө ч сэргэг харуулддаг гэж итгэдэг байжээ.', 'The Bankhar is a big, fluffy native Mongolian dog. The tan spots above its eyes are called “four eyes” — people believed it kept watch even at night.'),
    A(['нууц товчоо', 'нууц товчоо', 'secret history'], '“Монголын нууц товчоо” бол Чингис хааны удам угсаа, амьдралыг өгүүлсэн хамгийн эртний монгол зохиол. 12 бүлэг, 282 зүйлтэй. Ихэнх эрдэмтэд 1228 онд бичигдсэн гэж үздэг.', 'The Secret History of the Mongols is the oldest Mongolian literary work, telling the ancestry and life of Chinggis Khaan. It has 12 chapters and 282 sections, and most scholars date it to 1228.'),
    A(['чингис', 'тэмүжин', 'chinggis', 'genghis', 'temujin', 'temüjin'], 'Тэмүжин 1162 онд Онон голын Дэлүүн болдогт төржээ. Хүнд хэцүү бага насыг туулж, 1206 онд Чингис хаан хэмээн өргөмжлөгдөж, Их Монгол Улсыг байгуулсан.', 'Temüjin was born in 1162 at Delüün Boldog by the Onon river. After a hard childhood he was proclaimed Chinggis Khaan in 1206 and founded the Great Mongol State.'),
    A(['алан гуа', 'таван сум', 'сум', 'alan gua', 'arrow'], 'Алан гуа эх таван хүүдээ нэг нэг сум өгөхөд амархан хугалсан. Харин таван сумыг багцлахад хэн ч хугалж чадаагүй. “Эв нэгдэлтэй бол хүчтэй” гэсэн сургаал!', 'Alan Gua gave each of her five sons one arrow, and they snapped them easily. Bundled together, no one could break them. The lesson: together we are strong!'),
    A(['өэлүн', 'hoelun', 'hö’elün'], 'Өэлүн эх бол Тэмүжиний ээж. Нөхрөө нас барсны дараа хүүхдүүдээ Онон голын загас, жимс, ургамлын үндсээр тэжээн, зоригтой хүмүүжүүлсэн.', 'Hö’elün was Temüjin’s mother. After her husband died she raised her children bravely on fish, berries and wild roots from the Onon river.'),
    A(['бөртэ', 'borte', 'börte'], 'Бөртэ үжин бол Чингис хааны хатан. Хонгирад аймгийн Дэй сэцэний охин. Ухаалаг зөвлөгөөгөөрөө алдартай.', 'Börte was Chinggis Khaan’s empress, daughter of Dei Setsen of the Onggirat. She was famous for her wise advice.'),
    A(['жамуха', 'jamukha'], 'Жамуха бол Тэмүжиний бага насны анд. Хүүхэд байхдаа шагай, сум солилцож тангараг өргөсөн ч хожим өрсөлдөгч болсон.', 'Jamukha was Temüjin’s childhood sworn brother. They swapped knucklebones and arrows as boys but later became rivals.'),
    A(['хархорум', 'karakorum'], 'Хархорум бол Их Монгол Улсын нийслэл, Орхон голын хөндийд байдаг. Одоо тэнд Эрдэнэ Зуу хийд бий.', 'Karakorum was the capital of the Mongol Empire, in the Orkhon valley. Erdene Zuu monastery stands there today.'),
    A(['хүннү', 'модун', 'xiongnu', 'hunnu'], 'Хүннү гүрэн МЭӨ 209 онд Модун шаньюйгийн үед хүчирхэгжсэн. Үүнийг Монгол төрийн эхлэл гэж үздэг.', 'The Xiongnu state grew strong under Modun Chanyu in 209 BC. It is seen as the beginning of Mongolian statehood.'),
    A(['монгол бичиг', 'уйгаржин', 'mongol script', 'script'], 'Уйгаржин монгол бичгийг дээрээс доош, зүүнээс баруун тийш бичдэг. Чингис хааны үеэс төрийн бичиг болсон. Одоо сургуульд дахин заадаг.', 'The Mongol script is written top to bottom, columns left to right. It became the state script in Chinggis Khaan’s time and is taught in schools again today.'),
    A(['соёмбо', 'soyombo'], 'Соёмбо үсгийг 1686 онд Өндөр гэгээн Занабазар зохиосон. Соёмбо тэмдэг манай төрийн далбаан дээр бий.', 'Zanabazar created the Soyombo script in 1686. The Soyombo symbol is on our national flag.'),
    A(['гэр', 'ger', 'yurt'], 'Монгол гэр бол нүүдэлчдийн ухаалаг байшин. Хана, тооно, унь, багана, хаалга, эсгий, бүрээс, бүслүүрээс бүтдэг. Гэр бүлээрээ 1–2 цагт барьж болно!', 'The Mongol ger is the nomads’ clever home, made of khana walls, toono crown, uni poles, bagana posts, a door, felt, a cover and ropes. A family can put it up in 1–2 hours!'),
    A(['тооно', 'toono'], 'Тооно бол гэрийн дээд талын дугуй цонх. Гэрэл орж, утаа гардаг. Тооноор тусах нарны гэрлээр цагийг мэддэг байжээ.', 'The toono is the round crown at the top of the ger. Light comes in and smoke goes out, and its sunbeam was used to tell the time.'),
    A(['унь', 'uni'], 'Унь бол тооноос ханын толгой руу тавьдаг урт шон. 5 ханатай гэрт 80 орчим унь байдаг.', 'Uni are the long roof poles from the crown to the wall tops. A 5-khana ger has about 80 of them.'),
    A(['хана', 'khana', 'lattice'], 'Хана бол гэрийн эвхэгддэг тор хэлбэртэй хэрэм. Гэр хэдэн ханатай вэ гэдгээр томыг нь хэмждэг.', 'The khana is the folding lattice wall. A ger’s size is counted by how many khana it has.'),
    A(['багана', 'bagana'], 'Багана бол тоонг тулдаг хоёр шон. Хоёр баганын дундуур гарахгүй, баганаа түшихгүй байх нь ёс.', 'The bagana are the two posts holding up the crown. Custom says don’t walk between them or lean on them.'),
    A(['эсгий', 'felt'], 'Эсгийг хонины ноосыг дэвтээж, норгож, морь эсвэл тэмээгээр чирж өнхрүүлэн хийдэг. Гэрийг өвөл дулаан, зун сэрүүн байлгадаг.', 'Felt is made by wetting sheep’s wool and rolling it, often dragged by a horse or camel. It keeps the ger warm in winter and cool in summer.'),
    A(['цагаан идээ', 'сүү', 'dairy', 'milk'], 'Цагаан идээ гэдэг нь сүүгээр хийсэн хүнс: тараг, өрөм, ааруул, бяслаг, шар тос, айраг. Зуны улиралд хамгийн их хийдэг.', 'White foods are made from milk: yogurt, clotted cream, aaruul, cheese, butter and airag. They are made most in summer.'),
    A(['тараг', 'yogurt', 'yoghurt'], 'Тараг хийхдээ: сүүгээ буцалгаад бүлээн болтол хөргөнө, хөрөнгө (хуучин тараг) хийж хутгана, дулаан боож 6–8 цаг байлгана. Халуун сүүг том хүнтэй хамт!', 'To make yogurt: boil milk, cool it to lukewarm, stir in a spoon of old yogurt, wrap it warm for 6–8 hours. Handle hot milk with a grown-up!'),
    A(['ааруул', 'aaruul'], 'Ааруул хийхдээ исгэлэн сүү эсвэл тарагийг халааж ээдэм гаргаад, даавуунд хийж шахна. Дараа нь хэрчээд нар, салхинд хатаана.', 'For aaruul, heat sour milk or yogurt until curds form, press them in a cloth, cut them up and dry them in the sun and wind.'),
    A(['өрөм', 'orom', 'öröm', 'cream'], 'Өрөм хийхдээ сүүгээ буцалгаад шанагаар өндрөөс самарч хөөсрүүлнэ. Хонуулахад дээр нь зузаан өрөм тогтоно.', 'For öröm, boil milk and ladle it from high up to make foam. Overnight a thick cream forms on top.'),
    A(['айраг', 'airag', 'kumis'], 'Айргийг гүүний сүүгээр хийнэ. Хөхүүрт хийж мянга мянган удаа бүлж исгэдэг. Зуны баярын ундаа!', 'Airag is made from mare’s milk, churned thousands of times in a leather bag. It’s the summer festival drink!'),
    A(['наадам', 'naadam'], 'Наадам бол “эрийн гурван наадам”: бөх, морь уралдаан, сур харваа. Улсын наадам 7-р сарын 11–13-нд болдог. 2010 онд ЮНЕСКО-д бүртгэгдсэн.', 'Naadam has the “three games of men”: wrestling, horse racing and archery. The national Naadam is July 11–13 and was listed by UNESCO in 2010.'),
    A(['бөх', 'барилд', 'зодог', 'wrestl'], 'Монгол бөх зодог, шуудаг, гутал өмсдөг. Ялсан бөх гарьдын бүжиг хийнэ. Цол: начин, харцага, заан, гарьд, арслан, аварга.', 'Mongolian wrestlers wear the zodog jacket, shuudag shorts and gutal boots. Winners do the eagle dance. Titles: Nachin, Khartsaga, Zaan, Garid, Arslan, Avarga.'),
    A(['морь уралд', 'хурдан морь', 'horse rac'], 'Наадамд хүүхэд унаачид насаар нь ангилсан морьдоор 10–30 км давхидаг. Түрүүлсэн морийг айргаар цацаж ерөөдөг.', 'At Naadam, child jockeys race horses grouped by age over 10–30 km. The winning horse is blessed with airag.'),
    A(['сур харв', 'харваа', 'archery'], 'Сур харваанд эрэгтэйчүүд 75 метр, эмэгтэйчүүд 60 метрээс “сур” гэдэг жижиг бай руу харвадаг.', 'In Mongolian archery men shoot from 75 m and women from 60 m at small targets called sur.'),
    A(['шагай', 'shagai', 'knucklebone'], 'Шагай бол хонины шагайгаар тоглодог тоглоом. Морь, тэмээ, хонь, ямаа гэсэн дөрвөн талтай. Шагай харваа 2014 онд ЮНЕСКО-д бүртгэгдсэн.', 'Shagai are sheep anklebones with four sides: horse, camel, sheep and goat. Knucklebone shooting was listed by UNESCO in 2014.'),
    A(['цагаан сар', 'tsagaan sar', 'lunar new year'], 'Цагаан сар бол монгол шинэ жил. Ахмадуудтайгаа золгож, бууз, ул боов, цагаан идээгээр дайлдаг. Залуу хүн ахмадын тохойг доороос түшиж золгоно.', 'Tsagaan Sar is the Mongolian New Year. We greet elders, and share buuz, ul boov and dairy foods. The younger person supports the elder’s elbows from below.'),
    A(['морин хуур', 'morin khuur', 'horsehead fiddle'], 'Морин хуур бол морин толгойтой хоёр утастай хөгжим. Хөөрхөн Намжилын домогт хайртай морио дурсаж хийсэн гэдэг. ЮНЕСКО-д бүртгэлтэй.', 'The morin khuur is a two-string fiddle with a horse head. Legend says Khökhöö Namjil made it in memory of his beloved horse. It’s on the UNESCO list.'),
    A(['хөөмий', 'khoomii', 'throat sing'], 'Хөөмий бол нэг дор хоёр дуу авиа гаргадаг монгол хоолойн урлаг. 2010 онд ЮНЕСКО-д бүртгэгдсэн.', 'Khöömii is Mongolian throat singing — two sounds at once from one voice. It was listed by UNESCO in 2010.'),
    A(['босго', 'threshold'], 'Гэрт орохдоо босго гишгэдэггүй, алхаж давдаг. Босго бол гэрийн хүндэт хил гэж үздэг.', 'When entering a ger, never step on the threshold — step over it. It is seen as the home’s honoured border.'),
    A(['хоймор', 'khoimor'], 'Хоймор бол хаалганы эсрэг талын хүндэт хэсэг. Ахмад настан, хүндтэй зочин суудаг. Бурханы шүүгээ ч энд байдаг.', 'The khoimor is the place of honour opposite the door, where elders and honoured guests sit.'),
    A(['ямар ёс', 'ёс заншил', 'ёс журам', 'заншил', 'custom', 'manners'], 'Гэрт нар зөв явна, босго гишгэхгүй, баганы дундуур гарахгүй, ахмадад хоёр гараараа юм өгнө. Эмээ өвөөгөөсөө бусад ёсыг асуугаарай!', 'In a ger, move sunwise, don’t step on the threshold, don’t walk between the posts, and give things to elders with both hands. Ask your grandparents for more customs!'),
  ];

  // short "did you know?" facts Basar shares while walking with you
  B.FACTS = [
    { mn: 'Мэдэх үү? Тооноор тусах нарны гэрлээр монголчууд цагийг мэддэг байсан.', en: 'Did you know? Mongols told the time by the sunbeam through the toono.' },
    { mn: 'Мэдэх үү? 5 ханатай гэрт 80 орчим унь байдаг.', en: 'Did you know? A 5-khana ger has about 80 roof poles.' },
    { mn: 'Мэдэх үү? Айргийг мянга мянган удаа бүлж исгэдэг.', en: 'Did you know? Airag is churned thousands of times.' },
    { mn: 'Мэдэх үү? Нууц товчоо 12 бүлэгтэй.', en: 'Did you know? The Secret History has 12 chapters.' },
    { mn: 'Мэдэх үү? Банхар нохойн нүдний дээрх толбыг “дөрвөн нүд” гэдэг.', en: 'Did you know? A Bankhar’s eyebrow spots are called “four eyes”.' },
    { mn: 'Мэдэх үү? Гэрийн хаалга урагшаа харж барьдаг.', en: 'Did you know? A ger door faces south.' },
    { mn: 'Мэдэх үү? Ааруулыг наранд хатаадаг.', en: 'Did you know? Aaruul is dried in the sun.' },
    { mn: 'Мэдэх үү? Алан гуа таван сумаар эв нэгдлийг заажээ.', en: 'Did you know? Alan Gua taught unity with five arrows.' },
    { mn: 'Мэдэх үү? Монгол бичгийг дээрээс доош бичдэг.', en: 'Did you know? Mongol script is written top to bottom.' },
    { mn: 'Мэдэх үү? Наадам 2010 онд ЮНЕСКО-д бүртгэгдсэн.', en: 'Did you know? Naadam was listed by UNESCO in 2010.' },
  ];

  // suggested questions shown as chips in the chat
  B.SUGGEST = [
    { mn: 'Нууц товчоо гэж юу вэ?', en: 'What is the Secret History?' },
    { mn: 'Гэр яаж барьдаг вэ?', en: 'How do you build a ger?' },
    { mn: 'Тараг яаж хийдэг вэ?', en: 'How is yogurt made?' },
    { mn: 'Таван сумны сургаал', en: 'The five arrows lesson' },
    { mn: 'Наадам гэж юу вэ?', en: 'What is Naadam?' },
    { mn: 'Гэрт ямар ёс баримтлах вэ?', en: 'What are ger manners?' },
  ];

  const norm = (s) => String(s || '').toLowerCase().replace(/[“”"«».,!?;:()]/g, ' ').replace(/\s+/g, ' ');
  /** Best offline answer for a question, or null. */
  B.localAnswer = (q) => {
    const s = norm(q); let best = null, bs = 0;
    for (const f of B.FAQ) {
      let sc = 0; for (const k of f.k) if (s.includes(k)) sc += k.length;
      if (sc > bs) { bs = sc; best = f; }
    }
    return best ? best.a : null;
  };
  /** A quiz question from the offline bank, avoiding recently asked ones. */
  B.localQuiz = (topic, avoid = []) => {
    const pool = B.QUIZ.filter((q) => (!topic || topic === 'mix' || q.t === topic));
    const fresh = pool.filter((q) => !avoid.includes(q.q.mn));
    const q = (fresh.length ? fresh : pool)[Math.floor(Math.random() * (fresh.length ? fresh : pool).length)];
    // shuffle options so the right answer is not always first
    const idx = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
    return { topic: q.t, question: q.q, options: idx.map((i) => q.o[i]), answer: idx.indexOf(q.a), explain: q.e };
  };
})(window.TG);
