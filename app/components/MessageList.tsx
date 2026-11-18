'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Message } from '@/app/lib/messages'
import { getAvatarColor, getDisplayName, getInitial } from '@/app/lib/avatar'

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

interface Burst {
  x: number
  y: number
  accent: string
}

interface MessageListProps {
  messages: Message[]
}

export default function MessageList({ messages }: MessageListProps) {
  const [selected, setSelected] = useState<Message | null>(null)
  const [burst, setBurst] = useState<Burst | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const burstTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (burstTimer.current) window.clearTimeout(burstTimer.current)
    }
  }, [])

  useEffect(() => {
    if (!selected) return

    document.documentElement.classList.add('wish-modal-open')
    const pageMain = document.querySelector('main')
    const themeRoot = document.querySelector('.theme-root')
    pageMain?.setAttribute('inert', '')
    themeRoot?.setAttribute('inert', '')

    const previous =
      returnFocusRef.current ?? (document.activeElement as HTMLElement | null)
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 0)

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        setSelected(null)
        return
      }

      if (event.key !== 'Tab') return

      const dialog = dialogRef.current
      if (!dialog) return

      const items = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => !element.hasAttribute('disabled'))

      if (!items.length) return

      const first = items[0]
      const last = items[items.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      window.clearTimeout(focusTimer)
      document.removeEventListener('keydown', onKeyDown)
      document.documentElement.classList.remove('wish-modal-open')
      pageMain?.removeAttribute('inert')
      themeRoot?.removeAttribute('inert')
      previous?.focus?.()
    }
  }, [selected])

  function openWish(
    message: Message,
    event: React.MouseEvent<HTMLButtonElement>
  ) {
    returnFocusRef.current = event.currentTarget
    setSelected(message)

    if (document.documentElement.dataset.motion === 'reduced') return

    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX || rect.left + rect.width / 2
    const y = event.clientY || rect.top + rect.height / 2

    setBurst({ x, y, accent: getAvatarColor(message.id) })
    if (burstTimer.current) window.clearTimeout(burstTimer.current)
    burstTimer.current = window.setTimeout(() => setBurst(null), 800)
  }

  function closeToForm() {
    setSelected(null)
    const reduced = document.documentElement.dataset.motion === 'reduced'

    window.setTimeout(() => {
      document
        .getElementById('wish-form')
        ?.scrollIntoView({
          behavior: reduced ? 'auto' : 'smooth',
          block: 'start',
        })
      document.getElementById('name')?.focus({ preventScroll: true })
    }, 60)
  }

  if (messages.length === 0) {
    return (
      <div className="wall-empty">
        <span className="wall-empty-star" aria-hidden="true">
          ✦
        </span>
        <p>Bầu trời đang chờ ngôi sao đầu tiên.</p>
      </div>
    )
  }

  const selectedName = selected ? getDisplayName(selected.author) : ''

  return (
    <>
      <ul className="wish-grid" aria-label="Danh sách lời nhắn">
        {messages.map((message, index) => {
          const name = getDisplayName(message.author)
          const accent = getAvatarColor(message.id)

          return (
            <li
              key={message.id}
              className="wish-item"
              style={{ '--i': Math.min(index, 5) } as React.CSSProperties}
            >
              <button
                type="button"
                className="wish-card"
                style={{ '--accent': accent } as React.CSSProperties}
                onClick={(event) => openWish(message, event)}
                aria-haspopup="dialog"
                aria-label={`Mở lời nhắn của ${name}`}
              >
                <span
                  className="wish-avatar"
                  style={{ background: accent }}
                  aria-hidden="true"
                >
                  {getInitial(name)}
                </span>

                <span className="wish-body">
                  <span className="wish-meta">
                    <b className="wish-name">{name}</b>
                    <time
                      className="wish-time"
                      dateTime={message.createdAt}
                      suppressHydrationWarning
                    >
                      {formatDate(message.createdAt)}
                    </time>
                  </span>

                  <span className="wish-text">{message.text}</span>

                  <span className="wish-hint">
                    Đọc lời nhắn <span aria-hidden="true">↗</span>
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      {selected &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="wish-modal" role="presentation">
            <div
              className="wish-modal-backdrop"
              aria-hidden="true"
              onMouseDown={() => setSelected(null)}
            />

            <div
              ref={dialogRef}
              className="wish-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="wish-dialog-title"
              aria-describedby="wish-dialog-text"
              style={
                { '--accent': getAvatarColor(selected.id) } as React.CSSProperties
              }
            >
              <span className="wish-dialog-shoot" aria-hidden="true" />
              <button
                ref={closeRef}
                type="button"
                className="wish-dialog-close"
                onClick={() => setSelected(null)}
                aria-label="Đóng"
              >
                ✕
              </button>
              <span className="wish-dialog-mark" aria-hidden="true">
                “
              </span>

              <header className="wish-dialog-head">
                <span
                  className="wish-dialog-avatar"
                  style={{ background: getAvatarColor(selected.id) }}
                  aria-hidden="true"
                >
                  {getInitial(selectedName)}
                </span>
                <div>
                  <h3 id="wish-dialog-title">{selectedName}</h3>
                  <time dateTime={selected.createdAt}>
                    {formatDate(selected.createdAt)}
                  </time>
                </div>
              </header>

              <p id="wish-dialog-text" className="wish-dialog-text">
                {selected.text}
              </p>

              <footer className="wish-dialog-foot">
                <span>✦ Một ngôi sao trên bầu trời</span>
                <button
                  type="button"
                  className="wish-dialog-cta"
                  onClick={closeToForm}
                >
                  Gửi ước mơ của bạn ↗
                </button>
              </footer>
            </div>

            {burst && (
              <div
                className="wish-burst"
                aria-hidden="true"
                style={
                  {
                    '--bx': `${burst.x}px`,
                    '--by': `${burst.y}px`,
                    '--accent': burst.accent,
                  } as React.CSSProperties
                }
              >
                {Array.from({ length: 6 }, (_, index) => (
                  <i
                    key={index}
                    style={
                      { '--a': `${index * 60}deg` } as React.CSSProperties
                    }
                  />
                ))}
              </div>
            )}
          </div>,
          document.body
        )}
    </>
  )
}
