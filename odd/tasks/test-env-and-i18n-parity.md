# Test env and i18n parity

## Objective
Close the last loose ends after PRs #86 and #87.

## Problem / why
- On Node 26, the built-in global `localStorage` shadows jsdom's, so `npm test` fails 26 tests locally unless run with `NODE_OPTIONS=--no-experimental-webstorage`. CI (Node 20) is unaffected.
- Component tests mock next-intl, so nothing proves every key exists in both `messages/en.json` and `messages/es.json`.
- Production was not re-verified after the Vercel deploy of #86/#87.

## Scope
- In: Vitest config fix, a locale key-parity test, a live production check.
- Out: anything else.

## Constraints
- Strict TDD (`npm test`, Vitest). The flag must stay harmless on Node 20 (`.nvmrc`), which rejects unknown flags — pass it only when `process.allowedNodeEnvironmentFlags` has it.
- Checks: `npm run typecheck && npm run lint && npm test && npm run build`.
- Branch `chore/test-env-and-i18n-parity`; single PR, then merge (user-authorized).

## Tasks
- [x] T1 — Verify colorsitos.app live (Brave) after the #86/#87 deploy. Route: inline (read-only).
- [x] T2 — `vitest.config.mts` passes `--no-experimental-webstorage` to workers when supported. Route: inline (one mechanical file).
- [x] T3 — Test asserting `en.json` and `es.json` have identical key sets. Route: inline (one new test file).

## Progress / evidence
- T1 — Live check in Brave on colorsitos.app: horizontal overflow 0 at 1440/1280/390px; copy button found by name; all 4 dialogs expose a description; navbar `oklab(1 0 0 / 0.6)` + `blur(8px)`; Chakra v3 export starts with `createSystem`; `/es` 200; no console warnings.
- T2 (5f79b0f) — RED: plain `npm test` on Node 26 → 25 failed / 444 passed. GREEN: `test.execArgv` adds `--no-experimental-webstorage` only when `process.allowedNodeEnvironmentFlags` has it → 469/469 without any env var.
- T3 (cd79eea) — `src/i18n/messages.test.ts`. RED observed by temporarily deleting `export.copyCode` from es.json (key-parity test failed) and renaming the `{color}` placeholder in `hero.copyColorLabel` (placeholder test failed); es.json restored byte-identical. GREEN: 3/3.
- Checks: typecheck pass; lint pass; test 43 files / 472 tests pass; build pass.
