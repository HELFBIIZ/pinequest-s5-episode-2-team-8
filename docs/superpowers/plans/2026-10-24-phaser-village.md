# Naadamy on Phaser Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Run the Нутаг village on Phaser 4. Replace "pay 50 coins for a ger" with hands-on gathering and step-by-step building. Add two players on one screen with shared tasks.

**Architecture:** Two new files handle drawing:
- `js/village/view.js` holds the Phaser game: terrain, camera, pointer input, season particles and night, plus a keyed sprite/text pool that shows the dynamic entities.
- `js/village/tasks.js` is one Phaser scene that runs every hands-on interaction from a small spec (drag, rhythm, spots, hold, turn, choose).

`village.js` keeps all game rules. Its old `draw()` becomes `model(t)`, which returns a frame description instead of painting a 2D context. Ger rules live in the shared `rules.js`, so the browser and `server.js` agree on them. Gathering, trading and building live in a new `js/village/gerwork.js`.

**Tech Stack:** Plain browser JavaScript (`TG.*` IIFE modules, no build step), Phaser 4.2.1 (vendored), Node `server.js` with its own WebSocket code, puppeteer-core smoke tests.

**Spec:** `docs/superpowers/specs/2026-10-24-phaser-village-design.md`

## Global Constraints

- No build step, no app npm dependencies, no TypeScript. Every new file is a `<script>` in `index.html` **and** in `sw.js` `FILES` (`tests/check-assets.mjs` enforces both for every `js/**/*.js`).
- Phaser is vendored at `js/vendor/phaser.min.js`, **version 4.2.1**, with its license at `js/vendor/PHASER-LICENSE.txt`. Never load it from a CDN: the smoke test fails on any request to an outside server.
- All art is drawn in code by `js/village/pixel.js` (`TG.pixel`/`PX`). No image files.
- Every child-facing string uses `L(mn, en)`, `Tx(mn, en)` or `T(mn, en)`: Mongolian first, then English. No screen may show `null`, `undefined` or `NaN`, and the smoke `check()` fails if one does.
- Mistakes are never punished: no coin, part or progress loss on a wrong step.
- Phones come first: the smoke viewport is 390×844. Touch must work for everything.
- Each time a cached file changes, bump `CACHE` in `sw.js`: `naadamy-v28` → `naadamy-v29` once, in Task 1. Later tasks only add file names.
- `R.VERSION` goes from 3 to 4 in Task 4 and nowhere else.
- Test commands (from the repo root):
  - once: `npm install --no-save --no-package-lock --silent puppeteer-core@22.15.0`
  - syntax: `for f in $(find js -name '*.js') sw.js server.js basar-ai.js; do node --check "$f" || exit 1; done`
  - `node tests/check-assets.mjs`
  - `node tests/ger-rules.mjs`
  - `node tests/smoke.mjs`
  - `node tests/multiplayer.mjs`
  - `node tests/basar-api.mjs`
- Commit after each task on branch `feature/phaser-village`. Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Rotating the phone or resizing the window mid-game:** the Phaser canvas refits and the camera stays on the player, with no stretched or blurry pixels. Pinned in Task 1, Step 1.
2. **Leaving and re-entering the village many times** (menu → village ×5): exactly one Phaser game exists, keys aren't doubled, and nothing keeps running after leaving. Pinned in Task 1, Step 1.
3. **An old save with `village.gerBuilt = true` and an old local lot** (no `stage`): it loads as a finished ger (stage 9), not reset to an empty plot. The same applies to an old server room file. Pinned in Task 3 (rules) and Task 5, Step 1.
4. **The first offline load after this update:** the service worker caches Phaser and every new file under the new cache name. Pinned by `tests/check-assets.mjs` in Tasks 1, 4 and 5.
5. **A stray second finger in solo play** (two touches at once, no player 2): the joystick keeps working, no player-2 controls appear, and the toono hold works with one finger because grandpa holds the other post. Pinned in Task 7, Step 1.

---

### Task 1: Phaser runs the village (terrain, camera, entities, input)

**Files:**
- Create: `js/vendor/phaser.min.js`, `js/vendor/PHASER-LICENSE.txt`, `js/village/view.js`
- Modify: `index.html` (scripts: `js/vendor/phaser.min.js` first; `js/village/view.js` before `js/village/village.js`), `sw.js` (cache name + files), `js/village/village.js` (`start`, `stop`, `resize`, `cam`, `frame`, `draw` → `model`, pointer handlers), `css/styles.css` (`.v-canvas` rules now apply to the Phaser canvas)
- Test: `tests/smoke.mjs`

**Interfaces:**
- Produces, in `view.js`:
  - `TG.villageView.mount(parent: HTMLElement, hooks: ViewHooks) -> View`
  - `TG.villageView.current() -> View | null`
  - `View = { game: Phaser.Game, scene: Phaser.Scene, destroy(): void, taskToCss(x, y) -> [cssX, cssY], fx() }`. `taskToCss` arrives in Task 4 and `fx` in Task 2.
  - `TG.villageView.count() -> number`: how many Phaser games are live. Phaser 4 has no global game registry, so `view.js` keeps a module-level count.
- `ViewHooks`:
  - `tick(dt: number): void`: the old `update(dt)`.
  - `model(t: number) -> Frame`.
  - `paused() -> boolean`: true while `TG.scene.active()` or `TG.fp.active()`.
  - `pointer(type: 'down'|'move'|'up', p: { id: number, x: number, y: number, wx: number, wy: number, touch: boolean }): void`. `x`/`y` are CSS px in the canvas. `wx`/`wy` are world **art px** (16 per tile).
  - `mini(): void`: called every 2nd rendered frame (the old `drawMini`).
- `Frame` (all positions in world art px):
  - `cam: { x, y }`: centre target.
  - `zoomOut?: number`: ≥1. Task 7 uses it.
  - `sprites: { id: string, img: HTMLCanvasElement, x, y, flip?: boolean, alpha?: number, depth: number }[]`: `x, y` = top-left.
  - `shadows: { id, x, y }[]`
  - `texts: { id, text, x, y, size: number /* art px */, color, alpha? }[]`
  - `tags: { id, name, level, mine: boolean, title?: string, bubble?: string, bubbleAlpha?: number, x, y }[]`
  - `marks: { id, kind: 'arrow'|'compass'|'raceArrow'|'poof'|'ring', x, y, ang?: number, q?: number, color?: string, label?: string }[]`
- Produces: `TG._village.phaser() -> View | null`, used by tests.

- [ ] **Step 1: Write the failing smoke checks**

Right after the existing `straight into Нутаг after creating the character` check in `tests/smoke.mjs`, add:

