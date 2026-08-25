import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import CardCanvas from "./CardCanvas.jsx";
import SelectionOverlay from "./SelectionOverlay.jsx";
import { useCanvasPointer } from "../../../hooks/useCanvasPointer.js";

/**
 * Interactive preview: canvas plus selection chrome.
 *
 * Forced to dir="ltr" regardless of page direction. The preview is an image,
 * not text -- if it mirrored under RTL the pointer maths and the exported card
 * would disagree.
 */
const CardPreview = ({ design, image, state, dispatch, selectedLayer }) => {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const [measureCtx, setMeasureCtx] = useState(null);

  const onMeasureContext = useCallback((ctx) => setMeasureCtx(ctx), []);

  const { snapping, handlers } = useCanvasPointer({
    containerRef,
    measureCtx,
    design,
    layers: state.layers,
    selectedLayerId: state.selectedLayerId,
    dispatch,
  });

  const rotateBy = (delta) => {
    if (!selectedLayer) return;
    dispatch({
      type: "patchLayer",
      id: selectedLayer.id,
      patch: { rotation: ((selectedLayer.rotation ?? 0) + delta) % 360 },
    });
  };

  return (
    <div
      ref={containerRef}
      dir="ltr"
      role="application"
      aria-label={t("editor.preview")}
      tabIndex={0}
      {...handlers}
      className="bg-checker relative touch-none select-none overflow-hidden rounded-2xl border border-line focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <CardCanvas
        design={design}
        image={image}
        layers={state.layers}
        onMeasureContext={onMeasureContext}
      />

      <SelectionOverlay
        design={design}
        layer={selectedLayer}
        measureCtx={measureCtx}
        snapping={snapping}
        onRotate={rotateBy}
      />
    </div>
  );
};

export default CardPreview;
