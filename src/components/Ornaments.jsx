// Eight-pointed star — used in dividers and corner ornaments.
export const EightPointStar = ({ size = 18, className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className}
    aria-hidden="true"
  >
    <path
      d="M12 1.5 L13.9 8.5 L21 7 L15.5 12 L21 17 L13.9 15.5 L12 22.5 L10.1 15.5 L3 17 L8.5 12 L3 7 L10.1 8.5 Z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="0.4"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="1.4" fill="currentColor" opacity="0.4" />
  </svg>
);

// Arabesque corner ornament — top-left orientation; rotate via CSS.
export const CornerOrnament = ({ className = "", size = 64 }) => (
  <svg
    viewBox="0 0 80 80"
    width={size}
    height={size}
    className={className}
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
  >
    <path
      d="M2 2 L36 2 M2 2 L2 36"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <path
      d="M2 14 Q14 14 14 2 M14 14 L26 2 M14 14 L2 26"
      strokeWidth="1"
      strokeLinecap="round"
      opacity="0.85"
    />
    <path
      d="M22 22 Q22 14 30 14 Q38 14 38 22 Q38 30 30 30 Q22 30 22 22 Z"
      strokeWidth="0.9"
      opacity="0.9"
    />
    <path
      d="M30 14 L30 6 M30 30 L30 38 M14 22 Q22 22 22 14 M30 22 L38 22"
      strokeWidth="0.8"
      strokeLinecap="round"
      opacity="0.7"
    />
    <circle cx="30" cy="22" r="1.6" fill="currentColor" opacity="0.6" />
  </svg>
);

// Ornamental divider with center 8-point star.
export const StarDivider = ({ className = "", width = "max-w-md" }) => (
  <div
    className={`flex items-center justify-center gap-3 mx-auto ${width} ${className}`}
    aria-hidden="true"
  >
    <span className="flex-1 h-px bg-gradient-to-l from-[var(--jewel-gold)]/80 to-transparent" />
    <EightPointStar size={10} className="text-[var(--jewel-gold)] opacity-70" />
    <span className="h-px w-4 bg-[var(--jewel-gold)]/80" />
    <EightPointStar size={16} className="text-[var(--jewel-gold)]" />
    <span className="h-px w-4 bg-[var(--jewel-gold)]/80" />
    <EightPointStar size={10} className="text-[var(--jewel-gold)] opacity-70" />
    <span className="flex-1 h-px bg-gradient-to-r from-[var(--jewel-gold)]/80 to-transparent" />
  </div>
);

// Renders the four corner ornaments around an .ornate-panel parent.
// The parent must be `position: relative`. `scale` controls all four.
export const PanelCorners = ({ scale = 1, className = "text-[var(--jewel-gold)]" }) => {
  const style = scale !== 1 ? { transform: `scale(${scale})` } : undefined;
  return (
    <>
      <CornerOrnament className={`absolute top-3 left-3 ${className}`} />
      <CornerOrnament className={`absolute top-3 right-3 rotate-90 ${className}`} />
      <CornerOrnament className={`absolute bottom-3 right-3 rotate-180 ${className}`} />
      <CornerOrnament className={`absolute bottom-3 left-3 -rotate-90 ${className}`} />
    </>
  );
};
