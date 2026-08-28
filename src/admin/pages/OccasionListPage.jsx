import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react";

import PageShell from "../../components/layout/PageShell.jsx";
import StatusPill from "../../components/ui/StatusPill.jsx";
import OccasionIcon from "../../components/occasions/OccasionIcon.jsx";
import { loc } from "../../lib/localize.js";
import { useLanguage } from "../../hooks/useLanguage.js";

import { listOccasions, designCounts } from "../lib/api.js";
import { useAsync } from "../hooks/useAsync.js";
import AsyncSection from "../components/AsyncSection.jsx";

const load = async () => {
  const [occasions, counts] = await Promise.all([listOccasions(), designCounts()]);
  return occasions.map((o) => ({ ...o, counts: counts[o.slug] ?? { total: 0, draft: 0 } }));
};

/**
 * Every occasion, in display order, including the ones the public cannot see.
 *
 * That is the whole point of this screen existing separately from the home
 * page: it reads Postgres rather than the published snapshot, so drafts and
 * archives appear here and nowhere else.
 */
const OccasionListPage = () => {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const { state, data, error, reload } = useAsync(load);

  return (
    <PageShell>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          {t("admin.occasions.title")}
        </h1>
        <p className="mt-1 text-sm text-ink-2">{t("admin.occasions.subtitle")}</p>
      </header>

      <AsyncSection
        state={state}
        error={error}
        onRetry={reload}
        empty={t("admin.occasions.empty")}
      >
        <ul className="flex flex-col gap-2">
          {data?.map((occasion) => (
            <li key={occasion.slug}>
              <Link
                to={`/admin/designs?occasion=${occasion.slug}`}
                className="panel flex items-center gap-4 rounded-2xl p-4 transition-colors hover:bg-surface-3"
              >
                <span className="shrink-0 text-brand">
                  <OccasionIcon name={occasion.icon} className="h-8 w-8" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-medium text-ink">
                      {loc(occasion.title, lang)}
                    </span>
                    <StatusPill status={occasion.status} />
                    {!occasion.enabled && (
                      <span className="text-xs text-ink-3">
                        {t("admin.occasions.hidden")}
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block truncate text-sm text-ink-3">
                    {occasion.slug}
                  </span>
                </span>

                <span className="shrink-0 text-end text-sm text-ink-2">
                  <span className="block">
                    {t("admin.occasions.designCount", { count: occasion.counts.total })}
                  </span>
                  {occasion.counts.draft > 0 && (
                    <span className="block text-xs text-ink-3">
                      {t("admin.occasions.draftCount", { count: occasion.counts.draft })}
                    </span>
                  )}
                </span>

                <ChevronRight
                  className="h-4 w-4 shrink-0 text-ink-3 rtl:rotate-180"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </AsyncSection>
    </PageShell>
  );
};

export default OccasionListPage;
