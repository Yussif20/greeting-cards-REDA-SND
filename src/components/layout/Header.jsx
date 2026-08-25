import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import RedaHazardControlLogo from "../brand/RedaHazardControlLogo.jsx";
import LanguageToggle from "../ui/LanguageToggle.jsx";
import ThemeSwitcher from "../ui/ThemeSwitcher.jsx";

/**
 * White bar, logo left, language switcher right -- as in the design.
 *
 * The theme switcher is the one addition: the mockup shows a light-only page,
 * but the app keeps both themes, so it sits after the language control behind a
 * hairline divider rather than competing with it.
 */
const Header = () => {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface-2">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-8">
        <Link
          to="/"
          aria-label={t("common.appName")}
          className="shrink-0 transition-opacity hover:opacity-80"
        >
          <RedaHazardControlLogo className="h-7 w-auto sm:h-8" />
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageToggle />
          <span aria-hidden="true" className="h-5 w-px bg-line" />
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
};

export default Header;
