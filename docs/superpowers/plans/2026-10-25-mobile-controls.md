# Mobile Controls Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** On phones, the village buttons work while the other thumb steers, walking never gets stuck, and the joystick turns around immediately.

**Architecture:** Village action buttons act on `pointerdown` through one small helper in `js/village/village.js`. Input clears whenever the page is hidden. The joystick base slides to follow a thumb that goes past the ring. A new headless phone test (`tests/touch.mjs`) drives real multi-touch through the Chrome DevTools Protocol.

**Tech Stack:** Plain browser JavaScript (no build), Phaser 4 view, Node test scripts with puppeteer-core 22.15.0 and Chrome.

**Spec:** `docs/superpowers/specs/2026-10-25-mobile-controls-design.md`

## Global Constraints

- No build step, no new dependencies; the test uses `puppeteer-core@22.15.0` installed with `npm install --no-save` like the other browser tests.
- Code style matches `village.js`: dense one-line functions, short comments that say why, `L(mn, en)` for any shown text (Mongolian first).
- Keyboard and mouse keep working exactly as now (Space jumps, E uses, Shift runs, mouse clicks act once).
- Every changed JS file is served from the offline cache: bump `CACHE` in `sw.js` from `naadamy-v33` to `naadamy-v34` once on this branch.
- `tests/smoke.mjs` and `tests/multiplayer.mjs` must still pass; they press HUD buttons with `element.click()` (a click with `detail === 0`).

## Review Focus

- A mouse click on Jump or Run fires once, not twice (pointerdown, then the click that follows). Covered in Task 1, test `mouse click acts once`.
- `element.click()` and Enter on a focused button still act (keyboard users, smoke tests). Covered in Task 1, test `keyboard click acts`.
- A finger that lands on Run and slides off still toggles exactly once (no toggle on the trailing click). Covered by the same once-per-press rule; Task 1 test `mouse click acts once` checks Run's `runLock` flips once.
- Player 2's joystick also clears on hide and also follows the thumb. Covered in Task 2 test `hidden page clears both sticks` and Task 3 test `player 2 stick follows`.
- A tap on the map (no drag) still walks there after the joystick change. Covered in Task 3 test `tap still walks`.

---

### Task 1: Touch test harness, and buttons that act the moment a finger lands

**Files:**
- Create: `tests/touch.mjs`
- Modify: `js/village/village.js` (the `els` block in the village screen, ~lines 390-410; `hotbar()` ~497; `TG._village` hooks ~95)
- Modify: `sw.js:3`, `README.md:299-307`, `.github/workflows/ci.yml` (after the multiplayer step)

**Interfaces:**
- Produces: `press(fn)` in `village.js` → returns `{ onpointerdown, onclick }` props for `h()`. `fn` gets no arguments.
- Produces: `TG._village.hud()` → re-renders the HUD and hotbar (test hook).
- Produces in `tests/touch.mjs`: `touch(type, points)` where `points` is `[[x, y, id], ...]`. CDP `Input.dispatchTouchEvent` semantics: on `touchEnd` the points listed are the ones lifted, on `touchStart` and `touchMove` all active points. `state()` returns `{ x, y, stick, drag, vx, vy }` from `TG._village.live()`. `place(x, y)` teleports player 1 and stops them. Later tasks add cases to this file.

- [ ] **Step 1: Write `tests/touch.mjs` with the failing cases**

Server, Chrome launch and registration follow `tests/smoke.mjs` lines 1-76: same static server, same register and character-creator clicks, failing on any `pageerror`. Differences:
- `page.emulate({ viewport: { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true } })`.
- After entering the village: `TG.tutorial.stop()`, set `village.tutorial = 1` and `village.tutorialSeen = 1`, then `TG.store.save()`.
- Collect failures in an array, print `Touch test passed.` or the list and `process.exit(1)`, like smoke.

Cases. "Steer" means: finger 1 down at (150, 500), six 10 px moves to the right, 16 ms apart.
- `second finger jumps`: steer, finger 2 down and up on `.v-jump`'s centre. Assert `performance.now() - live.me.jt < 900`, and `live.stick` still set (steering kept).
- `second finger toggles run`: steer, finger 2 tap on `.v-run`. Assert `live.runLock === true`.
- `second finger uses`: `place` at the well door (`TG._village.objects().find(o => o.id === 'well').door`), set `village.energy = 10`. Finger 1 down at (150, 500) with no move, finger 2 tap on `.v-act`. Assert energy > 10.
- `second finger eats from the hotbar`: set `village.produce.aaruul = 2`, `village.energy = 10`, `TG._village.hud()`. Steer, finger 2 tap on the first `.v-slot-btn`. Assert `produce.aaruul === 1`.
- `mouse click acts once`: `page.mouse.click` on `.v-run`. Assert `runLock` flipped exactly once, and a second `page.mouse.click` flips it back.
- `keyboard click acts`: `document.querySelector('.v-jump').click()`. Assert it jumped.

- [ ] **Step 2: Run it and confirm the second-finger cases fail**

Run: `node tests/touch.mjs`
Expected: FAIL listing `second finger jumps`, `second finger toggles run`, `second finger uses` and `second finger eats from the hotbar`. The mouse and keyboard cases pass.

- [ ] **Step 3: Implement `press(fn)` and use it**

Next to the other small helpers before the village screen in `village.js`. `onpointerdown` acts when `e.button === 0`. `onclick` acts only when `e.detail === 0`, so a keyboard or `element.click()` click acts, and a click that follows a pointerdown never acts twice. Use `press` for `jump`, `run`, `ctx`, `shoot` and the hotbar slot buttons, both full and empty. Leave `sprint` alone: it already uses pointer events. Add `hud: () => hud()` to `TG._village`.

