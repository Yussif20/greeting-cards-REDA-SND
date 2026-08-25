import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RotateCcw, Bookmark, Download, Share2, Loader2 } from "lucide-react";

import { useDesignParam } from "../hooks/useDesignParam.js";
import { useLanguage } from "../hooks/useLanguage.js";
import { useEditorState } from "../hooks/useEditorState.js";
import { useDebouncedValue } from "../hooks/useDebouncedValue.js";

import { findSiblingByBrand } from "../data/designs/index.js";
import { getBrand } from "../data/brands.js";
import { occasionHeading, occasionShortHeading } from "../lib/localize.js";
import { loadImage } from "../lib/canvas.js";
import { preloadFont } from "../lib/fonts.js";
import { renderToBlob, downloadBlob, shareBlob, buildFilename } from "../lib/exportCard.js";
import { saveDraft, loadDraft } from "../lib/draft.js";
import { NAME_LAYER } from "../lib/layers.js";

import PageShell from "../components/layout/PageShell.jsx";
import Breadcrumbs from "../components/layout/Breadcrumbs.jsx";
import Button from "../components/ui/Button.jsx";
import IconButton from "../components/ui/IconButton.jsx";
import Toast from "../components/ui/Toast.jsx";
import EditorForm from "../components/editor/EditorForm.jsx";
import EditorToolbar from "../components/editor/EditorToolbar.jsx";
import CardPreview from "../components/editor/preview/CardPreview.jsx";
import MovePanel from "../components/editor/panels/MovePanel.jsx";
import SizePanel from "../components/editor/panels/SizePanel.jsx";
import AlignPanel from "../components/editor/panels/AlignPanel.jsx";
import LayersPanel from "../components/editor/panels/LayersPanel.jsx";
import NotFoundPage from "./NotFoundPage.jsx";

const EditorPage = () => {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const { slug, occasion, design } = useDesignParam();

  if (!occasion) return <NotFoundPage />;
  // An unknown design id is a bad link, not a missing page -- send them to the
  // occasion's grid rather than a dead end.
  if (!design) return <Navigate to={`/${slug}`} replace />;

  return <Editor key={design.id} slug={slug} occasion={occasion} design={design} lang={lang} t={t} navigate={navigate} />;
};

/**
 * Split out so the hooks below run against a single, known-good design.
 * `key={design.id}` on the element above remounts this when the design changes.
 */
