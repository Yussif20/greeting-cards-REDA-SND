import { useCallback, useRef, useState } from "react";
import { hitTest, layerBox, clampSize } from "../lib/layers.js";

/**
 * Pointer interaction over the card preview: select, drag, resize, rotate.
 *
 * Pointer positions are normalised to 0..1 of the preview's own box the moment
 * they arrive, so this is immune to display size, device pixel ratio and
 * browser zoom. Pointer capture keeps a drag alive when the cursor leaves the
 * element.
 */

const SNAP_CENTRE = 0.5;
const SNAP_TOLERANCE = 0.012;

export function useCanvasPointer({
  containerRef,
  measureCtx,
  design,
  layers,
  selectedLayerId,
  dispatch,
  enabled = true,
}) {
  const gesture = useRef(null);
  const [snapping, setSnapping] = useState(false);

  const toNormalised = useCallback(
    (event) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect || rect.width === 0) return null;
      return {
        x: (event.clientX - rect.left) / rect.width,
        y: (event.clientY - rect.top) / rect.height,
      };
    },
    [containerRef],
  );

  const onPointerDown = useCallback(
    (event) => {
      if (!enabled || !design || !measureCtx) return;
      const point = toNormalised(event);
      if (!point) return;

      // A corner handle owns the gesture; it reports which one via dataset.
      const handle = event.target?.dataset?.handle;
      const layer =
        handle
          ? layers.find((l) => l.id === selectedLayerId)
          : hitTest(layers, point, measureCtx, design.width, design.height);

      if (!layer) {
        dispatch({ type: "select", id: null });
        return;
      }

      event.currentTarget.setPointerCapture?.(event.pointerId);
      dispatch({ type: "select", id: layer.id });

      const box = layerBox(measureCtx, layer, design.width, design.height);

      gesture.current = {
        mode: handle ? "resize" : "drag",
        handle,
        layerId: layer.id,
        start: point,
        origin: { x: layer.x, y: layer.y },
        startSize: layer.type === "text" ? layer.size : layer.width,
        // Distance from the anchor to the grabbed corner, for uniform scaling.
        startRadius: box
          ? Math.hypot((point.x - layer.x) * (design.width / design.height), point.y - layer.y)
          : 0,
        isText: layer.type === "text",
      };
    },
    [enabled, design, measureCtx, layers, selectedLayerId, dispatch, toNormalised],
  );

  const onPointerMove = useCallback(
    (event) => {
      const g = gesture.current;
      if (!g || !design) return;

      const point = toNormalised(event);
      if (!point) return;

      if (g.mode === "drag") {
        let x = g.origin.x + (point.x - g.start.x);
        const y = g.origin.y + (point.y - g.start.y);

        // Snap to the horizontal centre, the alignment people actually want.
        const nearCentre = Math.abs(x - SNAP_CENTRE) < SNAP_TOLERANCE;
        if (nearCentre) x = SNAP_CENTRE;
        setSnapping(nearCentre);

        dispatch({ type: "move", id: g.layerId, x, y });
        return;
      }

      if (g.mode === "resize") {
        const aspect = design.width / design.height;
        const radius = Math.hypot(
          (point.x - g.origin.x) * aspect,
          point.y - g.origin.y,
        );
        if (g.startRadius <= 0) return;

        let factor = radius / g.startRadius;
        // Shift snaps the scale to 5% steps.
        if (event.shiftKey) factor = Math.round(factor * 20) / 20;

        if (g.isText) {
          dispatch({ type: "resize", id: g.layerId, size: clampSize(g.startSize * factor) });
        } else {
          dispatch({ type: "resizeImage", id: g.layerId, width: g.startSize * factor });
        }
      }
    },
    [design, dispatch, toNormalised],
  );

  const endGesture = useCallback(
    (event) => {
      if (!gesture.current) return;
      event?.currentTarget?.releasePointerCapture?.(event.pointerId);
      gesture.current = null;
      setSnapping(false);
      // One history entry per gesture rather than one per frame.
      dispatch({ type: "commit" });
    },
    [dispatch],
  );

  /** Arrow-key nudging for the selected layer. */
  const onKeyDown = useCallback(
    (event) => {
      if (!selectedLayerId) return;
      const layer = layers.find((l) => l.id === selectedLayerId);
      if (!layer || layer.locked) return;

      const step = event.shiftKey ? 0.02 : 0.002;
      const moves = {
        ArrowUp: { x: 0, y: -step },
        ArrowDown: { x: 0, y: step },
        ArrowLeft: { x: -step, y: 0 },
        ArrowRight: { x: step, y: 0 },
      };
      const delta = moves[event.key];
      if (!delta) return;

      event.preventDefault();
      dispatch({
        type: "move",
        id: layer.id,
        x: layer.x + delta.x,
        y: layer.y + delta.y,
      });
    },
    [selectedLayerId, layers, dispatch],
  );

  return {
    snapping,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endGesture,
      onPointerCancel: endGesture,
      onKeyDown,
    },
  };
}
