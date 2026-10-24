# Naadamy on Phaser: the village, hands-on ger building, and playing together

Date: 2026-10-24 · Final demo: Friday 2026-10-30

## Why

Naadamy placed first of the three finalist teams at the demo. The judges' main
note: the game is hand-written at a low level, with no game engine, and that looks
fragile. The team hasn't seen it crash. The real goal is to show on Friday that
the team acted on the feedback: the game visibly runs on a real engine, and it is
at least as stable as it was at the demo.

The team also wants two things the engine makes easier:

- **More family play.** Shared tasks that two people do together.
- **Hands-on tasks instead of quiz-style ones.** Ger building first: gather
  the materials, then put the ger up step by step, working out the order by doing it.

## Goals

1. The Нутаг village runs on **Phaser 4**, a real, well-known game engine. Its
   name appears in the code, the README, the About/pitch page and the demo.
2. **Hands-on ger building** in the village: gather materials, trade for wooden
   parts, then build on your own plot one physical step at a time. Mistakes
   are gentle and teach.
3. **Two people on one screen**, each with their own character, plus **shared
   tasks** that need both: lifting the toono, rolling felt.
4. Everything that works today still works on Friday, and every existing test
   still passes. Tests change only where a selector has to change, or where they
   check behaviour this design deliberately replaces (see Testing).

## Non-goals (this week)

- Moving the separate minigames to Phaser. Wrestling, archery, milking, the ger
  interior, the 3D first-person view, the travel map and the aimag passport stay on their current
  code. They open from the Phaser village exactly as they do now. Next after Friday.
- Moving menus, login, lessons, Basar chat, the script academy, the parent
  dashboard or the About page into the engine. They stay as web pages.
- TypeScript, a bundler, npm dependencies for the app, or any build step.
- Changing how online multiplayer works, beyond syncing ger-building progress.

## Anti-goals (would be failure even if it "works")

- **A Phaser wrapper around the old canvas.** If the judges open the code and see
  the old draw loop inside a Phaser shell, we're worse off than before.
- **A demo that stutters, looks worse, or loses features** compared with the
  demo version.
- **A solo child who gets stuck** because a shared task needs a second person
  who isn't there.
- **Anything that breaks offline play**, or any request to an outside server.
  The smoke test fails on those.
