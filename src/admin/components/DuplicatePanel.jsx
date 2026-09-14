import { useEffect, useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, AlertTriangle, X } from "lucide-react";

import Button from "../../components/ui/Button.jsx";
import Select from "../../components/ui/Select.jsx";
import { BRANDS } from "../../data/brands.js";
import { loc } from "../../lib/localize.js";
import { useLanguage } from "../../hooks/useLanguage.js";

import Dropzone from "./Dropzone.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { listDesigns, listCategories } from "../lib/api.js";
import { processCard, ImageError } from "../lib/images.js";
import { uploadCard } from "../lib/storage.js";
import { createDesign } from "../lib/mutations.js";
import { duplicateInput, nextFreeBrand, aspectDiffers } from "../lib/duplicateInput.js";

/** See the note on NO_CATEGORY in DesignUploadPage.jsx. */
const NO_CATEGORY = "__none__";

/**
 * Copy a card, optionally onto new artwork.
 *
 * An inline panel rather than a modal, because this dashboard has no modal
 * primitive and every other form in it -- add season, add category, rename --
 * is an inline block with `window.confirm` for the destructive steps.
 * Introducing a dialog layer for one screen would be the inconsistent choice,
 * not the polished one.
 *
 * It loads its own siblings and categories instead of taking them as props, so
 * both hosts -- the layout editor and the card list -- can render it with two
 * lines and neither has to know what a duplicate needs.
 *
 * The panel does NOT close on success. Filling a season means duplicating once
 * per company, so it stays open, advances the brand to the next gap, and clears
 * the file. Six brands is six drops and no navigation.
 *
 * @param {object} design       the card being copied
 * @param {object} [layout]     layout to copy -- the layout editor passes what
 *                              is on screen, which is not what the row holds
 * @param {Function} onCreated  called with the created row
 * @param {Function} onClose
 */
const DuplicatePanel = ({ design, layout, onCreated, onClose }) => {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const uid = useId();

  const siblings = useAsync(() => listDesigns(design.occasion), [design.occasion]);
  // Tolerated for the same reason DesignUploadPage tolerates it: a card does not
  // need a category, so a database without 0005_categories.sql applied should
  // not block duplicating one.
  const categories = useAsync(() => listCategories().catch(() => []));

  const [brand, setBrand] = useState(design.brand ?? BRANDS[0].id);
  const [category, setCategory] = useState(design.category ?? NO_CATEGORY);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(null);
  const [failure, setFailure] = useState(null);

  // Until the siblings are in, `brand` is still the source's own -- which is the
  // one value guaranteed to be taken. Submitting in that window would quietly
  // make a second card for the company you just copied FROM, so the action
  // waits for the default to be aimed.
  const waiting = siblings.state === "loading";

  // Re-aimed whenever the sibling set changes -- on first load, and again after
  // each successful duplicate, which is what advances the brand to the next gap.
  useEffect(() => {
    if (siblings.data) setBrand(nextFreeBrand(siblings.data, BRANDS, design));
  }, [siblings.data, design]);

  const submit = async () => {
    setFailure(null);
    try {
      let image;

      if (file) {
        setBusy("processing");
        const processed = await processCard(file);

        setBusy("uploading");
        const stored = await uploadCard({
          occasionSlug: design.occasion,
          seasonId: design.year,
          master: processed.master,
          thumb: processed.thumb,
          original: processed.original,
        });

        image = {
          src: stored.src,
          thumb: stored.thumb,
          width: processed.width,
          height: processed.height,
        };
      }

      setBusy("saving");
      const created = await createDesign(
        duplicateInput(design, {
          brand,
          category: category === NO_CATEGORY ? null : category,
          layout,
          image,
        }),
      );

      // A layout is fractional, not proportional -- see aspectDiffers. Said once,
      // here, rather than left for the admin to discover when a name sits over
      // the calligraphy.
      onCreated(created, { aspectWarning: aspectDiffers(image, design) });

      setFile(null);
      siblings.reload();
    } catch (err) {
      setFailure(
        err instanceof ImageError
          ? t(`admin.upload.errors.${err.code}`, { detail: err.detail ?? "" })
          : err.message,
      );
    } finally {
      setBusy(null);
    }
  };

  const field = (key, value, options, onChange) => (
    <div>
      <label
        htmlFor={`${uid}-${key}`}
        id={`${uid}-${key}-label`}
        className="mb-2 block text-sm font-medium text-ink"
      >
        {t(`admin.duplicate.${key}`)}
      </label>
      <Select
        id={`${uid}-${key}`}
        labelId={`${uid}-${key}-label`}
        value={value}
        options={options}
        onChange={onChange}
      />
    </div>
  );

  return (
    <section className="panel mb-6 rounded-2xl p-5">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* The source's own thumbnail, so which card is being copied is never
              a matter of remembering which button was pressed. */}
          <img
            src={design.thumb}
            alt=""
            loading="lazy"
            crossOrigin="anonymous"
            style={{ aspectRatio: `${design.width} / ${design.height}` }}
            className="h-12 w-auto rounded-lg border border-line object-cover"
          />
          <div>
            <h2 className="text-lg font-bold tracking-tight text-ink">
              {t("admin.duplicate.title")}
            </h2>
            {/* Entirely Latin -- slug, season, number -- so the line is marked
                LTR whole rather than isolating three runs. */}
            <p dir="ltr" className="mt-0.5 text-sm text-ink-3 rtl:text-end">
              {design.occasion} · {design.year} · {String(design.number).padStart(2, "0")}
            </p>
          </div>
        </div>

        <Button variant="ghost" size="sm" onClick={onClose} disabled={Boolean(busy)}>
          <X className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">{t("admin.duplicate.cancel")}</span>
        </Button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {field(
          "brand",
          brand,
          BRANDS.map((b) => ({ value: b.id, label: b.name })),
          setBrand,
        )}
        {field(
          "category",
          category,
          [
            { value: NO_CATEGORY, label: t("admin.duplicate.noCategory") },
            ...(categories.data ?? []).map((c) => ({
              value: c.id,
              label: loc(c.label, lang),
              hint: c.status === "published" ? undefined : t("admin.status.draft"),
            })),
          ],
          setCategory,
        )}
      </div>

      <div className="mt-4">
        {busy ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-line bg-surface-2 py-10 text-sm text-ink-2">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            {t(`admin.upload.busy.${busy}`)}
          </div>
        ) : file ? (
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface-2 px-4 py-3">
            <span className="min-w-0 flex-1 truncate text-sm text-ink">
              <bdi dir="ltr">{file.name}</bdi>
            </span>
            <Button variant="ghost" size="sm" onClick={() => setFile(null)}>
              {t("admin.duplicate.clearFile")}
            </Button>
          </div>
        ) : (
          <Dropzone
            onFile={setFile}
            label={t("admin.duplicate.newArtwork")}
            hint={t("admin.duplicate.keepImage")}
          />
        )}
      </div>

      {failure && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{failure}</span>
        </div>
      )}

      <p className="mt-4 text-xs text-ink-3">{t("admin.duplicate.hint")}</p>

      <div className="mt-4 flex items-center gap-2">
        <Button variant="primary" onClick={submit} disabled={Boolean(busy) || waiting}>
          {(busy || waiting) && (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          )}
          {t("admin.duplicate.create")}
        </Button>
        <Button variant="ghost" onClick={onClose} disabled={Boolean(busy)}>
          {t("admin.duplicate.cancel")}
        </Button>
      </div>
    </section>
  );
};

export default DuplicatePanel;
