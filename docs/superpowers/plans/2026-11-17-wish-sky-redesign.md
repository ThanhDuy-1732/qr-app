# Bầu trời ước mơ — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the wish-wall UI as a living night sky — aurora, stars, and a "star born" moment on submit — without changing the product's data model or features.

**Architecture:** Keep the existing Next.js App Router page and server components. Replace the single global stylesheet section by section with a new token system and new class names, so the page stays buildable at every step. Add four small client components (`Reveal`, `SkyCursor`, `CountUp`, plus the existing form/theme clients); all ambient motion is CSS-only.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, plain global CSS, `next/font/google` (Space Grotesk, Fraunces, Inter), Neon Postgres (unchanged), Node 24 built-in test runner.

**Spec:** `docs/superpowers/specs/2026-11-17-wish-sky-redesign-design.md`

## Global Constraints

- **No new runtime dependencies.** No Framer Motion, GSAP, Tailwind, or CSS-in-JS. Tests use `node:test` only.
- **Animate only `transform`, `opacity`, `background-position`, and colors.** Never animate `filter`, `width`, `height`, `top`, or `left`.
- **No `filter: blur()` on animated layers.** Aurora softness comes from gradient stops.
- **Reduced motion is mandatory:** `html[data-motion="reduced"]` disables every animation and transition. The attribute is set before paint from localStorage or the OS `prefers-reduced-motion` (and kept in sync by `ThemeProvider`), so it is the single switch. Hover effects keep color changes but drop movement.
- **QR integrity:** QR images always sit on an opaque `#ffffff` tile, display at ≥160px, keep a quiet zone, and are never covered by overlays or animated elements.
- **Fonts must keep Vietnamese:** all three families use `subsets: ['latin', 'vietnamese']` via `next/font/google`.
- **No backend/schema change** except adding `at?: number` to `ActionState` / the success return.
- **Never submit test messages to the production database.** Verify form states with static checks or by temporarily editing initial state, then revert.
- `npm run build`, `npm run lint`, and `npm test` must pass at the end of every task that changes code.
- Keep copy in Vietnamese, using the exact strings named in each task.

## Review Focus

1. **Long, unbroken wish text/URL at 390px** — must wrap inside the card without horizontal overflow. (Task 3)
2. **Double submit while pending** — button must be disabled; one message and one celebration per submit. (Task 4)
3. **Empty / whitespace / "Ẩn danh" name** — must render `?` avatar and "Ẩn danh", never `undefined` or an empty circle. (Task 3)
4. **Custom background that fights the theme** (white in dark, black in light) — text must remain readable; the helper test pins this. (Task 5)
5. **Keyboard-only and reduced-motion visitors** — must reach the form, theme panel, and success link with a visible focus ring, and see no moving background. (Task 6)

---

### Task 1: Foundation — fonts, tokens, animated sky

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css` (token blocks, `html`/`body` base, new `.sky*` rules)
- Create: `app/components/SkyBackdrop.tsx`
- Create: `app/components/SkyCursor.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: CSS tokens listed below; `SkyBackdrop()` (no props) and `SkyCursor()` (no props), both mounted from the root layout for the whole app.

- [ ] **Step 1: Add the display and serif fonts in `app/layout.tsx`**

Keep the existing Inter setup. Add:

```tsx
import { Fraunces, Inter, Space_Grotesk } from 'next/font/google'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-space',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-fraunces',
  display: 'swap',
  style: ['normal', 'italic'],
})
```

Apply all three variables to `<html>`: `className={`${inter.variable} ${spaceGrotesk.variable} ${fraunces.variable}`}`.

- [ ] **Step 2: Replace the token blocks at the top of `app/globals.css`**

Delete the three old token blocks (`:root, [data-theme="dark"]`, `[data-theme="light"]`, and the shared `:root`). Add dark tokens, light overrides, and compatibility aliases for the old CSS that is still in the file:

