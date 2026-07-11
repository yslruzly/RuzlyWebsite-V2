"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

// The intro splash. "RM" comes together in the middle, holds for a moment,
// then the whole panel slides up and reveals the site. It renders on the
// server too so the real page never flashes before the logo shows up.
// Anyone with reduced motion turned on gets a quick fade instead.

// how long the logo stays on screen before the reveal (ms)
const HOLD_MS = 2300;

export default function Preloader() {
  const [done, setDone] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    setReduced(prefersReduced);

    const t = setTimeout(() => setDone(true), prefersReduced ? 400 : HOLD_MS);
    return () => clearTimeout(t);
  }, []);

  // lock scrolling while the splash is up so the page can't move behind it
  useEffect(() => {
    if (done) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);
    return () => {
      document.body.style.overflow = prev;
    };
  }, [done]);

  const ease = [0.76, 0, 0.24, 1] as const;

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="preloader"
          aria-hidden
          initial={{ y: 0 }}
          exit={reduced ? { opacity: 0 } : { y: "-100%" }}
          transition={{ duration: reduced ? 0.3 : 0.8, ease }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-ink"
        >
          <div className="flex items-center overflow-hidden font-jet text-5xl font-bold tracking-tight text-paper sm:text-6xl">
            <motion.span
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.1 }}
            >
              R
            </motion.span>
            <motion.span
              initial={{ y: "-110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.1 }}
            >
              M
            </motion.span>
          </div>

          <div className="mt-5 h-px w-32 overflow-hidden bg-line">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.1, ease: "easeInOut", delay: 0.5 }}
              className="h-full w-full origin-left bg-paper"
            />
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-4 font-jet text-[0.6rem] tracking-[0.3em] text-mist uppercase"
          >
            Ruzly Macatula
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
