# Contributing to Colorsitos

Thanks for being here. This document is short on purpose: it covers what you need to get a change
merged, and the few conventions that aren't obvious from reading the code.

## Setup

Node.js 20 or later — `.nvmrc` and `package.json`'s `engines` both pin it, and CI runs it.

```bash
npm ci        # not `npm install` — ci installs exactly what the lockfile says
npm run dev
```

## Before you open a pull request

Run all four. CI runs exactly these, so a green local run means a green pipeline.

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

They are not interchangeable:

- **`typecheck`** covers test files and `vitest.config.mts` too, and has caught things the suite
  didn't.
- **`lint`** fails on **any warning**, not just errors. That is deliberate — the repo is at zero and
  CI keeps it there.
- **`build`** fails on lint errors. A lint rule in a test file has broken a build here before.

## Conventions

**Code, comments and docs are in English.** Spanish belongs in `messages/es.json`, which is the point
of it. If you're translating a file, finish it in one pass — a half-converted file looks like nobody
owns the convention.

**User-facing strings go through `next-intl`.** Never a literal in a component. `messages/en.json`
and `messages/es.json` must carry the same keys.

> A hardcoded string is invisible to key-count checks — comparing the two locale files cannot find a
> string that was never keyed at all. That is how three Spanish strings survived in the playground
> for months. If you add copy, add the key.

**Pure logic goes in `src/utils/`.** `utils`, `lib` and `hooks` are what the coverage config
measures. A pure function is testable; the same logic inside a component usually isn't.

**Where a new file goes** is decided in order: `components/ui/` is shadcn's (don't hand-edit),
`components/vendor/` is third-party, a component the router mounts belongs to its feature, one
feature consumer means it lives in that feature, two or more means `components/shared/`. The README
has the full version.

## Pull requests

**One concern per PR.** Two unrelated fixes in one diff make both harder to review and neither
revertible on its own.

**Say how you verified it.** Paste the command output. "Tested locally" isn't evidence.

**Screenshots for anything touching UI.** Before *and* after when the change is visual; the same
viewport twice when it shouldn't be. `.atl/screenshot.sh <out-dir> <label> [route] [light|dark|both]`
captures both themes in one command.

> Two things about screenshots here. The hero's accent colour is **randomised on every page load**,
> so no two captures of it share an accent — a colour difference between your before and after is not
> a regression. And that means screenshots are review evidence, never pixel-identity proof; the test
> suite is what proves behaviour.

**Refactors need a proof of no change**, not a promise of one. A test that fails if output moves beats
a sentence saying it doesn't. Golden snapshots are one way; there are 20 in
`src/utils/__snapshots__/` from exactly this situation.

## Where to start

Issues labelled [`good first issue`](https://github.com/Feli-dev/colorsitos/labels/good%20first%20issue)
are scoped and have acceptance criteria. Comment on one before starting so nobody duplicates work.

Found a bug? Open an issue with what you expected, what happened, and how to reproduce it.

## Security

Don't open a public issue for a vulnerability. See [SECURITY.md](./SECURITY.md).
