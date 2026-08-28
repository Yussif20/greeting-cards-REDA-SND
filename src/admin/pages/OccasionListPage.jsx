import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, ChevronUp, ChevronDown, Eye, EyeOff, Trash2, Loader2 } from "lucide-react";

import PageShell from "../../components/layout/PageShell.jsx";
import Button from "../../components/ui/Button.jsx";
import IconButton from "../../components/ui/IconButton.jsx";
import StatusPill from "../../components/ui/StatusPill.jsx";
import Toast from "../../components/ui/Toast.jsx";
import OccasionIcon from "../../components/occasions/OccasionIcon.jsx";
import { loc } from "../../lib/localize.js";
import { useLanguage } from "../../hooks/useLanguage.js";

import { listOccasions, designCounts } from "../lib/api.js";
import { setOccasionStatus, reorderOccasions, deleteOccasion } from "../lib/mutations.js";
import { useAsync } from "../hooks/useAsync.js";
import AsyncSection from "../components/AsyncSection.jsx";

const load = async () => {
  const [occasions, counts] = await Promise.all([listOccasions(), designCounts()]);
  return occasions.map((o) => ({ ...o, counts: counts[o.slug] ?? { total: 0, draft: 0 } }));
};

/**
 * Every occasion, in display order, including the ones the public cannot see.
 *
 * Reordering is up and down buttons rather than drag and drop. HTML5 drag
 * events do not fire on touch at all, and a pointer-based reimplementation is a
 * lot of machinery for a list of six that changes about once a year. Buttons
 * also happen to be the keyboard-accessible version for free.
 */
const OccasionListPage = () => {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const { state, data, error, reload } = useAsync(load);

  // Local copy so the arrows reorder instantly; the write follows behind.
  const [order, setOrder] = useState(null);
  const [pending, setPending] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (data) setOrder(data);
  }, [data]);

  const rows = order ?? [];

  const move = async (index, delta) => {
    const next = [...rows];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);

    setPending("order");
    try {
      await reorderOccasions(next.map((o) => o.slug));
      setToast({ tone: "info", message: t("admin.occasion.reordered") });
    } catch (err) {
      setOrder(rows); // put it back rather than lie about what was saved
      setToast({ tone: "error", message: err.message });
    } finally {
      setPending(null);
    }
  };

  const toggle = async (occasion) => {
    const live = occasion.status === "published";
    setPending(occasion.slug);
    try {
      await setOccasionStatus(occasion.slug, live ? "archived" : "published");
      setToast({
        tone: "info",
        message: t(live ? "admin.occasion.archived" : "admin.occasion.published"),
      });
      reload();
    } catch (err) {
      setToast({ tone: "error", message: err.message });
    } finally {
      setPending(null);
    }
  };

  const remove = async (occasion) => {
    const message = occasion.publishedAt
      ? t("admin.occasions.confirmDeletePublished")
      : t("admin.occasions.confirmDelete");
    if (!window.confirm(message)) return;

    setPending(occasion.slug);
    try {
      await deleteOccasion(occasion.slug);
      setToast({ tone: "info", message: t("admin.occasions.deleted") });
      reload();
    } catch (err) {
      // The foreign key refusal is the expected outcome, not a fault: it is
      // what stops an occasion taking a season of artwork down with it.
      setToast({
        tone: "error",
        message:
          err.code === "occasionHasDesigns"
            ? t("admin.occasions.hasDesigns", { count: err.count ?? 0 })
            : err.message,
      });
    } finally {
      setPending(null);
    }
  };

  return (
    <PageShell>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            {t("admin.occasions.title")}
          </h1>
          <p className="mt-1 text-sm text-ink-2">{t("admin.occasions.subtitle")}</p>
        </div>
        <Button as={Link} to="/admin/occasions/new" variant="primary">
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t("admin.occasions.add")}
        </Button>
      </header>

      <AsyncSection
        state={state}
        error={error}
        onRetry={reload}
        empty={t("admin.occasions.empty")}
      >
        <ul className="flex flex-col gap-2">
          {rows.map((occasion, index) => {
            const busy = pending === occasion.slug || pending === "order";
            const live = occasion.status === "published";
            // Same rule as cards: gone from the site before it can be gone
            // for good.
            const removable = occasion.status !== "published";

            return (
              <li
                key={occasion.slug}
                className="panel flex flex-wrap items-center gap-4 rounded-2xl p-4"
              >
                <span className="shrink-0 text-brand">
                  <OccasionIcon name={occasion.icon} className="h-8 w-8" />
                </span>

                <Link
                  to={`/admin/designs?occasion=${occasion.slug}`}
                  className="min-w-0 flex-1 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2"
                >
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
                  {/* <bdi> around the slug, because it is Latin text inside an
                      Arabic sentence. Without isolation the bidi algorithm
                      reorders the run and the separator drifts to the wrong
                      side -- the same class of bug FieldLabel guards against
                      with its bracketed secondary label. */}
                  <span className="mt-0.5 block truncate text-sm text-ink-3">
                    <bdi dir="ltr">{occasion.slug}</bdi> ·{" "}
                    {t("admin.occasions.designCount", { count: occasion.counts.total })}
                    {occasion.counts.draft > 0 &&
                      ` · ${t("admin.occasions.draftCount", { count: occasion.counts.draft })}`}
                  </span>
                </Link>

                <div className="flex shrink-0 items-center gap-1">
                  <IconButton
                    label={t("admin.occasions.moveUp")}
                    disabled={index === 0 || busy}
                    onClick={() => move(index, -1)}
                  >
                    <ChevronUp className="h-4 w-4" aria-hidden="true" />
                  </IconButton>
                  <IconButton
                    label={t("admin.occasions.moveDown")}
                    disabled={index === rows.length - 1 || busy}
                    onClick={() => move(index, 1)}
                  >
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  </IconButton>

                  <Button
                    as={Link}
                    to={`/admin/occasions/${occasion.slug}`}
                    size="sm"
                    variant="secondary"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    {t("admin.occasions.edit")}
                  </Button>

                  <Button size="sm" variant="ghost" disabled={busy} onClick={() => toggle(occasion)}>
                    {busy ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    ) : live ? (
                      <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    <span className="sr-only sm:not-sr-only">
                      {t(live ? "admin.designs.archive" : "admin.designs.publish")}
                    </span>
                  </Button>

                  {removable && (
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={busy}
                      onClick={() => remove(occasion)}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span className="sr-only">{t("admin.occasions.delete")}</span>
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </AsyncSection>

      <Toast
        message={toast?.message}
        tone={toast?.tone}
        onDismiss={() => setToast(null)}
        dismissLabel={t("common.dismiss")}
      />
    </PageShell>
  );
};

export default OccasionListPage;
