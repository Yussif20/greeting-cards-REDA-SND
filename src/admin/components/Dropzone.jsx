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

/**
 * `label`, `hint` and `accept` all default to the add-a-card wording and types,
 * so the original call sites are untouched. The duplicate panel overrides the
 * copy because there the drop is OPTIONAL; the font form overrides `accept`
 * because a font is matched by EXTENSION rather than by MIME type -- browsers
 * disagree about what a .ttf is, and "" is a common answer.
 *
 * `accept` is only ever a hint: the file picker honours it, a drop ignores it
 * entirely, and the real check is the one the caller runs on the file it gets.
 * Which is why the type filter below applies only to the image default -- an
 * extension-based list has nothing to compare `file.type` against.
 *
 * `compact` is for the places that show SEVERAL of these at once -- the brand
 * covers on the occasion form are one per company. At full height they would be
 * most of the page, and the format hint repeated seven times says nothing the
 * first one did not.
 */
const Dropzone = ({
  onFile,
  disabled = false,
  label,
  hint,
  accept = ACCEPT,
  compact = false,
}) => {
  const { t } = useTranslation();
  const input = useRef(null);
  const [over, setOver] = useState(false);

  const take = (file) => {
    if (!file) return;
    // Only meaningful for a MIME list. An extension list (".ttf,.otf") never
    // matches file.type, and silently dropping the file would look like the
    // dropzone was broken -- so those are validated by the caller instead.
    if (accept === ACCEPT && !ACCEPT.split(",").includes(file.type)) return;
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
        className={`flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed text-center transition-colors duration-200 disabled:opacity-45 ${
          compact ? "px-4 py-6" : "px-6 py-12"
        } ${
          over
            ? "border-brand bg-brand-soft"
            : "border-line bg-surface-2 hover:border-ink-3 hover:bg-surface-3"
        }`}
      >
        <ImagePlus className="h-6 w-6 text-ink-3" aria-hidden="true" />
        <span className="text-sm font-medium text-ink">
          {label ?? t("admin.upload.choose")}
        </span>
        {!compact && (
          <span className="text-xs text-ink-3">{hint ?? t("admin.upload.hint")}</span>
        )}
      </button>

      <input
        ref={input}
        type="file"
        accept={accept}
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
