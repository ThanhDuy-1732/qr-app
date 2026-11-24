'use client'

import { useEffect, useRef } from 'react'
import { isTapGesture, TAP_MAX_DISTANCE } from '@/app/lib/tap-gesture'
import { sparkColor, sparkHeadColor } from '@/app/lib/firework-color'
import { drawFlash, type Flash } from '@/app/lib/firework-flash'
import { useTheme } from './ThemeProvider'

const TAP_COUNT = 140
const MAX_SPARKS = 1400
const MAX_DPR = 2

const DARK_PALETTES: readonly (readonly string[])[] = [
  ['#c4b5fd', '#a78bfa', '#ffffff'],
  ['#67e8f9', '#a5f3fc', '#ffffff'],
  ['#f9a8d4', '#fbcfe8', '#ffffff'],
  ['#fde68a', '#fcd34d', '#ffffff'],
  ['#a78bfa', '#67e8f9', '#ffffff'],
  ['#7c5cff', '#c4b5fd', '#ffffff'],
]

const LIGHT_PALETTES: readonly (readonly string[])[] = [
  ['#7c3aed', '#6d28d9', '#4c1d95'],
  ['#0e7490', '#0891b2', '#1e3a8a'],
  ['#db2777', '#be185d', '#7c3aed'],
  ['#b45309', '#d97706', '#7c3aed'],
  ['#4c1d95', '#0e7490', '#db2777'],
  ['#6d28d9', '#0891b2', '#be185d'],
]

interface Spark {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  drag: number
  gravity: number
  life: number
  ttl: number
  glow: boolean
  crackle: boolean
  sparkle: boolean
}

interface Meteor {
  x: number
  y: number
  vx: number
  vy: number
  len: number
  width: number
  t: number
  ttl: number
  rgb: [number, number, number]
  color: string
  dustAt: number
}

