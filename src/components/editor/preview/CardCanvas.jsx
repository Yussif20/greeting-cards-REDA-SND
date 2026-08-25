import { useEffect, useRef, useState } from "react";
import { sizeCanvas } from "../../../lib/canvas.js";
import { renderCard } from "../../../lib/renderCard.js";

/**
 * The live preview canvas.
 *
 * Sized to its CSS box at the device pixel ratio -- never to the design's
 * native 2000px, which would allocate a ~16MB backing store and then
 * CSS-downsample the glyphs.
 *
 * There is no clipping mask and no chrome here, so what is drawn is exactly
 * what `renderToBlob` produces at export time.
 */
const CardCanvas = ({ design, image, layers, onMeasureContext, className = "" }) => {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const [cssWidth, setCssWidth] = useState(0);

  // Track the displayed size so the render scale stays correct across window
  // resizes and browser-zoom changes.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setCssWidth(entry.contentRect.width);
    });
    observer.observe(el);
    setCssWidth(el.getBoundingClientRect().width);
    return () => observer.disconnect();
  }, []);

  // An offscreen context for measuring text at native scale. Measurement must
  // not depend on the preview's display size or hit-testing drifts when the
  // window resizes.
  useEffect(() => {
    if (!design || !onMeasureContext) return;
    const measure = document.createElement("canvas");
    measure.width = 1;
    measure.height = 1;
    onMeasureContext(measure.getContext("2d"));
  }, [design, onMeasureContext]);

  useEffect(() => {
    if (!design || !canvasRef.current || cssWidth <= 0) return;

    let stale = false;
    const cssHeight = (cssWidth * design.height) / design.width;
    const ctx = sizeCanvas(canvasRef.current, cssWidth, cssHeight);
    const scale = cssWidth / design.width;

    // Fonts and images resolve asynchronously, so a fast sequence of edits can
    // finish out of order. isStale drops every frame but the newest.
    renderCard(
      ctx,
      { design, image, layers },
      { scale, isStale: () => stale },
    ).catch(() => {});

    return () => {
      stale = true;
    };
  }, [design, image, layers, cssWidth]);

  return (
    <div ref={wrapperRef} className={`w-full ${className}`}>
      <canvas
        ref={canvasRef}
        className="block h-auto w-full rounded-2xl"
        style={{ aspectRatio: design ? `${design.width} / ${design.height}` : undefined }}
      />
    </div>
  );
};

export default CardCanvas;
