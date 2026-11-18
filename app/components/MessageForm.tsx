'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { submitMessage, ActionState } from '@/app/actions'

const initialState: ActionState = { success: false }

export default function MessageForm() {
  const [state, formAction, pending] = useActionState(submitMessage, initialState)
  const formRef = useRef<HTMLFormElement>(null)
  const [length, setLength] = useState(0)
  const [celebrate, setCelebrate] = useState(false)

  useEffect(() => {
    if (!state.success) return

    formRef.current?.reset()
    /* eslint-disable react-hooks/set-state-in-effect -- one-time response to a completed server action */
    setLength(0)
    setCelebrate(true)
    /* eslint-enable react-hooks/set-state-in-effect */

    const timer = window.setTimeout(() => setCelebrate(false), 1800)
    return () => window.clearTimeout(timer)
  }, [state.at, state.success])

  function goToStar() {
    const wall = document.getElementById('wish-wall')
    const card = wall?.querySelector<HTMLElement>('.wish-card')
    const heading = wall?.querySelector<HTMLElement>('.wall-heading')

    heading?.focus({ preventScroll: true })

    const reduced =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.documentElement.dataset.motion === 'reduced'

    wall?.scrollIntoView({
      behavior: reduced ? 'auto' : 'smooth',
      block: 'start',
    })

    if (card) {
      card.classList.add('is-new')
      window.setTimeout(() => card.classList.remove('is-new'), 2400)
    }
  }

  return (
    <div className="wish-form">
      <h2 className="form-heading">Gửi lời nhắn</h2>
      <p className="form-sub">Điều bạn đang mong sẽ thành một ngôi sao mới.</p>

      <form ref={formRef} action={formAction} className="wish-form-el">
        <div className="wish-field">
          <label htmlFor="name" className="wish-label">
            Tên của bạn <span className="wish-optional">(không bắt buộc)</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className="wish-input"
            placeholder="Nhập tên hoặc để trống..."
            maxLength={100}
            autoComplete="name"
          />
        </div>

        <div className="wish-field">
          <div className="wish-label-row">
            <label htmlFor="message" className="wish-label">
              Lời nhắn <span className="wish-required">*</span>
            </label>
            <span className="wish-counter" data-near={length > 450}>
              {length}/500
            </span>
          </div>
          <textarea
            id="message"
            name="message"
            className="wish-textarea"
            placeholder="Viết bất cứ điều gì bạn muốn nói..."
            rows={4}
            maxLength={500}
            required
            onChange={(event) => setLength(event.target.value.length)}
          />
        </div>

        {state.error && (
          <div className="wish-error" role="alert">
            ⚠️ {state.error}
          </div>
        )}

        {state.success && (
          <div className="wish-success">
            <span className="wish-success-star" aria-hidden="true">
              ✦
            </span>
            <div>
              <b role="status">Ngôi sao của bạn đã lên trời.</b>
              <button type="button" className="wish-success-link" onClick={goToStar}>
                Xem ngôi sao của bạn ↓
              </button>
            </div>
          </div>
        )}

        {celebrate && <span className="wish-shoot" aria-hidden="true" />}

        <button type="submit" className="wish-submit" disabled={pending}>
          {pending ? (
            <>
              <span className="wish-spinner" aria-hidden="true" />
              Đang gửi...
            </>
          ) : (
            <>
              Thả sao lên trời <span aria-hidden="true">✦</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}
