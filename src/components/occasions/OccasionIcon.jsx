// Gold line-art marks for the occasion tiles.
//
// Stroke-only, currentColor, 48x48 viewBox, drawn at a consistent weight so the
// six read as one set. Keys match `icon` in src/data/occasions.js.

import {
  LUCIDE_ICONS,
  LUCIDE_STROKE_WIDTH,
  isLucideIcon,
  lucideName,
} from "./lucideIcons.js";

const props = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const ICONS = {
  // Crescent beside a domed mosque.
  eidFitr: (
    <>
      <path d="M17 8a9 9 0 1 0 0 17 11 11 0 0 1 0-17Z" />
      <path d="M32 27v-6a5 5 0 0 1 10 0v6" />
      <path d="M28 41V27h18v14Z" />
      <path d="M37 18v-3" />
      <path d="M33 41v-6a4 4 0 0 1 8 0v6" />
      <path d="M25 41h24" />
    </>
  ),

  // The Kaaba within its courtyard arcade.
  eidAdha: (
    <>
      <path d="M17 20h14v16H17Z" />
      <path d="M17 25h14" />
      <path d="M13 40h22" />
      <path d="M24 20v-4" />
      <path d="M38 40V26a3 3 0 0 1 6 0v14" />
      <path d="M8 40V26a3 3 0 0 1 6 0" />
      <path d="M6 44h36" />
    </>
  ),

  // Palm and crossed swords of the Saudi emblem.
  nationalDay: (
    <>
      <path d="M24 40V24" />
      <path d="M24 24c-4-5-9-6-13-4 3 5 8 7 13 4Z" />
      <path d="M24 24c4-5 9-6 13-4-3 5-8 7-13 4Z" />
      <path d="M24 26c-2-6-6-9-10-9 1 6 5 10 10 9Z" />
      <path d="M10 40h28" />
      <path d="M14 36l20-4" />
      <path d="M34 36L14 32" />
    </>
  ),

  // Najdi door arch with a heritage medallion.
  foundingDay: (
    <>
      <path d="M14 42V22a10 10 0 0 1 20 0v20" />
      <path d="M10 42h28" />
      <path d="M24 22v20" />
      <circle cx="24" cy="14" r="4" />
      <path d="M24 6v2M24 20v2M16 14h2M30 14h2" />
      <path d="M18 30h12" />
    </>
  ),

  // Slim crescent with stars.
  hijriNewYear: (
    <>
      <path d="M30 10a14 14 0 1 0 0 28 17 17 0 0 1 0-28Z" />
      <path d="M37 16l1.2 3 3 1.2-3 1.2L37 24l-1.2-2.6-3-1.2 3-1.2Z" />
      <path d="M40 30l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8Z" />
    </>
  ),

  // Radiating starburst, for fireworks.
  newYear: (
    <>
      <circle cx="24" cy="24" r="3.5" />
      <path d="M24 6v8M24 34v8M6 24h8M34 24h8" />
      <path d="M11.3 11.3l5.7 5.7M31 31l5.7 5.7M36.7 11.3L31 17M17 31l-5.7 5.7" />
    </>
  ),
};

const OccasionIcon = ({ name, className = "" }) => {
  const paths = ICONS[name];
  if (paths) {
    return (
      <svg viewBox="0 0 48 48" className={className} aria-hidden="true" {...props}>
        {paths}
      </svg>
    );
  }

  // Occasions created in /admin choose from a curated lucide shortlist rather
  // than getting a hand-drawn mark. The stroke width is overridden because
  // lucide draws at 2 in a 24 box where these are 1.5 in a 48 box -- left
  // alone, a picked icon reads 2.67x heavier than the six beside it.
  if (isLucideIcon(name)) {
    const Icon = LUCIDE_ICONS[lucideName(name)];
    if (!Icon) return null;
    return (
      <Icon
        className={className}
        aria-hidden="true"
        strokeWidth={LUCIDE_STROKE_WIDTH}
      />
    );
  }

  return null;
};

export default OccasionIcon;
