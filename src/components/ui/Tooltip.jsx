import { useId, useState } from "react";
import { HelpCircle } from "lucide-react";

/**
 * Keyboard-accessible help bubble. Opens on hover and on focus, and closes on
 * Escape, so it is reachable without a pointer.
 */
const Tooltip = ({ text, label }) => {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label={label}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-ink-3 transition-colors hover:text-ink"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        onClick={() => setOpen((v) => !v)}
      >
        <HelpCircle className="h-4 w-4" aria-hidden="true" />
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="absolute bottom-full z-20 mb-2 w-60 rounded-xl border border-line bg-surface-2 p-3 text-xs leading-relaxed text-ink-2 shadow-lg start-1/2 -translate-x-1/2 rtl:translate-x-1/2"
        >
          {text}
        </span>
      )}
    </span>
  );
};

export default Tooltip;
