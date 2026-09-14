import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * One company's tile on the brand chooser.
 *
 * The artwork is the label. There are no transparent brand logo files -- the
 * wordmark is baked into every card -- so a tile showing the company's first
 * card is not a placeholder for a logo, it is the most honest thing available:
 * it is what that company's cards actually look like this season.
 *
 * A brand with no card for this occasion still gets a tile, disabled. The
 * roster is the REDA group, and dropping the empty ones would read as artwork
 * gone missing rather than as artwork that does not exist yet. It renders as a
 * <div>, not a disabled <a>: there is nowhere to go, so there should be nothing
 * to tab to.
 *
 * `eager` marks the tiles above the fold so the LCP image is not lazy.
 */
const BrandCard = ({ to, name, cards, disabled = false, eager = false }) => {
  const { t } = useTranslation();
  const cover = cards[0];

  const body = (
    <>
      <div className="relative aspect-4/3 w-full overflow-hidden bg-surface-3">
        {cover ? (
          <img
            src={cover.thumb}
            alt=""
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-sm text-ink-3">
            {t("brands.noArtwork")}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 px-4 py-3">
        <span className="min-w-0 flex-1">
          {/* Brand names stay English in both languages -- see the note in
              src/data/brands.js. <bdi> isolates that Latin run so the bidi
              algorithm does not reorder it against the Arabic count below. */}
          <span className="block truncate font-semibold text-ink">
            <bdi dir="ltr">{name}</bdi>
          </span>
          <span className="mt-0.5 block text-sm text-ink-3">
            {disabled ? t("brands.empty") : t("brands.cardCount", { count: cards.length })}
          </span>
        </span>

        {!disabled && (
          <span
            aria-hidden="true"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-ink-2 transition-colors duration-300 group-hover:border-transparent group-hover:bg-chip-active group-hover:text-chip-active-fg"
          >
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </span>
        )}
      </div>
    </>
  );

  if (disabled) {
    return (
      <div
        aria-disabled="true"
        className="block h-full overflow-hidden rounded-2xl border border-line bg-surface-2 opacity-55"
      >
        {body}
      </div>
    );
  }

  return (
    <Link
      to={to}
      aria-label={t("brands.open", { name })}
      className="hover-lift group block h-full overflow-hidden rounded-2xl border border-line bg-surface-2 shadow-[var(--shadow-card)] transition-colors hover:border-ink-3 focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      {body}
    </Link>
  );
};

export default BrandCard;
