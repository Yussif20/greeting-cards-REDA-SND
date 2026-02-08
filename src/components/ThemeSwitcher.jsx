import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState("light");
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const initialTheme = savedTheme || (systemDark ? "dark" : "light");
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const themeToggleHandler = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setIsAnimating(true);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <>
      {/* Desktop Version - Two buttons */}
      <div className="hidden sm:flex relative">
        <div className="flex items-center p-1 bg-white/40 dark:bg-gray-700 rounded-xl shadow-inner border border-gray-300 dark:border-gray-600 transition-all duration-300 backdrop-blur-sm">
          <button
            onClick={themeToggleHandler}
            className={`relative flex items-center justify-center w-10 h-8 rounded-lg transition-all duration-300 transform ${
              theme === "light"
                ? "bg-white dark:bg-gray-800 shadow-md scale-105 text-[#C9A84C]"
                : "bg-transparent hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-500"
            } ${isAnimating ? "animate-pulse" : ""}`}
            aria-label="Switch to light mode"
            title="Light mode"
          >
            <Sun
              className={`w-4 h-4 transition-all duration-300 ${
                theme === "light"
                  ? "text-[#C9A84C] drop-shadow-sm"
                  : "text-gray-500 dark:text-gray-500"
              }`}
            />
            {theme === "light" && (
              <div className="absolute inset-0 rounded-lg bg-[#C9A84C]/10 animate-ping"></div>
            )}
          </button>

          <button
            onClick={themeToggleHandler}
            className={`relative flex items-center justify-center w-10 h-8 rounded-lg transition-all duration-300 transform ${
              theme === "dark"
                ? "bg-white dark:bg-gray-800 shadow-md scale-105 text-[#1B3A5C]"
                : "bg-transparent hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-500"
            } ${isAnimating ? "animate-pulse" : ""}`}
            aria-label="Switch to dark mode"
            title="Dark mode"
          >
            <Moon
              className={`w-4 h-4 transition-all duration-300 ${
                theme === "dark"
                  ? "text-[#1B3A5C] drop-shadow-sm"
                  : "text-gray-500 dark:text-gray-500"
              }`}
            />
            {theme === "dark" && (
              <div className="absolute inset-0 rounded-lg bg-[#1B3A5C]/10 animate-ping"></div>
            )}
          </button>
        </div>
        {/* Subtle indicator dot */}
        <div
          className={`absolute -top-1 -right-1 w-2 h-2 rounded-full transition-all duration-300 ${
            theme === "light" ? "bg-[#C9A84C]" : "bg-[#1B3A5C]"
          } ${isAnimating ? "animate-bounce" : ""}`}
        ></div>
      </div>

      {/* Mobile Version - Single icon that always shows and toggles theme */}
      <div className="flex sm:hidden">
        <button
          onClick={themeToggleHandler}
          className={`relative p-2.5 rounded-xl transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg border-2 ${
            theme === "light"
              ? "bg-white hover:bg-gray-50 text-[#132E4A] border-[#1B3A5C]/30 hover:border-[#1B3A5C]/50 shadow-[#1B3A5C]/20"
              : "bg-gray-800 hover:bg-gray-700 text-[#C9A84C] border-[#C9A84C]/30 hover:border-[#C9A84C]/50 shadow-[#C9A84C]/10"
          } ${isAnimating ? "animate-pulse" : ""}`}
          aria-label={`Toggle theme (currently ${theme})`}
          title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {/* Always show current theme icon, not the target */}
          {theme === "light" ? (
            <Sun className="w-6 h-6 text-[#C9A84C] transition-all duration-300 drop-shadow-sm" />
          ) : (
            <Moon className="w-6 h-6 text-[#1B3A5C] transition-all duration-300 drop-shadow-sm" />
          )}

          {/* Subtle glow effect */}
          <div
            className={`absolute inset-0 rounded-xl transition-all duration-300 ${
              theme === "light"
                ? "bg-linear-to-r from-amber-500/10 to-yellow-600/10"
                : "bg-linear-to-r from-blue-500/10 to-indigo-500/10"
            } ${isAnimating ? "animate-ping" : ""}`}
          ></div>

          {/* Active state indicator dot */}
          <div
            className={`absolute -top-1 -right-1 w-3 h-3 rounded-full transition-all duration-300 ${
              theme === "light"
                ? "bg-amber-600 shadow-amber-600/50"
                : "bg-blue-400 shadow-blue-400/50"
            } ${isAnimating ? "animate-bounce" : ""} shadow-lg`}
          ></div>
        </button>
      </div>
    </>
  );
}
