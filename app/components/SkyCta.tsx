'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface Meteor {
  id: number
  left: number
  top: number
  delay: number
  duration: number
  length: number
  opacity: number
}

function makeMeteors(count: number): Meteor[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    left: Math.random() * 110 - 10,
    top: Math.random() * 55 - 10,
    delay: Math.random() * 600,
    duration: 1300 + Math.random() * 900,
    length: 90 + Math.random() * 110,
    opacity: 0.55 + Math.random() * 0.45,
  }))
}

interface SkyCtaProps {
  href: string
  className?: string
  children: React.ReactNode
}

/**
 * In-page link that starts a short meteor shower before gliding to its target.
 * Reduced-motion visitors jump straight there with no overlay.
 */
export default function SkyCta({ href, className, children }: SkyCtaProps) {
  const [meteors, setMeteors] = useState<Meteor[] | null>(null)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [])

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

    const target = document.getElementById(href.replace(/^#/, ''))
    if (!target) return

    event.preventDefault()

    const reduced = document.documentElement.dataset.motion === 'reduced'

    target
      .querySelector<HTMLElement>('.wall-heading')
      ?.focus({ preventScroll: true })
    target.scrollIntoView({
      behavior: reduced ? 'auto' : 'smooth',
      block: 'start',
    })

    if (reduced) return

    const count = window.matchMedia('(max-width: 700px)').matches ? 14 : 26
    setMeteors(makeMeteors(count))

    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setMeteors(null), 2400)
  }

  return (
    <>
      <a href={href} className={className} onClick={handleClick}>
        {children}
      </a>

      {meteors &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="meteor-shower" aria-hidden="true">
            <div className="meteor-bloom" />
            {meteors.map((meteor) => (
              <i
                key={meteor.id}
                className="meteor"
                style={
                  {
                    left: `${meteor.left}%`,
                    top: `${meteor.top}%`,
                    width: `${meteor.length}px`,
                    '--o': meteor.opacity,
                    animationDelay: `${meteor.delay}ms`,
                    animationDuration: `${meteor.duration}ms`,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>,
          document.body
        )}
    </>
  )
}
