import { useTranslation } from "react-i18next";
import { MIN_SIZE, MAX_SIZE } from "../../../lib/layers.js";

const SizePanel = ({ layer, dispatch }) => {
  const { t } = useTranslation();
  if (!layer) return null;

  const isText = layer.type === "text";
  const value = isText ? layer.size : layer.width;
  const min = isText ? MIN_SIZE : 0.05;
  const max = isText ? MAX_SIZE : 0.9;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-ink">{t("editor.size.label")}</span>
        <span className="text-ink-3">{Math.round(value * 1000) / 10}%</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={0.001}
        value={value}
        onChange={(e) =>
          dispatch({
            type: isText ? "resize" : "resizeImage",
            id: layer.id,
            [isText ? "size" : "width"]: Number(e.target.value),
          })
        }
        onPointerUp={() => dispatch({ type: "commit" })}
        onKeyUp={() => dispatch({ type: "commit" })}
        className="w-full accent-[var(--occasion-accent)]"
        aria-label={t("editor.size.label")}
      />
      <p className="mt-2 text-xs text-ink-3">{t("editor.size.nudge")}</p>
    </div>
  );
};

export default SizePanel;
