# QA follow-ups

## Objective
Close the three follow-ups left out of PR #86 (live QA fixes).

## Problem / why
- The hero's decorative blob (`-right-4`, `src/features/hero/hero.tsx:265`) pushes the page 16px wider than the viewport on desktop.
- The export dialog's copy button is icon-only with no accessible name.
- Radix warns `Missing Description or aria-describedby` for `DialogContent` (export dialog and any other dialog without a description).

## Scope
- In: the three items above, with tests.
- Out: unrelated refactors.

## Constraints
- Strict TDD (`npm test`, Vitest; session config). Locally run with `NODE_OPTIONS=--no-experimental-webstorage` (Node 26 localStorage shadowing; pre-existing).
- Checks: `npm run typecheck && npm run lint && npm test && npm run build`.
- Branch `fix/qa-followups`; single PR, then merge (user-authorized).
- UI copy in English and localized through next-intl where the project already localizes strings.

## Tasks
- [x] T1 — No desktop horizontal overflow from the hero blobs. Route: delegated writer.
- [x] T2 — Export copy button has a localized accessible name. Route: delegated writer.
- [x] T3 — Every `DialogContent` has a description (visible or `sr-only`) or an explicit `aria-describedby`. Route: delegated writer.

## Acceptance criteria
- `scrollWidth - clientWidth === 0` at 1440px on `/en`.
- Copy button reachable by role + name.
- No Radix Description warning when opening dialogs.
- All four checks green.

## Route declaration
Multiple non-trivial files (hero, exporters panel, 2–3 dialogs, messages) → writer trigger → one delegated writer.

## Progress / evidence
- T1 (1c60130): `hero.test.tsx` RED (section lacked `overflow-x-clip`), GREEN after `relative overflow-x-clip` on the hero section. jsdom has no layout, so the test is structural; the 1440px `scrollWidth` check was not measured in a browser. Tooltip is portalled, so it is not clipped.
- T2 (4a0fb64): `exporters-panel.test.tsx` "copy button is reachable by its accessible name" RED (no name), GREEN with `aria-label={t("export.copyCode")}` (en/es). Copy feedback (icon swap) already existed.
- T3 (c7bea69): `dialog-descriptions.test.tsx` (color picker, image picker, export dialog, playground drawer) RED (no `aria-describedby`), GREEN after adding sr-only `DialogDescription`/`DrawerDescription` with localized text (en/es), plus no Description console warning.
- Checks: typecheck pass, lint pass, test 469/469 pass (with `--no-experimental-webstorage`), build pass.

## Next step
Open the PR and merge.
