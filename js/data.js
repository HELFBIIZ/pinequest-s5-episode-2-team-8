/* Content: age groups, pillars, family missions, memory-book prompts */
(function (TG) {
  TG.AGE_GROUPS = [
    { id: '3-6', emoji: '🐣', name: { mn: 'Бяцхан од', en: 'Little stars' }, range: { mn: '3–6 нас', en: 'Ages 3–6' } },
    { id: '7-10', emoji: '🐎', name: { mn: 'Сониуч унаач', en: 'Curious riders' }, range: { mn: '7–10 нас', en: 'Ages 7–10' } },
    { id: '11-14', emoji: '🦅', name: { mn: 'Бүргэд', en: 'Young eagles' }, range: { mn: '11–14 нас', en: 'Ages 11–14' } },
    { id: '15-18', emoji: '🏔️', name: { mn: 'Оргилд', en: 'Summit' }, range: { mn: '15–18 нас', en: 'Ages 15–18' } },
  ];

  TG.PILLARS = {
    health: { icon: '💚', color: '#12B76A', name: { mn: 'Эрүүл мэнд', en: 'Health' } },
    edu: { icon: '📘', color: '#2F6BFF', name: { mn: 'Боловсрол', en: 'Education' } },
    skills: { icon: '🛠️', color: '#F79009', name: { mn: 'Ур чадвар', en: 'Skills' } },
  };

  TG.AVATARS = ['🐎', '🐫', '🐑', '🐐', '🐄', '🦅', '🐺', '🦊', '🐻', '🐰', '🦌', '🐯', '🐼', '🦄', '🐸', '🐧'];
  TG.FAMILY_EMOJIS = ['👩', '👨', '👵', '👴', '🧑', '👧', '👦', '🧒', '👶', '🧕', '👩‍🦳', '👨‍🦳'];

  const A = ['3-6', '7-10', '11-14', '15-18'];
  const M = (id, ages, pillar, emoji, mnT, enT, mnD, enD) => ({ id, ages, pillar, emoji, title: { mn: mnT, en: enT }, desc: { mn: mnD, en: enD } });

  TG.MISSIONS = [
    M('lullaby', ['3-6'], 'edu', '🎶', 'Бүүвэйн дуу', 'Learn a lullaby',
      'Ээж, эмээгээсээ тэднийг бага байхад дуулдаг байсан бүүвэйн дууг заалгаж, хамт дуулаарай.',
      'Ask Mom or Grandma to teach you the lullaby they heard as children, then sing it together.'),
    M('count-home', ['3-6'], 'edu', '🔢', 'Гэрээ тоолъё', 'Count our home',
      'Гэрт байгаа халбага, сандал, цонхыг хамт тоолоорой. Хэн зөв тоолсон бэ?',
      'Count the spoons, chairs and windows at home together. Who got it right?'),
    M('handwash', ['3-6', '7-10'], 'health', '🧼', '20 секундын гар угаалт', '20-second hand wash',
      'Хамтдаа дуу дуулангаа 20 секунд гараа савандаж угаагаарай.',
      'Sing a song together while washing hands with soap for 20 seconds.'),
    M('aaruul', ['3-6', '7-10'], 'skills', '🧀', 'Ааруул хэрхэн хийдэг вэ?', 'How is aaruul made?',
      'Ааруул, тараг хэрхэн хийдгийг том хүнээс асууж, боломжтой бол хамт хийгээрэй.',
      'Ask a grown-up how aaruul and yogurt are made, and make some together if you can.'),
    M('ger-parts', ['3-6', '7-10'], 'edu', '⛺', 'Гэрийн хэсгүүд', 'Parts of a ger',
      'Тооно, унь, хана, баганын тухай том хүнээс асууж, гэрийн зургийг хамт зураарай.',
      'Ask a grown-up about the toono, uni, khana and bagana, then draw a ger together.'),
    M('real-shagai', ['3-6', '7-10', '11-14'], 'skills', '🦴', 'Жинхэнэ шагай', 'Real shagai',
      'Гэртээ байгаа шагайгаар морь уралдуулах эсвэл шагай няслах тоглоом тоглоорой.',
      'Play horse racing or flicking games with real shagai bones at home.'),
    M('stars', ['7-10', '11-14'], 'edu', '🌌', 'Долоон бурхан од', 'Find the Big Dipper',
      'Орой гэр бүлээрээ гадаа гарч Долоон бурхан болон Алтан гадас одыг хамт олоорой.',
      'Go outside one evening and find the Big Dipper and the North Star together.'),
    M('buuz', ['7-10', '11-14', '15-18'], 'skills', '🥟', 'Хамтдаа хоол хийх', 'Cook together',
      'Гэр бүлээрээ бууз эсвэл хуушуур хийж, хүн бүр нэг алхмыг хариуцаарай.',
      'Make buuz or khuushuur as a family. Everyone is in charge of one step.'),
    M('homeland', ['7-10', '11-14'], 'edu', '⛰️', 'Нутгийн уул ус', 'Our homeland',
      'Өвөө, эмээгээсээ төрсөн нутгийнх нь уул, голын нэрийг асууж, газрын зураг дээр олоорой.',
      'Ask your grandparents the names of the mountains and rivers where they were born. Find them on a map.'),
    M('walk', A, 'health', '🚶', 'Утасгүй алхалт', 'Phone-free walk',
      'Бүх гэр бүлээрээ утсаа гэртээ үлдээгээд 30 минут гадаа алхаарай.',
      'Leave all phones at home and take a 30-minute family walk.'),
    M('plant', ['3-6', '7-10', '11-14'], 'health', '🌱', 'Ургамал тарих', 'Grow a plant',
      'Хамтдаа үр суулгаж, өдөр бүр ус өгч, хэр өссөнийг тэмдэглээрэй.',
      'Plant a seed together, water it daily and note how much it grows.'),
    M('thanks', A, 'health', '💌', 'Талархлын захидал', 'A thank-you note',
      'Гэр бүлийн нэг гишүүндээ талархлын жижиг захидал эсвэл зураг бэлэглээрэй.',
      'Give a family member a small thank-you letter or drawing.'),
    M('family-tree', ['7-10', '11-14'], 'edu', '🌳', 'Гэр бүлийн мод', 'Family tree',
      'Гурван үеийн гэр бүлийн модоо зурж, хүн бүрийн төрсөн нутгийг бичээрэй.',
      'Draw a three-generation family tree and write where each person was born.'),
    M('proverbs', ['7-10', '11-14', '15-18'], 'edu', '📜', 'Зүйр цэцэн үг', 'Mongolian proverbs',
      'Өвөө, эмээгээсээ 3 зүйр цэцэн үг сурч, утгыг нь хамт ярилцаарай.',
      'Learn 3 proverbs from your grandparents and talk about what they mean.'),
    M('menu', ['11-14', '15-18'], 'health', '🥗', '7 хоногийн хоолны цэс', 'Weekly meal plan',
      'Гэр бүлийн 7 хоногийн эрүүл хоолны цэсийг хамт гаргаарай. Ногоо, жимс заавал оруулаарай!',
      'Plan a healthy weekly menu as a family. Vegetables and fruit are a must!'),
    M('parents-job', ['11-14', '15-18'], 'skills', '💼', 'Ээж, аавын ажил', "Parents' work",
      'Эцэг эхээсээ ажлынх нь нэг өдрийн тухай асууж, хамгийн хэцүү, хамгийн гоё хэсгийг сонсоорой.',
      "Ask your parents about a day at their job: the hardest part and the best part."),
    M('first-aid-kit', ['11-14', '15-18'], 'health', '🩹', 'Гэрийн эмийн сан', 'Home first-aid kit',
      'Гэрийнхээ эмийн санг хамт шалгаж, 103 руу хэзээ залгах ёстойг ярилцаарай.',
      'Check your home first-aid kit together and talk about when to call 103.'),
    M('teach-app', ['15-18'], 'skills', '📲', 'Ээж, аавдаа зааж өг', 'Teach your parents',
      'Эцэг эх, эмээ өвөөдөө видео дуудлага, QR төлбөр гэх мэт нэг шинэ ур чадвар зааж өгөөрэй.',
      'Teach a parent or grandparent one new digital skill, like video calls or QR payments.'),
    M('family-budget', ['15-18'], 'skills', '📊', 'Гэр бүлийн төсөв', 'Family budget',
      'Гэр бүлийнхээ сарын зардлыг хамт хараад, хэмнэх нэг арга санал болгоорой.',
      "Look at your family's monthly spending together and suggest one way to save."),
    M('dreams', ['11-14', '15-18'], 'edu', '💭', 'Залуу насны мөрөөдөл', 'Dreams of youth',
      'Эмээ, өвөөгөөсөө залуудаа юу мөрөөддөг байсныг асуугаарай. Дараа нь өөрийн мөрөөдлөө хуваалцаарай.',
      'Ask your grandparents what they dreamed of when young. Then share your own dream.'),
  ];

  TG.STORY_PROMPTS = [
    { mn: 'Та бага байхдаа ямар тоглоом тоглодог байсан бэ?', en: 'What games did you play as a child?' },
    { mn: 'Таны хамгийн дуртай үлгэрийг ярьж өгөөч.', en: 'Tell me your favorite folk tale.' },
    { mn: 'Та миний насан дээр юу мөрөөддөг байсан бэ?', en: 'What did you dream about at my age?' },
    { mn: 'Таны төрсөн нутаг ямар газар байсан бэ?', en: 'What was your birthplace like?' },
    { mn: 'Та Цагаан сараа хэрхэн тэмдэглэдэг байсан бэ?', en: 'How did you celebrate Tsagaan Sar?' },
    { mn: 'Таны амьдралын хамгийн аз жаргалтай өдөр аль нь вэ?', en: 'What was the happiest day of your life?' },
    { mn: 'Надад өгөх хамгийн чухал зөвлөгөө тань юу вэ?', en: 'What is the most important advice you would give me?' },
    { mn: 'Та анх ямар ажил хийж байсан бэ?', en: 'What was your first job?' },
    { mn: 'Танд ямар дуу хамгийн их таалагддаг вэ? Дуулж өгөөч!', en: 'What is your favorite song? Please sing it!' },
    { mn: 'Би бага байхдаа ямар хүүхэд байсан бэ?', en: 'What was I like as a baby?' },
    { mn: 'Ээж, аав хоёр минь хэрхэн танилцсан бэ?', en: 'How did my parents meet?' },
    { mn: 'Танд бага байхад хэн хамгийн их нөлөөлсөн бэ?', en: 'Who inspired you most as a child?' },
  ];

  /** Deterministic "mission of the day" so the whole family sees the same one. */
  TG.dailyMission = (ag) => {
    const list = TG.MISSIONS.filter((m) => m.ages.includes(ag));
    const k = TG.store.dkey(); let hsh = 0;
    for (const ch of k + ag) hsh = (hsh * 31 + ch.charCodeAt(0)) >>> 0;
    return list[hsh % list.length];
  };
})(window.TG);
