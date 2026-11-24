import { flashCoreColor } from './firework-color.ts'

export interface Flash {
  x: number
  y: number
  t: number
  ttl: number
  rgb: [number, number, number]
  radius: number
}

/** The slice of CanvasRenderingContext2D that drawing one flash needs. */
export interface FlashCanvas {
  globalAlpha: number
  fillStyle: string | CanvasGradient | CanvasPattern
  createRadialGradient(
    x0: number,
    y0: number,
    r0: number,
    x1: number,
    y1: number,
    r1: number
  ): CanvasGradient
  beginPath(): void
  arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number
  ): void
  fill(): void
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

function rgba(rgb: [number, number, number], alpha: number) {
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`
}

/**
 * Draws the soft bloom and the fast white core of one burst. Alpha is reset
 * first: overlapping bursts share the context, and a leftover alpha from the
 * previous flash would dim older bursts unevenly.
 */
export function drawFlash(
  ctx: FlashCanvas,
  flash: Flash,
  progress: number,
  light: boolean
): void {
  ctx.globalAlpha = 1

  const radius = flash.radius * (0.35 + easeOutCubic(progress) * 0.8)
  const alpha = Math.pow(1 - progress, 1.8)
  const glow = ctx.createRadialGradient(
    flash.x,
    flash.y,
    0,
    flash.x,
    flash.y,
    radius
  )
  glow.addColorStop(0, rgba(flash.rgb, 0.38 * alpha))
  glow.addColorStop(0.32, rgba(flash.rgb, 0.18 * alpha))
  glow.addColorStop(1, rgba(flash.rgb, 0))
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(flash.x, flash.y, radius, 0, Math.PI * 2)
  ctx.fill()

  if (progress < 0.45) {
    ctx.globalAlpha = (1 - progress / 0.45) * 0.85
    ctx.fillStyle = flashCoreColor(flash.rgb, light)
    ctx.beginPath()
    ctx.arc(
      flash.x,
      flash.y,
      10 * (1 - progress / 0.45) + 1.5,
      0,
      Math.PI * 2
    )
    ctx.fill()
  }
}