```js
step = 'phaser village';
const ph = await page.evaluate(() => { const v = TG._village.phaser && TG._village.phaser(); return v ? { ver: Phaser.VERSION, active: v.scene.sys.isActive(), cv: !!document.querySelector('.village canvas.v-canvas'), n: v.scene.children.list.length } : null; });
if (!ph || ph.ver !== '4.2.1' || !ph.active || !ph.cv || ph.n < 20) errors.push('village: Phaser 4.2.1 scene should be running and drawing the village, got ' + JSON.stringify(ph));
// Review Focus 1: rotate the phone
await page.setViewport({ width: 844, height: 390 }); await sleep(300);
if (!(await page.evaluate(() => { const c = document.querySelector('.village canvas.v-canvas').getBoundingClientRect(); return Math.abs(c.width - innerWidth) < 2 && Math.abs(c.height - innerHeight) < 2; }))) errors.push('village: canvas should refit after rotating');
await page.setViewport({ width: 390, height: 844 }); await sleep(300);
// Review Focus 2: leave and come back five times
for (let i = 0; i < 5; i++) { await page.evaluate(() => TG.go('learn')); await sleep(150); await page.evaluate(() => TG.go('village')); await sleep(250); }
if ((await page.evaluate(() => document.querySelectorAll('.village canvas.v-canvas').length + ':' + TG.villageView.count())) !== '1:1') errors.push('village: exactly one Phaser canvas and one game after re-entering');
```

Also walk the player: `TG._village.goTo({ x: 20, y: 13 })`. After 1.5 s, assert `TG._village.live().me.px` changed. This proves `tick` runs inside the Phaser loop.

- [ ] **Step 2: Run to verify it fails**

Run: `node tests/smoke.mjs`
Expected: FAIL with `village: Phaser 4.2.1 scene should be running…`.

- [ ] **Step 3: Vendor Phaser**

