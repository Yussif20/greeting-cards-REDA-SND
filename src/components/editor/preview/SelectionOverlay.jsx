import { useTranslation } from "react-i18next";
import { RotateCcw, RotateCw } from "lucide-react";
import { layerBox } from "../../../lib/layers.js";

/**
 * Selection chrome, drawn as DOM on top of the canvas rather than into it.
 *
 * Keeping it out of the canvas is what lets preview and export share one
 * renderer with no flags: chrome physically cannot leak into a download. It
 * also keeps handles crisp at any DPR and lets them be real focusable buttons.
 */
const HANDLES = ["tl", "tr", "br", "bl"];

const HANDLE_POSITION = {
  tl: { left: 0, top: 0 },
  tr: { left: 1, top: 0 },
  br: { left: 1, top: 1 },
  bl: { left: 0, top: 1 },
};

const SelectionOverlay = ({ design, layer, measureCtx, snapping, onRotate }) => {
  const { t } = useTranslation();

  if (!design || !layer || !measureCtx) return null;

  const box = layerBox(measureCtx, layer, design.width, design.height);
  if (!box) return null;

  const style = {
    left: `${(box.cx - box.w / 2) * 100}%`,
    top: `${(box.cy - box.h / 2) * 100}%`,
    width: `${box.w * 100}%`,
    height: `${box.h * 100}%`,
    transform: box.rotation ? `rotate(${box.rotation}deg)` : undefined,
  };

  return (
    <>
      {/* Centre guide, shown only while a drag is snapped. */}
      {snapping && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-accent/70"
        />
      )}

      <div
        className="pointer-events-none absolute rounded-sm outline-2 outline-dashed outline-offset-2 outline-accent/80"
        style={style}
      >
        {HANDLES.map((id) => {
          const pos = HANDLE_POSITION[id];
          return (
            <span
              key={id}
              data-handle={id}
              className="pointer-events-auto absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize rounded-full border-2 border-accent bg-white shadow-sm"
              style={{ left: `${pos.left * 100}%`, top: `${pos.top * 100}%` }}
            />
          );
        })}

        {/* Rotate controls, above the box as in the design. */}
        {!layer.locked && (
          <div className="pointer-events-auto absolute -top-11 left-1/2 flex -translate-x-1/2 gap-1.5">
            <button
              type="button"
              onClick={() => onRotate(-15)}
              aria-label={`${t("editor.tool.move")} -15°`}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-line bg-surface-2 text-ink-2 shadow-sm transition-colors hover:text-ink"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onRotate(15)}
              aria-label={`${t("editor.tool.move")} +15°`}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-line bg-surface-2 text-ink-2 shadow-sm transition-colors hover:text-ink"
            >
              <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default SelectionOverlay;
