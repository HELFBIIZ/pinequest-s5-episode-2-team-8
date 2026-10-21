# Тоглоом — Хамтдаа суралцъя (Play together, grow together)

**Pinequest · Pinecone Academy · Theme: "Fine-Tune for the Future — Equal Access to Health, Education, Skills"**

A learning-games platform for Mongolian children aged 3–18, built so that kids learn **with** their family and friends, not alone with a screen.

> "Дэлгэц бол гүүр. Зорилго нь гэр бүл." — The screen is a bridge. The destination is family.

## Run it

No install or build step. From this folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` directly also works, but offline mode and microphone recording need a local server.
On a phone, open the page and choose "Add to Home Screen". After the first load it runs fully offline.

## No Xcode, no accounts, no licenses

Тоглоом is a plain web app, a Progressive Web App (PWA). You do **not** need Xcode, Android Studio, an Apple Developer account, a Google Play account, or any paid license to build, run, demo or install it.

- **No build tools.** It is plain HTML, CSS and JavaScript. Nothing to compile and no `npm install`.
- **No third-party services.** Fonts are bundled in `assets/fonts`, and sounds are generated in code. The app makes zero requests to outside servers, and all data stays on the device.
- **No app store.** Phones install it straight from the browser:
  - **iPhone (Safari):** Share button → "Add to Home Screen".
  - **Android (Chrome):** menu ⋮ → "Install app" or "Add to Home screen".
  It then opens full-screen with its own icon and works offline.

### Getting it onto phones for free
Offline mode and voice recording need **HTTPS** (or `localhost`). For phones, put the folder on any free static host. None of these need a paid plan or license:
- **Netlify Drop**: drag the `togloom` folder onto app.netlify.com/drop.
- **GitHub Pages**: push the folder to a repository and turn on Pages in its settings.
- **Cloudflare Pages** or **Vercel**: connect the repository on the free tier.

For a quick test on the same Wi-Fi, run the local server and open `http://<your-mac-ip>:8000` on the phone. Everything except offline caching and the microphone works this way.

### Credits and licenses of what's included
| Item | License | Notes |
|---|---|---|
| Nunito font | SIL Open Font License 1.1 | Free to use and bundle. License text: `assets/fonts/OFL-Nunito.txt` |
| Rubik font | SIL Open Font License 1.1 | Free to use and bundle. License text: `assets/fonts/OFL-Rubik.txt` |
| Emoji | Device system fonts | Drawn by the phone's own emoji font. Nothing is bundled. |
| Icons, illustrations, logo, sounds | Written for this project | Original inline SVG and code-generated audio |
| App code | Your team's | No third-party libraries are used |

> An app-store version later would need store accounts (Apple charges a yearly fee and requires Xcode on a Mac; Google Play charges a one-time fee). None of that is needed for Pinequest.

## What's inside

| Age group | Games |
|---|---|
| 3–6 Бяцхан од | Цагаан толгой (alphabet), Таван хошуу мал (counting livestock), Санах ойн карт, Эрүүл зуршил, Хөдөлгөөнт завсарлага, Тайван амьсгал, Шагай |
| 7–10 Сониуч унаач | Шагайн морь уралдаан, Тооны тулаан, Тэмээг худаг руу (coding), Гэр бүлийн сагс, Миний Монгол, Анхны тусламж, … |
| 11–14 Бүргэд | Coding with loops and block limits, Ухаалаг мөнгө, Дижитал баатар, Сэтгэлийн эрүүл мэнд, … |
| 15–18 Оргилд | Harder budgets and savings goals, first aid, digital safety, mental health, … |

That makes 15 games across the 3 pillars: 💚 Health, 📘 Education, 🛠️ Skills.

### ✨ Цэгцлэе! (Make it perfect): satisfying puzzles that teach
Inspired by "satisfying" puzzle apps like Satisgame, but every level teaches one real thing.
There are 48 short levels, 12 per age group, on a level map with stars and unlocking. Each level ends with a "Мэдсэн үү?" (Did you know?) fact.

