/** Filter pill. Active state is an inverted surface, not a tint. */
const Chip = ({ active = false, className = "", children, ...props }) => (
  <button
    type="button"
    aria-pressed={active}
    className={`inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium transition-colors duration-200 ${
      active
        ? "border-transparent bg-chip-active text-chip-active-fg"
        : "border-line bg-surface-2 text-ink-2 hover:bg-surface-3 hover:text-ink"
    } ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default Chip;
