import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SHOW_PLACEHOLDER_BADGE } from "../../data/occasions.js";

const DesignCard = ({ design, selected = false, eager = false }) => {
  const { t } = useTranslation();
  const label = String(design.number).padStart(2, "0");

  return (
    <div className="flex flex-col gap-2">
      <Link
        to={`/${design.occasion}/${design.id}`}
        aria-label={`${t("designs.design")} ${label}`}
        aria-current={selected ? "true" : undefined}
        className={`hover-lift relative block overflow-hidden rounded-2xl border-2 bg-surface-2 transition-colors ${
          selected ? "border-accent" : "border-line hover:border-ink-3"
        }`}
      >
        <img
          src={design.thumb}
          width={design.width}
          height={design.height}
          alt=""
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="block w-full"
          style={{ aspectRatio: `${design.width} / ${design.height}` }}
        />

        {selected && (
          <span
            aria-hidden="true"
            className="absolute bottom-2 end-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent text-on-accent shadow-md"
          >
            <Check className="h-4 w-4" strokeWidth={3} />
          </span>
        )}

        {SHOW_PLACEHOLDER_BADGE && design.isPlaceholder && (
          <span className="absolute start-2 top-2 rounded-full bg-black/65 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
            {t("designs.sampleArtwork")}
          </span>
        )}
      </Link>

      <span className="text-center text-sm text-ink-3">{label}</span>
    </div>
  );
};

export default DesignCard;
