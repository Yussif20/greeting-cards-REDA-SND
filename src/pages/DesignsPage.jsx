import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Info } from "lucide-react";
import { useBrandParam } from "../hooks/useBrandParam.js";
import { useLanguage } from "../hooks/useLanguage.js";
import { seasonsIn, stylesIn } from "../data/designs/index.js";
import { categoriesIn } from "../data/categories.js";
import { OTHER_BRAND } from "../lib/brandGroups.js";
import { loc, occasionHeading, occasionShortHeading } from "../lib/localize.js";
import PageShell from "../components/layout/PageShell.jsx";
import Breadcrumbs from "../components/layout/Breadcrumbs.jsx";
import Button from "../components/ui/Button.jsx";
import AnimatedSection from "../components/ui/AnimatedSection.jsx";
import FilterChips from "../components/designs/FilterChips.jsx";
import YearSelect from "../components/designs/YearSelect.jsx";
import DesignCard from "../components/designs/DesignCard.jsx";
import NotFoundPage from "./NotFoundPage.jsx";

const PAGE_SIZE = 6;

/**
 * One company's cards for one occasion, narrowed by category and style.
 *
 * Everything above the grid is derived from this brand's designs rather than
 * from the occasion's, so no control can offer a value that matches nothing:
 * the season dropdown lists only years this company has artwork in, and both
 * chip rows list only what the visible season actually contains.
 *
 * Season, category and style all live in the URL so a view is shareable and
 * survives a refresh; how many cards are revealed is transient and stays in
 * component state.
 */
const DesignsPage = () => {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const { slug, occasion, brandId, brand, valid, designs: brandDesigns } = useBrandParam();

  const [searchParams, setSearchParams] = useSearchParams();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const years = useMemo(() => seasonsIn(brandDesigns), [brandDesigns]);

  // An unknown or absent ?year= opens the newest season rather than 404ing --
  // an old link should still land somewhere sensible.
  const requestedYear = searchParams.get("year");
  const year = years.some((y) => y.id === requestedYear) ? requestedYear : years[0]?.id;

  const designs = useMemo(
    () => brandDesigns.filter((d) => d.year === year),
    [brandDesigns, year],
  );

  // Scoped to the season on show, so a chip never points at an empty grid.
  const styles = useMemo(() => stylesIn(designs), [designs]);
  const categories = useMemo(() => categoriesIn(designs), [designs]);

  const requestedStyle = searchParams.get("style") ?? "all";
  const style =
    requestedStyle === "all" || styles.includes(requestedStyle) ? requestedStyle : "all";

  const requestedCategory = searchParams.get("category") ?? "all";
  const category =
    requestedCategory === "all" || categories.some((c) => c.id === requestedCategory)
      ? requestedCategory
      : "all";

  const filtered = useMemo(
    () =>
      designs.filter(
        (d) =>
          (style === "all" || d.style === style) &&
          (category === "all" || d.category === category),
      ),
    [designs, style, category],
  );

  // Guards render; they never redirect from an effect.
  if (!occasion || !valid) return <NotFoundPage />;

  // Patch one param at a time: season, category and style are independent, and
  // replacing the whole query string would drop the ones not being changed.
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
  const setCategory = (next) => updateParams({ category: next === "all" ? null : next });

  // The newest season is the default, so it stays out of the URL.
  const setYear = (next) => updateParams({ year: next === years[0]?.id ? null : next });

  const brandName = brandId === OTHER_BRAND ? t("brands.other") : brand.name;

  // Back to the brand chooser, keeping the season unless it is the one that
  // page opens on anyway.
  const backToBrands =
    year && year !== years[0]?.id ? `/${slug}?year=${year}` : `/${slug}`;

  const visible = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;

  return (
    <PageShell accent={occasion.theme.light}>
      <Breadcrumbs
        items={[
          { label: t("common.breadcrumb.home"), to: "/" },
          { label: occasionShortHeading(occasion, lang), to: backToBrands },
          { label: brandName },
        ]}
      />

      <header className="mb-7">
        <p className="text-sm font-medium text-ink-3">{occasionHeading(occasion, lang)}</p>
        {/* Brand names stay English in both languages -- see src/data/brands.js.
            <bdi> isolates that Latin run inside an otherwise Arabic page. */}
        <h1 className="mt-0.5 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          <bdi dir="ltr">{brandName}</bdi>
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
        {/* Category first: it is what the card is for, which is the question a
            visitor arrives with. Style is how it looks, and is the narrower of
            the two. */}
        <FilterChips
          options={categories.map((c) => ({ value: c.id, label: loc(c.label, lang) }))}
          value={category}
          onChange={setCategory}
          label={t("designs.category")}
          allLabel={t("designs.allCategories")}
        />
        <FilterChips
          options={styles.map((s) => ({ value: s, label: t(`designs.style.${s}`) }))}
          value={style}
          onChange={setStyle}
          label={t("designs.heading")}
        />
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface-2 px-6 py-14 text-center">
          <p className="text-ink-2">
            {designs.length === 0 ? t("brands.noCards") : t("designs.empty")}
          </p>
          {designs.length === 0 ? (
            <Button as={Link} to={backToBrands} variant="secondary" className="mt-5">
              {t("brands.backToBrands")}
            </Button>
          ) : (
            <Button
              variant="secondary"
              className="mt-5"
              onClick={() => updateParams({ style: null, category: null })}
            >
              {t("designs.clearFilter")}
            </Button>
          )}
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