| Mechanic | Example lessons |
|---|---|
| 🫧 Pop bubbles | Count 1–5, alphabet order, divisible by 3, prime numbers, binary |
| 🧺 Sort into bins | Livestock vs wild, recycling, renewable energy, fact vs opinion, scam messages |
| 🧽 Scrub | Brush teeth, wash hands, clear smog over the city, smoke-free lungs, wipe off a photo filter |
| 🧩 Place | Build a ger (khana, uni, toono…), organs in the body, life cycles, history timeline |
| 🥛 Pour | Half, 1/4, 2/3, 35%, the 50/30/20 savings rule, 80% battery care |
| 🔗 Connect | Animal and food, Mongolian and English words, capitals, chemical symbols, first aid |

Families can pick who plays together on the map. Players then take turns each level, and stars go to the family sky.
Level content lives in `js/satis-levels.js`. Adding a level is one object, with no new code.

### Features that make it "AI can't replace this"
- **Together mode in every game.** 2–4 players share one phone with turn-taking. Math Duel splits the screen so two players sit face to face.
- **Every game ends off-screen.** The result screen gives a real-life challenge to do as a family, worth +2 family stars.
- **Family sky.** Stars from playing together light up a night sky over a ger. The first 7 stars draw the Big Dipper (Долоон бурхан).
- **Family missions.** These are daily offline activities, like learning a lullaby from grandma, cooking buuz together, or teaching parents a digital skill.
- **Memory book.** Kids record grandparents' voices and stories. Recordings stay on the device.
- **"Ask your family" lifeline.** Quiz help unlocks only after talking with a real person.

### Equal access
- Offline PWA that works in the countryside without internet. It is tiny, with no images or audio files: sound is synthesized and pictures are emoji.
- Runs on old, cheap phones. It is Mongolian-first, with an English toggle.
- No accounts, no ads, no server. All data stays in the browser.
- Large-text and reduced-motion modes. The emoji-first design works for pre-readers.
- **Healthy screen time.** A parent-set daily limit triggers a break screen with a real family mission. There is also a 20-minute eye-rest reminder. Parents can unlock more time behind a math-question gate.
- **Fair pricing model** (shown on the About page): free forever for the core, a ₮3,900/month family plan where each family plan sponsors one rural child, and free access for public schools and soums.

## Project structure
```
index.html            app shell
css/styles.css        all styles
js/core.js            DOM helper, sounds, modals, turns, parental gate
js/store.js           localStorage state (profiles, stars, logs, screen time)
js/data.js            age groups, pillars, family missions, memory prompts
js/app.js             screens: onboarding, home, launcher, result, missions, memory book, parents, about
js/games/*.js         one file per game (quiz.js holds 5 quiz sets)
js/satis.js           Цэгцлэе! engine: 6 mechanics, level map, completion card
js/satis-levels.js    48 Цэгцлэе! levels (content only)
sw.js                 offline cache
```

### Adding a game
Create `js/games/mygame.js`, call `TG.registerGame({ id, icon, pillar, ages, title, desc, realLife, start(ctx) })`, add the script tag to `index.html`, and add the file to `sw.js`.
`ctx` provides `players`, `together`, `ageGroup`, `root` (the game area), `hud` (the score bar) and `finish({ stars, scores?, summary? })`.

## Demo tips for judges
1. Start on the welcome screen, then create a child profile.
2. Play **Шагайн морь уралдаан** in Together mode with "Ээж". Show the turn flash, the cultural facts, and the real-life challenge at the end.
3. Open **✨ Цэгцлэе** and play the ger-building, teeth-scrubbing and pouring levels.
4. Play **Тооны тулаан** with the phone flat between two people.
5. Open **Дурсамж** and record a short voice memory.
6. Open **Эцэг эх** (solve the math gate) to show together-time %, pillar progress and the screen-time limit.
7. Finish on the **About / fair pricing** page.
