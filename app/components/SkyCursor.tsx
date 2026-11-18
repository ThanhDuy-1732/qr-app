'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from './ThemeProvider'

/**
 * Soft violet glow that trails the pointer on devices with a fine pointer.
 * It appears only after the first pointer move, and stops completely when the
 * motion switch (or the OS preference) asks for reduced motion.
 */
export default function SkyCursor() {
  const ref = useRef<HTMLDivElement>(null)
  const { reduceMotion } = useTheme()

  useEffect(() => {
    const el = ref.current
    if (!el) return

    el.classList.remove('is-active')

    if (reduceMotion) return
    if (!window.matchMedia('(pointer: fine)').matches) return

    let raf = 0
    let x = window.innerWidth / 2
    let y = window.innerHeight / 2
    let targetX = x
    let targetY = y

    const tick = () => {
      x += (targetX - x) * 0.12
      y += (targetY - y) * 0.12
      el.style.setProperty('--cx', `${x}px`)
      el.style.setProperty('--cy', `${y}px`)

      if (Math.abs(targetX - x) + Math.abs(targetY - y) > 0.5) {
        raf = requestAnimationFrame(tick)
      } else {
        raf = 0
      }
    }

    const onPointerMove = (event: PointerEvent) => {
      el.classList.add('is-active')
      targetX = event.clientX
      targetY = event.clientY
      if (!raf) raf = requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      if (raf) cancelAnimationFrame(raf)
      el.classList.remove('is-active')
    }
  }, [reduceMotion])

  return <div ref={ref} className="sky-cursor" aria-hidden="true" />
}
