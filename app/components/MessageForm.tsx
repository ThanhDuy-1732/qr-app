'use client'

import { useActionState, useEffect, useRef } from 'react'
import { submitMessage, ActionState } from '@/app/actions'

const initialState: ActionState = { success: false }

export default function MessageForm() {
  const [state, formAction, pending] = useActionState(submitMessage, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset()
    }
  }, [state])

  return (
    <div className="form-card">
      <h2 className="form-title">💬 Để lại lời nhắn</h2>
      <p className="form-subtitle">Bạn muốn nói gì? Hãy để lại một lời nhắn!</p>

      <form ref={formRef} action={formAction} className="message-form" id="message-form">
        <div className="field-group">
          <label htmlFor="name" className="field-label">
            Tên của bạn <span className="optional">(không bắt buộc)</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className="field-input"
            placeholder="Nhập tên hoặc để trống..."
            maxLength={100}
            autoComplete="name"
          />
        </div>

        <div className="field-group">
          <label htmlFor="message" className="field-label">
            Lời nhắn <span className="required">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            className="field-textarea"
            placeholder="Viết bất cứ điều gì bạn muốn nói..."
            rows={4}
            maxLength={500}
            required
          />
        </div>

        {state.error && (
          <div className="form-error" role="alert">
            ⚠️ {state.error}
          </div>
        )}

        {state.success && (
          <div className="form-success" role="status">
            ✅ Gửi thành công! Cảm ơn bạn đã để lại lời nhắn.
          </div>
        )}

        <button
          type="submit"
          id="submit-button"
          className="submit-btn"
          disabled={pending}
        >
          {pending ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Đang gửi...
            </>
          ) : (
            <>✉️ Gửi lời nhắn</>
          )}
        </button>
      </form>
    </div>
  )
}