```css
:root, [data-theme="dark"] {
  --sky-0: #04050d;
  --sky-1: #090b1a;
  --violet: #7c5cff;
  --cyan: #22d3ee;
  --rose: #f472b6;
  --text-1: #eef0ff;
  --text-2: #a9abc8;
  --text-3: #8f92b5;
  --glass: rgba(255, 255, 255, .045);
  --glass-h: rgba(255, 255, 255, .075);
  --line: rgba(255, 255, 255, .09);
  --line-h: rgba(255, 255, 255, .18);
  --aurora-1: rgba(124, 92, 255, .55);
  --aurora-2: rgba(14, 116, 144, .42);
  --aurora-3: rgba(190, 24, 93, .28);
  --title-grad: linear-gradient(100deg, #ffffff 8%, #c4b5fd 30%, #67e8f9 52%, #f9a8d4 72%, #ffffff 92%);
}

[data-theme="light"] {
  --sky-0: #f6f1ff;
  --sky-1: #eef8ff;
  --violet: #6d28d9;
  --cyan: #0e7490;
  --rose: #db2777;
  --text-1: #1b1733;
  --text-2: #4a4670;
  --text-3: #55526e;
  --glass: #ffffff;
  --glass-h: #fffdfa;
  --line: rgba(27, 23, 51, .12);
  --line-h: rgba(27, 23, 51, .28);
  --aurora-1: rgba(124, 92, 255, .20);
  --aurora-2: rgba(34, 211, 238, .16);
  --aurora-3: rgba(244, 114, 182, .15);
  --title-grad: linear-gradient(100deg, #4c1d95 0%, #7c3aed 38%, #0e7490 62%, #db2777 100%);
}

:root {
  --font-sans: var(--font-inter), system-ui, sans-serif;
  --font-display: var(--font-space), var(--font-inter), system-ui, sans-serif;
  --font-serif: var(--font-fraunces), Georgia, serif;
  --radius-sm: 12px;
  --radius: 20px;
  --radius-lg: 28px;
  --ease-out: cubic-bezier(.22, 1, .36, 1);
  --shadow: 0 8px 32px rgba(0, 0, 0, .35);
  --shadow-lg: 0 24px 70px rgba(0, 0, 0, .5);
  --shadow-panel: 0 16px 50px rgba(0, 0, 0, .55);

  /* compatibility aliases — deleted in Task 6 */
  --bg: var(--sky-0);
  --bg-2: var(--sky-1);
  --bg-card: var(--glass);
  --bg-card-h: var(--glass-h);
  --border: var(--line);
  --border-h: var(--line-h);
  --field-bg: rgba(255, 255, 255, .05);
  --purple: var(--violet);
  --purple-d: #6d28d9;
  --purple-glow: rgba(124, 92, 255, .35);
  --blue: #3b82f6;
  --teal: #2dd4bf;
  --success: #34d399;
  --success-bg: rgba(52, 211, 153, .12);
  --error: #fb7185;
  --error-bg: rgba(251, 113, 133, .12);
  --transition: .2s ease;
  --scroll-track: var(--sky-1);
  --scroll-thumb: rgba(124, 92, 255, .35);
}
```

Also update the old `.wall-count`/`.qr-method` light overrides only if they now reference removed tokens; leave the rest for Task 6.

- [ ] **Step 3: Replace the `html`/`body` background rules with the sky base**

```css
html {
  background: var(--custom-bg, var(--sky-0));
  color: var(--text-1);
  font-family: var(--font-sans);
  line-height: 1.6;
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
}
body { min-height: 100dvh; background: transparent; }
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}
```

Add the fixed sky layer rules: `.sky` is `position: fixed; inset: 0; z-index: 0; overflow: hidden; pointer-events: none;`. Content sits above it with `position: relative; z-index: 1` on `.page`. Three `.sky-aurora` blobs use the `--aurora-*` tokens as soft `radial-gradient` backgrounds (no blur filter) and drift with `transform` over 26s / 34s / 42s, `ease-in-out infinite alternate`. Two `.sky-stars` layers use repeating `radial-gradient` dots (`background-size: 520px 520px` and `380px 380px`), animate `opacity` over 6s / 9s. `.sky-shoot` is a 1px gradient streak crossing every 13s, hidden below 700px.

- [ ] **Step 4: Create `app/components/SkyCursor.tsx`**

Client component, no props. It renders `<div className="sky-cursor" aria-hidden="true" />` and, in `useEffect`, returns early when `matchMedia('(pointer: fine)')` is false or reduced motion is on. Otherwise it tracks `pointermove` into `--cx` / `--cy` (px) with a `requestAnimationFrame` lerp (factor `0.12`) and never blocks clicks (`pointer-events: none`). `.sky-cursor` is 520×520px, centered on the pointer, radial violet glow at ≤16% opacity, `will-change: transform`.

- [ ] **Step 5: Create `app/components/SkyBackdrop.tsx`**

Server component, no props:

```tsx
import SkyCursor from './SkyCursor'

export default function SkyBackdrop() {
  return (
    <div className="sky" aria-hidden="true">
      <div className="sky-aurora one" />
      <div className="sky-aurora two" />
      <div className="sky-aurora three" />
      <div className="sky-stars layer-a" />
      <div className="sky-stars layer-b" />
      <div className="sky-shoot" />
      <SkyCursor />
    </div>
  )
}
```

