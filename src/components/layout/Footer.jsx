import { useTranslation } from "react-i18next";
import RedaHazardControlLogo from "../brand/RedaHazardControlLogo.jsx";

/**
 * Centred logo above the tagline, with a hairline running out to either side --
 * as in the design.
 *
 * The tagline is Arabic in both languages: it is the brand line, not UI copy,
 * so it carries its own lang and dir rather than being translated.
 */
const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-line bg-surface-2">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-10 sm:px-8 sm:py-14">
        <RedaHazardControlLogo className="h-8 w-auto sm:h-9" />

        <div className="flex w-full max-w-lg items-center gap-5">
          <span aria-hidden="true" className="h-px flex-1 bg-line" />
          <p lang="ar" dir="rtl" className="text-sm text-ink-2 sm:text-base">
            {t("footer.tagline")}
          </p>
          <span aria-hidden="true" className="h-px flex-1 bg-line" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
