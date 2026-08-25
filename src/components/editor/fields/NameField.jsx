import { useId } from "react";
import { useTranslation } from "react-i18next";
import FieldLabel from "../../ui/FieldLabel.jsx";
import TextField from "../../ui/TextField.jsx";
import { NAME_LAYER } from "../../../lib/layers.js";

const NameField = ({ value, dispatch }) => {
  const { t } = useTranslation();
  const id = useId();

  return (
    <div>
      <FieldLabel labelKey="editor.field.name" htmlFor={id} />
      <TextField
        id={id}
        value={value}
        placeholder={t("editor.placeholder.name")}
        onChange={(e) =>
          dispatch({ type: "text", id: NAME_LAYER, text: e.target.value })
        }
        onBlur={() => dispatch({ type: "commit" })}
      />
    </div>
  );
};

export default NameField;
