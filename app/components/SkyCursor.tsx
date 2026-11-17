'use client'

import { useEffect, useRef } from 'react'

/**
 * Soft violet glow that trails the pointer on devices with a fine pointer.
 * Purely decorative: it is hidden on touch devices and when motion is reduced.
 */
export default function SkyCursor() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches
    const reduced =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.documentElement.dataset.motion === 'reduced'

    if (!finePointer || reduced) return

    let raf = 0
    let x = window.innerWidth / 2
    let y = window.innerHeight / 2
    let targetX = x
    let targetY = y

    function tick() {
      x += (targetX - x) * 0.12
      y += (targetY - y) * 0.12

      const el = ref.current
      if (el) {
        el.style.setProperty('--cx', `${x}px`)
        el.style.setProperty('--cy', `${y}px`)
      }

      if (Math.abs(targetX - x) + Math.abs(targetY - y) > 0.5) {
        raf = requestAnimationFrame(tick)
      } else {
        raf = 0
      }
    }

    function onPointerMove(event: PointerEvent) {
      targetX = event.clientX
      targetY = event.clientY
      if (!raf) raf = requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return <div ref={ref} className="sky-cursor" aria-hidden="true" />
}
