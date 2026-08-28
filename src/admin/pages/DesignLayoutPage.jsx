import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader2, Save, Eye } from "lucide-react";

import PageShell from "../../components/layout/PageShell.jsx";
import Button from "../../components/ui/Button.jsx";
import TextField from "../../components/ui/TextField.jsx";
import Toast from "../../components/ui/Toast.jsx";
import StatusPill from "../../components/ui/StatusPill.jsx";
import EditorStage from "../../components/editor/EditorStage.jsx";
import ColorSwatches from "../../components/editor/fields/ColorSwatches.jsx";
import FontSelect from "../../components/editor/fields/FontSelect.jsx";

import { useEditorState } from "../../hooks/useEditorState.js";
import { loadImage } from "../../lib/canvas.js";
import { preloadFont } from "../../lib/fonts.js";
import { layoutFromScene } from "../../lib/layoutFromScene.js";
import { stableStringify } from "../../lib/registry/serialize.js";
import { NAME_LAYER, JOB_LAYER, LOGO_LAYER } from "../../lib/layers.js";

import RegionEditor from "../components/RegionEditor.jsx";
import PaletteEditor from "../components/PaletteEditor.jsx";
import { useAsync } from "../hooks/useAsync.js";
import AsyncSection from "../components/AsyncSection.jsx";
import { getDesignById } from "../lib/api.js";
import { saveLayout, setStatus } from "../lib/mutations.js";

/**
 * Place a card's default name and job title, using the customer's own editor.
 *
 * The equivalence is the whole design: the same SelectionOverlay, the same
 * pointer maths, the same renderCard. What the admin arranges here is what a
 * customer sees, by construction rather than by two implementations being kept
 * in step.
 */
const DesignLayoutPage = () => {
  const { designId } = useParams();
  const { state, data, error, reload } = useAsync(
    () => getDesignById(designId),
    [designId],
  );

  return (
    <AsyncSection state={state} error={error} onRetry={reload} empty={null}>
      {data ? <Workbench design={data} /> : null}
    </AsyncSection>
  );
};

/**
 * Split out so the hooks below run against a single, known-good design --
 * the same shape EditorPage uses for the same reason.
 */
