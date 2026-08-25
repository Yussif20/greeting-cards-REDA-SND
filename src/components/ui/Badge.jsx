const TONES = {
  neutral: "bg-surface-3 text-ink-2 border-line",
  brand: "bg-brand-soft text-brand border-transparent",
};

const Badge = ({ tone = "neutral", className = "", children }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${TONES[tone]} ${className}`}
  >
    {children}
  </span>
);

export default Badge;
