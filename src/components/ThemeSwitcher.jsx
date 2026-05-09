import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const initialTheme = savedTheme || (systemDark ? "dark" : "light");
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const setMode = (mode) => {
    document.documentElement.classList.toggle("dark", mode === "dark");
    setTheme(mode);
    localStorage.setItem("theme", mode);
  };

  const toggle = () => setMode(theme === "light" ? "dark" : "light");

  const segmentBase =
    "relative flex items-center justify-center w-9 h-8 rounded-sm transition-all duration-300";
  const segmentActive =
    "bg-gradient-to-br from-[var(--jewel-gold)] to-[var(--jewel-gold-deep)] text-[var(--ink)] shadow-md";
  const segmentInactive =
    "text-[var(--chrome-text)]/60 hover:text-[var(--chrome-text)]";

  return (
    <>
      {/* Desktop — segmented sun/moon */}
      <div
        className="hidden sm:flex items-center gap-1 p-1 rounded-sm border border-[var(--chrome-border)]"
        role="group"
        aria-label="Theme"
      >
        <button
          onClick={() => setMode("light")}
          className={`${segmentBase} ${
            theme === "light" ? segmentActive : segmentInactive
          }`}
          aria-label="Switch to light mode"
          aria-pressed={theme === "light"}
          title="Light mode"
        >
          <Sun className="w-4 h-4" />
        </button>
        <button
          onClick={() => setMode("dark")}
          className={`${segmentBase} ${
            theme === "dark" ? segmentActive : segmentInactive
          }`}
          aria-label="Switch to dark mode"
          aria-pressed={theme === "dark"}
          title="Dark mode"
        >
          <Moon className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile — single toggle */}
      <button
        onClick={toggle}
        className="flex sm:hidden p-2 rounded-sm border border-[var(--chrome-border)] hover:bg-[var(--chrome-border)]/10 transition-all duration-300 text-[var(--chrome-text)]"
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      >
        {theme === "light" ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </button>
    </>
  );
}
