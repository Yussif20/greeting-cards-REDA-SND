import { useTranslation } from "react-i18next";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";

const STEP = 0.004;

/** Nudge controls, for people who would rather not drag. */
const MovePanel = ({ layer, dispatch }) => {
  const { t } = useTranslation();
  if (!layer) return null;

  const nudge = (dx, dy) =>
    dispatch({ type: "move", id: layer.id, x: layer.x + dx, y: layer.y + dy });

  const btn = "inline-flex h-10 items-center justify-center rounded-xl border border-line bg-surface-2 text-ink-2 transition-colors hover:bg-surface-3 hover:text-ink";

  return (
    <div className="space-y-2.5">
      <div className="mx-auto grid w-40 grid-cols-3 gap-1.5">
        <span />
        <button type="button" className={btn} onClick={() => nudge(0, -STEP)} aria-label={t("editor.align.top")}>
          <ArrowUp className="h-4 w-4" aria-hidden="true" />
        </button>
        <span />
        <button type="button" className={btn} onClick={() => nudge(-STEP, 0)} aria-label={t("editor.align.left")}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <button type="button" className={btn} onClick={() => nudge(0, STEP)} aria-label={t("editor.align.bottom")}>
          <ArrowDown className="h-4 w-4" aria-hidden="true" />
        </button>
        <button type="button" className={btn} onClick={() => nudge(STEP, 0)} aria-label={t("editor.align.right")}>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <p className="text-center text-xs text-ink-3">{t("editor.selectLayerHint")}</p>
    </div>
  );
};

export default MovePanel;
