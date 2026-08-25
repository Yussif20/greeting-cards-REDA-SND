import { useId } from "react";
import { useTranslation } from "react-i18next";
import FieldLabel from "../../ui/FieldLabel.jsx";
import TextField from "../../ui/TextField.jsx";
import { JOB_LAYER } from "../../../lib/layers.js";

const JobTitleField = ({ value, dispatch }) => {
  const { t } = useTranslation();
  const id = useId();

  return (
    <div>
      <FieldLabel labelKey="editor.field.jobTitle" htmlFor={id} optional />
      <TextField
        id={id}
        value={value}
        placeholder={t("editor.placeholder.jobTitle")}
        onChange={(e) =>
          dispatch({ type: "text", id: JOB_LAYER, text: e.target.value })
        }
        onBlur={() => dispatch({ type: "commit" })}
      />
    </div>
  );
};

export default JobTitleField;