- [ ] **Step 6: Mount it in `app/layout.tsx`**

Render `<SkyBackdrop />` inside `<ThemeProvider>` before `{children}`.

- [ ] **Step 7: Verify build and lint**

Run: `npm run build && npm run lint`
Expected: both exit 0.

- [ ] **Step 8: Verify the sky renders**

Start `npm run dev` if it is not already running. Open `http://localhost:3000` at 1440×900 and 390×844. Expected: aurora and stars are visible behind the existing page, no console errors, body text still readable, no horizontal scrollbar.

- [ ] **Step 9: Commit**

```bash
git add app/layout.tsx app/globals.css app/components/SkyBackdrop.tsx app/components/SkyCursor.tsx
git commit -m "feat(ui): add sky fonts, tokens and animated backdrop"
```

---

### Task 2: Page shell, hero, support card, footer

**Files:**
- Modify: `app/page.tsx`
- Create: `app/components/Reveal.tsx`
- Modify: `app/globals.css` (append `.page`, `.sky-hero*`, `.wish-panel`, `.support-card`, `.qr-*`, `.page-footer`, `.reveal`, `.skip-link`)
- Modify: `app/components/ThemeProvider.tsx` only if a type export is needed for `Reveal` — otherwise leave it.

**Interfaces:**
- Consumes: tokens and `.sky` layer from Task 1.
- Produces: `Reveal({ children, className?, delay? }: { children: React.ReactNode; className?: string; delay?: number })`; the page ids `#wish-form`, `#wish-wall`; class hooks `.wish-card`, `.wall-heading` used by Task 4.

- [ ] **Step 1: Create `app/components/Reveal.tsx`**

Client component. In `useEffect`, if reduced motion is on (`prefers-reduced-motion` or `document.documentElement.dataset.motion === 'reduced'`), add `is-visible` immediately. Otherwise observe the element with `IntersectionObserver` (`threshold: 0.15`, `rootMargin: '0px 0px -40px 0px'`), add `is-visible` once, and disconnect. Render a `div` with `className={`reveal ${className ?? ''}`}` and `style={{ '--reveal-delay': `${delay ?? 0}ms` } as React.CSSProperties}`.

- [ ] **Step 2: Rewrite `app/page.tsx` shell and hero**

Keep `getMessages()` and `dynamic = 'force-dynamic'`. Structure:

```tsx
<main className="page">
  <a className="skip-link" href="#wish-form">Bỏ qua đến lời nhắn</a>
  <header className="sky-hero">
    <div className="hero-top">
      <span className="hero-mark" aria-hidden="true">✦</span>
      <span className="hero-count">{messages.length} ngôi sao đang sáng</span>
    </div>
    <div className="hero-copy">
      <p className="hero-kicker">Gửi một điều bạn mong</p>
      <h1 className="hero-title">Nơi chấp cánh<br /><em>ước mơ</em></h1>
      <p className="hero-sub">Mỗi lời nhắn là một ngôi sao. Viết điều bạn đang mong, cả bầu trời sẽ cùng cầu nguyện.</p>
      <div className="hero-actions">
        <a className="btn btn--primary" href="#wish-form">Viết ước mơ của bạn <span aria-hidden="true">↗</span></a>
        <a className="btn btn--ghost" href="#wish-wall">Xem bầu trời</a>
      </div>
    </div>
    <a className="hero-scroll" href="#wish-form" aria-label="Cuộn xuống phần gửi lời nhắn" />
  </header>

  <section id="wish-form" className="wish-panel" aria-label="Gửi lời nhắn và ủng hộ">
    <Reveal className="form-slot"><MessageForm /></Reveal>
    <Reveal className="support-card" delay={90}>…QR card…</Reveal>
  </section>

  <section id="wish-wall" className="sky-wall" aria-labelledby="wall-heading">
    <Reveal className="wall-head">
      <h2 id="wall-heading" className="wall-heading" tabIndex={-1}>Bầu trời hôm nay</h2>
      <span className="wall-badge">{messages.length} ngôi sao</span>
    </Reveal>
    <Reveal delay={80}><MessageList messages={messages} /></Reveal>
  </section>

  <footer className="page-footer">
    <span>✦ Mỗi lời nhắn là một ngôi sao.</span>
    <span>{new Date().getFullYear()}</span>
  </footer>
</main>
```

