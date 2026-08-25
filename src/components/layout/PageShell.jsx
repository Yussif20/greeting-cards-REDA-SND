/**
 * Standard page frame: arabesque ground, centred column, consistent padding.
 *
 * `accent` sets the per-occasion accent tokens the page's controls inherit.
 *
 * `fullHeight` makes the page fill exactly one viewport on a `desktop:`
 * viewport -- wide enough for three columns and tall enough for two rows -- by
 * continuing the flex column started in App rather than using percentage
 * heights, which a child of a flex item cannot resolve reliably.
 *
 * Anywhere smaller it scrolls normally. Six tiles will never fit a phone, and
 * on a short laptop crushing them into the viewport reads worse than a scroll.
 */
const PageShell = ({ accent, fullHeight = false, children, className = "" }) => (
  <div
    className={`bg-arabesque ${
      fullHeight ? "desktop:flex desktop:min-h-0 desktop:flex-1 desktop:flex-col" : "min-h-full"
    } ${className}`}
    style={
      accent
        ? {
            "--occasion-accent": accent.accent,
            "--occasion-accent-soft": accent.accentSoft,
            "--occasion-on-accent": accent.onAccent,
          }
        : undefined
    }
  >
    <div
      className={`mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 ${
        fullHeight ? "desktop:flex desktop:min-h-0 desktop:flex-1 desktop:flex-col desktop:py-7" : ""
      }`}
    >
      {children}
    </div>
  </div>
);

export default PageShell;
