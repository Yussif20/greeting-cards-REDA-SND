import NameField from "./fields/NameField.jsx";
import JobTitleField from "./fields/JobTitleField.jsx";
import BrandSelect from "./fields/BrandSelect.jsx";
import FontSelect from "./fields/FontSelect.jsx";
import ColorSwatches from "./fields/ColorSwatches.jsx";
import { NAME_LAYER, JOB_LAYER } from "../../lib/layers.js";

const EditorForm = ({ design, occasionSlug, state, dispatch, onBrandChange }) => {
  const name = state.layers.find((l) => l.id === NAME_LAYER)?.text ?? "";
  const jobTitle = state.layers.find((l) => l.id === JOB_LAYER)?.text ?? "";

  return (
    <div className="space-y-5">
      <NameField value={name} dispatch={dispatch} />
      <JobTitleField value={jobTitle} dispatch={dispatch} />

      <BrandSelect
        occasionSlug={occasionSlug}
        design={design}
        value={state.brandId}
        onChange={onBrandChange}
      />

      <FontSelect
        value={state.fontId}
        sampleText={name}
        onChange={(fontId) => dispatch({ type: "font", fontId })}
      />

      <ColorSwatches
        palette={design.layout.palette}
        value={state.color}
        onChange={(color) => dispatch({ type: "color", color })}
      />
    </div>
  );
};

export default EditorForm;
