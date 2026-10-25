# Mobile controls: no stuck walking, buttons that work while steering

## Why
Judges and players use Naadamy on phones. The village joystick is how children move, and the on-screen buttons
(jump, run, use) are how they act. Today those buttons do nothing while the other thumb is steering, and the
character can keep walking by itself. Controls that misbehave make a child give up before any learning happens.

## What was found (touch probe on a 390×844 phone screen, real multi-touch events)
1. **Buttons ignore a second finger.** While one thumb steers, a tap on Jump, Run or Use does nothing: the buttons
   act on `click`, and phones send no click when another finger is already down.
2. **Walking gets stuck.** Steer, then lock the phone or switch apps: on return the character keeps walking with
   no finger on the screen. Only `window.blur` clears input, and phones don't reliably send it.
3. **Turning around is slow.** The joystick base stays where the thumb landed, so after pushing far one way the
   thumb must travel back past that spot before the character turns.

Already fine and must stay fine: touch cancel, lifting over a button, a modal opening mid-drag, rotating mid-drag,
tap-to-walk, 60 fps.

## Goals
- Every village action button responds the moment a finger lands on it, even while another finger steers.
- No input survives the game going out of view (hidden page, app switch, lock).
- The joystick base follows the thumb once it passes the ring, so reversing is immediate.
- An automated touch test covers these cases so they stay fixed.

## Non-goals
- Changing what the buttons do, the HUD layout, or the feature set (cutting features is a separate piece of work).
- Keyboard and mouse behaviour (must keep working as now: Space, E, Shift, clicks).

## Approaches
- **Act on `pointerdown` on the DOM buttons (chosen).** Small change where the buttons are built; pointer events
  fire per finger, so a second finger works. A click that follows must not act twice, and keyboard activation
  (Enter/Space on a focused button) must still work.
- Listen to `touchstart` on each button. Same effect but touch-only, so mouse and pen need a second path.
- Move the buttons into the Phaser scene. Phaser tracks every pointer, but it means redrawing the HUD and losing
  the accessible DOM buttons. Far bigger for the same result.

## How
- A small helper makes a village button act on `pointerdown` (primary pointer button only), swallow the click
  that follows, and still act on a keyboard click (`detail === 0`). Used for Jump, Run, the Use (context) button,
  Shoot, and the dairy hotbar slots. The race Sprint button already uses pointer events and stays as it is.
- `visibilitychange` (hidden) and `pagehide` clear keys, run and both joysticks (player 1 and player 2), like blur does now.
- Joystick: when the thumb is farther than the ring radius from the base, the base slides along so the thumb sits
  on the ring; the drawn ring moves with it. Same for player 2's stick.
- Test: `tests/touch.mjs`, a headless phone with multi-touch through CDP, checking the cases above. Listed in the README
  next to the other tests.

## Left to the builder
- Exact helper name and where it lives in `village.js`.
