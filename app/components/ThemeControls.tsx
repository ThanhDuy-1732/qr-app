'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from './ThemeProvider'

const DARK_PRESETS = ['#04050d', '#020d1f', '#030f07', '#140206', '#0a0905', '#060614']
const LIGHT_PRESETS = ['#f6f1ff', '#ffffff', '#eef4ff', '#eefff6', '#fff9ee', '#ffeef4']

const DEFAULT_BG: Record<string, string> = {
  dark: '#04050d',
  light: '#f6f1ff',
}

export default function ThemeControls() {
  const {
    theme,
    setTheme,
    customBg,
    setCustomBg,
    reduceMotion,
    setReduceMotion,
  } = useTheme()
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const fabRef = useRef<HTMLButtonElement>(null)

  const presets = theme === 'dark' ? DARK_PRESETS : LIGHT_PRESETS
  const activeBg = customBg || DEFAULT_BG[theme]

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function onMouseDown(event: MouseEvent) {
      const target = event.target as Node
      if (
        !panelRef.current?.contains(target) &&
        !fabRef.current?.contains(target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        fabRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="theme-root">
      <button
        ref={fabRef}
        className={`theme-fab${open ? ' theme-fab--open' : ''}`}
        onClick={() => setOpen((value) => !value)}
        aria-label="Tùy chỉnh giao diện"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span aria-hidden="true">✦</span>
      </button>

      {/* Panel sits above the FAB so the FAB stays anchored to the corner */}
      <div
        ref={panelRef}
        className={`theme-panel${open ? ' theme-panel--open' : ''}`}
        role="dialog"
        aria-label="Cài đặt giao diện"
        aria-hidden={!open}
      >
        <div className="theme-head">
          <span>✦ Tùy chỉnh</span>
          <button
            className="theme-close"
            onClick={() => setOpen(false)}
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        <section className="theme-section">
          <p className="theme-label">Giao diện</p>
          <div className="theme-modes" role="radiogroup" aria-label="Chọn theme">
            <button
              role="radio"
              aria-checked={theme === 'dark'}
              className={`theme-mode${theme === 'dark' ? ' theme-mode--on' : ''}`}
              onClick={() => {
                setTheme('dark')
                setCustomBg('')
              }}
            >
              🌙 Tối
            </button>
            <button
              role="radio"
              aria-checked={theme === 'light'}
              className={`theme-mode${theme === 'light' ? ' theme-mode--on' : ''}`}
              onClick={() => {
                setTheme('light')
                setCustomBg('')
              }}
            >
              ☀️ Sáng
            </button>
          </div>
        </section>

        <section className="theme-section">
          <p className="theme-label">Màu nền</p>
          <div className="theme-swatches" role="group" aria-label="Màu nền có sẵn">
            {presets.map((color) => (
              <button
                key={color}
                type="button"
                className={`theme-swatch${activeBg === color ? ' theme-swatch--on' : ''}`}
                style={{ '--swatch': color } as React.CSSProperties}
                onClick={() =>
                  setCustomBg(color === DEFAULT_BG[theme] ? '' : color)
                }
                aria-label={`Màu ${color}`}
                aria-pressed={activeBg === color}
                title={color}
              >
                <span aria-hidden="true" />
              </button>
            ))}
          </div>

          <div className="theme-colors">
            <button
              className="theme-reset"
              onClick={() => setCustomBg('')}
              disabled={!customBg}
            >
              Đặt lại
            </button>

            <label className="theme-custom" title="Chọn màu bất kỳ">
              <span>🎨 Tùy chỉnh</span>
              <input
                type="color"
                value={activeBg}
                onChange={(event) => setCustomBg(event.target.value)}
                aria-label="Chọn màu nền tùy chỉnh"
              />
            </label>
          </div>
        </section>

        <section className="theme-section">
          <div className="theme-motion">
            <div>
              <p className="theme-motion-title">Giảm chuyển động</p>
              <p className="theme-motion-sub">Tắt hiệu ứng nền và chuyển động</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={reduceMotion}
              aria-label="Giảm chuyển động"
              className={`switch${reduceMotion ? ' switch--on' : ''}`}
              onClick={() => setReduceMotion(!reduceMotion)}
            >
              <span className="switch-knob" aria-hidden="true" />
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
