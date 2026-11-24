import { test } from 'node:test'
import assert from 'node:assert/strict'
import { drawFlash, type FlashCanvas } from './firework-flash.ts'

function fakeCanvas() {
  const fills: Array<{ alpha: number; style: string }> = []
  const ctx = {
    globalAlpha: 1,
    fillStyle: '#000000' as string | CanvasGradient,
    createRadialGradient() {
      return { addColorStop() {} } as unknown as CanvasGradient
    },
    beginPath() {},
    arc() {},
    fill() {
      fills.push({ alpha: ctx.globalAlpha, style: String(ctx.fillStyle) })
    },
  }
  return { ctx: ctx as unknown as FlashCanvas, fills }
}

const flash = {
  x: 10,
  y: 20,
  t: 0.1,
  ttl: 0.5,
  rgb: [124, 58, 237] as [number, number, number],
  radius: 80,
}

test('flash resets alpha left over by a previous flash', () => {
  const { ctx, fills } = fakeCanvas()
  ctx.globalAlpha = 0.3
  drawFlash(ctx, flash, 0.2, false)
  assert.equal(fills[0]?.alpha, 1)
})

test('flash core is tinted rather than white in the light theme', () => {
  const { ctx, fills } = fakeCanvas()
  drawFlash(ctx, flash, 0.2, true)
  assert.match(fills[1]?.style ?? '', /^rgba\(124,58,237,/)
})