const Editor = ({ slug, occasion, design, lang, t, navigate }) => {
  const draft = useMemo(() => loadDraft(slug, design.id), [slug, design.id]);
  const { state, dispatch, selectedLayer } = useEditorState(design, draft);

  const [image, setImage] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);

  // Keeping a rendered blob warm means the share handler can call
  // navigator.share() synchronously -- on iOS it must run inside the gesture.
  const latestBlob = useRef(null);
  const debouncedLayers = useDebouncedValue(state.layers, 400);

  const name = state.layers.find((l) => l.id === NAME_LAYER)?.text ?? "";

  useEffect(() => {
    let cancelled = false;
    setImage(null);
    loadImage(design.src)
      .then((img) => !cancelled && setImage(img))
      .catch(() => !cancelled && setToast({ tone: "error", message: t("errors.imageLoad") }));
    return () => {
      cancelled = true;
    };
  }, [design.src, t]);

  useEffect(() => {
    preloadFont(state.fontId);
  }, [state.fontId]);

  // Refresh the share blob in the background as edits settle.
  useEffect(() => {
    if (!image) return;
    let cancelled = false;
    renderToBlob({ design, image, layers: debouncedLayers })
      .then((blob) => {
        if (!cancelled) latestBlob.current = blob;
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [design, image, debouncedLayers]);

  useEffect(() => {
    if (draft) setToast({ tone: "info", message: t("editor.draftRestored") });
  }, [draft, t]);

  const handleBrandChange = useCallback(
    (brandId) => {
      dispatch({ type: "brand", brandId });

      if (design.brandBakedIn) {
        // Mode A: the logo is in the pixels, so a brand change is a design
        // change. Draft state is keyed per design, so carry the typed text over.
        const sibling = findSiblingByBrand(slug, design, brandId);
        if (sibling && sibling.id !== design.id) {
          saveDraft(slug, sibling.id, {
            layers: Object.fromEntries(
              state.layers
                .filter((l) => l.type === "text")
                .map((l) => [l.id, { text: l.text, color: l.color, fontId: l.fontId }]),
            ),
            brandId,
            fontId: state.fontId,
            color: state.color,
          });
          navigate(`/${slug}/${sibling.id}`, { replace: true });
        }
        return;
      }

      // Mode B: the brand is a compositing layer.
      const brand = getBrand(brandId);
      dispatch({ type: "logoSrc", src: brand?.logo?.light ?? null, aspect: brand?.aspect });
    },
    [design, slug, state.layers, state.fontId, state.color, dispatch, navigate],
  );

  const handleSaveDraft = () => {
    const ok = saveDraft(slug, design.id, {
      layers: Object.fromEntries(state.layers.map((l) => [l.id, l])),
      brandId: state.brandId,
      fontId: state.fontId,
      color: state.color,
    });
    setToast(
      ok
        ? { tone: "info", message: t("editor.draftSaved") }
        : { tone: "error", message: t("errors.download") },
    );
  };

  const handleReset = () => {
    dispatch({ type: "reset", design });
    setToast({ tone: "info", message: t("editor.resetDone") });
  };

  const handleDownload = async () => {
    if (!image) return;
    if (!name.trim()) {
      setToast({ tone: "error", message: t("editor.enterNameFirst") });
      return;
    }
    setBusy(true);
    try {
      const blob = await renderToBlob({ design, image, layers: state.layers });
      latestBlob.current = blob;
      downloadBlob(blob, buildFilename(slug, name));
    } catch {
      setToast({ tone: "error", message: t("errors.download") });
    } finally {
      setBusy(false);
    }
  };

  const handleShare = async () => {
    if (!name.trim()) {
      setToast({ tone: "error", message: t("editor.enterNameFirst") });
      return;
    }
    const blob = latestBlob.current;
    if (!blob) {
      await handleDownload();
      return;
    }
    try {
      await shareBlob(blob, buildFilename(slug, name), {
        title: occasionHeading(occasion, lang),
        text: occasionHeading(occasion, lang),
      });
    } catch (err) {
      if (err?.name !== "AbortError") {
        setToast({ tone: "error", message: t("errors.share") });
      }
    }
  };

  // Move, Size and Align act on a selection; Layers always has something to show.
  const needsLayer = state.activeTool !== "layers";

  const panels = {
    move: <MovePanel layer={selectedLayer} dispatch={dispatch} />,
    size: <SizePanel layer={selectedLayer} dispatch={dispatch} />,
    align: (
      <AlignPanel
        design={design}
        layer={selectedLayer}
        layers={state.layers}
        dispatch={dispatch}
      />
    ),
    layers: (
      <LayersPanel
        layers={state.layers}
        selectedLayerId={state.selectedLayerId}
        dispatch={dispatch}
      />
    ),
  };

  return (
    <PageShell accent={occasion.theme.light}>
      <Breadcrumbs
        items={[
          { label: t("common.breadcrumb.home"), to: "/" },
          { label: occasionShortHeading(occasion, lang), to: `/${slug}` },
          { label: `${t("designs.design")} ${String(design.number).padStart(2, "0")}` },
        ]}
      />

      <header className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {t("editor.title")}
          </h1>
          <p className="mt-1.5 text-ink-2">{t("editor.subtitle")}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {t("editor.action.reset")}
          </Button>
          <Button variant="secondary" onClick={handleSaveDraft}>
            <Bookmark className="h-4 w-4" aria-hidden="true" />
            {t("editor.action.saveDraft")}
          </Button>
          <Button variant="primary" onClick={handleDownload} disabled={busy || !image}>
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="h-4 w-4" aria-hidden="true" />
            )}
            {t("editor.action.download")}
          </Button>
          <IconButton label={t("editor.action.share")} onClick={handleShare}>
            <Share2 className="h-4 w-4" aria-hidden="true" />
          </IconButton>
        </div>
      </header>

      {/* Preview first on narrow screens: the result matters more than the form. */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section className="order-2 rounded-2xl border border-line bg-surface-2 p-5 lg:order-1">
          <EditorForm
            design={design}
            occasionSlug={slug}
            state={state}
            dispatch={dispatch}
            onBrandChange={handleBrandChange}
          />
        </section>

        <section className="order-1 space-y-4 lg:order-2">
          <CardPreview
            design={design}
            image={image}
            state={state}
            dispatch={dispatch}
            selectedLayer={selectedLayer}
          />

          <EditorToolbar
            value={state.activeTool}
            onChange={(tool) => dispatch({ type: "tool", tool })}
          />

          <div className="rounded-2xl border border-line bg-surface-2 p-4">
            {needsLayer && !selectedLayer ? (
              <p className="py-2 text-center text-sm text-ink-3">
                {t("editor.selectLayerHint")}
              </p>
            ) : (
              panels[state.activeTool]
            )}
          </div>
        </section>
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

export default EditorPage;
