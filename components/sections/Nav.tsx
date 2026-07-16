"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Menu, X } from "lucide-react";
import RMLogo from "@/components/ui/RMLogo";

// The live Manila clock on the left side of the navbar. Clicking it scrolls
// back to the top.
function ManilaClock() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-PH", {
      timeZone: "Asia/Manila",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className="cursor-pointer font-jet text-xs font-medium tracking-[0.12em] text-mist uppercase tabular-nums sm:text-sm sm:tracking-[0.18em]"
      suppressHydrationWarning
    >
      MNL <span className="font-bold text-paper">{time || "--:--:--"}</span>
    </button>
  );
}

const sections = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
];

// The top navbar. Full width while you're on the hero, then once you scroll
// past it, it shrinks into the floating pill with the glow.
export default function Nav() {
  const [detached, setDetached] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const hero = document.getElementById("top");
        const threshold = hero ? hero.offsetHeight - 80 : window.innerHeight - 80;
        setDetached(window.scrollY > threshold);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        detached ? "px-4 pt-3 sm:px-6" : "px-0 pt-0"
      }`}
    >
      <nav
        className={`mx-auto flex items-center justify-between transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          detached
            ? "h-13 max-w-4xl rounded-full border border-paper/25 bg-ink/80 px-5 shadow-[0_0_18px_rgba(255,255,255,0.12),inset_0_0_10px_rgba(255,255,255,0.04),0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-md sm:px-7"
            : "h-16 max-w-6xl bg-transparent px-5 sm:px-8"
        }`}
        aria-label="Main"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
            className="flex cursor-pointer items-center text-paper transition-opacity duration-200 hover:opacity-70"
          >
            <RMLogo size={30} />
          </button>
          <ManilaClock />
        </div>

        <div className="flex items-center">
          <ul className="hidden items-center gap-5 sm:gap-6 md:flex">
            {sections.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => go(s.id)}
                  className="inline-flex min-h-11 cursor-pointer items-center font-jet text-xs tracking-[0.14em] text-mist uppercase transition-colors duration-200 hover:text-paper"
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center text-paper md:hidden"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`mx-auto backdrop-blur-md md:hidden ${
            detached
              ? "mt-2 max-w-4xl rounded-2xl border border-line bg-ink/90"
              : "border-t border-line bg-ink/95"
          }`}
        >
          <div className="mx-auto flex max-w-6xl flex-col px-5 py-3">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => go(s.id)}
                className="min-h-12 cursor-pointer text-left font-jet text-sm tracking-[0.14em] text-mist uppercase transition-colors duration-200 hover:text-paper"
              >
                {s.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
