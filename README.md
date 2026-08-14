# 🎨 Colorsitos

Generate a full colour palette from one base hex, preview it on real components, and export it to
Tailwind CSS or Chakra UI.

Give it `#3182CE` and it produces the eleven standard stops — 50 through 950 — using HSLuv for
perceptually even lightness steps, then hands you the code for your framework of choice in hex, RGB,
HSL or OKLCH.

## Getting started

**Prerequisites:** Node.js 20 or later (see `.nvmrc`), and npm.

```bash
git clone https://github.com/Feli-dev/colorsitos.git
cd colorsitos
npm ci
npm run dev
```

Then open <http://localhost:3000>.

## Verifying your changes

Four commands, each catching something the others don't. **Run all four before opening a pull
request** — CI runs exactly these, so a green local run means a green pipeline.

| command | what it catches |
| ------- | --------------- |
| `npm run typecheck` | type errors anywhere, including in test files and `vitest.config.mts` |
| `npm run lint` | lint errors, and **any warning at all** — CI fails on warnings |
| `npm test` | the unit and component suite |
| `npm run build` | production build failures, which lint errors also trigger |

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

Useful while working:

```bash
npm run test:watch      # re-runs affected tests as you edit
npm run test:coverage   # coverage over src/utils, src/lib and src/hooks
```

## How the code is organised

The rule that decides where a file goes, applied in this order:

1. **`src/components/ui/`** is the shadcn CLI target. Files there are managed by `npx shadcn add`;
   don't hand-edit them and don't move the directory — `components.json` points at it.
2. **`src/components/vendor/`** is third-party code copied in from elsewhere. Each file names its
   upstream and licence in a header. Prefer pulling upstream fixes over rewriting locally.
3. **`src/features/<feature>/`** — a component the app router mounts belongs to its feature.
4. One feature consumer → that feature. **Two or more → `src/components/shared/`.**

```
src/
├── app/                    routes, layouts, error and loading boundaries, robots and sitemap
├── features/
│   ├── hero/               landing headline and the colour squares
│   ├── palette-generator/  the generator, its export panel and saved palettes
│   └── playground/         previews a palette on real components
├── components/
│   ├── layout/             navbar, footer, logo, support button
│   ├── shared/             used by more than one feature
│   ├── ui/                 shadcn primitives
│   └── vendor/             third-party, see the headers
├── hooks/                  React state and effects
├── lib/                    framework-agnostic helpers
├── types/                  shared type definitions
└── utils/                  pure functions — colour maths, palette generation, exporters
```

### Where logic belongs

**Push pure logic down into `src/utils/`.** That is not a style preference: `src/utils`, `src/lib`
and `src/hooks` are what the coverage config measures, and a pure function is testable in a way a
function buried in a component is not.

The export panel is the worked example. Its code generation lived inside the component and had no
tests; moving it to `src/utils/export-code.ts` made 20 golden snapshots possible, and those
snapshots are what proved a later refactor changed nothing.

## Internationalisation

English and Spanish, via [next-intl](https://next-intl.dev/). Messages live in `messages/en.json`
and `messages/es.json`, which must stay in sync — **the same keys in both, always**.

User-facing strings belong in those files, never as literals in a component. A hardcoded string
renders in the wrong language for half the users and no test will catch it, because comparing key
counts between locale files cannot find a string that was never keyed.

Code, comments and documentation are in English.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Issues labelled
[`good first issue`](https://github.com/Feli-dev/colorsitos/labels/good%20first%20issue) are a good
place to start.

## Built with

- **[Next.js 15](https://nextjs.org/)** — App Router, React 19
- **[TypeScript](https://www.typescriptlang.org/)** — strict mode
- **[Tailwind CSS 4](https://tailwindcss.com/)**
- **[shadcn/ui](https://ui.shadcn.com/)** — accessible component primitives
- **[next-intl](https://next-intl.dev/)** — internationalisation
- **[Vitest](https://vitest.dev/)** + **[Testing Library](https://testing-library.com/)**
- **[chroma-js](https://gka.github.io/chroma.js/)** and **[hsluv](https://www.hsluv.org/)** — colour maths

## Credits

Third-party components included and redistributed under the MIT licence:

| Component | Project | Licence |
| --------- | ------- | ------- |
| `src/components/vendor/magicui/cool-mode.tsx` | [Magic UI](https://magicui.design/docs/components/cool-mode) · [repo](https://github.com/magicuidesign/magicui) | MIT |
| `src/components/vendor/animated-theme-toggler.tsx` | [Magic UI](https://magicui.design/docs/components/animated-theme-toggler) · [repo](https://github.com/magicuidesign/magicui) | MIT |
| `src/components/vendor/shadcn-io/color-picker/` | [Kibo UI](https://www.shadcn.io/components/color-picker) · [repo](https://github.com/haydenbleasel/kibo) | MIT |

Primitives under `src/components/ui/` come from [shadcn/ui](https://ui.shadcn.com/), also MIT.

## Licence

MIT — see [`LICENSE`](./LICENSE).
