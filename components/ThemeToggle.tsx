"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";

type Theme = "dark" | "light" | "system";

/**
 * Resolve a theme choice to a concrete light/dark state and apply it by
 * toggling the `light` class on <html>. Dark is the absence of that class,
 * which matches what AsciiGlobe / DotField already look for.
 */
function applyTheme(theme: Theme) {
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isLight = theme === "light" || (theme === "system" && !systemDark);
  document.documentElement.classList.toggle("light", isLight);
}

const OPTIONS: { value: Theme; Icon: typeof Moon; label: string }[] = [
  { value: "dark", Icon: Moon, label: "Dark" },
  { value: "light", Icon: Sun, label: "Light" },
  { value: "system", Icon: Monitor, label: "System" },
];

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  // Read the saved choice on mount (the inline script in layout has already
  // applied the correct class before paint, so this just syncs the UI state).
  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored === "light" || stored === "dark" || stored === "system") {
      setTheme(stored);
    }
    setMounted(true);
  }, []);

  // Apply + persist whenever the choice changes; when on "system", follow
  // live OS changes too.
  useEffect(() => {
    if (!mounted) return;
    applyTheme(theme);
    localStorage.setItem("theme", theme);
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme, mounted]);

  return (
    <div
      role="group"
      aria-label="Color theme"
      className="flex items-center gap-0.5 rounded-full border border-line bg-ink/50 p-0.5"
    >
      {OPTIONS.map(({ value, Icon, label }) => {
        const active = mounted && theme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            aria-pressed={active}
            aria-label={label}
            title={label}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] tracking-wide transition-colors duration-200 ${
              active
                ? "bg-paper text-ink"
                : "text-ash hover:text-paper"
            }`}
          >
            <Icon size={12} strokeWidth={1.75} aria-hidden="true" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
