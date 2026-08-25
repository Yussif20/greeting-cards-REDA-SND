// REDA Cards wordmark.
//
// NOTE: the official vector has not been supplied -- this is hand-authored from
// the design mockup and should be swapped for the real asset when it arrives.
// Shape: interlocking hexagonal mark, then "REDA" over a letter-spaced "CARDS".

const RedaCardsLogo = ({ className = "", title = "REDA Cards" }) => (
  <svg
    viewBox="0 0 260 64"
    className={className}
    role="img"
    aria-label={title}
    fill="none"
  >
    <title>{title}</title>

    {/* Mark: two interlocking hexagons */}
    <g transform="translate(2 8)">
      <path
        d="M24 0 L44 11.5 L44 34.5 L24 46 L4 34.5 L4 11.5 Z"
        fill="currentColor"
        opacity="0.14"
      />
      <path
        d="M15 14 L27 7 L39 14 M15 32 L27 39 L39 32"
        stroke="currentColor"
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 23 L27 18.5 L35 23 L27 27.5 Z"
        fill="currentColor"
      />
    </g>

    {/* Wordmark */}
    <text
      x="60"
      y="33"
      fill="currentColor"
      fontFamily="var(--font-sans)"
      fontSize="30"
      fontWeight="700"
      letterSpacing="0.5"
    >
      REDA
    </text>
    <text
      x="61"
      y="51"
      fill="currentColor"
      fontFamily="var(--font-sans)"
      fontSize="12"
      fontWeight="500"
      letterSpacing="7.5"
      opacity="0.72"
    >
      CARDS
    </text>
  </svg>
);

export default RedaCardsLogo;
