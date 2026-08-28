import { useId } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import PageShell from "../../components/layout/PageShell.jsx";
import Select from "../../components/ui/Select.jsx";
import StatusPill from "../../components/ui/StatusPill.jsx";
import { loc } from "../../lib/localize.js";
import { useLanguage } from "../../hooks/useLanguage.js";

import { listOccasions, listDesigns } from "../lib/api.js";
import { useAsync } from "../hooks/useAsync.js";
import AsyncSection from "../components/AsyncSection.jsx";

const ALL = "__all__";

/**
 * Every design, filtered by occasion.
 *
 * The filter lives in the URL rather than in component state, matching how the
 * public DesignsPage carries ?year= and ?style=: a screen the admin will link
 * a colleague to, or come back to after an edit, should survive being
 * bookmarked and reloaded.
 */
const DesignListPage = () => {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const [params, setParams] = useSearchParams();
  const id = useId();
  const labelId = `${id}-label`;

  const slug = params.get("occasion") ?? ALL;

  const occasions = useAsync(listOccasions);
  const designs = useAsync(() => listDesigns(slug === ALL ? null : slug), [slug]);

  const options = [
    { value: ALL, label: t("admin.designs.allOccasions") },
    ...(occasions.data ?? []).map((o) => ({
      value: o.slug,
      label: loc(o.title, lang),
      hint: o.slug,
    })),
  ];

  const setOccasion = (next) => {
    const patched = new URLSearchParams(params);
    if (next === ALL) patched.delete("occasion");
    else patched.set("occasion", next);
    setParams(patched, { replace: true });
  };

  return (
    <PageShell>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          {t("admin.designs.title")}
        </h1>
        <p className="mt-1 text-sm text-ink-2">{t("admin.designs.subtitle")}</p>
      </header>

      <div className="mb-6 flex items-center gap-2.5">
        <label
          htmlFor={id}
          id={labelId}
          className="shrink-0 text-sm font-medium text-ink-2"
        >
          {t("admin.designs.occasion")}
        </label>
        <div className="w-64 max-w-full">
          <Select
            id={id}
            labelId={labelId}
            value={slug}
            options={options}
            onChange={setOccasion}
          />
        </div>
      </div>

      <AsyncSection
        state={designs.state}
        error={designs.error}
        onRetry={designs.reload}
        empty={t("admin.designs.empty")}
      >
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {designs.data?.map((design) => (
            <li key={design.id} className="panel overflow-hidden rounded-2xl">
              <div className="relative bg-checker">
                <img
                  src={design.thumb}
                  alt=""
                  loading="lazy"
                  crossOrigin="anonymous"
                  style={{ aspectRatio: `${design.width} / ${design.height}` }}
                  className="w-full object-cover"
                />
                <span className="absolute top-2 start-2">
                  <StatusPill status={design.status} />
                </span>
              </div>
              <div className="p-3">
                <p className="flex items-center justify-between gap-2 text-sm font-medium text-ink">
                  <span>{String(design.number).padStart(2, "0")}</span>
                  <span className="text-xs font-normal text-ink-3">{design.year}</span>
                </p>
                <p className="mt-1 truncate text-xs text-ink-3">
                  {[design.brand, t(`designs.style.${design.style}`)]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {design.isPlaceholder && (
                  <p className="mt-1 text-xs text-ink-3">
                    {t("admin.designs.placeholder")}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </AsyncSection>
    </PageShell>
  );
};

export default DesignListPage;