const Workbench = ({ design }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { state, dispatch, selectedLayer } = useEditorState(design, null);
  const [image, setImage] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);

  // Sample text is not a nicety. layerBox() returns null for empty text, so an
  // empty layer is invisible, unselectable and impossible to drag -- the admin
  // would be handed an editor with nothing in it to edit. Seeding both scripts
  // also makes a too-narrow maxWidth obvious immediately rather than the first
  // time a customer types a long Arabic name.
  const [sampleName, setSampleName] = useState("فيصل الغامدي");
  const [sampleTitle, setSampleTitle] = useState("Marketing Manager");

  useEffect(() => {
    dispatch({ type: "text", id: NAME_LAYER, text: sampleName });
  }, [sampleName, dispatch]);

  useEffect(() => {
    dispatch({ type: "text", id: JOB_LAYER, text: sampleTitle });
  }, [sampleTitle, dispatch]);

  // Every current design bakes its brand into the artwork, which means
  // buildLayers hides the logo layer and layout.logo can never be adjusted.
  // Revealing a placeholder is the only way to position it at all.
  // safeArea, brandMark and palette are part of a layout but not of the scene:
  // no layer represents them, so useEditorState neither holds nor returns them.
  // They live here and are folded back in as layoutFromScene's `base`.
  const [regions, setRegions] = useState({
    safeArea: design.layout.safeArea,
    brandMark: design.layout.brandMark,
  });
  const [palette, setPalette] = useState(design.layout.palette);

  const [showLogo, setShowLogo] = useState(false);
  useEffect(() => {
    dispatch({ type: "patchLayer", id: LOGO_LAYER, patch: { visible: showLogo } });
  }, [showLogo, dispatch]);

  useEffect(() => {
    let cancelled = false;
    loadImage(design.src)
      .then((img) => !cancelled && setImage(img))
      .catch(() => !cancelled && setToast({ tone: "error", message: t("errors.download") }));
    return () => {
      cancelled = true;
    };
  }, [design.src, t]);

  useEffect(() => {
    preloadFont(state.fontId);
  }, [state.fontId]);

  const base = useMemo(
    () => ({ ...design.layout, ...regions, palette }),
    [design.layout, regions, palette],
  );

  const nextLayout = useMemo(() => layoutFromScene(state, base), [state, base]);

  // The stage reads geometry off the design, so handing it the edited layout
  // is what makes "align to safe area" respect a safe area the admin just
  // dragged rather than the one the card was created with.
  const liveDesign = useMemo(() => ({ ...design, layout: base }), [design, base]);

  // Compared without regard to key order: design.layout arrives from Postgres
  // jsonb, which does not preserve it, while layoutFromScene rebuilds its
  // objects fresh. A plain JSON.stringify comparison reports every untouched
  // layout as modified, which makes "Save" meaningless.
  const dirty = useMemo(
    () => stableStringify(nextLayout) !== stableStringify(design.layout),
    [nextLayout, design.layout],
  );

  const save = useCallback(
    async (thenPublish) => {
      setBusy(true);
      try {
        await saveLayout(design.id, nextLayout);
        if (thenPublish) await setStatus(design.id, "published");
        setToast({
          tone: "info",
          message: thenPublish ? t("admin.layout.published") : t("admin.layout.saved"),
        });
        if (thenPublish) navigate("/admin/designs");
      } catch (err) {
        setToast({ tone: "error", message: err.message });
      } finally {
        setBusy(false);
      }
    },
    [design.id, nextLayout, navigate, t],
  );

  return (
    <PageShell>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-ink">
            {t("admin.layout.title")}
            <StatusPill status={design.status} />
          </h1>
          {/* Entirely Latin -- slug, season and card number -- so the whole
              line is marked LTR rather than isolating three runs separately. */}
          <p dir="ltr" className="mt-1 text-sm text-ink-2 rtl:text-end">
            {design.occasion} · {design.year} ·{" "}
            {String(design.number).padStart(2, "0")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={() => save(false)} disabled={busy || !dirty}>
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="h-4 w-4" aria-hidden="true" />
            )}
            {t("admin.layout.save")}
          </Button>
          {design.status !== "published" && (
            <Button variant="primary" onClick={() => save(true)} disabled={busy}>
              <Eye className="h-4 w-4" aria-hidden="true" />
              {t("admin.layout.saveAndPublish")}
            </Button>
          )}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <section className="order-2 space-y-4 rounded-2xl border border-line bg-surface-2 p-5 lg:order-1">
          <p className="text-xs text-ink-3">{t("admin.layout.sampleHint")}</p>

          <div>
            <label htmlFor="sample-name" className="mb-2 block text-sm font-medium text-ink">
              {t("admin.layout.sampleName")}
            </label>
            <TextField
              id="sample-name"
              value={sampleName}
              onChange={(e) => setSampleName(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="sample-title" className="mb-2 block text-sm font-medium text-ink">
              {t("admin.layout.sampleTitle")}
            </label>
            <TextField
              id="sample-title"
              value={sampleTitle}
              onChange={(e) => setSampleTitle(e.target.value)}
            />
          </div>

          <FontSelect
            value={state.fontId}
            sampleText={sampleName}
            onChange={(fontId) => dispatch({ type: "font", fontId })}
          />

          <ColorSwatches
            palette={design.layout.palette}
            value={state.color}
            onChange={(color) => dispatch({ type: "color", color })}
          />

          <PaletteEditor
            value={palette}
            onChange={setPalette}
            defaultColor={state.color}
            onDefaultChange={(color) => dispatch({ type: "color", color })}
          />

          <details className="rounded-xl border border-line">
            <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-ink">
              {t("admin.layout.regions")}
            </summary>
            <div className="space-y-4 border-t border-line p-3">
              <p className="text-xs text-ink-3">{t("admin.layout.regionsHint")}</p>
              <RegionEditor
                src={design.src}
                aspect={`${design.width} / ${design.height}`}
                label={t("admin.layout.safeArea")}
                value={regions.safeArea}
                tone="brand"
                onChange={(safeArea) => setRegions((r) => ({ ...r, safeArea }))}
              />
              <RegionEditor
                src={design.src}
                aspect={`${design.width} / ${design.height}`}
                label={t("admin.layout.brandMark")}
                value={regions.brandMark}
                tone="gold"
                onChange={(brandMark) => setRegions((r) => ({ ...r, brandMark }))}
              />
            </div>
          </details>

          <label className="flex items-center gap-2 text-sm text-ink-2">
            <input
              type="checkbox"
              checked={showLogo}
              onChange={(e) => setShowLogo(e.target.checked)}
              className="h-4 w-4 rounded border-line"
            />
            {t("admin.layout.showLogo")}
          </label>
        </section>

        <EditorStage
          className="order-1 lg:order-2"
          design={liveDesign}
          image={image}
          state={state}
          dispatch={dispatch}
          selectedLayer={selectedLayer}
        />
      </div>

      <Toast
        message={toast?.message}
        tone={toast?.tone}
        onDismiss={() => setToast(null)}
        dismissLabel={t("common.dismiss")}
      />
    </PageShell>
  );
};

export default DesignLayoutPage;
