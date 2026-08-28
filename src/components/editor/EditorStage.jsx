import { useTranslation } from "react-i18next";

import CardPreview from "./preview/CardPreview.jsx";
import EditorToolbar from "./EditorToolbar.jsx";
import MovePanel from "./panels/MovePanel.jsx";
import SizePanel from "./panels/SizePanel.jsx";
import AlignPanel from "./panels/AlignPanel.jsx";

/**
 * The editing surface: preview, tool tabs, and the panel for the active tool.
 *
 * Lifted out of EditorPage unchanged so /admin can place a card's default
 * layout using the customer's editor rather than a second implementation of
 * it. That equivalence is the point -- the admin drags the name with the same
 * pointer maths, against the same renderCard, so what they arrange is by
 * construction what a customer will see, instead of by careful duplication.
 *
 * Everything around it -- the form, the download button, the breadcrumbs --
 * stays with the page, because that is exactly what differs between the two.
 */
const EditorStage = ({ design, image, state, dispatch, selectedLayer, className = "" }) => {
  const { t } = useTranslation();

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
  };

  return (
    <section className={`space-y-4 ${className}`}>
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
        {!selectedLayer ? (
          <p className="py-2 text-center text-sm text-ink-3">
            {t("editor.selectLayerHint")}
          </p>
        ) : (
          panels[state.activeTool]
        )}
      </div>
    </section>
  );
};

export default EditorStage;
