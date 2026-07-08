"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

/**
 * Inline rich link-preview: highlights a word in running text and, on hover
 * or click, reveals a card with a photo and a frosted info panel — the
 * "unfurl" style used for shared links. Built from <span>s so it stays valid
 * HTML inside a <p>.
 */
export default function CampusPreview({
  label,
  domain,
  title,
  description,
  image,
}: {
  label: string;
  domain: string;
  title: string;
  description: string;
  image: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);

  // Close on Escape or a pointer/tap outside (mainly for click-to-open on touch).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDown = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <span
      ref={wrapRef}
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="cursor-pointer font-semibold text-paper underline decoration-mist/60 decoration-dotted underline-offset-4 transition-colors duration-200 hover:decoration-paper focus-visible:outline-none"
      >
        {label}
      </button>

      <AnimatePresence>
        {open && (
          <motion.span
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-3 block w-72 -translate-x-1/2 sm:w-80"
          >
            <span className="block overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl shadow-black/60">
              <span className="relative block aspect-[16/10] w-full">
                <Image
                  src={image}
                  alt={title}
                  fill
                  sizes="320px"
                  className="object-cover"
                />
                <span className="absolute inset-0 block bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />

                {/* frosted info panel */}
                <span className="absolute inset-x-3 bottom-3 block max-w-[90%] rounded-xl border border-white/10 bg-ink/55 px-3 py-2.5 backdrop-blur-md">
                  <span className="block font-mono text-[10px] tracking-wide text-mist">
                    {domain}
                  </span>
                  <span className="mt-0.5 block text-sm font-semibold text-paper">
                    {title}
                  </span>
                  <span className="mt-1 block font-jet text-xs leading-snug text-mist">
                    {description}
                  </span>
                </span>
              </span>
            </span>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