Keep `import Image from 'next/image'`; the support card contains both QR images on white `.qr-tile` surfaces, with labels "MoMo" and "VietQR", the hint "Mở MoMo hoặc app ngân hàng → quét mã → chuyển khoản.", and the line "Hỗ trợ tất cả ngân hàng Việt Nam". Remove `priority`; add `sizes="(max-width: 700px) 44vw, 200px"`.

- [ ] **Step 3: Add hero and shell CSS**

Key values:
- `.page { max-width: 1120px; margin-inline: auto; padding: 0 24px 96px; position: relative; z-index: 1; }`
- `.sky-hero { min-height: 88svh; display: flex; flex-direction: column; justify-content: center; padding: 40px 0 56px; }`
- `.hero-title { font-family: var(--font-display); font-size: clamp(2.6rem, 7vw, 5.5rem); line-height: 1.02; letter-spacing: -.04em; font-weight: 700; }` and `.hero-title em { font-family: var(--font-serif); font-style: italic; font-weight: 600; }`
- Gradient text only inside `@supports ((-webkit-background-clip: text) or (background-clip: text))`; base `color: var(--text-1)`. Animate `background-position` over 10s.
- Hero entrance: children of `.hero-copy` start at `opacity: 0; transform: translateY(18px)` and run `hero-in .8s var(--ease-out) forwards` with delays `0.05s / 0.14s / 0.23s / 0.32s`.
- `.btn--primary` gradient violet→cyan, pill, glow; `.btn--ghost` 1px border, transparent.
- `.wish-panel { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, .85fr); gap: 24px; scroll-margin-top: 32px; }` → `1fr` below 860px.
- `.support-card` and `.form-slot` are glass cards at ≥860px; `.support-card` is a regular card with padding 22px.
- `.qr-tile { background: #fff; border-radius: 12px; padding: 10px; }` — no glass, no gradient behind the QR.
- `.reveal { opacity: 0; transform: translateY(24px); transition: opacity .5s var(--ease-out), transform .5s var(--ease-out); transition-delay: var(--reveal-delay, 0ms); }` and `.reveal.is-visible { opacity: 1; transform: none; }`. Under reduced motion, `.reveal { opacity: 1; transform: none; transition: none; }`.
- `.skip-link` is off-screen until `:focus-visible`.

- [ ] **Step 4: Verify build and lint**

Run: `npm run build && npm run lint`
Expected: exit 0.

- [ ] **Step 5: Verify the shell**

At 1440×900 and 390×844: hero fits without clipping; both CTAs scroll to `#wish-form` and `#wish-wall`; the support card shows both QR tiles on pure white; no horizontal scroll. Screenshot both widths.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx app/globals.css app/components/Reveal.tsx
git commit -m "feat(ui): new sky hero, panel shell and support cards"
```

---

### Task 3: Wish wall, avatars, count-up

**Files:**
- Create: `app/lib/avatar.ts`
- Create: `app/lib/avatar.test.ts`
- Create: `app/components/CountUp.tsx`
- Modify: `app/components/MessageList.tsx`
- Modify: `app/page.tsx` (use `CountUp` in hero + wall)
- Modify: `app/globals.css` (append `.sky-wall`, `.wall-*`, `.wish-*`, `.wall-empty`)
- Modify: `tsconfig.json`, `package.json`

**Interfaces:**
- Consumes: `Reveal`, `#wish-wall`, `.wall-heading`.
- Produces: `getInitial(name: string): string`, `getAvatarColor(id: string): string`, `AVATAR_COLORS: string[]`; `CountUp({ value }: { value: number })`. Task 4 queries `.wish-card` and focuses `.wall-heading`.

- [ ] **Step 1: Enable TypeScript test imports and the test script**

In `tsconfig.json` add `"allowImportingTsExtensions": true` inside `compilerOptions`. In `package.json` add `"test": "node --test app/lib/*.test.ts"`.

- [ ] **Step 2: Write the failing avatar test**

`app/lib/avatar.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { AVATAR_COLORS, getAvatarColor, getInitial } from './avatar.ts'

test('empty and anonymous names get ?', () => {
  assert.equal(getInitial(''), '?')
  assert.equal(getInitial('   '), '?')
  assert.equal(getInitial('Ẩn danh'), '?')
})

test('uses first and last initials', () => {
  assert.equal(getInitial('Minh Hạnh'), 'MH')
  assert.equal(getInitial('Nguyễn Văn An'), 'NA')
})

test('single name uses one letter', () => {
  assert.equal(getInitial('An'), 'A')
})

test('avatar color is deterministic and from the palette', () => {
  assert.equal(getAvatarColor('abc'), getAvatarColor('abc'))
  assert.ok(AVATAR_COLORS.includes(getAvatarColor('abc')))
})
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npm test`
Expected: FAIL with `Cannot find module './avatar.ts'`.

