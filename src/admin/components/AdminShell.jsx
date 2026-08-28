import { useEffect } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, LogOut } from "lucide-react";

import Button from "../../components/ui/Button.jsx";
import RedaHazardControlLogo from "../../components/brand/RedaHazardControlLogo.jsx";
import LanguageToggle from "../../components/ui/LanguageToggle.jsx";
import ThemeSwitcher from "../../components/ui/ThemeSwitcher.jsx";

const TABS = [
  { to: "/admin/occasions", key: "admin.nav.occasions" },
  { to: "/admin/designs", key: "admin.nav.designs" },
];

/**
 * Chrome for /admin: its own header rather than the public one.
 *
 * The logo sits in the centre and stays there. It is absolutely positioned
 * rather than being a third flex child, because the navigation on one side and
 * the controls on the other are never the same width -- and they change width
 * again when the language does. A flex-centred logo would drift a few pixels
 * left or right depending on how long "Occasions" happens to be in Arabic;
 * this one is centred on the header, not on whatever is left over.
 *
 * Centring is physical (left-1/2 with a half-width shift), which is correct in
 * both directions: the middle of the bar is the middle of the bar in Arabic
 * too, so nothing here needs a logical property or an RTL variant.
 *
 * On narrow screens it takes its own row instead, since a centred logo between
 * two groups of controls has nowhere to go on a phone.
 *
 * The language and theme controls come along because the content being edited
 * is bilingual -- an admin writing Arabic copy needs to see the interface the
 * way the reader will, and checking a new occasion's accent in both themes is
 * part of the job rather than a preference.
 */
const AdminShell = ({ email, onSignOut }) => {
  const { t } = useTranslation();

  // /admin holds no public content and should never appear in a search index.
  // robots.txt covers crawlers that read it; this covers the ones that do not.
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  const logo = (
    <Link
      to="/admin"
      aria-label={t("admin.title")}
      className="inline-block shrink-0 transition-opacity hover:opacity-80"
    >
      <RedaHazardControlLogo className="h-6 w-auto sm:h-7" />
    </Link>
  );

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="sticky top-0 z-40 border-b border-line bg-surface-2/95 backdrop-blur">
        {/* Its own row below sm, where there is no room to centre anything. */}
        <div className="flex justify-center border-b border-line py-2 sm:hidden">{logo}</div>

        <div className="relative mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
          <nav className="flex items-center gap-1" aria-label={t("admin.nav.label")}>
            {TABS.map(({ to, key }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "bg-chip-active text-chip-active-fg"
                      : "text-ink-2 hover:bg-surface-3 hover:text-ink"
                  }`
                }
              >
                {t(key)}
              </NavLink>
            ))}
          </nav>

          {/* Centred on the header itself, so it cannot be pushed off-centre by
              the width of the controls on either side. */}
          <div className="pointer-events-none absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 sm:block">
            <span className="pointer-events-auto">{logo}</span>
          </div>

          <div className="ms-auto flex items-center gap-2">
            <a
              href="/"
              className="hidden items-center gap-1 rounded-full px-3 py-1.5 text-sm text-ink-2 transition-colors hover:bg-surface-3 hover:text-ink lg:inline-flex"
            >
              {t("admin.nav.viewSite")}
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
            <LanguageToggle />
            <ThemeSwitcher />
            <Button size="sm" variant="ghost" onClick={onSignOut} title={email ?? undefined}>
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only lg:not-sr-only">{t("admin.auth.signOut")}</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminShell;