- **Punishing mistakes.** The game already teaches gently (grandma's visit), and
  ger building must too.

## Constraints

- Plain JavaScript files loaded by `<script>` tags, in the `TG.*` module pattern
  used everywhere. No build step. The README says this, and the judges' demo
  depends on `node server.js` being all you need.
- Phaser is **vendored**: `js/vendor/phaser.min.js`, version 4.2.1 (latest
  stable, from July 2026). Keep its MIT license file next to it. Add it to
  `sw.js` `FILES`, bump the `CACHE` name, and make sure `tests/check-assets.mjs`
  passes.
- All art stays **drawn in code** by `js/village/pixel.js`. Its canvases become
  Phaser textures (`textures.addCanvas` or the equivalent). No image files.
- Text is bilingual through `L(mn, en)` and the `Tx`/`T` helpers. All new text needs
  Mongolian first, then English.
- Phones are the main target: 390×844 portrait in the smoke test, touch
  controls, offline after the first load.
- CI (`.github/workflows/ci.yml`): syntax check, asset check, puppeteer smoke
  test with software WebGL, multiplayer test, Basar API test. All must stay green.
- Six days. The work is ordered so that something demo-ready exists at the end of
  every day.

## Approaches considered

| | Approach | Trade-off | Verdict |
|---|---|---|---|
| A | Rebuild the whole app in Phaser: menus, lessons, academy, dashboard | Most complete "all engine" story, but rebuilds text-heavy screens that work well as web pages (including vertical Mongolian script) and doesn't fit in six days | Rejected |
| **B** | **Phaser runs the game worlds; web pages stay for menus and reading** | Real engine where the game is. Art, server, Basar and offline stay. The 3D view stays on its own WebGL because Phaser is 2D | **Chosen by the team** |
| C | Put the existing canvas inside a Phaser shell | Fast but hollow, and the judges would see through it | Rejected (anti-goal) |

The team also chose **demo-first**: the village and ger building move to Phaser
and get excellent, while the separate minigames move after Friday. The other
option was engine-first: move every minigame and keep ger building as it is.
Reason: what's on stage matters most, and a half-converted minigame is riskier
than an old one that works.

Gathering depth (my call, the team agreed): **felt gets the full chain**
(shear → beat → wet → roll). **Wooden parts come from a craftsman** in exchange
for goods, as real families buy them.

## Mind map

```
Naadamy on Phaser (Friday 2026-10-30)
├── Engine
│   ├── Phaser 4.2.1 vendored, offline-cached
│   ├── Village scene: terrain, water shimmer, seasons, entities, camera
│   ├── Textures from pixel.js canvases (same look)
│   ├── Input: keys, tap-to-walk, drag joystick, jump, run
│   ├── In-village modes ride along: horse riding, horse race, raider battles
│   └── Old minigames still open from the village (unchanged)
├── Hands-on ger
│   ├── Felt chain: shear sheep → beat wool → wet → roll felt (shared)
│   ├── Craftsman grandpa: trade wool/dairy/coins for khana, door, toono, bagana, uni
│   ├── Cover + ropes: from the shop / grandpa
│   ├── Build on your plot, step by step, visible to friends online
│   └── Gentle mistakes: ger sags, grandpa laughs, gives a hint
├── Family play
│   ├── Two characters on one screen (keys: WASD + arrows; touch: left/right halves)
│   ├── Shared tasks: lift toono together, roll felt together
│   ├── Solo fallback: Basar or grandpa helps when you're alone
│   └── Parent dashboard records "built together"
└── Friday
    ├── Pitch line + README + About page name the engine
    ├── Updated judges' demo order
    └── All CI green
```

## What gets built

### 1. Phaser village (parity first)

Replace the village's hand-written canvas loop (`frame`, `draw`, `drawMini` and the
pointer/keyboard handlers in `js/village/village.js`) with a Phaser game. It
lives in a new file, `js/village/phaser-village.js` (one Phaser `Scene`), mounted in
the same `.village` container so the HUD, pills, modals and minimap stay DOM.

- **Stays in village.js:** game logic. Quests, rewards, food, network handling,
  modals, the race and battle rules (`battleTick`, race update), NPC talk,
  `TG._village`. The Phaser scene reads `live` and calls into that logic. Drawing
  and input move. Rules don't.
- **Terrain:** built from `WD.g` (world.js) as a Phaser tilemap or a baked texture.
  Collision keeps using `WD.blocked` / `freeAt`, so behaviour is identical.
  Switching to Arcade physics is left to the builder, as long as movement feels
  the same.
- **Entities** (player, other players, pets, Basar, NPCs, animals, gers on plots,
  riders in the race, raiders in battles, floating text, bubbles, the jump arc):
  Phaser sprites/containers with depth sorted by y, as the old `ents` list
  did. Use pixel.js images as textures, cached per look/dir/frame as pixel.js
  already caches them.
- **Camera:** Phaser camera follows the player, with pixel-art settings (no
  smoothing, integer zoom where possible). Keep the "no shaking" property the old
  renderer had (characters at screen-pixel precision).
- **Season effects, water shimmer, night:** reproduced in the scene.
- **Input:** WASD/arrows 8-way, Shift run, Space jump, E interact, tap-to-walk
  with the existing path finding, drag joystick on touch, minimap tap. Same
  behaviour as now.
- **Other screens:** when a full-screen scene (`TG.scene`) or the 3D view (`TG.fp`)
  is open, the Phaser scene pauses (today the loop skips drawing).
- **Test hook:** the `.village canvas` selector still matches (Phaser adds a
  canvas). Expose `TG._village.phaser` for tests.
- **Visible engine:** the About/pitch page and README say "Built with Phaser 4".
  Add a short line in the Phaser boot, like the server's `Basar AI: on` line.

**Done when:** the village looks and plays the same as today on a phone and on
desktop, including riding, the race and a raider battle, and the existing smoke
and multiplayer tests pass.

### 2. Hands-on ger building

