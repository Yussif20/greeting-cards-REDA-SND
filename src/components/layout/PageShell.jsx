/**
 * Standard page frame: arabesque ground, centred column, consistent padding.
 * `accent` sets the per-occasion accent tokens the page's controls inherit.
 */
const PageShell = ({ accent, children, className = "" }) => (
  <div
    className={`bg-arabesque min-h-full ${className}`}
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
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">{children}</div>
  </div>
);

export default PageShell;
