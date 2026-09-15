import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Info } from "lucide-react";

import { useOccasionParam } from "../hooks/useOccasionParam.js";
import { useLanguage } from "../hooks/useLanguage.js";
import { getDesigns, getYears } from "../data/designs/index.js";
import { BRANDS } from "../data/brands.js";
import { brandGroups, coverFor, OTHER_BRAND } from "../lib/brandGroups.js";
import { occasionHeading, occasionShortHeading } from "../lib/localize.js";

import PageShell from "../components/layout/PageShell.jsx";
import Breadcrumbs from "../components/layout/Breadcrumbs.jsx";
import AnimatedSection from "../components/ui/AnimatedSection.jsx";
import YearSelect from "../components/designs/YearSelect.jsx";
import BrandCard from "../components/brands/BrandCard.jsx";
import NotFoundPage from "./NotFoundPage.jsx";

/**
 * The second step: which company's cards.
 *
 * This page used to be the design grid. The grid moved one level down, to
 * /:occasion/brands/:brandId, because a season now holds several cards per
 * company rather than one -- a flat grid of forty thumbnails, six of which are
 * yours, is not a chooser.
 *
 * The editor's URL is deliberately untouched: /:occasion/:designId still
 * resolves, so every bookmarked card and every saved localStorage draft
 * survives this change. The new route has three segments rather than two, so
 * react-router separates them without either needing to know about the other.
 */
const BrandsPage = () => {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const { slug, occasion } = useOccasionParam();

  // The season lives in the URL so the view is shareable and survives a
  // refresh, and it is carried down to the designs page so picking a company
  // never silently moves you to a different year.
  const [searchParams, setSearchParams] = useSearchParams();

  const years = useMemo(() => (occasion ? getYears(slug) : []), [occasion, slug]);

  // An unknown or absent ?year= opens the newest season rather than 404ing --
  // an old link should still land somewhere sensible.
  const requestedYear = searchParams.get("year");
  const year = years.some((y) => y.id === requestedYear) ? requestedYear : years[0]?.id;

  const designs = useMemo(
    () => (occasion ? getDesigns(slug, year) : []),
    [occasion, slug, year],
  );
  const groups = useMemo(() => brandGroups(designs, BRANDS), [designs]);

  // Guards render; they never redirect from an effect.
  if (!occasion) return <NotFoundPage />;

  // The newest season is the default, so it stays out of the URL -- /:occasion
  // keeps meaning "this year's cards".
  const setYear = (next) => {
    const patched = new URLSearchParams(searchParams);
    if (next === years[0]?.id) patched.delete("year");
    else patched.set("year", next);
    setSearchParams(patched, { replace: true });
  };

  const hrefFor = (brandId) => {
    const query = year && year !== years[0]?.id ? `?year=${year}` : "";
    return `/${slug}/brands/${brandId}${query}`;
  };

  return (
    <PageShell accent={occasion.theme.light}>
      <Breadcrumbs
        items={[
          { label: t("common.breadcrumb.home"), to: "/" },
          { label: occasionShortHeading(occasion, lang) },
        ]}
      />

      <header className="mb-7">
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {occasionHeading(occasion, lang)}
        </h1>
        <p className="mt-1.5 text-ink-2">{t("brands.chooseABrand")}</p>

        {occasion.artStatus === "placeholder" && (
          <p className="mt-4 flex items-start gap-2 rounded-xl border border-line bg-surface-3 px-3.5 py-3 text-sm text-ink-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-ink-3" aria-hidden="true" />
            <span>{t("designs.sampleNotice")}</span>
          </p>
        )}
      </header>

      <div className="mb-7 flex flex-wrap items-center gap-x-5 gap-y-3">
        <YearSelect years={years} value={year} onChange={setYear} />
      </div>

      {/* brandGroups always returns the full roster, so an occasion with no
          artwork at all would otherwise render seven dead tiles and never say
          why. The emptiness is a property of the designs, not of the groups. */}
      {designs.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface-2 px-6 py-14 text-center">
          <p className="text-ink-2">{t("brands.none")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {groups.map((group, i) => (
            <AnimatedSection key={group.id} delay={Math.min(i, 5) * 60} className="h-full">
              <BrandCard
                to={hrefFor(group.id)}
                // The catch-all group is not a company, so it takes an
                // interface string where the others take a trade name.
                name={group.id === OTHER_BRAND ? t("brands.other") : group.name}
                cards={group.cards}
                // What the admin chose for this company on this occasion, or
                // its first card. Covers do not vary by season, so this is the
                // one thing on the page the year dropdown does not reach.
                cover={coverFor(group, occasion.brandCovers)}
                disabled={group.disabled}
                eager={i < 3}
              />
            </AnimatedSection>
          ))}
        </div>
      )}
    </PageShell>
  );
};

export default BrandsPage;