Replaces "pay 50 coins → ger appears". The ger lesson in the school stays as
optional theory and no longer gates building. Finishing it first makes grandpa's
hints shorter (one line).

**New NPC: Grandpa Craftsman (Мужаан өвөө)**, near the ger lane. He makes the
wooden parts and gives the hints. He has a "!"/"?" quest series like the other
townspeople.

**Materials** (kept in the player's bag, saved with progress):

| Part | Mongolian | How you get it |
|---|---|---|
| Felt ×2 | эсгий | The felt chain below |
| Walls ×5 | хана | Trade with grandpa |
| Door ×1 | хаалга | Trade with grandpa |
| Crown ×1 | тооно | Trade with grandpa |
| Posts ×2 | багана | Trade with grandpa |
| Roof poles ×9 | унь | Trade with grandpa (sold as one bundle) |
| Cover ×1 | бүрээс | Shop |
| Ropes ×3 | бүслүүр | Grandpa gives them free with the toono |

Prices are in wool and dairy foods (aaruul, öröm) or coins, so the existing
dairy loop feeds into ger building. Exact amounts are the builder's call. A new
player should be able to gather everything in about 5–8 minutes.

**Felt chain** (hands-on, each a short interaction in the village, not a quiz):

1. **Shear** a sheep in the pasture: hold and drag along its back. The child
   uses blunt shears and the sheep is calm and unharmed; say so.
2. **Beat the wool** with two sticks at the felt spot: a rhythm tap, like
   milking's rhythm.
3. **Lay and wet** the wool: tap to spread layers, then sprinkle water.
4. **Roll the felt**: a **shared task**. One player rolls with a steady rhythm
   while the other sprinkles water when the roll dries. Alone, Basar pulls the
   roll (as a horse would) and the child does the water.

Each finished roll gives one felt. Explain in one line each step: why wool, why
rolling. The "never punished" rule applies.

**Building on your plot** (in the Phaser village, on the plot you claim by laying
the floor; the ger grows on the map, seen live by friends):

1. Lay the floor (choose flat ground; the plot is flat, and grandpa remarks why).
2. Unfold each wall: drag to stretch the khana lattice open. ×5.
3. Tie the door: rotate it to face **south**, then tie it between two walls. If it
   faces another way, the sun arrow shows why south.
4. Lift the toono onto the two bagana: a **shared task**. Both players hold at
   the same time. Alone, grandpa holds the other post.
5. Push in the roof poles one by one. Placing them in alternating directions
   keeps the toono level. Bunching them on one side tilts it, and you fix it.
6. Wrap the felt (both felts).
7. Pull on the white cover.
8. Tighten three ropes (a pull-and-hold).
9. Done: the ger becomes your plot's ger as today (color pick, furniture,
   interior, friends can visit). Celebration, achievement, and the existing
   "Mom, Dad, let's build a mini ger together!" family card.

**Mistakes:** steps can be tried in a wrong order (for example felt before poles).
The ger sags or wobbles comically, grandpa laughs kindly and gives a hint, and
nothing is lost. Under-9s get the hint after one mistake. Older children get it after two.
No mistakes at all earns a special achievement, as grandma's visit does.

**Who owns progress (my call): the player.** The local save is the truth for
materials, build stage and which plot the player prefers (`V()`). The server lot
only mirrors it so others can see it.

- The server lot record gets a `stage` (0–9).
- Laying the floor claims the lot with the same checks as the old `ger-buy` (one
  per player, not taken).
- Each stage change is sent and broadcast. Bump `R.VERSION`.
- Saved rooms with old full gers load as stage 9.
- **Joining a room**, solo-to-online or a different room code: the client
  re-claims its preferred plot index, or the first free plot if that one is
  taken, and pushes its current stage.
- **No free plot:** the build carries on and shows locally only, with a toast
  explaining why.
- **Going offline:** the local save already holds everything, so solo play
  continues where it left off.
- The old one-message `ger-buy` and the 50-coin purchase are **removed**, not
  kept as a legacy path.

### 3. Two players on one screen

- A **"Play together"** button in the village HUD adds a second character
  chosen from the family members already set up for family lessons, or a quick
  new one. The second character is drawn with the same character code.
