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
import {
  FONT_ACCEPT,
  FontError,
  validateFontFile,
  uploadedFamily,
} from "../../lib/fontFile.js";
import { registerFontFace } from "../../lib/fonts.js";

import Dropzone from "../components/Dropzone.jsx";
import { listFonts } from "../lib/api.js";
import { uploadFont } from "../lib/storage.js";
import {
  createFont,
  updateFont,
  setFontStatus,
  reorderFonts,
  deleteFont,
} from "../lib/mutations.js";
import { useAsync } from "../hooks/useAsync.js";
import AsyncSection from "../components/AsyncSection.jsx";

const EMPTY_DRAFT = { id: "", en: "", ar: "", regular: null, bold: null };

/**
 * Fonts: the editor's typeface list, uploaded rather than built.
 *
 * The four bundled pairings come through @fontsource and are @import-ed in
 * src/index.css, so adding a fifth used to mean an npm dependency and a code
 * edit -- and a licensed face that is not on npm could not be added at all. The
 * README carried a manual recipe for exactly that case from the first release.
 *
 * A font here is one or two files and a bilingual name. The regular file is
 * required; the bold one is not, and the asymmetry is deliberate rather than
 * unfinished: a card sets the name at 700 and the job title at 400, and with a
 * single file the face is declared across the whole weight range so both render
 * from the real outlines. The alternative -- letting the browser synthesise a
 * bold -- smears Arabic letterforms, which is most of what these cards are.
 *
 * Uploaded fonts appear after the bundled four in the picker, and only once
 * published.
 */