- [ ] **Step 4: Implement `app/lib/avatar.ts`**

Move the existing logic out of `MessageList.tsx`:

```ts
export const AVATAR_COLORS = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626', '#9333ea', '#0891b2', '#65a30d']
export function getInitial(name: string): string { /* existing behavior */ }
export function getAvatarColor(id: string): string { /* existing hash behavior */ }
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test`
Expected: 4 tests pass.

- [ ] **Step 6: Create `app/components/CountUp.tsx`**

Client component, prop `{ value: number }`. Render `<span aria-hidden="true">{display}</span><span className="sr-only">{value}</span>`; start `display` at `0` so SSR and hydration match. In `useEffect`, if reduced motion, set `display` to `value`; otherwise animate with `requestAnimationFrame` over 1200ms using `1 - Math.pow(1 - p, 3)` and `Math.round(value * eased)`. Cancel on unmount.

- [ ] **Step 7: Rewrite `app/components/MessageList.tsx`**

Server component. Import the avatar helpers. Empty state:

```tsx
<div className="wall-empty">
  <span className="wall-empty-star" aria-hidden="true">✦</span>
  <p>Bầu trời đang chờ ngôi sao đầu tiên.</p>
</div>
```

List: `<ul className="wish-grid" aria-label="Danh sách lời nhắn">`; each `<li className="wish-card" style={{ '--i': Math.min(index, 5) } as React.CSSProperties}>` with `.wish-avatar`, `.wish-body`, `.wish-meta` (`<b className="wish-name">`, `<time className="wish-time">`), `.wish-text`. Keep `suppressHydrationWarning` on time.

- [ ] **Step 8: Use `CountUp` in `app/page.tsx`**

Replace the hero count and wall badge numbers with `<CountUp value={messages.length} />`, keeping the surrounding words.

- [ ] **Step 9: Add wall CSS**

- `.sky-wall { margin-top: clamp(64px, 9vw, 112px); scroll-margin-top: 24px; }`
- `.wall-head` flex baseline, `.wall-heading` `font-family: var(--font-display)`, `font-size: clamp(1.6rem, 3vw, 2.2rem)`.
- `.wish-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }` → 1 column below 860px.
- `.wish-card` glass card, `padding: 18px`, `border-radius: 20px`, `display: flex; gap: 14px; min-width: 0; overflow-wrap: anywhere;` and entrance `opacity: 0; transform: translateY(18px); transition ...; transition-delay: calc(var(--i) * 60ms)`; `.reveal.is-visible .wish-card { opacity: 1; transform: none; }`.
- `.wish-card.is-new` adds a violet border and a 2.4s glow animation.
- `.wish-text { overflow-wrap: anywhere; word-break: break-word; }`
- `.wall-empty` dashed border, centered, floating star animation (disabled under reduced motion).

- [ ] **Step 10: Verify the wall**

- Long text: in the browser at 390px, set the first `.wish-text` to `'a'.repeat(300)` via the console; the card must stay inside the viewport (`document.documentElement.scrollWidth === document.documentElement.clientWidth`).
- Anonymous: the unit test covers `''` and `'Ẩn danh'`.
- Empty state: temporarily change `getMessages()` to `return []`, screenshot, then revert with `git checkout app/lib/messages.ts`.
- Run `npm run build && npm run lint && npm test`; all pass.

- [ ] **Step 11: Commit**

```bash
git add app/lib/avatar.ts app/lib/avatar.test.ts app/components/CountUp.tsx app/components/MessageList.tsx app/page.tsx app/globals.css tsconfig.json package.json
git commit -m "feat(ui): star-card wish wall, avatars and count-up"
```

---

### Task 4: Wish form and success moment

**Files:**
- Modify: `app/actions.ts`
- Modify: `app/components/MessageForm.tsx`
- Modify: `app/globals.css` (append `.wish-form*`, `.wish-field*`, `.wish-success*`, `.wish-shoot`)

**Interfaces:**
- Consumes: `#wish-wall`, `.wish-card`, `.wall-heading` from Task 3; `ActionState` from `app/actions.ts`.
- Produces: success behavior; no exports.

- [ ] **Step 1: Add the success timestamp to `app/actions.ts`**

```ts
export interface ActionState {
  success: boolean
  error?: string
  at?: number
}
```

Return `{ success: true, at: Date.now() }` on success. Leave validation and save logic unchanged.