In the scratchpad, run `npm pack phaser@4.2.1`. Extract the tarball and copy `package/dist/phaser.min.js` to `js/vendor/phaser.min.js` and `package/LICENSE.md` to `js/vendor/PHASER-LICENSE.txt`. Grep the file and confirm it contains `4.2.1`, `addCanvas`, `ParticleEmitter` and `CanvasRenderer` (or Phaser 4's equivalent). Use whatever names exist there in Steps 4–5.

- [ ] **Step 4: Implement `TG.villageView.mount` in `js/village/view.js`**

Use one `Phaser.Game`:
- `type: Phaser.AUTO`, `parent`, `pixelArt: true`, `transparent: false`, `backgroundColor: '#76b947'`
- scale mode `RESIZE` filling `parent`
- canvas class `v-canvas` with the old `aria-label`
- `input.activePointers: 3`

It has one scene, `'village'`:
- **Terrain:** the canvas from `WD.renderStatic()` is added once as a texture and an image at depth 0.
- **Water shimmer:** a `Graphics` redrawn each frame from `WD.g` `'w'` tiles, using the same formula as the old `draw()` lines 1047–1051.
- **Camera:** bounds `0, 0, WD.W*16, WD.H*16`. Zoom is the old `k / dpr`, re-computed on resize with the same rule as old `resize()`. The camera centres on `frame.cam`, divided by `frame.zoomOut` when present. `roundPixels` stays false for sprites so characters don't shake.
- **Keyed pool:** `sprites`, `shadows`, `texts`, `tags` and `marks` are synced by `id`. Create on first sight, update every frame, and destroy anything not seen this frame. Canvas images become textures through a `WeakMap<HTMLCanvasElement, string>` key cache. `PX` already caches its canvases, so each canvas is added once.
- **Text:** uses `Phaser.GameObjects.Text` with the `Tiny5` font and a `#2b1e2e` stroke, matching the old `pixelText`.
- **Tags:** the gold level box plus the name box, as a `Container`, matching the old `labels()`.
- **Marks:** drawn into one per-frame `Graphics`.
- **Every frame:** `scene.update` calls `hooks.tick(dt)`. Unless `hooks.paused()`, it then renders `hooks.model(t)`.
- **Pointer events:** forwarded to `hooks.pointer` with `pointer.worldX/worldY`.
- **Cleanup:** `destroy()` removes the game with `game.destroy(true)` and decrements the count.

- [ ] **Step 5: Rewire `js/village/village.js`**

- **`start`:** builds no 2D canvas, buffer or `requestAnimationFrame`. It calls `live.view = TG.villageView.mount(root, { tick: update, model, paused, pointer, mini: drawMini })`. Insert the canvas as the first child of `root`, where `canvas` used to be: remove the `canvas` element and the `els`/`root` reference to it.
- **`stop`:** calls `live.view.destroy()`.
- **`draw(t)` becomes `model(t) -> Frame`:**
  - Every `sprite(img, wx, wy, flip)` call becomes a `sprites.push({ id, img, x: wx, y: wy, flip, depth })`. `depth` is the old sort key `y` in tiles.
  - Each `shadow` becomes `shadows.push`.
  - `pixelText` becomes `texts.push`. `labels()` becomes `tags.push`.
  - The arrows and poofs become `marks.push`.
  - The race and battle drawing (`battleDraw`, `battleOverlay`, race flags, rider labels) push into the same lists.
  - Season tint/particles, night tint and lantern glow are **not** in `Frame`: `view.js` draws them from `live.season` (exposed through `TG._village.live()`) and `TG.seasons.night()`.
  - Use stable ids: `'me'`, `'o:'+id`, `'pet:'+id`, `'dog'`, `'sheep:'+i`, `'lot:'+i`, `'obj:'+o.id`, `'race:'+i`, `'raider:'+i`, `'flag:'+i`, `'float:'+t0`.
- **Pointer handlers:** `onPointerDown/Move/Up/onTap` take `p` from `hooks.pointer` and use `p.wx/16, p.wy/16` instead of computing tiles from `cam()`.
- **Delete** `resize`, `cam`, `frame`, `blit`, the pixel buffers and the old 2D `pixelText`/`labels`. Keep `drawMini`.
- **Expose** `TG._village.phaser = () => live && live.view`.

- [ ] **Step 6: Wire the files**

In `index.html`, add `js/vendor/phaser.min.js` as the first script and `js/village/view.js` right before `js/village/village.js`. In `sw.js`, add both files, plus `./js/vendor/PHASER-LICENSE.txt`, and set `CACHE = 'naadamy-v29'`.

- [ ] **Step 7: Run everything to verify it passes**

Run: the syntax loop, `node tests/check-assets.mjs`, `node tests/smoke.mjs`, `node tests/multiplayer.mjs`
Expected:
- The asset check prints `Asset check passed`.
- The smoke test reports no errors. It covers the new checks plus every existing one, including archery, race, battle, travel and the ger interior.
- The multiplayer test prints only ✓ lines.

If Phaser can't make a WebGL context under the smoke test's swiftshader flags, `Phaser.AUTO` falls back to Canvas. Note in the commit which renderer CI used.

- [ ] **Step 8: Check it by eye**

Run `node server.js` and open `http://localhost:8000` at 390×844 and at desktop size. To compare side by side with the old look:
- `git worktree add ../naadamy-main main`
- `PORT=8001 node server.js` in that folder Walk, run, jump, ride a horse, start a race (`TG._village.race('daaga')` in the console) and a raider battle. Check that names, the Basar "!", Nomin's arrows and the night/season look all show. Fix any difference before committing.

- [ ] **Step 9: Commit**

```bash
git add js/vendor js/village/view.js js/village/village.js index.html sw.js css/styles.css tests/smoke.mjs
git commit -m "Village runs on Phaser 4: terrain, camera, sprites, text, input"
```

### Task 2: Season particles, night and lantern glow on the engine

**Files:**
- Modify: `js/village/view.js`
- Test: `tests/smoke.mjs`

**Interfaces:**
- Consumes: Task 1's `View`/`Frame`, `TG.seasons.current().id` (`'winter'|'spring'|'summer'|'autumn'`) and `TG.seasons.night() -> boolean`.
- Produces: `View.fx() -> { season: string, emitters: number, night: boolean }`, used by tests.

- [ ] **Step 1: Write the failing check**

Next to the existing `season explainer` check, add:

```js
const fx = await page.evaluate(() => TG._village.phaser().fx());
if (!fx || fx.season !== TG.seasons.current().id || fx.emitters < 1) errors.push('village: season particles should run on Phaser, got ' + JSON.stringify(fx));
```

- [ ] **Step 2: Run to verify it fails**

Run: `node tests/smoke.mjs`
Expected: FAIL with `season particles should run on Phaser`.

- [ ] **Step 3: Implement it in `view.js`**

- **Season particles:** one Phaser `ParticleEmitter` per season, using the old `seasonFx` look: winter flakes, autumn leaves, spring petals, summer butterflies. Each uses tiny canvas textures made with `PX.mk`. Rebuild the emitter when `live.season` changes.
- **Tint:** a camera-fixed `Rectangle` with the old tint values: winter `rgba(235,242,250,.16)`, autumn multiply `#ffd59a`, spring `rgba(255,200,230,.06)`.
- **Night:** a `Rectangle` with `rgba(18,22,70,.38)`, plus lantern glows. These are stepped ellipses in a `Graphics` with `BlendModes.ADD` at each `WD.objects` lantern, using the old radii 26/20, 15/12 and 6/5 and alphas .10, .14 and .2.
- `fx()` reports the current state.

- [ ] **Step 4: Run to verify it passes**

Run: `node tests/smoke.mjs`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add js/village/view.js tests/smoke.mjs
git commit -m "Seasons and night drawn with Phaser particles and blend modes"
```

### Task 3: Ger rules shared by the browser and the server

**Files:**
- Modify: `js/village/rules.js`
- Create: `tests/ger-rules.mjs`
- Modify: `.github/workflows/ci.yml` (run `node tests/ger-rules.mjs` after the asset check)

**Interfaces:**
- Produces, all on the `rules.js` export:
  - `GER_STEPS = ['shal','khana','khaalga','toono','uni','esgii','buurees','buslvvr','tulga']`. `stage` is how many are done, and `GER_DONE = 9`.
  - `GER_NEEDS = { shal:{}, khana:{khana:5}, khaalga:{khaalga:1}, toono:{toono:1,bagana:2}, uni:{uni:9}, esgii:{esgii:2}, buurees:{buurees:1}, buslvvr:{buslvvr:3}, tulga:{} }`
  - `gerTry(stage: number, step: string, parts: object) -> { ok: true } | { ok: false, why: 'done' } | { ok: false, why: 'order', next: string } | { ok: false, why: 'parts', missing: object }`. It checks `done`, then `order`, then `parts`.
  - `gerUse(parts: object, step: string) -> object`: a new parts object with the step's needs subtracted.
  - `TRADES = [{ id:'khana', gives:{khana:5}, goods:{wool:2,aaruul:2}, coins:30 }, { id:'khaalga', gives:{khaalga:1}, goods:{urum:1}, coins:10 }, { id:'toono', gives:{toono:1,bagana:2,buslvvr:3}, goods:{wool:2,aaruul:1}, coins:25 }, { id:'uni', gives:{uni:9}, goods:{wool:2}, coins:15 }]`
  - `COVER_PRICE = 20` (the shop sells `buurees`)
  - `tradeCost(id: string, pay: 'goods'|'coins') -> object`, for example `{wool:2,aaruul:2}` or `{coins:30}`
  - `SHEAR_WOOL = 2`, `SHEAR_REGROW_MS = 45000`, `FELT_WOOL = 4`
  - `lotStage(lot) -> number`: `0` for `null`, `lot.stage` when it's an integer 1–9, and otherwise `9` (old lots).
  - `unisTilt(sides: number[]) -> boolean`: `sides` lists each placed pole's side (0 = east, 1 = south, 2 = west, 3 = north). Returns true when the last three placed poles are all on the same side.
- `GER_PRICE` and `GER_LEVEL` stay for now. Task 5 removes them together with their last users.

- [ ] **Step 1: Write the failing test `tests/ger-rules.mjs`**

```js
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const R = createRequire(import.meta.url)('../js/village/rules.js');
assert.equal(R.GER_STEPS.length, 9); assert.equal(R.GER_DONE, 9);
assert.deepEqual(R.gerTry(0, 'shal', {}), { ok: true });
assert.deepEqual(R.gerTry(0, 'esgii', { esgii: 2 }), { ok: false, why: 'order', next: 'shal' });
assert.deepEqual(R.gerTry(1, 'khana', { khana: 3 }), { ok: false, why: 'parts', missing: { khana: 2 } });
assert.deepEqual(R.gerTry(9, 'tulga', {}), { ok: false, why: 'done' });
assert.deepEqual(R.gerUse({ toono: 1, bagana: 2, uni: 9 }, 'toono'), { toono: 0, bagana: 0, uni: 9 });
assert.deepEqual(R.tradeCost('khana', 'goods'), { wool: 2, aaruul: 2 });
assert.deepEqual(R.tradeCost('uni', 'coins'), { coins: 15 });
assert.equal(R.lotStage(null), 0); assert.equal(R.lotStage({ by: 'u1' }), 9); assert.equal(R.lotStage({ by: 'u1', stage: 4 }), 4); assert.equal(R.lotStage({ by: 'u1', stage: 12 }), 9);
assert.equal(R.unisTilt([0, 2, 0]), false); assert.equal(R.unisTilt([1, 1, 1]), true); assert.equal(R.unisTilt([1, 1]), false);
console.log('Ger rules: all checks passed.');
```

- [ ] **Step 2: Run to verify it fails**

Run: `node tests/ger-rules.mjs`
Expected: FAIL with `AssertionError` (`GER_STEPS` is undefined).

- [ ] **Step 3: Implement the exports above in `rules.js`**

`VERSION` stays 3 here.

- [ ] **Step 4: Run to verify it passes**

Run: `node tests/ger-rules.mjs` and the syntax loop.
Expected: `Ger rules: all checks passed.`

- [ ] **Step 5: Commit**

```bash
git add js/village/rules.js tests/ger-rules.mjs .github/workflows/ci.yml
git commit -m "Shared ger rules: steps, parts, trades, felt and old-lot handling"
```

### Task 4: Hands-on task scene (the engine's interaction toolkit)

**Files:**
- Create: `js/village/tasks.js` (add it to `index.html` after `view.js` and to `sw.js`)
- Modify: `css/styles.css` (only if the task title or hint uses DOM; prefer Phaser text)
- Test: `tests/smoke.mjs`

**Interfaces:**
- Consumes: `TG.villageView.current()` (Task 1).
- Produces:
  - `TG.tasks.run(spec: TaskSpec) -> Promise<{ done: boolean, mistakes: number, together: boolean, pick?: string }>`. It launches scene `'task'` in the village game over a dimmed village and resolves when the task finishes or is cancelled.
  - `TG.tasks.active() -> { kind: string, progress: number, n: number } | null`
  - Test helpers:
    - `TG.tasks.finish()` completes the active task as a success.
    - `TG.tasks.cancel()` cancels it.
    - `TG.tasks.pick(id)` resolves an active `choose` task with that `pick`.
  - `View.taskToCss(x, y) -> [cssX, cssY]`: maps task-stage coordinates (160×120) to CSS px, so tests can aim real pointer events.
  - `TG.tasks.say(text: {mn,en}, who: 'grandpa'|'basar') -> void`: shows a speech line in the task scene. It's used for hints.
- `TaskSpec` common fields:
  - `kind`
  - `title: {mn,en}`, `hint: {mn,en}`
  - `art(ctx: CanvasRenderingContext2D, t: number, st: object) -> void`: draws the 160×120 backdrop into a Phaser `CanvasTexture` every frame. `st` is the kind's live state.
  - `two?: 'need'|'help'`: `'help'` means a second player is optional and a helper character covers the second role when `TG.tasks.players() === 1`.
- `TaskSpec` per kind:
  - `drag`: `{ path: [[x0,y0],[x1,y1]], n }`. Drag the handle from the start to the end `n` times.
  - `rhythm`: `{ n, speed, win, water?: boolean }`. Tap when the marker is in the zone, `n` hits. A miss only resets the marker. With `water: true`, a "dry" icon appears every ~3 s and the second role taps it. Solo, the helper (Basar) pulls and the child does the water.
  - `spots`: `{ spots: [[x,y]...], side?: number[], rule?: (sides: number[]) => boolean }`. Tap each spot once. If `rule(sides)` is true after a tap, the art wobbles and `mistakes++`. The player fixes it by tapping a spot on another side.
  - `hold`: `{ ms, holders: 1|2, n?: number }`. Hold for `ms`, `n` times. With `holders: 2`, two pointers or both players' action keys are needed. Solo, the helper holds one.
  - `turn`: `{ start: number, target: number, tol: number }`. Drag in a circle to rotate. Release within `tol` radians of `target` to succeed.
  - `choose`: `{ options: [{ id, icon: HTMLCanvasElement, label: {mn,en} }] }`. Tap a part in a tray, then resolve with `pick`.
- Produces: `TG.tasks.players() -> 1|2` (reads `TG._village.live().p2`; Task 7 sets it).

- [ ] **Step 1: Write the failing check**

After the `village minimap` check, add:

```js
step = 'hands-on task scene';
const tr = page.evaluate(() => TG.tasks.run({ kind: 'drag', title: { mn: 'Тест', en: 'Test' }, hint: { mn: 'Чир', en: 'Drag' }, path: [[20, 60], [140, 60]], n: 2, art: () => {} }));
await sleep(300);
const act = await page.evaluate(() => TG.tasks.active());
if (!act || act.kind !== 'drag' || act.n !== 2) errors.push('task scene: drag task should be active, got ' + JSON.stringify(act));
// a real drag with the mouse across the handle path, twice
for (let i = 0; i < 2; i++) { const [a, b] = await page.evaluate(() => [TG.villageView.current().taskToCss(20, 60), TG.villageView.current().taskToCss(140, 60)]); await page.mouse.move(a[0], a[1]); await page.mouse.down(); await page.mouse.move(b[0], b[1], { steps: 12 }); await page.mouse.up(); await sleep(150); }
const res = await tr;
if (!res || !res.done) errors.push('task scene: two real drags should finish the task');
```

- [ ] **Step 2: Run to verify it fails**

Run: `node tests/smoke.mjs`
Expected: FAIL with `TG.tasks is undefined` (reported through `pageerror`).

- [ ] **Step 3: Implement `js/village/tasks.js`**

- **Scene:** one Phaser `Scene` class `'task'`, added to the village game with `game.scene.add('task', TaskScene, true, spec)`.
- **While a task runs:** the village scene keeps ticking but ignores pointers, and the village keyboard ignores E/Space.
- **Layout:** the stage is 160×120, scaled up to fit by an integer factor and centred, with the title, hint and progress pips in Phaser text.
- **Look:** use Phaser tweens for all motion: the wobble on mistakes, the pop on progress and the finish burst.
- **Sounds:** use `TG.sfx` (`tap`, `good`, `win`).
- **Close button:** an ✕ cancels the task.
- **One file:** keep each kind's input handling in a small handler object keyed by kind.

- [ ] **Step 4: Run to verify it passes**

Run: `node tests/smoke.mjs`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add js/village/tasks.js index.html sw.js tests/smoke.mjs
git commit -m "Hands-on task scene on Phaser: drag, rhythm, spots, hold, turn, choose"
```

### Task 5: Building a ger by hand, step by step, synced online

**Files:**
- Create: `js/village/gerwork.js` (add it to `index.html` before `village.js` and to `sw.js`)
- Modify: `js/village/rules.js` (`VERSION = 4`), `server.js` (`ger-buy` → `ger-claim` + `ger-stage`), `js/village/village.js` (`lotAction`, `buyGer` removed, `onLot`, `handle`, `model`'s lot sprites, `V()` defaults and migration, the `welcome` handling), `js/village/pixel.js` (`gerStage`), `js/achievements.js` (`ger_built` reads the stage, new `ger_perfect`)
- Test: `tests/smoke.mjs` (rewrite lines ~185–187 and ~273–279), `tests/multiplayer.mjs` (rewrite lines ~78–83)

**Interfaces:**
- Consumes: `R.GER_STEPS`, `R.gerTry`, `R.gerUse`, `R.lotStage`, `R.unisTilt`, `R.GER_DONE` (Task 3) and `TG.tasks.run` (Task 4).
- Produces:
  - **Save shape:** `V().ger = { stage: 0, lot: -1, parts: {}, wool: 0, fluff: 0, mats: 0, mistakes: 0, perfect: false }`.
  - **Migration in `V()`:** if `v.gerBuilt` is set and `v.ger` is missing, set `stage = 9`, `lot = index of my local lot`, `perfect = false`.
  - `TG.gerwork.init(api: { V, live: () => live, net, reward, quest, factCard, lotsArr, onLot, save: () => S.save() })`, called from `start`.
  - `TG.gerwork.build(i: number) -> Promise<void>`: the whole build loop on lot `i`.
  - `TG.gerwork.stepSpec(step: string) -> TaskSpec`: the hands-on spec for each build step. Task 6 reuses it for test hooks.
  - `PX.gerStage(stage: number, roof: string, door: string) -> HTMLCanvasElement`: 48×50 like `gerSprite`. Stage 9 returns `gerSprite(roof, door)`.
  - `TG._village.build = (i) => TG.gerwork.build(i)`, used by tests.
- **Protocol** (`R.VERSION` = 4):
  - Client → server:
    - `{ t:'ger-claim', i, roof, door, stage }`: `stage` is an integer 1–9. The server checks the same things as the old `ger-buy` (lot free, one per player), stores `{ by, n, roof, door, furn: [], stage }` and broadcasts `{ t:'lot', act:'claim', i, lot, by }`.
    - `{ t:'ger-stage', stage }`: sets the sender's lot `stage` (clamped 1–9) and broadcasts `{ t:'lot', act:'stage', i, lot, by }`.
  - The server deletes `ger-buy`. When a room file loads, lots keep whatever they had, and readers use `R.lotStage`.
  - **Rejoining:** on `welcome`, if `V().ger.stage >= 1` and the room has no lot `by === me`, the client sends `ger-claim` with `i = V().ger.lot` if that lot is free, else the first free index, together with its current `stage`. If none is free, it shows the toast `L('Энэ өрөөнд сул газар алга. Гэр чинь зөвхөн чамд харагдана.', 'No free plot in this room. Your ger shows only for you.')` and keeps the local lot.

**Build loop** (`build(i)`):
- If `V().ger.stage === 0`, the plot must be free. Otherwise it must be the player's own plot, and if `stage === 9`, the old `enterGer(i)` runs.
- Each round runs `TG.tasks.run({ kind: 'choose', options })`. The options are every step whose parts the player holds, plus `shal` and `tulga`, so the child decides what comes next.
- Then `R.gerTry`:
  - `order`: grandpa's hint through `TG.tasks.say` with a sag wobble, then `mistakes++`. The hint names the right step after 1 mistake for under-9s (`S.active().age < 9`) and after 2 for everyone else. After `TG.learn.done('ger')`, the hint is the one-line version.
  - `parts`: a toast naming what's missing and who has it.
  - `ok`: run `stepSpec(step)`. On `done`, apply `gerUse`, `stage++`, send `ger-claim` (first step) or `ger-stage`, save, and redraw the lot through `model` using `PX.gerStage`.
- At stage 9: `v.gerBuilt = true`, `perfect = mistakes === 0`, `reward(0, 30)`, `TG.confetti(70)`, then the old "Your new ger!" fact card and the family card from lesson `ger`.
- Then the existing roof and door colour picker (the old swatches) runs once and sends `ger-style`.

**Step specs** (art: `TG.scenes.ger(ctx, stage, t)` from `js/learn/scenes.js`, drawn at the current stage, since its stages 0–9 match `GER_STEPS`):
- `shal` → `spots`, 4 floor boards
- `khana` → `drag`, n 5
- `khaalga` → `turn`, start 0, target south = π/2 on the stage, tol 0.35. The hint on a wrong angle explains sun and the cold north wind.
- `toono` → `hold`, holders 2, `two: 'help'`, ms 1500. Solo, grandpa holds the other post.
- `uni` → `spots`, 9 around the toono with `side` per spot and `rule: R.unisTilt`
- `esgii` → `drag`, n 2
- `buurees` → `drag`, n 1
- `buslvvr` → `hold`, holders 1, ms 900, n 3
- `tulga` → `spots`, 1 (set the stove, first tea)

Each spec has its own Mongolian/English title and hint. Take the wording from lesson `ger`'s step texts in `js/learn/lessons.js` lines 15–25.

**The lesson no longer gates building.** Delete the `buyGer` "learn first" branch and the coin purchase.

- [ ] **Step 1: Rewrite the failing tests**

In `tests/smoke.mjs`, replace the `ger locked before the lesson` block (~185–187) with:

```js
step = 'ger is built by hand, not bought';
await page.evaluate(() => { const v = TG.store.active().village; v.ger.parts = { khana: 5, khaalga: 1, toono: 1, bagana: 2, uni: 9, esgii: 2, buurees: 1, buslvvr: 3 }; v.coins = 40; });
const b = page.evaluate(() => TG._village.build(0));
await sleep(300);
if ((await page.evaluate(() => TG.tasks.active() && TG.tasks.active().kind)) !== 'choose') errors.push('ger: building should start by choosing what comes first');
// wrong first step: felt before the floor → a hint, nothing lost
await page.evaluate(() => TG.tasks.pick('esgii')); await sleep(400);
if (!(await page.evaluate(() => TG.store.active().village.ger.mistakes === 1 && TG.store.active().village.ger.parts.esgii === 2))) errors.push('ger: a wrong step should count a mistake and keep the parts');
for (const s of ['shal', 'khana', 'khaalga', 'toono', 'uni', 'esgii', 'buurees', 'buslvvr', 'tulga']) { await page.evaluate((x) => TG.tasks.pick(x), s); await sleep(250); await page.evaluate(() => TG.tasks.finish()); await sleep(250); }
await b;
const g = await page.evaluate(() => ({ st: TG.store.active().village.ger.stage, coins: TG.store.active().village.coins, built: TG.store.active().village.gerBuilt, lot: TG._village.lots()[0] && TG.vrules.lotStage(TG._village.lots()[0]) }));
if (g.st !== 9 || !g.built || g.lot !== 9 || g.coins !== 40) errors.push('ger: nine hands-on steps should finish the ger without spending coins, got ' + JSON.stringify(g));
await page.evaluate(() => document.querySelectorAll('.modal-x').forEach((x) => x.click())); await sleep(250);
```

This needs `TG.tasks.pick(id)`, which resolves an active `choose` task with that `pick`. Add it to Task 4's helpers.

In the old `ger unlocked after the lesson` / `inside my ger` block (~273–279):
- Delete the `ger builder unlocked` check and the buy click. The ger is already built above.
- Keep the furniture and `enterGer(0)` interior checks as they are.

**Review Focus 3.** Right before `TG.go('village')` in that block, add:

```js
await page.evaluate(() => { const v = TG.store.active().village; delete v.ger; v.gerBuilt = true; TG.store.save(); });
await page.evaluate(() => TG.go('learn')); await page.evaluate(() => TG.go('village')); await sleep(500);
if ((await page.evaluate(() => TG.store.active().village.ger.stage)) !== 9) errors.push('old save: a ger built before this update should load finished');
```

In `tests/multiplayer.mjs` (~78–83), replace the `buyLot` lines with:

```js
await a.evaluate(() => { const v = TG.store.active().village; v.ger.parts = { khana: 5, khaalga: 1, toono: 1, bagana: 2, uni: 9, esgii: 2, buurees: 1, buslvvr: 3 }; });
const ab = a.evaluate(() => TG._village.build(2));
for (const s of ['shal', 'khana', 'khaalga']) { await a.evaluate((x) => TG.tasks.pick(x), s); await sleep(200); await a.evaluate(() => TG.tasks.finish()); await sleep(200); }
await until(() => b.evaluate(() => { const l = TG._village.lots()[2]; return l && l.n === 'Бат' && TG.vrules.lotStage(l) === 3; }), 'B sees A\'s ger at stage 3');
await a.evaluate(() => TG.tasks.cancel());
if ((await a.evaluate(() => TG.store.active().village.coins)) !== 600) throw new Error('building a ger should not cost coins');
await b.evaluate(() => { TG.store.active().village.ger.stage = 1; TG.store.active().village.ger.lot = 2; });
await b.evaluate(() => TG._village.reconnect());
await until(() => b.evaluate(() => TG._village.lots().some((l, i) => i !== 2 && l && l.n !== 'Бат' && TG.vrules.lotStage(l) === 1)), 'B re-claims a different free plot when its old one is taken');
if ((await b.evaluate(() => TG._village.lots()[2].n)) !== 'Бат') throw new Error('a taken lot was overwritten');
ok('building a ger syncs stage by stage; taken plots are protected; progress follows the player into a room');
```

This needs `TG._village.reconnect()`, which closes and reopens `net`. Add it to the `TG._village` exports. Check the 600 against the coins line earlier in that test (it starts players at 600). If that value differs, use the test's own starting value.

- [ ] **Step 2: Run to verify they fail**

Run: `node tests/smoke.mjs`, then `node tests/multiplayer.mjs`
Expected: FAIL. Smoke reports `TG._village.build is not a function`, and multiplayer times out with `B sees A's ger at stage 3`.

- [ ] **Step 3: Implement `PX.gerStage` in `pixel.js`**

The look of stages 1–8 on a 48×50 canvas should match `gerSprite`'s palette and outline:
1. floor
2. lattice ring
3. door
4. toono on two posts
5. poles
6. felt
7. white cover
8. ropes

Cache each stage per roof/door, as `gerSprite` does.

- [ ] **Step 4: Implement the server and the rules version**

Set `R.VERSION = 4`. Remove `GER_PRICE` and `GER_LEVEL` from `rules.js`, and add `assert.equal(R.GER_PRICE, undefined);` to `tests/ger-rules.mjs`. Replace `ger-buy` in `server.js` with `ger-claim` and `ger-stage` as specified.

- [ ] **Step 5: Implement `js/village/gerwork.js` and rewire `village.js`**

- `lotAction(i)`: free lot and `ger.stage === 0` → `build(i)`. My lot with stage < 9 → `build(i)`. My finished lot → `enterGer(i)`. Someone else's lot → visit as now.
- `labelFor` `'lot'`:
  - `L('Гэр барих', 'Build a ger')` for an empty plot or my unfinished one
  - `L('Миний гэр', 'My ger')`
  - `L('Зочлох', 'Visit')`
- `model()` draws lots with `PX.gerStage(R.lotStage(l), …)`.
- `onLot` handles `act: 'claim'|'stage'`. The toast `🏠 <name> гэр барьж эхэллээ!` / `started building a ger!` shows only for others' claims.
- In `achievements.js`, add `A('ger_perfect', 'nutag', 'home', 'Алдаагүй барьсан', 'Built without a slip', 'Нэг ч алдаагүйгээр гэрээ барих', 'Build your ger without a single mistake', (c) => !!(c.v.ger && c.v.ger.perfect))`.

- [ ] **Step 6: Run everything to verify it passes**

Run: the syntax loop, `node tests/check-assets.mjs`, `node tests/ger-rules.mjs`, `node tests/smoke.mjs`, `node tests/multiplayer.mjs`
Expected: all pass, with no errors and only ✓ lines.

- [ ] **Step 7: Check it by eye**

Run `node server.js`. Build a ger on a phone-sized window:
- Get the order wrong once and see grandpa's hint.
- Do the door at the wrong angle and see the sun hint.
- Bunch the poles and see the toono tilt, then fix it.
- Finish and see the confetti and the family card.

Open a second browser profile in the same room and watch the ger grow.

- [ ] **Step 8: Commit**

```bash
git add js/village/gerwork.js js/village/village.js js/village/pixel.js js/village/rules.js js/achievements.js server.js index.html sw.js tests/smoke.mjs tests/multiplayer.mjs
git commit -m "Build your ger by hand, step by step; plots sync stage by stage"
```

### Task 6: Gathering: shear, felt, and Grandpa Craftsman's trades

**Files:**
- Modify: `js/village/world.js` (two objects), `js/village/gerwork.js`, `js/village/village.js` (`contextAction`, `labelFor`, `doAction`, `NPCS`, shop list for `buurees`, sheep model sprite when shorn, minimap colours `felt`/`craftsman`), `js/village/pixel.js` (shorn sheep frames via `PX.animal('sheepShorn', f)`, `PX.icon` keys `part:<id>` for the eight parts plus `part:wool`, used by the `choose` tray and the bag)
- Test: `tests/smoke.mjs`

**Interfaces:**
- Consumes: `R.TRADES`, `R.tradeCost`, `R.COVER_PRICE`, `R.SHEAR_WOOL`, `R.SHEAR_REGROW_MS`, `R.FELT_WOOL`; `TG.tasks.run`; `V().ger` (Task 5).
- Produces:
  - **World objects:**
    - `{ id:'felt', kind:'felt', x:20, y:21, w:2, h:1, door:{x:20,y:22} }`
    - `{ id:'craftsman', kind:'npcq', x:15, y:29, w:1, h:1, door:{x:15,y:30} }`

    Before adding them, check with `WD.blocked` that each tile and door is open grass and not on a path. If not, move to the nearest open tile in the same area: the felt spot west of the sheep pasture, the craftsman by the ger lane.
  - **`NPCS.craftsman`:** name `Tx('Мужаан өвөө', 'Grandpa Craftsman')`, an elderly look (brown deel, `hat: 'mongol'`), and a 3-quest series in the same shape as the other `NPCS` entries:
    1. shear a sheep
    2. roll a felt
    3. finish your ger

    Talking to him opens the existing NPC talk with a **trade list**. Each `R.TRADES` row has two buttons, "pay with goods" and "pay with coins", each disabled with a reason when the player can't afford it. A short line explains each part.
  - **Felt chain** (all through `TG.tasks.run`):
    - **Shear:** a sheep context action `'shear'` when `Date.now() - (V().shorn?.[i] || 0) > R.SHEAR_REGROW_MS`, otherwise the old `'sheep'` pet. It runs `drag` with n 3 along the back. The hint says the shears are blunt-ended and the sheep is calm and unharmed. On success: `wool += R.SHEAR_WOOL` and the sheep is drawn shorn until it regrows.
    - **Felt spot** context action `'felt'`, with the label and action chosen by state:
      1. `mats >= 1` → **roll**: `rhythm` with `water: true`, `two: 'help'`, n 10. On success, `mats--` and `parts.esgii++`.
      2. else `fluff >= R.FELT_WOOL` → **lay and wet**: one `spots` task with 7 spots, 4 wool tufts first and then 3 water drops (the art switches after the 4th). On success, `fluff -= R.FELT_WOOL` and `mats++`.
      3. else `wool >= 1` → **beat**: `rhythm` n 8. On success, `fluff += wool` and `wool = 0`.
      4. else a toast: `L('Эхлээд хонио хяргаж ноос ав.', 'Shear a sheep first to get wool.')`.
    - The shop gets item `buurees` at `R.COVER_PRICE` coins, which adds `parts.buurees`.
    - The bag shows wool, fluff, mats and every part with `PX.icon('part:<id>')`.
  - **Test hooks:** `TG._village.felt()` runs the felt-spot action, and `TG._village.shear(i)` shears sheep `i`.

- [ ] **Step 1: Write the failing checks**

After the ger block from Task 5, add:

```js
step = 'gathering for a ger';
await page.evaluate(() => { const v = TG.store.active().village; v.ger = { stage: 0, lot: -1, parts: {}, wool: 0, fluff: 0, mats: 0, mistakes: 0, perfect: false }; v.shorn = {}; v.produce.aaruul = 5; v.coins = 200; });
for (let i = 0; i < 2; i++) { const p = page.evaluate((k) => TG._village.shear(k), i); await sleep(250); await page.evaluate(() => TG.tasks.finish()); await p; }
if ((await page.evaluate(() => TG.store.active().village.ger.wool)) !== 4) errors.push('gathering: two shorn sheep should give 4 wool');
if ((await page.evaluate(() => TG._village.shearable(0))) !== false) errors.push('gathering: a shorn sheep should not be shearable again right away');
for (let i = 0; i < 3; i++) { const p = page.evaluate(() => TG._village.felt()); await sleep(250); await page.evaluate(() => TG.tasks.finish()); await p; } // beat → lay & wet → roll
const fe = await page.evaluate(() => TG.store.active().village.ger);
if (fe.parts.esgii !== 1 || fe.fluff !== 0 || fe.mats !== 0) errors.push('gathering: beat → lay & wet → roll should make one felt, got ' + JSON.stringify(fe));
await page.evaluate(() => TG._village.npc('craftsman')); await sleep(300);
await check('grandpa craftsman trades', '.npc-talk .v-trade');
await page.evaluate(() => [...document.querySelectorAll('.npc-talk .v-trade [data-trade="uni"][data-pay="coins"]')][0].click()); await sleep(200);
const tr2 = await page.evaluate(() => ({ uni: TG.store.active().village.ger.parts.uni, coins: TG.store.active().village.coins }));
if (tr2.uni !== 9 || tr2.coins !== 185) errors.push('grandpa: buying roof poles for 15 coins should give 9 poles, got ' + JSON.stringify(tr2));
await page.evaluate(() => document.querySelectorAll('.modal-x').forEach((x) => x.click())); await sleep(200);
```

This needs `TG._village.shearable(i) -> boolean` as a test hook. Trade buttons render inside `.v-trade` with `data-trade` and `data-pay` attributes.

- [ ] **Step 2: Run to verify it fails**

Run: `node tests/smoke.mjs`
Expected: FAIL with `TG._village.shear is not a function`.

- [ ] **Step 3: Implement the interfaces above**

- [ ] **Step 4: Run everything to verify it passes**

Run: the syntax loop, `node tests/check-assets.mjs`, `node tests/smoke.mjs`, `node tests/multiplayer.mjs`
Expected: all pass.

- [ ] **Step 5: Time the loop by eye**

Run `node server.js`. With a fresh child (40 coins, nothing in the bag), gather everything for a ger: milk and make aaruul for trades, shear, make 2 felts, trade, and buy the cover. Target: 5–8 minutes. If it's outside that range, adjust only `R.TRADES` amounts, `R.COVER_PRICE` and `R.SHEAR_REGROW_MS`, and update `tests/ger-rules.mjs` to match.

- [ ] **Step 6: Commit**

```bash
git add js/village js/achievements.js tests/smoke.mjs tests/ger-rules.mjs
git commit -m "Gather for your ger: shear sheep, make felt, trade with Grandpa Craftsman"
```

### Task 7: Two players on one screen and the shared tasks

**Files:**
- Modify: `js/village/village.js` (`live.p2`, `update`, `onKey`/`onKeyUp`, pointer stick split, `model` adds p2 sprite and tag plus `zoomOut`, HUD button `els.together`, hide p2 while player 1 is busy), `js/village/tasks.js` (second-player input for `two`), `js/village/gerwork.js` (p2 can run shear/beat/lay; logs together), `css/styles.css` (`.v-together`, second stick `.v-stick.p2`)
- Test: `tests/smoke.mjs`

**Interfaces:**
- Consumes: `TG.tasks.players()` (Task 4), `Frame.zoomOut` (Task 1), `S.state.family` (`[{ id, name: {mn,en}, emoji }]`), `S.logActivity({ kind, id })`.
- Produces:
  - **`live.p2`:** `null | { name: string, look: object, px, py, vx, vy, dir, face, moving, running, jt, keys: Set }`.
  - **`TG._village.together(familyId: string | null) -> void`:** adds player 2 (a family member's name, or `L('Найз', 'Friend')` for `null`), with a look derived from player 1's but a different deel colour. Called again, it removes player 2.
  - **Keys:**
    - When `live.p2` is set, arrows/Enter/right-Shift belong to player 2. WASD/E/Space/left-Shift stay player 1's.
    - With no player 2, arrows still move player 1, as today.
    - Player 2's Enter runs `TG.gerwork.p2Action()`: shear, beat, or lay and wet at the felt spot, or nothing.
  - **Touch:**
    - With `live.p2` set, a drag starting on the right half drives player 2's stick, and the left half drives player 1's. Tap-to-walk is player 1 only.
    - Without player 2, a second simultaneous pointer is ignored.
  - **Camera:** `Frame.cam` is the midpoint. `zoomOut = clamp(dist / 9, 1, 1.6)`. Player 2 can't move further than 14 tiles from player 1.
  - **Shared tasks:** in `tasks.js`, with 2 players, the `hold` task with `holders: 2` needs player 1 (pointer A, or E held) **and** player 2 (pointer B, or Enter held). The `rhythm` task with `water: true` gives player 2 the water taps (pointer on the right half, or Enter). The result includes `together: true`.
  - **Log:** when a ger build or felt roll finishes with `together`, `S.logActivity({ kind: 'together', id: 'ger|family|' + p2.name })`. This matches the existing dashboard parsing in `js/app.js:243`.
  - **While player 1 is busy:** when player 1 rides, races or fights, or has a modal (`.modal-back`), `TG.scene` or `TG.fp` open, player 2 is not drawn and does not move. Afterwards, player 2 reappears at `besideMe()`.

- [ ] **Step 1: Write the failing checks**

```js
step = 'play together on one screen';
await page.evaluate(() => TG._village.together('f1')); await sleep(300);
const p2 = await page.evaluate(() => { const l = TG._village.live(); return l.p2 && { name: l.p2.name, x: l.p2.px }; });
if (!p2 || !/Ээж|Mom/.test(p2.name)) errors.push('together: Mom should join as player 2');
await page.keyboard.down('ArrowRight'); await sleep(500); await page.keyboard.up('ArrowRight');
const moved = await page.evaluate((x0) => { const l = TG._village.live(); return [l.p2.px > x0 + 0.5, Math.abs(l.me.vx) < 0.01]; }, p2.x);
if (!moved[0] || !moved[1]) errors.push('together: arrow keys should move player 2 only');
// shared toono lift: both players hold
await page.evaluate(() => { const v = TG.store.active().village; v.ger.parts = { toono: 1, bagana: 2 }; });
const hr = page.evaluate(() => TG.tasks.run(TG.gerwork.stepSpec('toono'))); await sleep(300);
await page.keyboard.down('KeyE'); await sleep(400);
if ((await page.evaluate(() => TG.tasks.active().progress)) > 0) errors.push('together: the toono should not rise with only one player holding');
await page.keyboard.down('Enter'); await sleep(1800); await page.keyboard.up('Enter'); await page.keyboard.up('KeyE');
const hres = await hr;
if (!hres.done || !hres.together) errors.push('together: holding with both players should lift the toono together');
await page.evaluate(() => TG._village.together(null)); await sleep(200);
// Review Focus 5: solo, a stray second finger, and the solo toono with grandpa's help
if (await page.evaluate(() => !!TG._village.live().p2)) errors.push('together: calling it again should remove player 2');
const sr = page.evaluate(() => TG.tasks.run(TG.gerwork.stepSpec('toono'))); await sleep(300);
const c = await page.evaluate(() => TG.villageView.current().taskToCss(60, 60));
await page.touchscreen.touchStart(c[0], c[1]); await sleep(1800); await page.touchscreen.touchEnd();
if (!(await sr).done) errors.push('solo: one finger should lift the toono with grandpa holding the other post');
await check('no player-2 controls in solo play', '.village:not(:has(.v-stick.p2.on))');
```

- [ ] **Step 2: Run to verify it fails**

Run: `node tests/smoke.mjs`
Expected: FAIL with `TG._village.together is not a function`.

- [ ] **Step 3: Implement the interfaces above**

Online friends standing nearby as the second person (the spec's optional stretch) is **not** built. It was first on the spec's cut list.

The `🤝` HUD button `els.together` sits next to the help pill. It opens a small modal listing `S.state.family` (emoji + name), plus "Friend", plus "Stop playing together" when player 2 is present.

- [ ] **Step 4: Run everything to verify it passes**

Run: the syntax loop, `node tests/check-assets.mjs`, `node tests/smoke.mjs`, `node tests/multiplayer.mjs`
Expected: all pass.

- [ ] **Step 5: Check it by eye**

Run `node server.js`. On a real phone or tablet:
- Two thumbs, left and right halves, each move their own character.
- The camera zooms out as they separate and the tether holds them together.
- Roll felt together (one rolls, the other waters).
- Lift the toono together.

Check the parent dashboard shows "Build a Mongol ger · Ээж".

- [ ] **Step 6: Commit**

```bash
git add js/village css/styles.css tests/smoke.mjs
git commit -m "Play together on one screen: player 2, split touch, shared toono and felt"
```

### Task 8: Friday packaging

**Files:**
- Modify: `README.md` (Mongolian), `js/app.js` (About/pitch page around lines 431–493)
- Test: `tests/smoke.mjs`

**Interfaces:**
- Consumes: everything above.
- Produces: no code interfaces.

- [ ] **Step 1: Write the failing check**

Next to the existing About-page check, add:

```js
if (!(await page.evaluate(() => /Phaser 4/.test(document.body.textContent)))) errors.push('about: the pitch page should say the village is built with Phaser 4');
```

- [ ] **Step 2: Run to verify it fails**

Run: `node tests/smoke.mjs`
Expected: FAIL with `about: the pitch page should say…`.

- [ ] **Step 3: Update the About page and the README**

**About page:** a short section, with both strings in the `L()` call:
- `L('Нутаг тосгон Phaser 4 тоглоомын хөдөлгүүр дээр ажилладаг: дүр зураг, камер, удирдлага, хөдөлгөөнийг хөдөлгүүр хариуцаж, бид соёлын агуулгадаа анхаардаг.', 'The Nutag village runs on the Phaser 4 game engine: scenes, camera, controls and animation are handled by the engine, so we spend our time on the culture.')`

**README (Mongolian):**
- New `### 🎮 Тоглоомын хөдөлгүүр: Phaser 4` section: why, what runs on it, what doesn't yet, and that it's vendored and offline.
- Update `### 🏡 Нутаг` with:
  - hands-on ger building
  - shearing and felt
  - Мужаан өвөө
  - playing together on one screen
- Remove the "Learn first, then 50 coins" text.
- In `## Шүүгчдэд үзүүлэх дараалал`, steps 3–5 become:
  1. shear a sheep
  2. make felt together on one phone ("🤝 Хамтдаа")
  3. trade with Мужаан өвөө
  4. build the ger by hand, with one deliberate wrong step to show the hint
  5. lift the toono together
  6. a second phone sees the ger grow
- In `## Төслийн бүтэц`, add `js/vendor/phaser.min.js`, `js/village/view.js`, `js/village/tasks.js` and `js/village/gerwork.js`.
- In the asset sources and licenses section, add Phaser 4.2.1 (MIT).

- [ ] **Step 4: Run the full suite**

Run: the syntax loop, `node tests/check-assets.mjs`, `node tests/ger-rules.mjs`, `node tests/smoke.mjs`, `node tests/multiplayer.mjs`, `node tests/basar-api.mjs`
Expected: all pass.

- [ ] **Step 5: Rehearse the demo**

Run `node server.js`. Follow the new demo order on a phone over Wi-Fi with a second device. Note anything that stutters or reads badly, and fix it in this task.

- [ ] **Step 6: Commit**

```bash
git add README.md js/app.js tests/smoke.mjs
git commit -m "Pitch and README: Phaser 4 engine, hands-on ger, playing together"
```
