import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { loc, occasionHeading } from "../../lib/localize.js";
import { useLanguage } from "../../hooks/useLanguage.js";
import OccasionIcon from "./OccasionIcon.jsx";

/**
 * Photo tile: full-bleed hero under a bottom scrim, gold line icon, bilingual
 * title, one-line description, and a circular chevron.
 *
 * `eager` marks the above-the-fold tiles so the LCP image is not lazy.
 */
const OccasionCard = ({ occasion, eager = false }) => {
  const { t } = useTranslation();
  const { lang } = useLanguage();

  const title = occasionHeading(occasion, lang);
  const english = loc(occasion.title, "en");
  const arabic = loc(occasion.title, "ar");
  const { hero, theme } = occasion;

  return (
    <Link
      to={`/${occasion.slug}`}
      aria-label={t("home.openOccasion", { name: english })}
      className="hover-lift group relative block overflow-hidden rounded-2xl border border-line shadow-[var(--shadow-card)] focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{ outlineColor: theme.light.accent }}
    >
      <div className="relative aspect-16/9 w-full overflow-hidden bg-surface-3">
        <picture>
          <source
            type="image/avif"
            srcSet={`${hero.base}.avif 760w, ${hero.base}@2x.avif 1520w`}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
          <source
            type="image/webp"
            srcSet={`${hero.base}.webp 760w, ${hero.base}@2x.webp 1520w`}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
          <img
            src={`${hero.base}.jpg`}
            srcSet={`${hero.base}.jpg 760w, ${hero.base}@2x.jpg 1520w`}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            width={hero.width}
            height={hero.height}
            alt={loc(hero.alt, lang)}
            loading={eager ? "eager" : "lazy"}
            fetchPriority={eager ? "high" : undefined}
            decoding="async"
            style={{ objectPosition: hero.focal }}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        </picture>

        {/* Scrim: keeps the title legible whatever the photograph does. */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, ${theme.light.scrimTo} 0%, ${theme.light.scrimTo} 22%, ${theme.light.scrimFrom} 62%)`,
          }}
        />

        <div className="absolute inset-x-0 bottom-0 flex items-end gap-3 p-4 sm:p-5">
          <OccasionIcon
            name={occasion.icon}
            className="mb-1 h-10 w-10 shrink-0 text-gold-300 opacity-90 sm:h-11 sm:w-11"
          />

          <div className="min-w-0 flex-1">
            <h2
              lang="ar"
              dir="rtl"
              className="truncate text-lg font-bold text-white sm:text-xl"
            >
              {lang === "ar" ? title : arabic}
            </h2>
            <p lang="en" dir="ltr" className="truncate text-sm text-white/85">
              {lang === "ar" ? english : title}
            </p>
            <p
              lang="ar"
              dir="rtl"
              className="mt-1 truncate text-xs text-white/70"
            >
              {loc(occasion.tagline, "ar")}
            </p>
          </div>

          <span
            aria-hidden="true"
            className="mb-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/60 text-white transition-colors duration-300 group-hover:bg-white/15"
          >
            <ChevronRight className="h-4.5 w-4.5 rtl:rotate-180" />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default OccasionCard;
