import { useTranslation } from "react-i18next";
import { Move, Maximize2, AlignCenter } from "lucide-react";

const TOOLS = [
  { id: "move", Icon: Move },
  { id: "size", Icon: Maximize2 },
  { id: "align", Icon: AlignCenter },
];

const EditorToolbar = ({ value, onChange }) => {
  const { t } = useTranslation();

  return (
    <div
      role="tablist"
      aria-label={t("editor.title")}
      className="grid grid-cols-3 gap-1 rounded-2xl border border-line bg-surface-2 p-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]"
    >
      {TOOLS.map(({ id, Icon }) => {
        const active = value === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(id)}
            className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 text-xs font-medium transition-colors ${
              active
                ? "bg-surface-3 text-ink"
                : "text-ink-3 hover:bg-surface-3 hover:text-ink-2"
            }`}
          >
            <Icon className="h-4.5 w-4.5" aria-hidden="true" />
            {t(`editor.tool.${id}`)}
          </button>
        );
      })}
    </div>
  );
};

export default EditorToolbar;