- [ ] **Step 4: Run the touch test, then the existing browser tests**

Run: `node tests/touch.mjs && node tests/smoke.mjs && node tests/multiplayer.mjs`
Expected: `Touch test passed.`, `Smoke test passed…`, `Multiplayer test passed.` The smoke test's first-person battle check is known to be flaky; rerun once if only that check fails.

- [ ] **Step 5: Wire the test in and bump the cache**

- `sw.js`: `naadamy-v34`.
- `ci.yml`: a step `Touch test (phone joystick and buttons)` running `node tests/touch.mjs`, after the multiplayer step.
- `README.md`: a numbered test line after the multiplayer one, in Mongolian like its neighbours: **Утасны удирдлагын шалгалт** (`tests/touch.mjs`), covering the second finger on the buttons, the hidden page and the joystick. Add `node tests/touch.mjs` to the run command on line 307.

Run: `node tests/check-assets.mjs`. Expected: `Asset check passed`.

- [ ] **Step 6: Commit**

```bash
git add tests/touch.mjs js/village/village.js sw.js README.md .github/workflows/ci.yml
git commit -m "Village buttons act the moment a finger lands, even while the other thumb steers"
```

### Task 2: Walking stops whenever the game goes out of view

**Files:**
- Modify: `js/village/village.js:451,463,469` (listener setup, `clearKeys`, cleanup)
- Test: `tests/touch.mjs`

**Interfaces:**
- Consumes: `touch`, `state`, `place` from Task 1.
- Produces: `clearKeys()` also ends player 2's stick (`endStick2()`) and clears `live.p2.keys` and `live.p2.running` when `live.p2` exists.

- [ ] **Step 1: Add the failing cases**

To fake hiding, use `Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true })`, the same for `document.hidden`, then dispatch `visibilitychange`. Undo it the same way.
- `hidden page stops walking`: steer left. Hide, then show again, with no touch events in between. Wait 500 ms. Assert `live.stick === null`, `live.drag === null`, and `x` unchanged across those 500 ms (within 0.05).
- `hidden page clears both sticks`: start playing together with `TG._village.together('')`. Finger 1 down at (100, 500), finger 2 down at (300, 500), both move 60 px. Hide. Assert `live.drag2 === null` and `live.p2.stick === null`. Then `TG._village.together(null)`.

- [ ] **Step 2: Run and confirm both fail**

Run: `node tests/touch.mjs`
Expected: FAIL with `hidden page stops walking` and `hidden page clears both sticks`.

- [ ] **Step 3: Clear input when hidden**

Register `document` `visibilitychange` (only acting when `document.hidden`) and `window` `pagehide`, both calling `clearKeys`, next to the existing `blur` listener. Remove both in the cleanup. Extend `clearKeys` to cover player 2 (see Interfaces).

- [ ] **Step 4: Run the touch test**

Run: `node tests/touch.mjs`
Expected: `Touch test passed.`

- [ ] **Step 5: Commit**

```bash
git add js/village/village.js tests/touch.mjs
git commit -m "Walking stops when the phone locks or the app is switched"
```

### Task 3: The joystick follows the thumb

**Files:**
- Modify: `js/village/village.js` (`onPointerMove`, ~lines 600-617)
- Test: `tests/touch.mjs`

**Interfaces:**
- Consumes: `STICK_R` (50), `live.drag` and `live.drag2` (`{ id, x0, y0, on }`), and the stick elements `live.els.stick` and `live.els.stick2`.

- [ ] **Step 1: Add the failing cases**

- `stick turns around at once`: finger down at (195, 500), ten 15 px moves right (to 345), then four 30 px moves left (to 225). After 150 ms, assert `live.stick.x < 0` and `live.me.vx < 0`. Today the base stays at 195, so 225 still reads as right.
- `player 2 stick follows`: playing together, finger at (250, 500) moves to (350, 500) and then back to (290, 500). Assert `live.p2.stick.x < 0`.
- `tap still walks`: touch down and up at (300, 420) with no move. Assert `live.me.path.length > 0`.
- Regression cases from the probe, each asserting the stick ends `null` and `vx` returns to 0: `touch cancel stops`, `lifting over a button stops`, `modal mid-drag stops`, and `rotate mid-drag stops` (set the viewport to 844×390 and back).

- [ ] **Step 2: Run and confirm the two follow cases fail**

Run: `node tests/touch.mjs`
Expected: FAIL with `stick turns around at once` and `player 2 stick follows`. The other new cases pass.

- [ ] **Step 3: Make the base follow**

For both sticks, once the stick is on: when `dist > STICK_R`, move the base toward the thumb by `dist - STICK_R` along the drag direction, so the thumb sits on the ring. Then reposition the ring element: `style.left` and `style.top` from the new base, relative to `live.root`'s rect, as on first activation. The knob offset stays clamped to `STICK_R`.

- [ ] **Step 4: Run every test**

Run: `node tests/touch.mjs && node tests/smoke.mjs && node tests/multiplayer.mjs && node tests/check-assets.mjs && node tests/ger-rules.mjs`
Expected: all pass. Rerun once if only the smoke test's first-person battle check fails.

- [ ] **Step 5: Commit**

```bash
git add js/village/village.js tests/touch.mjs
git commit -m "Joystick follows the thumb, so turning around is immediate"
```
