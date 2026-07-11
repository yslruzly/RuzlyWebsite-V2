"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";

type Theme = "dark" | "light" | "system";

// Turns the picked theme into an actual light or dark page by toggling the
// `light` class on <html>. Dark is just "no class", which is also what the
// globe and the dot background check for.
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

  // read the saved choice when the buttons mount. the little script in
  // layout.tsx already applied the right class before paint, this just
  // makes the buttons show the right one as active
  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored === "light" || stored === "dark" || stored === "system") {
      setTheme(stored);
    }
    setMounted(true);
  }, []);

  // apply and save whenever the choice changes. on "system" we also listen
  // for the OS switching themes so the site follows along live
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
