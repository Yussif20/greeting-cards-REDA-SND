import { useTranslation } from "react-i18next";

/**
 * Whether a row is visible to the public.
 *
 * Colour alone does not carry this -- "live" and "draft" are the difference
 * between a customer seeing a half-finished card and not, so each pill states
 * its status in words as well. The dot is redundant reinforcement, not the
 * signal.
 */
const TONES = {
  published: "border-transparent bg-brand-soft text-brand",
  draft: "border-line bg-surface-3 text-ink-2",
  archived: "border-line bg-surface-3 text-ink-3",
};

const DOTS = {
  published: "bg-brand",
  draft: "bg-ink-3",
  archived: "bg-ink-3",
};

const StatusPill = ({ status = "draft", className = "" }) => {
  const { t } = useTranslation();
  const tone = TONES[status] ?? TONES.draft;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${tone} ${className}`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${DOTS[status] ?? DOTS.draft}`}
      />
      {t(`admin.status.${status}`)}
    </span>
  );
};

export default StatusPill;