- [ ] **Step 2: Rewrite `app/components/MessageForm.tsx`**

Keep `useActionState(submitMessage, { success: false })`, `formRef`, and the reset-on-success effect. Add:

```tsx
const [length, setLength] = useState(0)
const [celebrate, setCelebrate] = useState(false)
```

On `state.at` change (and `state.success`), reset the form, set `length` to 0, set `celebrate` true, and clear it after 1800ms; return the cleanup.

Markup:
- Root `<div className="wish-form">`, `<h2 className="form-heading">Gửi lời nhắn</h2>`, `<p className="form-sub">Điều bạn đang mong sẽ thành một ngôi sao mới.</p>`.
- Fields use `.wish-field`, `.wish-label`, `.wish-input`, `.wish-textarea`; keep ids `name` and `message`, `maxLength={100}` and `{500}`, `required` on message.
- Counter: `<span className="wish-counter" data-near={length > 450}>{length}/500</span>` updated in `onChange`.
- Error: `.wish-error` with `role="alert"`.
- Success:
```tsx
{state.success && (
  <div className="wish-success">
    <span className="wish-success-star" aria-hidden="true">✦</span>
    <div>
      <b role="status">Ngôi sao của bạn đã lên trời.</b>
      <button type="button" className="wish-success-link" onClick={goToStar}>
        Xem ngôi sao của bạn ↓
      </button>
    </div>
  </div>
)}
{celebrate && <span className="wish-shoot" aria-hidden="true" />}
```
- Submit button `.wish-submit`, `disabled={pending}`, content spinner + "Đang gửi..." or "Thả sao lên trời ✦".
- `goToStar()`:
```tsx
const wall = document.getElementById('wish-wall')
const card = wall?.querySelector<HTMLElement>('.wish-card')
const heading = wall?.querySelector<HTMLElement>('.wall-heading')
heading?.focus({ preventScroll: true })
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'reduced'
wall?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
if (card) {
  card.classList.add('is-new')
  window.setTimeout(() => card.classList.remove('is-new'), 2400)
}
```

- [ ] **Step 3: Add form CSS**

- `.wish-form` is the glass card (`padding: clamp(20px, 3vw, 28px)`, `border-radius: var(--radius)`, `position: relative; overflow: hidden`).
- Labels `font-size: .875rem`, `font-weight: 600`; inputs `min-height: 44px`, `background: rgba(255,255,255,.05)`, border `1px solid var(--line)`, radius 12px, `font-size: 1rem` (16px on mobile) and focus ring `0 0 0 3px` violet.
- `.wish-counter` right-aligned, `font-size: .75rem`, color `--text-3`; `[data-near="true"]` turns rose.
- `.wish-submit` full width, pill-ish 14px radius, gradient violet→cyan, glow, `disabled` opacity .6.
- `.wish-success` violet-tinted panel with a sparkle; `.wish-success-link` underline, min 44px tap target.
- `.wish-shoot` is an absolutely positioned 120px gradient streak that runs once across the card in 1.1s (`@keyframes` from `translateX(-120%)` to `translateX(420%)`, opacity 0→1→0).
- Under reduced motion, hide `.wish-shoot`, remove transitions, keep the success panel.

- [ ] **Step 4: Verify build, lint and tests**

Run: `npm run build && npm run lint && npm test`
Expected: all pass.

- [ ] **Step 5: Verify form states without touching the database**

- Pending/double-submit: inspect that the button renders `disabled={pending}` and the form has exactly one `action={formAction}`. Do not submit.
- Success UI: temporarily set the `useActionState` initial state to `{ success: true, at: 0 }`, screenshot the success panel and shooting star, then restore `{ success: false }`.
- Keyboard: Tab reaches name, message, submit; focus ring is visible.
- Card overflow: the counter and labels do not cause horizontal scroll at 390px.

- [ ] **Step 6: Commit**

```bash
git add app/actions.ts app/components/MessageForm.tsx app/globals.css
git commit -m "feat(ui): redesign wish form with star-born success moment"
```

---

### Task 5: Theme panel, motion switch, background guard

**Files:**
- Create: `app/lib/resolve-custom-bg.ts`
- Create: `app/lib/resolve-custom-bg.test.ts`
- Modify: `app/components/ThemeProvider.tsx`
- Modify: `app/components/ThemeControls.tsx`
- Modify: `app/layout.tsx` (anti-FOUC script)
- Modify: `app/globals.css` (append `.theme-*`, `.switch`)

**Interfaces:**
- Consumes: tokens, `--custom-bg` usage from Task 1.
- Produces: `resolveCustomBg(theme: 'dark' | 'light', color: string): string`; `ThemeContextValue` gains `reduceMotion: boolean` and `setReduceMotion: (v: boolean) => void`.

