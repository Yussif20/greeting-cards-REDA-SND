import { useEffect } from "react";
import { X } from "lucide-react";

const TONES = {
  info: "border-line bg-surface-2 text-ink",
  error: "border-transparent bg-danger-soft text-danger",
};

/** Transient status message. Auto-dismisses unless `duration` is 0. */
const Toast = ({ message, tone = "info", onDismiss, duration = 2600, dismissLabel }) => {
  useEffect(() => {
    if (!message || !duration) return;
    const id = setTimeout(() => onDismiss?.(), duration);
    return () => clearTimeout(id);
  }, [message, duration, onDismiss]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-5 z-50 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg end-5 ${TONES[tone]}`}
    >
      <span>{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={dismissLabel}
          className="opacity-60 transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

export default Toast;
