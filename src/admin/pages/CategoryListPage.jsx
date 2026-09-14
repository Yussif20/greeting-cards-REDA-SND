import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, ChevronUp, ChevronDown, Eye, EyeOff, Trash2, Loader2 } from "lucide-react";

import PageShell from "../../components/layout/PageShell.jsx";
import Button from "../../components/ui/Button.jsx";
import IconButton from "../../components/ui/IconButton.jsx";
import TextField from "../../components/ui/TextField.jsx";
import StatusPill from "../../components/ui/StatusPill.jsx";
import Toast from "../../components/ui/Toast.jsx";
import { loc } from "../../lib/localize.js";
import { useLanguage } from "../../hooks/useLanguage.js";

import { listCategories, categoryCounts } from "../lib/api.js";
import {
  createCategory,
  updateCategory,
  setCategoryStatus,
  reorderCategories,
  deleteCategory,
} from "../lib/mutations.js";
import { useAsync } from "../hooks/useAsync.js";
import AsyncSection from "../components/AsyncSection.jsx";

const load = async () => {
  const [categories, counts] = await Promise.all([listCategories(), categoryCounts()]);
  return categories.map((c) => ({ ...c, cards: counts[c.id] ?? 0 }));
};

/**
 * Categories: what a card is *for*.
 *
 * The one axis of the card registry the client owns outright. Occasions are the
 * calendar, seasons are the year, brands are the group's companies -- all three
 * are given. "موظفين", "عملاء", and whatever is needed next are not, which is
 * why this is a table with an editor rather than four ids in a bundle like
 * designs.style.
 *
 * A category is created as a draft like everything else, and it reaches the
 * public site only when it is both published and stamped on a published card:
 * the chips are built from the categories present in the visible grid, so a
 * published category nothing uses renders nothing. That is what lets the whole
 * taxonomy be set up before a single card moves.
 *
 * Reordering is up and down buttons for the same reason as occasions: HTML5
 * drag events do not fire on touch, and a pointer reimplementation is a lot of
 * machinery for a short list.
 */
