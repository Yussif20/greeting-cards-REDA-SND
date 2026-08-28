import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Eye, EyeOff, Trash2, Loader2 } from "lucide-react";

import PageShell from "../../components/layout/PageShell.jsx";
import Button from "../../components/ui/Button.jsx";
import TextField from "../../components/ui/TextField.jsx";
import StatusPill from "../../components/ui/StatusPill.jsx";
import Toast from "../../components/ui/Toast.jsx";
import { loc } from "../../lib/localize.js";
import { useLanguage } from "../../hooks/useLanguage.js";

import { listSeasons, listDesigns } from "../lib/api.js";
import { createSeason, setSeasonStatus, deleteSeason } from "../lib/mutations.js";
import { useAsync } from "../hooks/useAsync.js";
import AsyncSection from "../components/AsyncSection.jsx";

const load = async () => {
  const [seasons, designs] = await Promise.all([listSeasons(), listDesigns(null)]);
  return seasons.map((s) => ({
    ...s,
    cards: designs.filter((d) => d.year === s.id).length,
  }));
};

/**
 * Seasons: the archive of card years.
 *
 * Designs accumulate rather than being replaced, so every card belongs to one
 * of these and the upload form only offers seasons that exist. Without a way
 * to add one, the dashboard would stop short of the single job it is most
 * needed for -- next year's cards.
 *
 * A season is created as a draft like everything else. It becomes selectable
 * for uploads immediately, but stays out of the public year dropdown until
 * published, so a season can be filled with cards before anyone can see that
 * it exists.
 */
const SeasonListPage = () => {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const { state, data, error, reload } = useAsync(load);

  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ id: "", en: "", ar: "" });
  const [pending, setPending] = useState(null);
  const [toast, setToast] = useState(null);

  const act = async (key, run, message) => {
    setPending(key);
    try {
      await run();
      setToast({ tone: "info", message });
      reload();
    } catch (err) {
      setToast({
        tone: "error",
        message:
          err.code === "seasonHasDesigns"
            ? t("admin.seasons.hasDesigns", { count: err.count ?? 0 })
            : err.message,
      });
    } finally {
      setPending(null);
    }
  };

  // "2026-2027" reads as "2026 / 2027" in English and in Arabic-Indic digits in
  // Arabic, matching the existing season rather than leaving the admin to
  // reproduce a convention they cannot see.
  const suggest = (id) => {
    const [from, to] = id.split("-");
    if (!from || !to) return { en: "", ar: "" };
    const arabic = (n) => n.replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
    return { en: `${from} / ${to}`, ar: `${arabic(from)} / ${arabic(to)}` };
  };

  const submit = async (event) => {
    event.preventDefault();
    await act(
      "new",
      () => createSeason({ id: draft.id, label: { en: draft.en, ar: draft.ar } }),
      t("admin.seasons.created"),
    );
    setAdding(false);
    setDraft({ id: "", en: "", ar: "" });
  };

  return (
    <PageShell>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            {t("admin.seasons.title")}
          </h1>
          <p className="mt-1 text-sm text-ink-2">{t("admin.seasons.subtitle")}</p>
        </div>
        {!adding && (
          <Button variant="primary" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t("admin.seasons.add")}
          </Button>
        )}
      </header>

      {adding && (
        <form onSubmit={submit} className="panel mb-6 rounded-2xl p-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="season-id" className="mb-2 block text-sm font-medium text-ink">
                {t("admin.seasons.id")}
              </label>
              <TextField
                id="season-id"
                dir="ltr"
                required
                pattern="[0-9]{4}-[0-9]{4}"
                placeholder="2026-2027"
                value={draft.id}
                onChange={(e) => {
                  const id = e.target.value;
                  const s = suggest(id);
                  setDraft((d) => ({
                    id,
                    // Only fill what the admin has not typed over.
                    en: d.en && d.en !== suggest(d.id).en ? d.en : s.en,
                    ar: d.ar && d.ar !== suggest(d.id).ar ? d.ar : s.ar,
                  }));
                }}
              />
              <p className="mt-1.5 text-xs text-ink-3">{t("admin.seasons.idHint")}</p>
            </div>

            <div>
              <label htmlFor="season-en" className="mb-2 block text-sm font-medium text-ink">
                {t("admin.seasons.labelEn")}
              </label>
              <TextField
                id="season-en"
                dir="ltr"
                lang="en"
                required
                value={draft.en}
                onChange={(e) => setDraft((d) => ({ ...d, en: e.target.value }))}
              />
            </div>

            <div>
              <label htmlFor="season-ar" className="mb-2 block text-sm font-medium text-ink">
                {t("admin.seasons.labelAr")}
              </label>
              <TextField
                id="season-ar"
                dir="rtl"
                lang="ar"
                required
                value={draft.ar}
                onChange={(e) => setDraft((d) => ({ ...d, ar: e.target.value }))}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Button type="submit" variant="primary" disabled={pending === "new"}>
              {pending === "new" && (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              )}
              {t("admin.seasons.create")}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setAdding(false)}>
              {t("admin.upload.cancel")}
            </Button>
          </div>
        </form>
      )}

      <AsyncSection
        state={state}
        error={error}
        onRetry={reload}
        empty={t("admin.seasons.empty")}
      >
        <ul className="flex flex-col gap-2">
          {data?.map((season) => {
            const busy = pending === season.id;
            const live = season.status === "published";

            return (
              <li
                key={season.id}
                className="panel flex flex-wrap items-center gap-4 rounded-2xl p-4"
              >
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-ink">{loc(season.label, lang)}</span>
                    <StatusPill status={season.status} />
                  </span>
                  <span dir="ltr" className="mt-0.5 block text-sm text-ink-3">
                    {season.id} · {t("admin.seasons.cardCount", { count: season.cards })}
                  </span>
                </span>

                <div className="flex shrink-0 items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busy}
                    onClick={() =>
                      act(
                        season.id,
                        () => setSeasonStatus(season.id, live ? "archived" : "published"),
                        t(live ? "admin.seasons.archived" : "admin.seasons.published"),
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

                  {!live && (
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={busy}
                      onClick={() => {
                        if (!window.confirm(t("admin.seasons.confirmDelete"))) return;
                        act(season.id, () => deleteSeason(season.id), t("admin.seasons.deleted"));
                      }}
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

export default SeasonListPage;
