import { useTranslation } from "react-i18next";
import { visibleOccasions } from "../data/occasions.js";
import PageShell from "../components/layout/PageShell.jsx";
import AnimatedSection from "../components/ui/AnimatedSection.jsx";
import OccasionCard from "../components/occasions/OccasionCard.jsx";

const OccasionsPage = () => {
  const { t } = useTranslation();
  const occasions = visibleOccasions();

  return (
    <PageShell fullHeight>
      <header className="mb-8 shrink-0 text-center sm:mb-10 lg:mb-6">
        <h1 className="text-4xl font-bold tracking-tight text-brand-strong sm:text-5xl lg:text-[2.75rem] xl:text-5xl">
          {t("home.title")}
        </h1>
        <p className="mt-2 text-2xl font-light text-ink-2 sm:text-3xl lg:mt-1 lg:text-2xl xl:text-3xl">
          {t("home.subtitle")}
        </p>
        <p
          lang="ar"
          dir="rtl"
          className="mt-3 text-base text-ink-2 sm:text-lg lg:mt-2 lg:text-base"
        >
          {t("common.taglineAr")}
        </p>
        <span
          aria-hidden="true"
          className="mx-auto mt-5 block h-1 w-20 rounded-full bg-brand lg:mt-4"
        />
      </header>

      {/* On a desktop-sized viewport the grid takes whatever height is left and
          its two rows share it evenly, so the tiles size themselves to the
          screen rather than the page growing past it. */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 desktop:min-h-0 desktop:flex-1 desktop:grid-rows-2">
        {occasions.map((occasion, i) => (
          <AnimatedSection
            key={occasion.slug}
            delay={Math.min(i, 3) * 80}
            className="desktop:min-h-0"
          >
            <OccasionCard occasion={occasion} eager={i < 3} />
          </AnimatedSection>
        ))}
      </div>
    </PageShell>
  );
};

export default OccasionsPage;