interface TapStart {
  id: number
  x: number
  y: number
  at: number
  moved: boolean
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function hexToRgb(hex: string): [number, number, number] {
  const value = parseInt(hex.slice(1), 16)
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
}

function rgba(rgb: [number, number, number], alpha: number) {
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`
}

function isLightTheme() {
  return document.documentElement.dataset.theme === 'light'
}

/**
 * Decorative overlay: every real tap sparks a firework at the pointer and
 * launches one shooting star. Scrolls, drags and long presses never fire.
 * Purely visual, so it never captures the pointer and skips reduced motion.
 */
export default function TapFireworks() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { reduceMotion } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const drawing = ctx
    const element = canvas

    const sparks: Spark[] = []
    const flashes: Flash[] = []
    const meteors: Meteor[] = []

    let width = 0
    let height = 0
    let dpr = 1
    let raf = 0
    let last = 0
    let tap: TapStart | null = null

    const reducedNow = () =>
      reduceMotion || document.documentElement.dataset.motion === 'reduced'

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      width = window.innerWidth
      height = window.innerHeight
      element.width = Math.round(width * dpr)
      element.height = Math.round(height * dpr)
      drawing.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function palette() {
      const list = isLightTheme() ? LIGHT_PALETTES : DARK_PALETTES
      return list[Math.floor(Math.random() * list.length)]
    }

    function spawnBurst(x: number, y: number) {
      const colors = palette()
      flashes.push({
        x,
        y,
        t: 0,
        ttl: rand(0.42, 0.58),
        rgb: hexToRgb(colors[0]),
        radius: rand(70, 102),
      })

      const speedScale = width < 700 ? 0.92 : 1
      const light = isLightTheme()

      for (let i = 0; i < TAP_COUNT; i++) {
        if (sparks.length >= MAX_SPARKS) break

        const roll = Math.random()
        const color = sparkColor(colors, light, Math.random(), Math.random())
        const angle = Math.random() * Math.PI * 2
        const spark: Spark = {
          x: x + rand(-2.5, 2.5),
          y: y + rand(-2.5, 2.5),
          vx: 0,
          vy: 0,
          color,
          size: 1.6,
          drag: 1.15,
          gravity: 230,
          life: 1,
          ttl: 1,
          glow: true,
          crackle: false,
          sparkle: false,
        }

        if (roll < 0.7) {
          const speed = rand(140, 430) * speedScale
          spark.vx = Math.cos(angle) * speed
          spark.vy = Math.sin(angle) * speed
          spark.size = rand(1.5, 2.8)
          spark.ttl = rand(1.0, 1.6)
          spark.glow = Math.random() < 0.5
          spark.sparkle = Math.random() < 0.09
        } else if (roll < 0.86) {
          const speed = rand(30, 120)
          spark.vx = Math.cos(angle) * speed
          spark.vy = Math.sin(angle) * speed
          spark.size = rand(2.8, 4.0)
          spark.ttl = rand(0.65, 1.1)
          spark.drag = 2.2
          spark.gravity = 90
        } else {
          const speed = rand(400, 580)
          spark.vx = Math.cos(angle) * speed
          spark.vy = Math.sin(angle) * speed
          spark.size = rand(0.9, 1.5)
          spark.ttl = rand(0.45, 0.8)
          spark.drag = 0.85
          spark.gravity = 260
          spark.crackle = Math.random() < 0.5
        }

        spark.life = spark.ttl
        sparks.push(spark)
      }
    }

    function spawnMeteor(x: number, y: number, delay: number) {
      const angle = (rand(24, 46) * Math.PI) / 180
      const speed = rand(620, 880)
      const color = isLightTheme() ? '#6d28d9' : '#c4b5fd'
      meteors.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        len: rand(90, 175),
        width: rand(1.5, 2.7),
        t: -delay,
        ttl: rand(0.72, 1.0),
        rgb: hexToRgb(color),
        color,
        dustAt: 0,
      })
    }

    function spawnDust(x: number, y: number, color: string) {
      if (sparks.length >= MAX_SPARKS) return
      const angle = Math.random() * Math.PI * 2
      const speed = rand(6, 40)
      const ttl = rand(0.25, 0.6)
      sparks.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: rand(0.7, 1.5),
        drag: 2,
        gravity: 40,
        life: ttl,
        ttl,
        glow: false,
        crackle: true,
        sparkle: false,
      })
    }

    function fire(x: number, y: number) {
      if (reducedNow()) return
      spawnBurst(x, y)
      spawnMeteor(x, y, 0.06)
      start()
    }

    function loop(now: number) {
      if (!last) last = now
      const dt = Math.min(now - last, 48) / 1000
      last = now

      drawing.clearRect(0, 0, width, height)
      drawing.globalAlpha = 1
      const light = isLightTheme()
      drawing.globalCompositeOperation = light ? 'source-over' : 'lighter'
      drawing.lineCap = 'round'

      for (let f = flashes.length - 1; f >= 0; f--) {
        const flash = flashes[f]
        flash.t += dt
        const progress = flash.t / flash.ttl
        if (progress >= 1) {
          flashes.splice(f, 1)
          continue
        }

        drawFlash(drawing, flash, progress, light)
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const spark = sparks[i]
        spark.life -= dt
        if (spark.life <= 0) {
          sparks.splice(i, 1)
          continue
        }

        const damp = Math.exp(-spark.drag * dt)
        spark.vx *= damp
        spark.vy = spark.vy * damp + spark.gravity * dt
        spark.x += spark.vx * dt
        spark.y += spark.vy * dt

        const lifeRatio = spark.life / spark.ttl
        let alpha = Math.pow(lifeRatio, 0.62)
        if (spark.crackle) alpha *= 0.65 + Math.random() * 0.35
        const size = Math.max(0.5, spark.size * (0.5 + lifeRatio * 0.6))
        const tailX = spark.x - spark.vx * 0.085
        const tailY = spark.y - spark.vy * 0.085

        if (spark.glow) {
          drawing.globalAlpha = alpha * 0.18
          drawing.strokeStyle = spark.color
          drawing.lineWidth = size * 3.6
          drawing.beginPath()
          drawing.moveTo(tailX, tailY)
          drawing.lineTo(spark.x, spark.y)
          drawing.stroke()
        }

        drawing.globalAlpha = alpha
        drawing.strokeStyle = spark.color
        drawing.lineWidth = size
        drawing.beginPath()
        drawing.moveTo(tailX, tailY)
        drawing.lineTo(spark.x, spark.y)
        drawing.stroke()

        if (spark.sparkle && lifeRatio > 0.35) {
          const reach = size * 2.6
          drawing.globalAlpha = alpha * 0.75
          drawing.lineWidth = 1
          drawing.beginPath()
          drawing.moveTo(spark.x - reach, spark.y)
          drawing.lineTo(spark.x + reach, spark.y)
          drawing.moveTo(spark.x, spark.y - reach)
          drawing.lineTo(spark.x, spark.y + reach)
          drawing.stroke()
        }

        if (lifeRatio > 0.3) {
          drawing.globalAlpha = alpha * 0.9
          drawing.fillStyle = sparkHeadColor(spark.color, light)
          drawing.beginPath()
          drawing.arc(spark.x, spark.y, Math.max(0.7, size * 0.55), 0, Math.PI * 2)
          drawing.fill()
        }
      }

      for (let m = meteors.length - 1; m >= 0; m--) {
        const meteor = meteors[m]
        meteor.t += dt
        if (meteor.t < 0) continue
        if (meteor.t >= meteor.ttl) {
          meteors.splice(m, 1)
          continue
        }

        meteor.x += meteor.vx * dt
        meteor.y += meteor.vy * dt

        const progress = meteor.t / meteor.ttl
        const alpha =
          progress < 0.12
            ? progress / 0.12
            : Math.pow(1 - (progress - 0.12) / 0.88, 1.1)
        const speed = Math.hypot(meteor.vx, meteor.vy)
        const dirX = meteor.vx / speed
        const dirY = meteor.vy / speed
        const tail = meteor.len * (0.55 + alpha * 0.45)
        const tailX = meteor.x - dirX * tail
        const tailY = meteor.y - dirY * tail

        const tailGradient = drawing.createLinearGradient(
          tailX,
          tailY,
          meteor.x,
          meteor.y
        )
        tailGradient.addColorStop(0, rgba(meteor.rgb, 0))
        tailGradient.addColorStop(0.55, rgba(meteor.rgb, 0.55 * alpha))
        tailGradient.addColorStop(1, rgba(meteor.rgb, 0.95 * alpha))

        drawing.globalAlpha = 1
        drawing.strokeStyle = tailGradient
        drawing.lineWidth = meteor.width
        drawing.beginPath()
        drawing.moveTo(tailX, tailY)
        drawing.lineTo(meteor.x, meteor.y)
        drawing.stroke()

        const head = drawing.createRadialGradient(
          meteor.x,
          meteor.y,
          0,
          meteor.x,
          meteor.y,
          12
        )
        head.addColorStop(0, `rgba(255,255,255,${0.95 * alpha})`)
        head.addColorStop(0.25, rgba(meteor.rgb, 0.8 * alpha))
        head.addColorStop(1, rgba(meteor.rgb, 0))
        drawing.fillStyle = head
        drawing.beginPath()
        drawing.arc(meteor.x, meteor.y, 12, 0, Math.PI * 2)
        drawing.fill()

        if (meteor.t - meteor.dustAt > 0.04) {
          meteor.dustAt = meteor.t
          spawnDust(
            meteor.x - dirX * tail * 0.5,
            meteor.y - dirY * tail * 0.5,
            meteor.color
          )
        }
      }

      drawing.globalAlpha = 1
      drawing.globalCompositeOperation = 'source-over'

      if (sparks.length || flashes.length || meteors.length) {
        raf = requestAnimationFrame(loop)
      } else {
        raf = 0
        last = 0
      }
    }

    function start() {
      if (!raf) {
        last = 0
        raf = requestAnimationFrame(loop)
      }
    }

    function cancelTap() {
      tap = null
    }

    function onPointerDown(event: PointerEvent) {
      if (event.pointerType === 'mouse' && event.button !== 0) return
      if (event.pointerType === 'touch' && !event.isPrimary) {
        cancelTap()
        return
      }
      tap = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        at: performance.now(),
        moved: false,
      }
    }

    function onPointerMove(event: PointerEvent) {
      if (!tap || event.pointerId !== tap.id) return
      if (
        Math.abs(event.clientX - tap.x) > TAP_MAX_DISTANCE ||
        Math.abs(event.clientY - tap.y) > TAP_MAX_DISTANCE
      ) {
        tap.moved = true
      }
    }

    function onPointerUp(event: PointerEvent) {
      if (!tap || event.pointerId !== tap.id) return
      const start = tap
      tap = null
      if (start.moved) return

      const moved = isTapGesture(
        { x: start.x, y: start.y, at: start.at },
        { x: event.clientX, y: event.clientY, at: performance.now() }
      )
      if (moved) fire(event.clientX, event.clientY)
    }

    function onTouchStart(event: TouchEvent) {
      if (event.touches.length > 1) cancelTap()
    }

    resize()
    window.addEventListener('resize', resize, { passive: true })
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerup', onPointerUp, { passive: true })
    window.addEventListener('pointercancel', cancelTap, { passive: true })
    window.addEventListener('scroll', cancelTap, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('dragstart', cancelTap, { passive: true })

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', cancelTap)
      window.removeEventListener('scroll', cancelTap)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('dragstart', cancelTap)
      if (raf) cancelAnimationFrame(raf)
      drawing.clearRect(0, 0, width, height)
    }
  }, [reduceMotion])

  return <canvas ref={canvasRef} className="tap-fx" aria-hidden="true" />
}
