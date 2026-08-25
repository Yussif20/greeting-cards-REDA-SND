import { useTranslation } from "react-i18next";
import {
  AlignLeft, AlignCenter, AlignRight,
  AlignVerticalJustifyStart, AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd, Rows3,
} from "lucide-react";
import { alignLayer, distributeVertically } from "../../../lib/layers.js";

const H = [
  { edge: "left", Icon: AlignLeft },
  { edge: "center", Icon: AlignCenter },
  { edge: "right", Icon: AlignRight },
];
const V = [
  { edge: "top", Icon: AlignVerticalJustifyStart },
  { edge: "middle", Icon: AlignVerticalJustifyCenter },
  { edge: "bottom", Icon: AlignVerticalJustifyEnd },
];

/** Alignment is relative to the design's safe area, not the raw canvas. */
const AlignPanel = ({ design, layer, layers, dispatch }) => {
  const { t } = useTranslation();
  if (!layer) return null;

  const safeArea = design.layout.safeArea;

  const apply = (edge) =>
    dispatch({
      type: "patchLayer",
      id: layer.id,
      patch: alignLayer(layer, safeArea, edge),
    });

  // Pinned to ltr: these describe where the text sits on the card, not reading
  // order, so the "left" control has to stay on the left in Arabic too.
  const row = (items) => (
    <div dir="ltr" className="grid grid-cols-3 gap-1.5">
      {items.map(({ edge, Icon }) => (
        <button
          key={edge}
          type="button"
          onClick={() => apply(edge)}
          aria-label={t(`editor.align.${edge}`)}
          title={t(`editor.align.${edge}`)}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-line bg-surface-2 text-ink-2 transition-colors hover:bg-surface-3 hover:text-ink"
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-2.5">
      {row(H)}
      {row(V)}
      <button
        type="button"
        onClick={() =>
          dispatch({
            type: "patchMany",
            patches: distributeVertically(
              layers.filter((l) => l.type === "text" || l.visible),
              safeArea,
            ),
          })
        }
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface-2 text-sm text-ink-2 transition-colors hover:bg-surface-3 hover:text-ink"
      >
        <Rows3 className="h-4 w-4" aria-hidden="true" />
        {t("editor.align.distribute")}
      </button>
    </div>
  );
};

export default AlignPanel;
