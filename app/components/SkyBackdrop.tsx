import SkyCursor from './SkyCursor'

/**
 * Fixed, decorative night sky behind the whole page: aurora, two star layers,
 * one slow shooting star, and the pointer glow on desktop.
 */
export default function SkyBackdrop() {
  return (
    <div className="sky" aria-hidden="true">
      <div className="sky-aurora one" />
      <div className="sky-aurora two" />
      <div className="sky-aurora three" />
      <div className="sky-stars layer-a" />
      <div className="sky-stars layer-b" />
      <div className="sky-shoot" />
      <SkyCursor />
    </div>
  )
}
