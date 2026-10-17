# Live QA fixes

## Objective
Fix the three bugs found while testing https://www.colorsitos.app live in Brave (2026-10-09).

## Problem / why
- The "Chakra v3" export emits Chakra v2 code (`extendTheme`, `defineStyleConfig`), which v3 removed — users who copy it get a broken theme.
- The fixed navbar has no background, so on scroll its logo and icons paint over the generator inputs and swatches.
- At 390px width the page scrolls horizontally by ~13px; the generator container overflows the viewport.

## Scope
- In: the three bugs above, with tests.
- Out: the minor a11y notes (export copy button label, DialogContent description) — follow-ups.

## Constraints
- Strict TDD: observed RED before GREEN. Runner: `npm test` (Vitest), source: user/session config ("Strict TDD Mode: enabled").
- Repo checks before PR: `npm run typecheck && npm run lint && npm test && npm run build`.
- Branch: `fix/live-qa-findings`. Delivery: single PR, then merge (user-authorized).

## Tasks
- [x] T1 — Chakra v3 exporter emits v3 API (`createSystem(defaultConfig, defineConfig({ theme: { tokens: { colors } } }))` with `{ value }` tokens); whole-system export stays consistent. Route: delegated writer.
- [x] T2 — Navbar gets a background (translucent + blur) so content doesn't show through on scroll. Route: delegated writer.
- [x] T3 — No horizontal overflow at 390px on the home page. Route: delegated writer.

## Acceptance criteria
- Chakra v3 snippet contains no `extendTheme`/`defineStyleConfig`; uses `createSystem`, `defaultConfig`, `defineConfig`, `{ value: '#…' }`.
- Navbar has an opaque/translucent background in light and dark.
- `document.documentElement.scrollWidth - innerWidth === 0` at 390px with a palette generated.
- All four repo checks green.

## Route declaration
2+ non-trivial files across three areas → mandatory writer trigger → one delegated writer.

## Progress / evidence
Env note: Node 26's global `localStorage` shadows jsdom's, failing ~26 unrelated tests; all runs used `NODE_OPTIONS=--no-experimental-webstorage` (no repo change).

- T1 (3c9ee41) — RED: 6 failing (`exportChakraV3 > emits the v3 createSystem API...`, `> nests all eleven shades ... as { value } tokens`, `> keeps the 950 shade`, fragment 950, joined-fragments, `combined-export chakra3 ... one tokens.colors object`). GREEN: `src/utils` 295/295; 5 chakra3 snapshots regenerated.
- T2 (846b493) — RED: `Navbar > paints a translucent, blurred background...` failed (no `bg-background/80`). GREEN after adding `border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60`. jsdom has no layout, so the test asserts classes only.
- T3 (5004e76) — RED: `Home layout > lets the generator's wrapper span the column` and `PaletteGenerator layout > adds no horizontal padding of its own` failed. GREEN after wrapper `w-full` and dropping `px-6 md:px-0` from the generator. jsdom cannot measure scrollWidth; the 390px check is NOT browser-verified yet.
- Checks: typecheck clean; lint clean; `npm test` 40 files / 463 tests pass; `npm run build` succeeds.

## Next step
Browser-verify 390px scrollWidth and navbar blur, then PR.
