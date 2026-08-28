import { useId, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader2, AlertTriangle } from "lucide-react";

import PageShell from "../../components/layout/PageShell.jsx";
import Button from "../../components/ui/Button.jsx";
import Select from "../../components/ui/Select.jsx";
import { BRANDS } from "../../data/brands.js";
import { STYLES } from "../../data/designs/index.js";
import { loc } from "../../lib/localize.js";
import { useLanguage } from "../../hooks/useLanguage.js";

import Dropzone from "../components/Dropzone.jsx";
import AsyncSection from "../components/AsyncSection.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { listOccasions, listSeasons, listDesigns } from "../lib/api.js";
import { processCard, ImageError } from "../lib/images.js";
import { uploadCard } from "../lib/storage.js";
import { createDesign } from "../lib/mutations.js";
import { defaultLayout } from "../lib/layoutDefaults.js";

const load = async () => {
  const [occasions, seasons] = await Promise.all([listOccasions(), listSeasons()]);
  return { occasions, seasons };
};

/**
 * Add a card: choose where it belongs, drop the artwork, land in the editor.
 *
 * The row is created as a draft and the admin is sent straight to the layout
 * editor, because an uploaded card with nobody's geometry on it is not yet a
 * card -- the name would render wherever the sibling design happened to put
 * it. Publishing is a separate, later action for exactly that reason.
 */
const DesignUploadPage = () => {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const uid = useId();

  const { state, data, error, reload } = useAsync(load);

  const [occasion, setOccasion] = useState(params.get("occasion") ?? "");
  const [season, setSeason] = useState("");
  const [brand, setBrand] = useState(BRANDS[0].id);
  const [style, setStyle] = useState(STYLES[1]);
  const [busy, setBusy] = useState(null);
  const [failure, setFailure] = useState(null);

  const occasions = data?.occasions ?? [];
  const seasons = data?.seasons ?? [];

  const chosenSeason = season || seasons[0]?.id || "";
  const chosenOccasion = occasion || occasions[0]?.slug || "";

  const submit = async (file) => {
    setFailure(null);
    try {
      setBusy("processing");
      const processed = await processCard(file);

      setBusy("uploading");
      const stored = await uploadCard({
        occasionSlug: chosenOccasion,
        seasonId: chosenSeason,
        master: processed.master,
        thumb: processed.thumb,
        original: processed.original,
      });

      setBusy("saving");
      const siblings = await listDesigns(chosenOccasion);
      const created = await createDesign({
        occasion: chosenOccasion,
        year: chosenSeason,
        style,
        brand,
        brandBakedIn: true,
        isPlaceholder: false,
        src: stored.src,
        thumb: stored.thumb,
        width: processed.width,
        height: processed.height,
        layout: defaultLayout(siblings, chosenSeason),
      });

      navigate(`/admin/designs/${created.id}/layout`);
    } catch (err) {
      setFailure(
        err instanceof ImageError
          ? t(`admin.upload.errors.${err.code}`, { detail: err.detail ?? "" })
          : err.message,
      );
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
        {t(`admin.upload.${key}`)}
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
    <PageShell>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          {t("admin.upload.title")}
        </h1>
        <p className="mt-1 text-sm text-ink-2">{t("admin.upload.subtitle")}</p>
      </header>

      <AsyncSection state={state} error={error} onRetry={reload} empty={null}>
        <div className="mx-auto grid w-full max-w-2xl gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {field(
              "occasion",
              chosenOccasion,
              occasions.map((o) => ({ value: o.slug, label: loc(o.title, lang), hint: o.slug })),
              setOccasion,
            )}
            {field(
              "season",
              chosenSeason,
              seasons.map((s) => ({ value: s.id, label: loc(s.label, lang) })),
              setSeason,
            )}
            {field(
              "brand",
              brand,
              BRANDS.map((b) => ({ value: b.id, label: b.name })),
              setBrand,
            )}
            {field(
              "style",
              style,
              STYLES.map((s) => ({ value: s, label: t(`designs.style.${s}`) })),
              setStyle,
            )}
          </div>

          {busy ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-line bg-surface-2 py-12 text-sm text-ink-2">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              {t(`admin.upload.busy.${busy}`)}
            </div>
          ) : (
            <Dropzone onFile={submit} disabled={!chosenOccasion || !chosenSeason} />
          )}

          {failure && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{failure}</span>
            </div>
          )}

          <p className="text-center text-xs text-ink-3">{t("admin.upload.note")}</p>

          <div className="flex justify-center">
            <Button variant="ghost" onClick={() => navigate("/admin/designs")}>
              {t("admin.upload.cancel")}
            </Button>
          </div>
        </div>
      </AsyncSection>
    </PageShell>
  );
};

export default DesignUploadPage;
