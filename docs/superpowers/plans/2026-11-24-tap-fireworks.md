# Tap Fireworks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mỗi cú chạm/click trên trang bắn 140 tia pháo hoa tại điểm chạm kèm một vệt sao băng, không kích hoạt khi người dùng kéo để cuộn.

**Architecture:** Một client component gắn `<canvas>` phủ toàn trang (`pointer-events: none`) và vẽ particle bằng 2D context trong một vòng `requestAnimationFrame` tự dừng. Một hàm thuần tách riêng quyết định một cặp pointer-down/up có phải là "chạm" hay không, để test bằng `node --test`.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Canvas 2D, `node:test`. Không thêm dependency.

**Spec:** `docs/superpowers/specs/2026-11-24-tap-fireworks-design.md`

## Global Constraints

- Mỗi lần chạm: **140 tia**, giữ nguyên trên mobile; 1 vệt sao băng delay 60ms.
- Chạm hợp lệ: `pointerup` cách `pointerdown` **≤ 12px** và **≤ 800ms**.
- Trần **1.400 hạt**; `devicePixelRatio` tối đa **2**; rAF tự dừng khi hết hạt.
- Canvas: `position: fixed; inset: 0; z-index: 60; pointer-events: none; aria-hidden="true"`.
- `[data-motion="reduced"]` hoặc `reduceMotion` = true → không vẽ, xoá canvas nếu đang có hạt.
- Không `preventDefault`; không đổi link/nút/form/QR; không thêm dependency; không sửa DB.
- Màu lấy đúng palette của app; theme sáng dùng blend `source-over`, theme tối dùng `lighter`.

## Review Focus

- Chạm hai ngón / pinch-zoom: không được bắn pháo hoa, và không được nuốt gesture của trình duyệt.
- Kéo để cuộn (kể cả cú kéo ngắn trên mobile): không bắn; trang vẫn cuộn bình thường.
- Bật giảm chuyển động giữa lúc hạt đang bay: canvas phải sạch ngay, không còn frame nào vẽ tiếp.
- Theme sáng: tia phải đọc được trên nền sáng, không biến thành vệt trắng nhoè.
- Chạm dồn dập: không vượt trần hạt, không mở nhiều vòng rAF, không tụt fps.

---

### Task 1: Tap gesture predicate

**Files:**
- Create: `app/lib/tap-gesture.ts`
- Test: `app/lib/tap-gesture.test.ts`

**Interfaces:**
- Produces:
  - `export const TAP_MAX_DISTANCE = 12`
  - `export const TAP_MAX_DURATION = 800`
  - `export interface TapPoint { x: number; y: number; at: number }`
  - `export function isTapGesture(start: TapPoint, end: TapPoint): boolean`

- [ ] **Step 1: Write the failing test**

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isTapGesture } from './tap-gesture.ts'

const at = (x: number, y: number, time: number) => ({ x, y, at: time })

test('accepts a short press that barely moves', () => {
  assert.equal(isTapGesture(at(100, 100, 0), at(105, 104, 120)), true)
})

test('accepts exactly the distance and duration limits', () => {
  assert.equal(isTapGesture(at(0, 0, 0), at(0, 12, 800)), true)
})

test('rejects a pointer that moved past 12px', () => {
  assert.equal(isTapGesture(at(0, 0, 0), at(13, 0, 200)), false)
})

