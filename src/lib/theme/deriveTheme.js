// An occasion's theme, from one colour per mode.
//
// A theme is five values in each of light and dark: accent, accentSoft,
// onAccent, scrimFrom and scrimTo. Asking an admin for ten hex codes would be
// asking them to hand-maintain a colour system, and the four derived ones are
// not free choices anyway -- they are consequences of the accent. So the form
// takes one colour per mode and computes the rest, with every field still
// overridable for the case where a brand guideline says otherwise.

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

const hexToRgb = (hex) => {
  const value = hex.replace("#", "");
  const full =
    value.length === 3
      ? value
          .split("")
          .map((c) => c + c)
          .join("")
      : value;
  const n = Number.parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};

const toHex = ({ r, g, b }) =>
  `#${[r, g, b].map((c) => clamp(Math.round(c), 0, 255).toString(16).padStart(2, "0")).join("")}`.toUpperCase();

const mix = (a, b, weight) => ({
  r: a.r + (b.r - a.r) * weight,
  g: a.g + (b.g - a.g) * weight,
  b: a.b + (b.b - a.b) * weight,
});

/**
 * Relative luminance, WCAG's formula.
 *
 * Used to decide whether text on the accent should be white or near-black.
 * Picking that by eye is exactly the judgement that goes wrong on a mid-tone
 * accent, where both look plausible in isolation and only one is readable.
 */
export function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const channel = (c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

const WHITE = { r: 255, g: 255, b: 255 };
const NEAR_BLACK = { r: 10, g: 8, b: 6 };

/**
 * @param {string} accent hex
 * @param {"light"|"dark"} mode
 */
export function deriveMode(accent, mode) {
  const rgb = hexToRgb(accent);
  const light = mode === "light";

  // A tint of the accent against the surface, for chips and soft fills.
  const accentSoft = toHex(mix(rgb, light ? WHITE : NEAR_BLACK, light ? 0.88 : 0.84));

  // Text sitting ON the accent. The 0.45 threshold is where white stops being
  // the more readable of the two against these accents.
  const onAccent = luminance(accent) > 0.45 ? "#1A1206" : "#FFFFFF";

  // The scrim behind a hero tile's caption: a vertical fade from transparent to
  // a heavily darkened accent, so the gradient belongs to the occasion rather
  // than being a generic grey wash over its photograph.
  const deep = mix(rgb, NEAR_BLACK, light ? 0.86 : 0.94);
  const rgbaOf = (alpha) =>
    `rgba(${Math.round(deep.r)}, ${Math.round(deep.g)}, ${Math.round(deep.b)}, ${alpha})`;

  return {
    accent: accent.toUpperCase(),
    accentSoft,
    onAccent,
    scrimFrom: rgbaOf(0),
    scrimTo: rgbaOf(light ? 0.86 : 0.9),
  };
}

/** Both modes at once, with any explicit overrides applied last. */
export const deriveTheme = (lightAccent, darkAccent, overrides = {}) => ({
  light: { ...deriveMode(lightAccent, "light"), ...(overrides.light ?? {}) },
  dark: { ...deriveMode(darkAccent, "dark"), ...(overrides.dark ?? {}) },
});
