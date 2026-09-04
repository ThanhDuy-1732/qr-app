'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from './ThemeProvider'

const DARK_PRESETS = ['#07070f', '#020d1f', '#030f07', '#140206', '#0a0905', '#060614']
const LIGHT_PRESETS = ['#f5f4ff', '#ffffff', '#eef4ff', '#eefff6', '#fff9ee', '#ffeef4']

const DEFAULT_BG: Record<string, string> = {
  dark: '#07070f',
  light: '#f5f4ff',
}

export default function ThemeControls() {
  const { theme, setTheme, customBg, setCustomBg } = useTheme()
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const fabRef = useRef<HTMLButtonElement>(null)

  const presets = theme === 'dark' ? DARK_PRESETS : LIGHT_PRESETS
  const activeBg = customBg || DEFAULT_BG[theme]

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function onMouseDown(e: MouseEvent) {
      const target = e.target as Node
      if (!panelRef.current?.contains(target) && !fabRef.current?.contains(target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [open])

  // Close on Escape key
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="tc-root">
      {/* Floating action button */}
      <button
        ref={fabRef}
        id="theme-fab"
        className={`tc-fab${open ? ' tc-fab--open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-label="Tùy chỉnh giao diện"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span className="tc-fab-icon" aria-hidden="true">🎨</span>
      </button>

      {/* Settings panel */}
      <div
        ref={panelRef}
        className={`tc-panel${open ? ' tc-panel--open' : ''}`}
        role="dialog"
        aria-label="Cài đặt giao diện"
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="tc-panel-head">
          <span>⚙️ Tùy chỉnh</span>
          <button
            className="tc-close"
            onClick={() => setOpen(false)}
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        {/* Theme mode */}
        <section className="tc-section">
          <p className="tc-label">Giao diện</p>
          <div className="tc-mode-row" role="radiogroup" aria-label="Chọn theme">
            <button
              id="btn-dark-mode"
              role="radio"
              aria-checked={theme === 'dark'}
              className={`tc-mode-btn${theme === 'dark' ? ' tc-mode-btn--on' : ''}`}
              onClick={() => {
                setTheme('dark')
                setCustomBg('')
              }}
            >
              🌙 Tối
            </button>
            <button
              id="btn-light-mode"
              role="radio"
              aria-checked={theme === 'light'}
              className={`tc-mode-btn${theme === 'light' ? ' tc-mode-btn--on' : ''}`}
              onClick={() => {
                setTheme('light')
                setCustomBg('')
              }}
            >
              ☀️ Sáng
            </button>
          </div>
        </section>

        {/* Background color */}
        <section className="tc-section">
          <p className="tc-label">Màu nền</p>
          <div className="tc-swatches" role="group" aria-label="Màu nền có sẵn">
            {presets.map((color) => (
              <button
                key={color}
                className={`tc-swatch${activeBg === color ? ' tc-swatch--on' : ''}`}
                style={{ background: color }}
                onClick={() =>
                  setCustomBg(color === DEFAULT_BG[theme] ? '' : color)
                }
                aria-label={`Màu ${color}`}
                aria-pressed={activeBg === color}
                title={color}
              />
            ))}
          </div>

          <div className="tc-color-row">
            <button
              id="btn-reset-color"
              className="tc-reset"
              onClick={() => setCustomBg('')}
              disabled={!customBg}
            >
              Đặt lại
            </button>

            <label className="tc-custom" title="Chọn màu bất kỳ">
              <span>🎨 Tùy chỉnh</span>
              <input
                id="custom-color-input"
                type="color"
                value={activeBg}
                onChange={(e) => setCustomBg(e.target.value)}
                aria-label="Chọn màu nền tùy chỉnh"
              />
            </label>
          </div>
        </section>
      </div>
    </div>
  )
}
