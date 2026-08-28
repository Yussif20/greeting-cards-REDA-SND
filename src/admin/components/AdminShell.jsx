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
  { to: "/admin/seasons", key: "admin.nav.seasons" },
];

/**
 * Chrome for /admin: its own header rather than the public one.
 *
 * The logo leads, matching the public header, so the two read as one product
 * rather than two. "Start" here is the logical start: as the first flex child
 * it lands on the left in English and on the right in Arabic, following the
 * direction on <html> with no RTL variant of its own. The controls are pushed
 * to the far end with ms-auto, which is logical for the same reason.
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
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6">
          {logo}

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
