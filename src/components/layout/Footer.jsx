import { useTranslation } from "react-i18next";
import RedaCardsLogo from "../brand/RedaCardsLogo.jsx";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-line bg-surface-2">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 py-10 sm:px-6">
        <RedaCardsLogo
          className="h-9 w-auto text-brand"
          title={t("common.appName")}
        />

        {/* Tagline between two hairlines, as in the design. */}
        <div className="flex w-full max-w-md items-center gap-4">
          <span aria-hidden="true" className="h-px flex-1 bg-line" />
          <p lang="ar" dir="rtl" className="text-sm text-ink-2">
            {t("footer.tagline")}
          </p>
          <span aria-hidden="true" className="h-px flex-1 bg-line" />
        </div>

        <p className="text-xs text-ink-3">{t("footer.copyright")}</p>
      </div>
    </footer>
  );
};

export default Footer;