const CategoryListPage = () => {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const { state, data, error, reload } = useAsync(load);

  // Local copy so the arrows reorder instantly; the write follows behind.
  const [order, setOrder] = useState(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ id: "", en: "", ar: "" });
  const [editing, setEditing] = useState(null);
  const [pending, setPending] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (data) setOrder(data);
  }, [data]);

  const rows = order ?? [];

  const act = async (key, run, message) => {
    setPending(key);
    try {
      await run();
      setToast({ tone: "info", message });
      reload();
      return true;
    } catch (err) {
      setToast({ tone: "error", message: err.message });
      return false;
    } finally {
      setPending(null);
    }
  };

  /**
   * Suggest the id from the English name, never the Arabic one.
   *
   * The column only accepts `^[a-z0-9]+(-[a-z0-9]+)*$` -- it is a URL segment --
   * so "موظفين" transliterated by machine would produce either nothing or
   * something nobody would choose. English is the half of a bilingual label
   * that is already in the right alphabet.
   */
  const slugify = (value) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const submit = async (event) => {
    event.preventDefault();
    const id = draft.id || slugify(draft.en);
    const ok = await act(
      "new",
      () => createCategory({ id, label: { en: draft.en, ar: draft.ar } }),
      t("admin.categories.created"),
    );
    if (!ok) return;
    setAdding(false);
    setDraft({ id: "", en: "", ar: "" });
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    const ok = await act(
      editing.id,
      () => updateCategory(editing.id, { en: editing.en, ar: editing.ar }),
      t("admin.categories.saved"),
    );
    if (ok) setEditing(null);
  };

  const move = async (index, delta) => {
    const next = [...rows];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);

    setPending("order");
    try {
      await reorderCategories(next.map((c) => c.id));
      setToast({ tone: "info", message: t("admin.categories.reordered") });
    } catch (err) {
      setOrder(rows); // put it back rather than lie about what was saved
      setToast({ tone: "error", message: err.message });
    } finally {
      setPending(null);
    }
  };

  const remove = (category) => {
    // Deleting un-files cards rather than refusing, so the count is the thing
    // worth saying out loud -- see deleteCategory in ../lib/mutations.js.
    const message =
      category.cards > 0
        ? t("admin.categories.confirmDeleteWithCards", { count: category.cards })
        : t("admin.categories.confirmDelete");
    if (!window.confirm(message)) return;
    act(category.id, () => deleteCategory(category.id), t("admin.categories.deleted"));
  };

  return (
    <PageShell>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            {t("admin.categories.title")}
          </h1>
          <p className="mt-1 text-sm text-ink-2">{t("admin.categories.subtitle")}</p>
        </div>
        {!adding && (
          <Button variant="primary" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t("admin.categories.add")}
          </Button>
        )}
      </header>

      {adding && (
        <form onSubmit={submit} className="panel mb-6 rounded-2xl p-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="cat-ar" className="mb-2 block text-sm font-medium text-ink">
                {t("admin.categories.labelAr")}
              </label>
              <TextField
                id="cat-ar"
                dir="rtl"
                lang="ar"
                required
                placeholder="موظفين"
                value={draft.ar}
                onChange={(e) => setDraft((d) => ({ ...d, ar: e.target.value }))}
              />
            </div>

            <div>
              <label htmlFor="cat-en" className="mb-2 block text-sm font-medium text-ink">
                {t("admin.categories.labelEn")}
              </label>
              <TextField
                id="cat-en"
                dir="ltr"
                lang="en"
                required
                placeholder="Employees"
                value={draft.en}
                onChange={(e) => {
                  const en = e.target.value;
                  setDraft((d) => ({
                    ...d,
                    en,
                    // Only fill what the admin has not typed over.
                    id: d.id && d.id !== slugify(d.en) ? d.id : slugify(en),
                  }));
                }}
              />
            </div>

            <div>
              <label htmlFor="cat-id" className="mb-2 block text-sm font-medium text-ink">
                {t("admin.categories.id")}
              </label>
              <TextField
                id="cat-id"
                dir="ltr"
                required
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                placeholder="employees"
                value={draft.id}
                onChange={(e) => setDraft((d) => ({ ...d, id: e.target.value }))}
              />
              <p className="mt-1.5 text-xs text-ink-3">{t("admin.categories.idHint")}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Button type="submit" variant="primary" disabled={pending === "new"}>
              {pending === "new" && (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              )}
              {t("admin.categories.create")}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setAdding(false)}>
              {t("admin.categories.cancel")}
            </Button>
          </div>
        </form>
      )}

      <AsyncSection
        state={state}
        error={error}
        onRetry={reload}
        empty={t("admin.categories.empty")}
      >
        <ul className="flex flex-col gap-2">
          {rows.map((category, index) => {
            const busy = pending === category.id || pending === "order";
            const live = category.status === "published";
            // Same rule as every other row: gone from the site before it can be
            // gone for good.
            const removable = category.status !== "published";

            if (editing?.id === category.id) {
              return (
                <li key={category.id} className="panel rounded-2xl p-4">
                  <form onSubmit={saveEdit} className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor={`edit-ar-${category.id}`}
                        className="mb-2 block text-sm font-medium text-ink"
                      >
                        {t("admin.categories.labelAr")}
                      </label>
                      <TextField
                        id={`edit-ar-${category.id}`}
                        dir="rtl"
                        lang="ar"
                        required
                        value={editing.ar}
                        onChange={(e) => setEditing((c) => ({ ...c, ar: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`edit-en-${category.id}`}
                        className="mb-2 block text-sm font-medium text-ink"
                      >
                        {t("admin.categories.labelEn")}
                      </label>
                      <TextField
                        id={`edit-en-${category.id}`}
                        dir="ltr"
                        lang="en"
                        required
                        value={editing.en}
                        onChange={(e) => setEditing((c) => ({ ...c, en: e.target.value }))}
                      />
                    </div>
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <Button type="submit" variant="primary" size="sm" disabled={busy}>
                        {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
                        {t("admin.categories.save")}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditing(null)}
                      >
                        {t("admin.categories.cancel")}
                      </Button>
                    </div>
                  </form>
                </li>
              );
            }

            return (
              <li
                key={category.id}
                className="panel flex flex-wrap items-center gap-4 rounded-2xl p-4"
              >
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-ink">{loc(category.label, lang)}</span>
                    <StatusPill status={category.status} />
                  </span>
                  {/* <bdi> around the id: it is Latin text inside an Arabic
                      sentence, and without isolation the separator drifts to
                      the wrong side of the count. */}
                  <span className="mt-0.5 block text-sm text-ink-3">
                    <bdi dir="ltr">{category.id}</bdi> ·{" "}
                    {t("admin.categories.cardCount", { count: category.cards })}
                  </span>
                </span>

                <div className="flex shrink-0 items-center gap-1">
                  <IconButton
                    label={t("admin.categories.moveUp")}
                    disabled={index === 0 || busy}
                    onClick={() => move(index, -1)}
                  >
                    <ChevronUp className="h-4 w-4" aria-hidden="true" />
                  </IconButton>
                  <IconButton
                    label={t("admin.categories.moveDown")}
                    disabled={index === rows.length - 1 || busy}
                    onClick={() => move(index, 1)}
                  >
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  </IconButton>

                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={busy}
                    onClick={() =>
                      setEditing({
                        id: category.id,
                        en: category.label.en,
                        ar: category.label.ar,
                      })
                    }
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    {t("admin.categories.edit")}
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busy}
                    onClick={() =>
                      act(
                        category.id,
                        () => setCategoryStatus(category.id, live ? "archived" : "published"),
                        t(live ? "admin.categories.archived" : "admin.categories.published"),
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
                    <span className="sr-only sm:not-sr-only">
                      {t(live ? "admin.designs.archive" : "admin.designs.publish")}
                    </span>
                  </Button>

                  {removable && (
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={busy}
                      onClick={() => remove(category)}
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

      <p className="mt-6 text-sm text-ink-3">{t("admin.categories.hint")}</p>

      <Toast
        message={toast?.message}
        tone={toast?.tone}
        onDismiss={() => setToast(null)}
        dismissLabel={t("common.dismiss")}
      />
    </PageShell>
  );
};

export default CategoryListPage;
