import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ImagePlus } from "lucide-react";

/**
 * Pick one image, by click or by drop.
 *
 * The `accept` attribute is a hint the file picker honours and a drop ignores
 * entirely, so the type is checked here as well -- and again in the pipeline,
 * which is the only check that actually governs what gets uploaded.
 *
 * It is a <button> wrapping a hidden <input type="file"> rather than a styled
 * label, so it is reachable and operable from the keyboard without relying on
 * label-click forwarding.
 */
const ACCEPT = "image/jpeg,image/png,image/webp";

const Dropzone = ({ onFile, disabled = false }) => {
  const { t } = useTranslation();
  const input = useRef(null);
  const [over, setOver] = useState(false);

  const take = (file) => {
    if (!file) return;
    if (!ACCEPT.split(",").includes(file.type)) return;
    onFile(file);
  };

  return (
    <div
      onDragOver={(e) => {
        if (disabled) return;
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (!disabled) take(e.dataTransfer.files?.[0]);
      }}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => input.current?.click()}
        className={`flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors duration-200 disabled:opacity-45 ${
          over
            ? "border-brand bg-brand-soft"
            : "border-line bg-surface-2 hover:border-ink-3 hover:bg-surface-3"
        }`}
      >
        <ImagePlus className="h-6 w-6 text-ink-3" aria-hidden="true" />
        <span className="text-sm font-medium text-ink">{t("admin.upload.choose")}</span>
        <span className="text-xs text-ink-3">{t("admin.upload.hint")}</span>
      </button>

      <input
        ref={input}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={(e) => {
          take(e.target.files?.[0]);
          // Clear it, so re-picking the same file still fires a change event.
          e.target.value = "";
        }}
      />
    </div>
  );
};

export default Dropzone;
