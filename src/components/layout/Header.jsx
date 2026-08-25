import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import RedaCardsLogo from "../brand/RedaCardsLogo.jsx";
import LanguageToggle from "../ui/LanguageToggle.jsx";
import ThemeSwitcher from "../ui/ThemeSwitcher.jsx";

const Header = () => {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface-2/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          to="/"
          aria-label={t("common.appName")}
          className="shrink-0 text-brand transition-opacity hover:opacity-80"
        >
          <RedaCardsLogo className="h-8 w-auto" title={t("common.appName")} />
        </Link>

        <div className="flex items-center gap-1 sm:gap-3">
          <LanguageToggle />
          <span aria-hidden="true" className="hidden h-5 w-px bg-line sm:block" />
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
};

export default Header;
