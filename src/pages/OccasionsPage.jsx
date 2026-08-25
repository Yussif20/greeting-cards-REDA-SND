import { useTranslation } from "react-i18next";
import { visibleOccasions } from "../data/occasions.js";
import PageShell from "../components/layout/PageShell.jsx";
import AnimatedSection from "../components/ui/AnimatedSection.jsx";
import OccasionCard from "../components/occasions/OccasionCard.jsx";

const OccasionsPage = () => {
  const { t } = useTranslation();
  const occasions = visibleOccasions();

  return (
    <PageShell>
      <header className="mb-10 text-center sm:mb-14">
        <h1 className="text-4xl font-bold tracking-tight text-brand-strong sm:text-5xl">
          {t("home.title")}
        </h1>
        <p className="mt-2 text-2xl font-light text-ink-2 sm:text-3xl">
          {t("home.subtitle")}
        </p>
        <p lang="ar" dir="rtl" className="mt-3 text-base text-ink-2 sm:text-lg">
          {t("common.taglineAr")}
        </p>
        <span
          aria-hidden="true"
          className="mx-auto mt-6 block h-1 w-20 rounded-full bg-brand"
        />
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {occasions.map((occasion, i) => (
          <AnimatedSection key={occasion.slug} delay={Math.min(i, 3) * 80}>
            <OccasionCard occasion={occasion} eager={i < 3} />
          </AnimatedSection>
        ))}
      </div>
    </PageShell>
  );
};

export default OccasionsPage;