- **Player 2 is a companion, not a full second player (my call).** Player 2
  can:
  - walk, run and jump
  - do the felt-chain steps (shear, beat, wet), so a parent and child can split
    the work
  - be the second person in the two shared tasks

  Player 2 does **not** shop, trade, milk, talk to NPCs, ride, race or fight
  raiders. Those stay player 1's, on the single-player code they use today.
  Reason: everything else in `village.js` is built around one `live.me` and
  single-user modals, and making it all two-player would take days and push
  past the cut line.
- **While player 1 is busy:** when player 1 rides, races, is in a battle, or has
  a modal, the ger interior (`TG.scene`) or the 3D view (`TG.fp`) open, player 2
  is hidden or follows and waits. Player 2 comes back beside player 1 afterwards.
- **Controls:** keyboard WASD/Space/E for player 1, arrows/Enter/Shift-right
  for player 2. Enter is player 2's action key for their felt-chain steps and
  shared tasks only. Touch: the left half of the screen is player 1's joystick
  zone and the right half is player 2's. Tap-to-walk stays player 1 only.
- **Camera:** keeps both in view, zooming out to a limit. If they drift too far
  apart, a gentle tether stops player 2 at the edge.
- **Shared tasks** (toono lift, felt rolling) detect two local players. Online
  friends standing nearby can also be the second person (my call: a nice
  stretch, and the builder can drop it if time is short).
- **What online friends see:** only player 1 is sent online. Player 2 is local
  for now.
- **Rewards:** both share player 1's save. The parent dashboard logs "built a ger
  together with <name>", reusing how family lessons log who learned together.

### 4. Friday packaging

- README: the engine section, the new ger flow and the updated "Шүүгчдэд үзүүлэх
  дараалал" (judges' demo order), all in Mongolian.
- About/pitch page: "Built with Phaser 4", one sentence on why (scenes,
  camera, input and animation handled by an engine, so the team spends time on
  culture, not plumbing).
- A rehearsal pass: run the demo order on a phone over Wi-Fi with two
  devices, and fix anything that stutters.

## Order of work and the cut line

| Day | Work | Demo-ready at end of day? |
|---|---|---|
| Sat–Sun | Phaser foundation + village parity (riding, race, battles) | Yes: same game on an engine |
| Mon–Tue | Grandpa craftsman, felt chain, hands-on build, server stage sync | Yes |
| Wed | Two players on one screen + the two shared tasks | Yes |
| Thu | README/pitch, smoke-test additions, phone rehearsal, polish | Yes |
| Fri | Demo | |

If time runs short, cut in this order: online friends as the second person →
felt chain steps 2–3 merged into one → the wall-unfold drag becoming a tap. The
Phaser village, the hands-on build order, the toono lift and the solo fallbacks are
not cut.

## Testing

- Every existing smoke check passes, with selectors updated only if Phaser forces it.
- **Rewrite** (my call) the checks for behaviour this design replaces:
  - `tests/smoke.mjs` ~185–187: "ger locked until the lesson"; the lesson no
    longer gates building.
  - `tests/smoke.mjs` ~273–279: the buy modal and instant purchase.
  - `tests/multiplayer.mjs` ~78–83: one-message `ger-buy`, 50 coins.

  They become checks of the new flow: claiming by laying the floor, stage sync,
  and re-claiming on join.
- New smoke checks: the Phaser scene is running (`TG._village.phaser`); trade with
  grandpa; one felt-chain step; the ger stages advance; a wrong-order step shows a
  hint; "Play together" adds a second character; a shared task completes with the
  solo helper.
- Multiplayer test: a second player sees the first player's ger stage change.
- Check that Phaser runs under the CI's software WebGL. If Phaser 4 can't start
  there, the builder finds a way that keeps the test meaningful (for example a
  renderer flag only for tests) and says so.

## Left to the builder

- Tilemap vs baked terrain texture; Arcade physics vs the existing collision.
- Exact trade prices and gather times (target 5–8 minutes to a full set).
- The interaction details of each hands-on step, within the descriptions above.
- File split inside `js/village/` beyond the one new scene file.
- Small-screen layout of the two-player touch zones.
