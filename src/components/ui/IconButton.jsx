const SIZES = { sm: "h-9 w-9", md: "h-11 w-11" };

/** Square icon-only control. `label` is required -- it becomes the accessible name. */
const IconButton = ({ label, size = "md", className = "", children, ...props }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    className={`inline-flex items-center justify-center rounded-full border border-line bg-surface-2 text-ink-2 transition-colors duration-200 hover:bg-surface-3 hover:text-ink disabled:opacity-45 disabled:pointer-events-none ${SIZES[size]} ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default IconButton;
