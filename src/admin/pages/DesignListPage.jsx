import { useId, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus, SlidersHorizontal, Eye, EyeOff, Trash2, Loader2 } from "lucide-react";

import PageShell from "../../components/layout/PageShell.jsx";
import Button from "../../components/ui/Button.jsx";
import Select from "../../components/ui/Select.jsx";
import StatusPill from "../../components/ui/StatusPill.jsx";
import Toast from "../../components/ui/Toast.jsx";
import { loc } from "../../lib/localize.js";
import { useLanguage } from "../../hooks/useLanguage.js";

import { listOccasions, listDesigns } from "../lib/api.js";
import { setStatus, deleteDesign } from "../lib/mutations.js";
import { useAsync } from "../hooks/useAsync.js";
import AsyncSection from "../components/AsyncSection.jsx";

const ALL = "__all__";

/**
 * Every card, filtered by occasion, with the actions that change what the
 * public can see.
 *
 * Publishing and archiving are offered on every row; permanent deletion only
 * once a card is not public. Removing something that has been live is
 * therefore two deliberate steps -- unpublish, then delete -- and the second
 * one says in words that a link somebody shared will stop working. The
 * database enforces the same rule in its delete policy, so a bug here cannot
 * destroy a card customers can currently see.
 */
const DesignListPage = () => {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const [params, setParams] = useSearchParams();
  const id = useId();
  const labelId = `${id}-label`;

  const [pending, setPending] = useState(null);
  const [toast, setToast] = useState(null);

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

  const act = async (design, run, message) => {
    setPending(design.id);
    try {
      await run();
      setToast({ tone: "info", message });
      designs.reload();
    } catch (err) {
      setToast({ tone: "error", message: err.message });
    } finally {
      setPending(null);
    }
  };

  const addHref = slug === ALL ? "/admin/designs/new" : `/admin/designs/new?occasion=${slug}`;

  return (
    <PageShell>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            {t("admin.designs.title")}
          </h1>
          <p className="mt-1 text-sm text-ink-2">{t("admin.designs.subtitle")}</p>
        </div>
        <Button as={Link} to={addHref} variant="primary">
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t("admin.designs.add")}
        </Button>
      </header>

      <div className="mb-6 flex items-center gap-2.5">
        <label htmlFor={id} id={labelId} className="shrink-0 text-sm font-medium text-ink-2">
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
          {designs.data?.map((design) => {
            const busy = pending === design.id;
            const live = design.status === "published";
            // Deletable once it is not public. Removing something that HAS
            // been live stays two deliberate steps -- unpublish, then delete --
            // and the confirmation says what that costs, because a link
            // somebody shared will stop working.
            const removable = design.status !== "published";
            const wasLive = Boolean(design.publishedAt);

            return (
              <li key={design.id} className="panel flex flex-col overflow-hidden rounded-2xl">
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

                <div className="flex flex-1 flex-col p-3">
                  <p className="flex items-center justify-between gap-2 text-sm font-medium text-ink">
                    <span>{String(design.number).padStart(2, "0")}</span>
                    <span className="text-xs font-normal text-ink-3">{design.year}</span>
                  </p>
                  {/* Same reason as the occasion slug: "rhc" is Latin, the
                      style name is translated, and an unisolated mix reorders. */}
                  <p className="mt-1 truncate text-xs text-ink-3">
                    {design.brand && <bdi dir="ltr">{design.brand}</bdi>}
                    {design.brand && " · "}
                    {t(`designs.style.${design.style}`)}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <Button
                      as={Link}
                      to={`/admin/designs/${design.id}/layout`}
                      size="sm"
                      variant="secondary"
                    >
                      <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                      {t("admin.designs.layout")}
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busy}
                      onClick={() =>
                        act(
                          design,
                          () => setStatus(design.id, live ? "archived" : "published"),
                          t(live ? "admin.designs.archived" : "admin.designs.publishedToast"),
                        )
                      }
                    >
                      {busy ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                      ) : live ? (
                        <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      {t(live ? "admin.designs.archive" : "admin.designs.publish")}
                    </Button>

                    {removable && (
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={busy}
                        onClick={() => {
                          const message = wasLive
                            ? t("admin.designs.confirmDeletePublished")
                            : t("admin.designs.confirmDelete");
                          if (!window.confirm(message)) return;
                          act(design, () => deleteDesign(design.id), t("admin.designs.deleted"));
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="sr-only">{t("admin.designs.delete")}</span>
                      </Button>
                    )}
                  </div>
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

export default DesignListPage;