test('rejects a press longer than 800ms', () => {
  assert.equal(isTapGesture(at(0, 0, 0), at(4, 4, 801)), false)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot find module `./tap-gesture.ts`.

- [ ] **Step 3: Implement `app/lib/tap-gesture.ts`**

Use `Math.hypot` for the distance; both limits are inclusive (`<=`).

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS, 4 new tests plus the existing suite.

- [ ] **Step 5: Commit**

```bash
git add app/lib/tap-gesture.ts app/lib/tap-gesture.test.ts
git commit -m "feat(ui): add tap gesture predicate"
```

---

### Task 2: Canvas overlay and mount

**Files:**
- Create: `app/components/TapFireworks.tsx`
- Modify: `app/layout.tsx` (import + render after `<SkyBackdrop />`)
- Modify: `app/globals.css` (new `.tap-fx` rule near the meteor shower section)
- Test: manual browser checklist below (no unit test — DOM canvas)

**Interfaces:**
- Consumes: `isTapGesture`, `TapPoint` from `app/lib/tap-gesture.ts`.
- Produces: `export default function TapFireworks(): React.JSX.Element` (no props).

**Behavior the implementer must ship**

- Component is `'use client'`, renders exactly `<canvas ref={canvasRef} className="tap-fx" aria-hidden="true" />`, and keeps particles in refs/closures — **no React state per particle**.
- `useTheme().reduceMotion` plus `document.documentElement.dataset.motion === 'reduced'` gate the effect. Read the dataset at mount to decide whether to attach listeners, and check it again in `fire()` so the anti-FOUC reduced state is never missed. When reduced becomes true, the effect cleanup cancels rAF, removes listeners and calls `clearRect`.
- Sizing: `canvas.width = innerWidth * dpr`, `canvas.height = innerHeight * dpr`, `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)`, `dpr = Math.min(devicePixelRatio || 1, 2)`. Recompute on `resize`.
- Every `fire(x, y)` spawns 140 particles in three groups:
  - 70% main: speed 140–430 px/s (×0.92 below 700px), size 1.5–2.8, life 1.0–1.6s, drag 1.15, gravity 230, 50% glow, 9% four-point sparkle.
  - 16% embers: speed 30–120, size 2.8–4.0, life 0.65–1.1s, drag 2.2, gravity 90, always glow.
  - 14% fast: speed 400–580, size 0.9–1.5, life 0.45–0.8s, drag 0.85, gravity 260.
  - Plus one flash: radius 70–102, life 0.42–0.58s, white core in the first 45% of its life.
  - Plus one meteor after 60ms: angle 24–46°, speed 620–880, tail 90–175px, width 1.5–2.7, life 0.72–1.0s; spawn dust while it flies.
- Rendering: `ctx.lineCap = 'round'`; spark trail drawn from `(x - vx * 0.085, y - vy * 0.085)` to `(x, y)`; alpha `(life / ttl) ** 0.62`; white head while life ratio > 0.3; global composite `lighter` on dark, `source-over` on light.
- Palettes — dark: `['#c4b5fd','#a78bfa','#ffffff']`, `['#67e8f9','#a5f3fc','#ffffff']`, `['#f9a8d4','#fbcfe8','#ffffff']`, `['#fde68a','#fcd34d','#ffffff']`, `['#a78bfa','#67e8f9','#ffffff']`, `['#7c5cff','#c4b5fd','#ffffff']`; light: `['#7c3aed','#6d28d9','#4c1d95']`, `['#0e7490','#0891b2','#1e3a8a']`, `['#db2777','#be185d','#7c3aed']`, `['#b45309','#d97706','#7c3aed']`, `['#4c1d95','#0e7490','#db2777']`, `['#6d28d9','#0891b2','#be185d']`.
- Pointer rules: track only primary pointer; ignore non-left mouse buttons; `pointermove` beyond `TAP_MAX_DISTANCE` or any `pointercancel`, `scroll`, second `touchstart` or `dragstart` cancels; on `pointerup` call `isTapGesture(start, end)` before firing at `clientX/clientY`. Listeners are passive where possible and all removed on cleanup.
- Particle cap: skip appending new particles when `sparks.length >= 1400`. Start rAF only if not already running; in the loop, schedule the next frame only while sparks/flashes/meteors remain, otherwise clear and stop.
- CSS:

```css
.tap-fx {
  position: fixed;
  inset: 0;
  z-index: 60;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
```

- [ ] **Step 1: Create `app/components/TapFireworks.tsx` with the behavior above**

- [ ] **Step 2: Mount it in `app/layout.tsx`**

Import it beside `SkyBackdrop` and render `<TapFireworks />` immediately after `<SkyBackdrop />` inside `ThemeProvider`.

- [ ] **Step 3: Add the `.tap-fx` rule to `app/globals.css`**

Put it in the meteor-shower section so the decorative overlays stay together.

- [ ] **Step 4: Run static checks**

Run: `npm test && npm run lint && npm run build`
Expected: tests pass, lint clean, production build succeeds.

- [ ] **Step 5: Verify in the browser**

Run `npm run dev`, open `http://localhost:3000`, then at 1440px wide and at 390px wide:

- Click hero text, a button, and a QR image → burst + meteor at the click point.
- Drag to scroll → no burst; the page still scrolls.
- On touch emulation: quick tap → burst; two fingers / pinch → no burst; press and hold 1s → no burst.
- Enable "giảm chuyển động" while particles are mid-air → canvas goes blank immediately; taps do nothing.
- Switch to light theme → burst still visible with darker violet/teal strokes.
- Tap 10 times quickly → no console errors, animation stays smooth, and it stops by itself when particles die.
- Open a wish modal, tap inside → modal works; canvas stays below the modal (z-index 60 < 10000).

- [ ] **Step 6: Commit**

```bash
git add app/components/TapFireworks.tsx app/layout.tsx app/globals.css
git commit -m "feat(ui): tap fireworks and shooting star overlay"
```