const FontListPage = () => {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const { state, data, error, reload } = useAsync(listFonts);

  // Local copy so the arrows reorder instantly; the write follows behind.
  const [order, setOrder] = useState(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [editing, setEditing] = useState(null);
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (data) setOrder(data);
  }, [data]);

  // Declare every row's face, drafts included. The published snapshot is what
  // registerUploadedFonts() reads, and a draft is deliberately not in it -- so
  // without this the list would preview a just-uploaded font in the fallback,
  // at exactly the moment the admin is checking that the file is right.
  useEffect(() => {
    data?.forEach((font) => registerFontFace(font));
  }, [data]);

  const rows = order ?? [];

  const fail = (err) =>
    setToast({
      tone: "error",
      message:
        err instanceof FontError
          ? t(`admin.fonts.errors.${err.code}`, { detail: err.detail ?? "" })
          : err.message,
    });

  const act = async (key, run, message) => {
    setPending(key);
    try {
      await run();
      setToast({ tone: "info", message });
      reload();
      return true;
    } catch (err) {
      fail(err);
      return false;
    } finally {
      setPending(null);
    }
  };

  /**
   * The id is suggested from the English name, never the Arabic one.
   *
   * It has to satisfy `^[a-z0-9]+(-[a-z0-9]+)*$` -- it is both a stored fontId
   * and half of the CSS family the face registers under -- so a machine
   * transliteration of "آي بي إم بلكس" would produce either nothing or
   * something nobody would choose.
   */
  const slugify = (value) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  /** Reject the file here rather than after two uploads and an insert. */
  const takeFile = (weight) => (file) => {
    try {
      validateFontFile(file);
      setDraft((d) => ({ ...d, [weight]: file }));
    } catch (err) {
      fail(err);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    const id = draft.id || slugify(draft.en);

    if (!draft.regular) {
      setToast({ tone: "error", message: t("admin.fonts.errors.regularRequired") });
      return;
    }

    setPending("new");
    try {
      // Files first, then the row. The reverse order would leave a font in the
      // list pointing at nothing if an upload failed -- and uploads are the
      // step that actually fails, being the only one that moves megabytes.
      setBusy("uploading");
      const regular = await uploadFont({ fontId: id, weight: "regular", file: draft.regular });
      const bold = draft.bold
        ? await uploadFont({ fontId: id, weight: "bold", file: draft.bold })
        : null;

      setBusy("saving");
      await createFont({ id, label: { en: draft.en, ar: draft.ar }, regular, bold });

      setToast({ tone: "info", message: t("admin.fonts.created") });
      setAdding(false);
      setDraft(EMPTY_DRAFT);
      reload();
    } catch (err) {
      fail(err);
    } finally {
      setBusy(null);
      setPending(null);
    }
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    const ok = await act(
      editing.id,
      () => updateFont(editing.id, { label_en: editing.en, label_ar: editing.ar }),
      t("admin.fonts.saved"),
    );
    if (ok) setEditing(null);
  };

  /** Attach a bold file to a font that was created without one. */
  const addBold = async (font, file) => {
    try {
      validateFontFile(file);
    } catch (err) {
      return fail(err);
    }
    return act(
      font.id,
      async () => {
        const bold = await uploadFont({ fontId: font.id, weight: "bold", file });
        await updateFont(font.id, { bold_src: bold });
      },
      t("admin.fonts.boldAdded"),
    );
  };

  const move = async (index, delta) => {
    const next = [...rows];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);

    setPending("order");
    try {
      await reorderFonts(next.map((f) => f.id));
      setToast({ tone: "info", message: t("admin.fonts.reordered") });
    } catch (err) {
      setOrder(rows); // put it back rather than lie about what was saved
      fail(err);
    } finally {
      setPending(null);
    }
  };

  const remove = (font) => {
    if (!window.confirm(t("admin.fonts.confirmDelete"))) return;
    act(font.id, () => deleteFont(font.id), t("admin.fonts.deleted"));
  };

  const nameField = (key, value, onChange, dir, placeholder) => (
    <div>
      <label htmlFor={`font-${key}`} className="mb-2 block text-sm font-medium text-ink">
        {t(`admin.fonts.${key}`)}
      </label>
      <TextField
        id={`font-${key}`}
        dir={dir}
        lang={dir === "rtl" ? "ar" : "en"}
        required
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );

  const slot = (weight, file, required) => (
    <div>
      <p className="mb-2 flex items-center gap-2 text-sm font-medium text-ink">
        {t(`admin.fonts.${weight}`)}
        <span className="text-xs font-normal text-ink-3">
          {t(required ? "admin.fonts.required" : "admin.fonts.optional")}
        </span>
      </p>
      {file ? (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface-2 px-4 py-3">
          <span className="min-w-0 flex-1 truncate text-sm text-ink">
            <bdi dir="ltr">{file.name}</bdi>
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setDraft((d) => ({ ...d, [weight]: null }))}
          >
            {t("admin.fonts.clearFile")}
          </Button>
        </div>
      ) : (
        <Dropzone
          accept={FONT_ACCEPT}
          onFile={takeFile(weight)}
          label={t("admin.fonts.dropFile")}
          hint={t("admin.fonts.fileHint")}
        />
      )}
    </div>
  );

  return (
    <PageShell>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            {t("admin.fonts.title")}
          </h1>
          <p className="mt-1 text-sm text-ink-2">{t("admin.fonts.subtitle")}</p>
        </div>
        {!adding && (
          <Button variant="primary" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t("admin.fonts.add")}
          </Button>
        )}
      </header>

      {adding && (
        <form onSubmit={submit} className="panel mb-6 rounded-2xl p-5">
          <div className="grid gap-4 sm:grid-cols-3">
            {nameField(
              "labelAr",
              draft.ar,
              (e) => setDraft((d) => ({ ...d, ar: e.target.value })),
              "rtl",
              "آي بي إم بلكس عربي",
            )}
            {nameField(
              "labelEn",
              draft.en,
              (e) => {
                const en = e.target.value;
                setDraft((d) => ({
                  ...d,
                  en,
                  // Only fill what the admin has not typed over.
                  id: d.id && d.id !== slugify(d.en) ? d.id : slugify(en),
                }));
              },
              "ltr",
              "IBM Plex Sans Arabic",
            )}
            <div>
              <label htmlFor="font-id" className="mb-2 block text-sm font-medium text-ink">
                {t("admin.fonts.id")}
              </label>
              <TextField
                id="font-id"
                dir="ltr"
                required
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                placeholder="ibm-plex-arabic"
                value={draft.id}
                onChange={(e) => setDraft((d) => ({ ...d, id: e.target.value }))}
              />
              <p className="mt-1.5 text-xs text-ink-3">{t("admin.fonts.idHint")}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {slot("regular", draft.regular, true)}
            {slot("bold", draft.bold, false)}
          </div>

          <p className="mt-4 text-xs text-ink-3">{t("admin.fonts.hint")}</p>

          <div className="mt-4 flex items-center gap-2">
            <Button type="submit" variant="primary" disabled={pending === "new"}>
              {pending === "new" && (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              )}
              {busy ? t(`admin.fonts.busy.${busy}`) : t("admin.fonts.create")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={pending === "new"}
              onClick={() => {
                setAdding(false);
                setDraft(EMPTY_DRAFT);
              }}
            >
              {t("admin.fonts.cancel")}
            </Button>
          </div>
        </form>
      )}

      <AsyncSection state={state} error={error} onRetry={reload} empty={t("admin.fonts.empty")}>
        <ul className="flex flex-col gap-2">
          {rows.map((font, index) => {
            const rowBusy = pending === font.id || pending === "order";
            const live = font.status === "published";
            const removable = font.status !== "published";

            if (editing?.id === font.id) {
              return (
                <li key={font.id} className="panel rounded-2xl p-4">
                  <form onSubmit={saveEdit} className="grid gap-4 sm:grid-cols-2">
                    {nameField(
                      "labelAr",
                      editing.ar,
                      (e) => setEditing((f) => ({ ...f, ar: e.target.value })),
                      "rtl",
                    )}
                    {nameField(
                      "labelEn",
                      editing.en,
                      (e) => setEditing((f) => ({ ...f, en: e.target.value })),
                      "ltr",
                    )}
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <Button type="submit" variant="primary" size="sm" disabled={rowBusy}>
                        {rowBusy && (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                        )}
                        {t("admin.fonts.save")}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditing(null)}
                      >
                        {t("admin.fonts.cancel")}
                      </Button>
                    </div>
                  </form>
                </li>
              );
            }

            return (
              <li key={font.id} className="panel flex flex-wrap items-center gap-4 rounded-2xl p-4">
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    {/* Set in the face itself, so the row is its own proof that
                        the file loaded. registerUploadedFonts() has declared the
                        family by now -- the picker and this list share it. */}
                    <span
                      className="truncate text-lg font-medium text-ink"
                      style={{ fontFamily: `"${uploadedFamily(font.id)}", sans-serif` }}
                    >
                      {loc(font.label, lang)}
                    </span>
                    <StatusPill status={font.status} />
                  </span>
                  <span className="mt-0.5 block text-sm text-ink-3">
                    <bdi dir="ltr">{font.id}</bdi> ·{" "}
                    {t(font.bold ? "admin.fonts.twoWeights" : "admin.fonts.oneWeight")}
                  </span>
                </span>

                <div className="flex shrink-0 items-center gap-1">
                  <IconButton
                    label={t("admin.fonts.moveUp")}
                    disabled={index === 0 || rowBusy}
                    onClick={() => move(index, -1)}
                  >
                    <ChevronUp className="h-4 w-4" aria-hidden="true" />
                  </IconButton>
                  <IconButton
                    label={t("admin.fonts.moveDown")}
                    disabled={index === rows.length - 1 || rowBusy}
                    onClick={() => move(index, 1)}
                  >
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  </IconButton>

                  {!font.bold && (
                    <label className="cursor-pointer rounded-full px-3 py-1.5 text-sm text-ink-2 transition-colors hover:bg-surface-3 hover:text-ink">
                      {t("admin.fonts.addBold")}
                      <input
                        type="file"
                        accept={FONT_ACCEPT}
                        className="sr-only"
                        disabled={rowBusy}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          e.target.value = "";
                          if (file) addBold(font, file);
                        }}
                      />
                    </label>
                  )}

                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={rowBusy}
                    onClick={() =>
                      setEditing({ id: font.id, en: font.label.en, ar: font.label.ar })
                    }
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    {t("admin.fonts.edit")}
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={rowBusy}
                    onClick={() =>
                      act(
                        font.id,
                        () => setFontStatus(font.id, live ? "archived" : "published"),
                        t(live ? "admin.fonts.archived" : "admin.fonts.published"),
                      )
                    }
                  >
                    {rowBusy ? (
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
                    <Button size="sm" variant="danger" disabled={rowBusy} onClick={() => remove(font)}>
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

export default FontListPage;
