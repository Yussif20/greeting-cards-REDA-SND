// The marks an admin can choose for a new occasion.
//
// A curated list, not all 1500 of lucide's icons: the six hand-drawn marks are
// a set, and the point of choosing from a shortlist is that a seventh occasion
// still looks like it belongs beside them on the home page.
//
// Statically imported on purpose. lucide-react/dynamicIconImports would make
// an icon render asynchronously, reintroducing exactly the flash of missing
// content the synchronous registry snapshot exists to prevent -- on the home
// page, which is the first thing anyone sees.
//
// That choice has a price, and it is paid by every visitor: OccasionIcon
// renders on the home page, so whatever is listed here lands in the PUBLIC
// bundle, not the admin chunk. Measured, an unconstrained 60-icon list cost
// 6.9KB gzipped; this list of 24 costs about a third of that. Keep it short --
// each addition is charged to people who will never open /admin.

import {
  Gift, PartyPopper, Sparkles, Heart, Handshake,
  Moon, MoonStar, Star, Sun, Sunrise,
  Flag, Landmark, Castle, Crown, Award,
  TreePalm, Mountain, Leaf, Flower,
  Compass, Globe,
  Calendar, Bell, Flame,
} from "lucide-react";

/** Prefix that marks an occasion's `icon` as one of these rather than a
    hand-drawn key in OccasionIcon's own map. */
export const LUCIDE_PREFIX = "lucide:";

export const isLucideIcon = (name) => Boolean(name?.startsWith(LUCIDE_PREFIX));
export const lucideName = (name) => name.slice(LUCIDE_PREFIX.length);

/**
 * Optically matched to the hand-drawn set.
 *
 * The originals are strokeWidth 1.5 in a 48x48 viewBox -- 3.125% of the box.
 * Lucide draws at strokeWidth 2 in 24x24, which is 8.33%, so at the same
 * rendered size a lucide mark would be 2.67 times heavier and would read as a
 * different family sitting in the same row. 0.75 in a 24 box is the same
 * 3.125%.
 */
export const LUCIDE_STROKE_WIDTH = 0.75;

/** Grouped only so the picker can show headings; the values are what matter. */
export const LUCIDE_GROUPS = [
  { key: "celebration", icons: { Gift, PartyPopper, Sparkles, Heart, Handshake } },
  { key: "sky", icons: { Moon, MoonStar, Star, Sun, Sunrise } },
  { key: "heritage", icons: { Flag, Landmark, Castle, Crown, Award } },
  { key: "nature", icons: { TreePalm, Mountain, Leaf, Flower } },
  { key: "journey", icons: { Compass, Globe } },
  { key: "other", icons: { Calendar, Bell, Flame } },
];

/** Flat lookup, for rendering a stored `icon` value. */
export const LUCIDE_ICONS = Object.fromEntries(
  LUCIDE_GROUPS.flatMap((group) => Object.entries(group.icons)),
);
