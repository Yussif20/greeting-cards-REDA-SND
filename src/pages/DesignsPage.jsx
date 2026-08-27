import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Info } from "lucide-react";
import { useOccasionParam } from "../hooks/useOccasionParam.js";
import { useLanguage } from "../hooks/useLanguage.js";
import { getDesigns, getStyles, getYears } from "../data/designs/index.js";
import { occasionHeading, occasionShortHeading } from "../lib/localize.js";
import PageShell from "../components/layout/PageShell.jsx";
import Breadcrumbs from "../components/layout/Breadcrumbs.jsx";
import Button from "../components/ui/Button.jsx";
import AnimatedSection from "../components/ui/AnimatedSection.jsx";
import FilterChips from "../components/designs/FilterChips.jsx";
import YearSelect from "../components/designs/YearSelect.jsx";
import DesignCard from "../components/designs/DesignCard.jsx";
import NotFoundPage from "./NotFoundPage.jsx";

const PAGE_SIZE = 6;

const DesignsPage = () => {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const { slug, occasion } = useOccasionParam();

  // Season and filter both live in the URL so a view is shareable and survives
  // a refresh; how many are revealed is transient and stays in component state.
  const [searchParams, setSearchParams] = useSearchParams();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const years = useMemo(() => (occasion ? getYears(slug) : []), [occasion, slug]);

  // An unknown or absent ?year= opens the newest season rather than 404ing --
  // an old link should still land somewhere sensible.
  const requestedYear = searchParams.get("year");
  const year = years.some((y) => y.id === requestedYear) ? requestedYear : years[0]?.id;

  const designs = useMemo(
    () => (occasion ? getDesigns(slug, year) : []),
    [occasion, slug, year],
  );
  // Scoped to the season on show, so a chip never points at an empty grid.
  const styles = useMemo(
    () => (occasion ? getStyles(slug, year) : []),
    [occasion, slug, year],
  );

  const requested = searchParams.get("style") ?? "all";
  const style = requested === "all" || styles.includes(requested) ? requested : "all";

  const filtered = useMemo(
    () => (style === "all" ? designs : designs.filter((d) => d.style === style)),
    [designs, style],
  );

  // Guards render; they never redirect from an effect.
  if (!occasion) return <NotFoundPage />;

  // Patch one param at a time: season and style are independent, and replacing
  // the whole query string would drop whichever one was not being changed.
  const updateParams = (patch) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(patch)) {
      if (value == null) next.delete(key);
      else next.set(key, value);
    }
    setSearchParams(next, { replace: true });
    setVisibleCount(PAGE_SIZE);
  };

  const setStyle = (next) => updateParams({ style: next === "all" ? null : next });

  // The newest season is the default, so it stays out of the URL -- /:occasion
  // keeps meaning "this year's cards".
  const setYear = (next) => updateParams({ year: next === years[0]?.id ? null : next });

  const visible = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;

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
        <p className="mt-1.5 text-ink-2">{t("designs.chooseADesign")}</p>

        {occasion.artStatus === "placeholder" && (
          <p className="mt-4 flex items-start gap-2 rounded-xl border border-line bg-surface-3 px-3.5 py-3 text-sm text-ink-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-ink-3" aria-hidden="true" />
            <span>{t("designs.sampleNotice")}</span>
          </p>
        )}
      </header>

      <div className="mb-7 flex flex-wrap items-center gap-x-5 gap-y-3">
        <YearSelect years={years} value={year} onChange={setYear} />
        <FilterChips styles={styles} value={style} onChange={setStyle} />
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface-2 px-6 py-14 text-center">
          <p className="text-ink-2">{t("designs.empty")}</p>
          <Button variant="secondary" className="mt-5" onClick={() => setStyle("all")}>
            {t("designs.clearFilter")}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5">
          {visible.map((design, i) => (
            <AnimatedSection key={design.id} delay={Math.min(i, 5) * 60}>
              <DesignCard design={design} eager={i < 3} />
            </AnimatedSection>
          ))}
        </div>
      )}

      {/* Only rendered when there is genuinely more to show. */}
      {hasMore && (
        <div className="mt-9 flex justify-center">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
          >
            {t("designs.loadMore")}
          </Button>
        </div>
      )}
    </PageShell>
  );
};

export default DesignsPage;
