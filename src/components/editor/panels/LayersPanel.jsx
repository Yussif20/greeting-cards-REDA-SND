import { useTranslation } from "react-i18next";
import { ChevronUp, ChevronDown, Eye, EyeOff, Lock, Unlock } from "lucide-react";

/**
 * Layer list. The background is deliberately absent -- it belongs to the design
 * rather than the scene, so it cannot be reordered, hidden, or moved above the
 * text.
 */
const LayersPanel = ({ layers, selectedLayerId, dispatch }) => {
  const { t } = useTranslation();

  // Topmost first, which is how people expect to read a layer stack.
  const ordered = [...layers].sort((a, b) => (b.z ?? 0) - (a.z ?? 0));

  return (
    <ul className="space-y-1.5">
      {ordered.map((layer) => {
        const active = layer.id === selectedLayerId;
        return (
          <li
            key={layer.id}
            className={`flex items-center gap-1 rounded-xl border px-2 py-1.5 ${
              active ? "border-accent bg-accent-soft" : "border-line bg-surface-2"
            }`}
          >
            <button
              type="button"
              onClick={() => dispatch({ type: "select", id: layer.id })}
              className="flex-1 truncate text-start text-sm text-ink"
            >
              {t(`editor.layer.${layer.id}`)}
            </button>

            <button
              type="button"
              onClick={() => dispatch({ type: "reorder", id: layer.id, direction: 1 })}
              aria-label={t("editor.layer.moveUp")}
              title={t("editor.layer.moveUp")}
              className="rounded-lg p-1.5 text-ink-3 transition-colors hover:bg-surface-3 hover:text-ink"
            >
              <ChevronUp className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: "reorder", id: layer.id, direction: -1 })}
              aria-label={t("editor.layer.moveDown")}
              title={t("editor.layer.moveDown")}
              className="rounded-lg p-1.5 text-ink-3 transition-colors hover:bg-surface-3 hover:text-ink"
            >
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() =>
                dispatch({
                  type: "patchLayer",
                  id: layer.id,
                  patch: { visible: !layer.visible },
                })
              }
              aria-label={layer.visible ? t("editor.layer.hide") : t("editor.layer.show")}
              title={layer.visible ? t("editor.layer.hide") : t("editor.layer.show")}
              className="rounded-lg p-1.5 text-ink-3 transition-colors hover:bg-surface-3 hover:text-ink"
            >
              {layer.visible ? (
                <Eye className="h-4 w-4" aria-hidden="true" />
              ) : (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                dispatch({
                  type: "patchLayer",
                  id: layer.id,
                  patch: { locked: !layer.locked },
                })
              }
              aria-label={layer.locked ? t("editor.layer.unlock") : t("editor.layer.lock")}
              title={layer.locked ? t("editor.layer.unlock") : t("editor.layer.lock")}
              className="rounded-lg p-1.5 text-ink-3 transition-colors hover:bg-surface-3 hover:text-ink"
            >
              {layer.locked ? (
                <Lock className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Unlock className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
};

export default LayersPanel;