- [ ] **Step 1: Write the failing background test**

`app/lib/resolve-custom-bg.test.ts`:

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resolveCustomBg } from './resolve-custom-bg.ts'

test('keeps near-black presets in dark theme', () => {
  assert.equal(resolveCustomBg('dark', '#07070f'), '#07070f')
})

test('mutes white toward the dark base', () => {
  assert.equal(resolveCustomBg('dark', '#ffffff'), '#22232a')
})

test('keeps light presets in light theme', () => {
  assert.equal(resolveCustomBg('light', '#f5f4ff'), '#f5f4ff')
})

test('mutes black toward the light base', () => {
  assert.equal(resolveCustomBg('light', '#000000'), '#d8d4e0')
})

test('leaves invalid colors untouched', () => {
  assert.equal(resolveCustomBg('dark', 'not-a-color'), 'not-a-color')
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test`
Expected: FAIL with `Cannot find module './resolve-custom-bg.ts'`.

- [ ] **Step 3: Implement `app/lib/resolve-custom-bg.ts`**

- Parse `#rgb` and `#rrggbb`; return the input unchanged if invalid.
- Relative luminance with the sRGB gamma formula (`0.2126R + 0.7152G + 0.0722B`).
- Safe bands: dark `L <= 0.03`, light `L >= 0.86`; inside the band return the input lowercased.
- Outside the band mix 12% of the chosen color with 88% of the theme base (`dark: #04050d`, `light: #f6f1ff`), `Math.round` each channel, output lowercase `#rrggbb`.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test`
Expected: 9 tests pass (4 avatar + 5 background).

- [ ] **Step 5: Extend `ThemeProvider.tsx`**

Add `reduceMotion` state, default `false`, plus a `motionLoaded` boolean state. On mount read `localStorage.getItem('reduceMotion')`; if the key is absent use `matchMedia('(prefers-reduced-motion: reduce)').matches`; set both `reduceMotion` and `motionLoaded`. Only after `motionLoaded` is true, apply `document.documentElement.dataset.motion = reduceMotion ? 'reduced' : 'off'` and persist `'true'` / `'false'` — this avoids overwriting the pre-paint value set by the inline script. Expose both value and setter.

Apply the custom background through `resolveCustomBg(theme, customBg)` when non-empty; keep storing the raw color in localStorage under `customBg`.

- [ ] **Step 6: Update the anti-FOUC script in `app/layout.tsx`**

Add before the theme attribute is set:

```js
var m = localStorage.getItem('reduceMotion');
var reduce = m === 'true' || (m === null && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
document.documentElement.setAttribute('data-motion', reduce ? 'reduced' : 'off');
```

Keep the existing theme/customBg lines.

- [ ] **Step 7: Rewrite `ThemeControls.tsx` UI**

Keep outside-click and Escape closing, `aria-expanded`, and `aria-haspopup="dialog"`. New classes: `.theme-root`, `.theme-fab`, `.theme-panel`, `.theme-head`, `.theme-close`, `.theme-section`, `.theme-label`, `.theme-modes`, `.theme-mode`, `.theme-swatches`, `.theme-swatch`, `.theme-reset`, `.theme-custom`, `.theme-motion`, `.switch`. Keep the six dark and six light presets, updating the arrays to `#04050d, #020d1f, #030f07, #140206, #0a0905, #060614` and `#f6f1ff, #ffffff, #eef4ff, #eefff6, #fff9ee, #ffeef4`. Add a `role="switch"` row labelled "Giảm chuyển động" bound to `reduceMotion`.

- [ ] **Step 8: Add theme panel CSS**

Glass panel, 280px wide, anchored bottom-right, 20px radius, `transform-origin: bottom right`, open/close 220ms scale+fade. FAB is a 48px glowing orb with `✦`. Swatches 24px circles with a selected ring. The switch is 40×22px, violet when on. All controls ≥44px tap targets on mobile.

- [ ] **Step 9: Verify**

- `npm run build && npm run lint && npm test`.
- Open the panel at 390px: it fits the viewport, closes on Escape and outside click.
- Toggle "Giảm chuyển động": aurora, stars, shooting star, reveal, and counter stop; toggling back restores them.
- Pick white in dark mode: the effective background is the muted `#22232a`, and `--text-2` remains readable.

- [ ] **Step 10: Commit**

```bash
git add app/lib/resolve-custom-bg.ts app/lib/resolve-custom-bg.test.ts app/components/ThemeProvider.tsx app/components/ThemeControls.tsx app/layout.tsx app/globals.css
git commit -m "feat(ui): restyle theme panel with motion switch and bg guard"
```

---

### Task 6: Accessibility, cleanup, final verification

**Files:**
- Modify: `app/globals.css` (remove dead legacy rules; add focus/reduced-motion/skip-link styles)
- Modify: `app/page.tsx` only if the skip link or footer needs an a11y fix.

**Interfaces:**
- Consumes: everything above.
- Produces: the shippable page.

- [ ] **Step 1: Delete legacy CSS**

Remove the old selectors that no component references anymore: `.main-layout`, `.hero`, `.hero-glow`, `.hero-emoji`, `.hero-title`, `.hero-subtitle`, `.content-grid`, `.qr-section`, `.qr-pair`, `.qr-card`, `.qr-image-wrapper`, `.qr-image`, `.qr-method-*`, `.qr-hint`, `.qr-badge`, `.form-section`, `.form-card`, `.form-title`, `.form-subtitle`, `.message-form`, `.field-*`, `.form-error`, `.form-success`, `.submit-btn`, `.spinner`, `.wall-section`, `.wall-title`, `.wall-count`, `.message-*`, `.empty-*`, all `[data-theme="light"]` overrides for those, and every `.tc-*` rule. Remove the compatibility alias tokens added in Task 1 only after confirming no remaining rule uses `--bg`, `--bg-2`, `--bg-card`, `--border`, `--field-bg`, `--purple`, `--blue`, `--teal`, or `--transition`.

Check first: `grep -rn "form-card\|message-item\|wall-title\|tc-panel\|qr-card\|hero-title" app --include='*.tsx'` → no matches. Then delete.

- [ ] **Step 2: Add the focus and reduced-motion layer**

```css
:where(a, button, input, textarea, [tabindex]):focus-visible {
  outline: 2px solid var(--cyan);
  outline-offset: 3px;
  border-radius: 6px;
}
[data-motion="reduced"] .sky-aurora,
[data-motion="reduced"] .sky-stars,
[data-motion="reduced"] .sky-shoot,
[data-motion="reduced"] .sky-cursor,
[data-motion="reduced"] .wish-shoot,
[data-motion="reduced"] .wall-empty-star { animation: none !important; }
[data-motion="reduced"] *,
[data-motion="reduced"] *::before,
[data-motion="reduced"] *::after {
  animation-duration: .001ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: .001ms !important;
  transition-delay: 0ms !important;
}
```

The inline script already maps the OS `prefers-reduced-motion` setting to `data-motion="reduced"` when the visitor has never chosen, so no separate media-query block is needed — and an explicit "off" can override the OS setting, as the switch promises.

Keep hover color changes; drop only movement.

- [ ] **Step 3: Verify keyboard and screen-reader paths**

- Tab from the top: skip link appears first, then brand/count, hero CTAs, form fields, submit, QR labels, wall links, theme FAB, panel controls, success link. Every stop has a visible ring.
- `Escape` closes the theme panel and returns focus to the FAB.
- `aria-live`/`role` checks: error is `alert`, success is `status`.
- With `document.documentElement.dataset.motion = 'reduced'`, take a screenshot: no aurora motion (static gradient is fine), no shooting star, no cursor glow.

- [ ] **Step 4: Final visual verification**

Screenshots at 1440×900 and 390×844, dark and light, plus the wall below the fold. Check:
- Hero does not clip; gradient text is readable in both themes.
- QR tiles are pure white and scannable (scan with a phone if available).
- Wall cards align in two columns on desktop, one on mobile; no overflow.
- Footer and theme FAB do not overlap content.

- [ ] **Step 5: Run the full gate**

```bash
npm run build
npm run lint
npm test
```

Expected: all exit 0; 9 tests pass.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore(ui): remove legacy styles, add focus and reduced-motion layer"
```

---

## Self-review notes

- Spec §4 tokens → Task 1; §5.1 hero → Task 2; §5.2 form/QR → Tasks 2 and 4; §5.3 wall → Task 3; §5.5 theme panel → Task 5; §6 motion → Tasks 1–5; §7 a11y → Task 6; §8 performance constraints → Global Constraints + Tasks 1 and 6.
- Custom background uses an 88% mix toward the theme base instead of a separate overlay; it realizes the spec's scrim while keeping one CSS variable and is pinned by tests.
- Dark `text-3` was raised to `#8f92b5` and light `text-3` to `#55526e` so the 88% mix still clears 4.5:1 on extreme custom backgrounds.
