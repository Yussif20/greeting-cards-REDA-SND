import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTranslation } from "react-i18next";

export const THEME_KEY = "theme";

const ThemeSwitcher = () => {
  const { t } = useTranslation();
  // index.html applies the stored theme before first paint; mirror it here so
  // the control starts in the right position without a flash.
  const [theme, setTheme] = useState(() =>
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark")
      ? "dark"
      : "light",
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const next = theme === "light" ? "dark" : "light";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={t(`common.theme.${next}`)}
      title={t(`common.theme.${next}`)}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-2 transition-colors hover:bg-surface-3 hover:text-ink"
    >
      {theme === "light" ? (
        <Sun className="h-4.5 w-4.5" aria-hidden="true" />
      ) : (
        <Moon className="h-4.5 w-4.5" aria-hidden="true" />
      )}
    </button>
  );
};

export default ThemeSwitcher;
