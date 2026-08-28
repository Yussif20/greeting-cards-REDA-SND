import { useCallback, useRef, useState } from "react";

/**
 * Drag a rectangle out on the artwork, in fractions of it.
 *
 * Two parts of a layout are rectangles rather than layers, so the editor's own
 * SelectionOverlay never sees them:
 *
 *   safeArea  -- what AlignPanel aligns text against, and what
 *                distributeVertically spaces within.
 *   brandMark -- the region BrandSelect crops out of the artwork to show a
 *                logo preview, since no transparent logo files exist.
 *
 * Both were previously inherited from a sibling card and unreachable, which is
 * fine while an occasion's artwork is one composition and wrong the moment it
 * is not.
 *
 * Everything here is a fraction of the natural image, never a pixel, so the
 * box means the same thing at any preview size -- the same invariant the rest
 * of the geometry keeps.
 */
const MIN = 0.02;
const clamp01 = (n) => Math.min(1, Math.max(0, n));

const RegionEditor = ({ src, aspect, value, onChange, tone = "brand", label }) => {
  const frame = useRef(null);
  const drag = useRef(null);
  const [active, setActive] = useState(false);

  const pointToFraction = useCallback((event) => {
    const box = frame.current.getBoundingClientRect();
    return {
      x: (event.clientX - box.left) / box.width,
      y: (event.clientY - box.top) / box.height,
    };
  }, []);

  const start = (mode) => (event) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { mode, origin: pointToFraction(event), start: { ...value } };
    setActive(true);
  };

  const move = (event) => {
    if (!drag.current) return;
    const now = pointToFraction(event);
    const dx = now.x - drag.current.origin.x;
    const dy = now.y - drag.current.origin.y;
    const from = drag.current.start;

    if (drag.current.mode === "move") {
      onChange({
        ...value,
        x: clamp01(Math.min(from.x + dx, 1 - from.w)),
        y: clamp01(Math.min(from.y + dy, 1 - from.h)),
      });
      return;
    }

    // Resize from the bottom-right, so x and y stay put and only the extent
    // changes -- the corner you are not holding does not wander.
    onChange({
      ...value,
      w: Math.max(MIN, Math.min(from.w + dx, 1 - from.x)),
      h: Math.max(MIN, Math.min(from.h + dy, 1 - from.y)),
    });
  };

  const end = (event) => {
    drag.current = null;
    setActive(false);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };

  // --brand is the semantic token and flips with the theme; --color-* is the
  // raw palette tier and does not. The gold is a literal because there is no
  // semantic token for "the other region".
  const colour = tone === "brand" ? "var(--brand)" : "#E0C063";

  return (
    <div>
      {label && <p className="mb-1.5 text-xs font-medium text-ink-2">{label}</p>}
      <div
        ref={frame}
        className="relative w-full overflow-hidden rounded-xl border border-line bg-checker select-none"
        style={{ aspectRatio: aspect }}
      >
        {src && (
          <img
            src={src}
            alt=""
            crossOrigin="anonymous"
            draggable={false}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          />
        )}

        <div
          role="presentation"
          onPointerDown={start("move")}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
          className={`absolute cursor-move border-2 ${active ? "opacity-100" : "opacity-80"}`}
          style={{
            left: `${value.x * 100}%`,
            top: `${value.y * 100}%`,
            width: `${value.w * 100}%`,
            height: `${value.h * 100}%`,
            borderColor: colour,
            backgroundColor: `color-mix(in srgb, ${colour} 18%, transparent)`,
          }}
        >
          <span
            role="presentation"
            onPointerDown={start("resize")}
            onPointerMove={move}
            onPointerUp={end}
            onPointerCancel={end}
            className="absolute -end-1.5 -bottom-1.5 h-3.5 w-3.5 cursor-nwse-resize rounded-sm border border-white"
            style={{ backgroundColor: colour }}
          />
        </div>
      </div>

      <p dir="ltr" className="mt-1.5 text-end font-mono text-[11px] text-ink-3">
        x {value.x.toFixed(3)} · y {value.y.toFixed(3)} · w {value.w.toFixed(3)} · h{" "}
        {value.h.toFixed(3)}
      </p>
    </div>
  );
};

export default RegionEditor;
