"use client";

import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

/** Scroll-triggered reveal: fades and slides content up once it enters view. */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
}

/** Button that subtly follows the cursor, magicui-style. */
export function MagneticButton({
  children,
  href,
  variant = "solid",
  rounded = "full",
}: {
  children: React.ReactNode;
  href: string;
  variant?: "solid" | "outline";
  rounded?: "full" | "lg";
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const reduce = useReducedMotion();

  const onMove = (e: React.MouseEvent) => {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setOffset({
      x: (e.clientX - rect.left - rect.width / 2) * 0.22,
      y: (e.clientY - rect.top - rect.height / 2) * 0.22,
    });
  };

  const base = `inline-flex min-h-11 items-center justify-center gap-2 ${
    rounded === "full" ? "rounded-full" : "rounded-lg"
  } px-7 py-3 font-mono text-sm tracking-tight transition-colors duration-200`;
  const styles =
    variant === "solid"
      ? "bg-paper text-ink hover:bg-mist"
      : "border border-line text-paper hover:border-mist";

  return (
    <motion.a
      ref={ref}
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className={`${base} ${styles}`}
      onMouseMove={onMove}
      onMouseLeave={() => setOffset({ x: 0, y: 0 })}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: "spring", stiffness: 300, damping: 20, mass: 0.5 }}
    >
      {children}
    </motion.a>
  );
}

/**
 * Looping typewriter: types the text letter by letter, pauses, deletes it,
 * and starts over. Accepts styled segments so parts of the sentence can
 * carry different classes. An invisible copy of the full text reserves the
 * final size, so the layout never shifts while typing.
 */
export function TypewriterLoop({
  segments,
  className = "",
  typeSpeed = 32,
  deleteSpeed = 16,
  pauseFull = 2200,
  pauseEmpty = 600,
}: {
  segments: { text: string; className?: string }[];
  className?: string;
  typeSpeed?: number;
  deleteSpeed?: number;
  pauseFull?: number;
  pauseEmpty?: number;
}) {
  const reduce = useReducedMotion();
  const full = segments.map((s) => s.text).join("");
  const [count, setCount] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (reduce) return;
    let t: ReturnType<typeof setTimeout>;
    if (!deleting) {
      t =
        count < full.length
          ? setTimeout(() => setCount((c) => c + 1), typeSpeed)
          : setTimeout(() => setDeleting(true), pauseFull);
    } else {
      t =
        count > 0
          ? setTimeout(() => setCount((c) => c - 1), deleteSpeed)
          : setTimeout(() => setDeleting(false), pauseEmpty);
    }
    return () => clearTimeout(t);
  }, [count, deleting, reduce, full.length, typeSpeed, deleteSpeed, pauseFull, pauseEmpty]);

  if (reduce) {
    return (
      <span className={className}>
        {segments.map((s, i) => (
          <span key={i} className={s.className}>
            {s.text}
          </span>
        ))}
      </span>
    );
  }

  let offset = 0;
  const typed = segments.map((s, i) => {
    const visibleLen = Math.max(0, Math.min(count - offset, s.text.length));
    offset += s.text.length;
    return (
      <span key={i} className={s.className}>
        {s.text.slice(0, visibleLen)}
      </span>
    );
  });

  return (
    <span className={`relative inline-block ${className}`} aria-label={full} role="text">
      {/* invisible copy reserves the full width/height */}
      <span className="invisible" aria-hidden="true">
        {segments.map((s, i) => (
          <span key={i} className={s.className}>
            {s.text}
          </span>
        ))}
      </span>
      <span className="absolute inset-0" aria-hidden="true">
        {typed}
        <span className="animate-caret text-paper select-none">|</span>
      </span>
    </span>
  );
}

/**
 * Rotating typewriter: a static prefix followed by phrases that type in
 * letter by letter, hold, backspace out, then advance to the next phrase
 * in the list — looping forever.
 */
export function TypewriterRotate({
  prefix = "",
  phrases,
  className = "",
  phraseClassName = "",
  typeSpeed = 38,
  deleteSpeed = 20,
  pauseFull = 1800,
  pauseEmpty = 400,
}: {
  prefix?: string;
  phrases: string[];
  className?: string;
  phraseClassName?: string;
  typeSpeed?: number;
  deleteSpeed?: number;
  pauseFull?: number;
  pauseEmpty?: number;
}) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const phrase = phrases[index % phrases.length];

  useEffect(() => {
    if (reduce) return;
    let t: ReturnType<typeof setTimeout>;
    if (!deleting) {
      t =
        count < phrase.length
          ? setTimeout(() => setCount((c) => c + 1), typeSpeed)
          : setTimeout(() => setDeleting(true), pauseFull);
    } else {
      t =
        count > 0
          ? setTimeout(() => setCount((c) => c - 1), deleteSpeed)
          : setTimeout(() => {
              setDeleting(false);
              setIndex((i) => (i + 1) % phrases.length);
            }, pauseEmpty);
    }
    return () => clearTimeout(t);
  }, [count, deleting, reduce, phrase.length, phrases.length, typeSpeed, deleteSpeed, pauseFull, pauseEmpty]);

  if (reduce) {
    return (
      <span className={className}>
        {prefix}
        <span className={phraseClassName}>{phrases[0]}</span>
      </span>
    );
  }

  return (
    <span className={className} aria-label={`${prefix}${phrases.join(", ")}`} role="text">
      <span aria-hidden="true">
        {prefix}
        <span className={phraseClassName}>{phrase.slice(0, count)}</span>
        <span className="animate-caret text-paper font-bold select-none">|</span>
      </span>
    </span>
  );
}

/**
 * Hero headline word that slides up on load, then scatters letter by letter
 * away from the cursor. Letter rest positions are measured in page
 * coordinates once the entrance finishes, so the push is computed against
 * where a letter *belongs*, not where the spring has currently flung it.
 */
export function RepelText({
  text,
  className = "",
  delay = 0,
  radius = 120,
  maxPush = 28,
}: {
  text: string;
  className?: string;
  delay?: number;
  /** Cursor distance, in px, at which a letter starts to move. */
  radius?: number;
  /** How far a letter travels when the cursor is right on top of it. */
  maxPush?: number;
}) {
  const reduce = useReducedMotion();
  const letters = Array.from(text);

  const refs = useRef<(HTMLSpanElement | null)[]>([]);
  const [centers, setCenters] = useState<{ x: number; y: number }[]>([]);
  const [mouse, setMouse] = useState<{ x: number; y: number } | null>(null);
  // The entrance clips letters to their line box; only unclip once it's done,
  // otherwise a letter pushed upward gets sliced off.
  const [entered, setEntered] = useState(false);

  const measure = useCallback(() => {
    setCenters(
      refs.current.map((el) => {
        if (!el) return { x: -9999, y: -9999 };
        const r = el.getBoundingClientRect();
        return {
          x: r.left + r.width / 2 + window.scrollX,
          y: r.top + r.height / 2 + window.scrollY,
        };
      })
    );
  }, []);

  useEffect(() => {
    if (reduce) return;
    const t = setTimeout(() => setEntered(true), (delay + 0.9) * 1000);
    return () => clearTimeout(t);
  }, [reduce, delay]);

  useEffect(() => {
    if (reduce || !entered) return;
    measure();
    // Webfonts can land after first paint and reflow every letter.
    document.fonts?.ready.then(measure).catch(() => {});
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [reduce, entered, measure]);

  useEffect(() => {
    if (reduce || !entered) return;
    let frame = 0;
    const onMove = (e: MouseEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setMouse({ x: e.pageX, y: e.pageY });
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduce, entered]);

  const offsetFor = (i: number) => {
    const c = centers[i];
    if (!mouse || !c) return { x: 0, y: 0 };
    const dx = c.x - mouse.x;
    const dy = c.y - mouse.y;
    const dist = Math.hypot(dx, dy);
    if (dist > radius) return { x: 0, y: 0 };
    // Linear falloff, strongest when the cursor sits on the letter's center.
    const force = (1 - dist / radius) * maxPush;
    // Guard the degenerate case where the cursor is exactly on the center.
    if (dist < 0.001) return { x: 0, y: -force };
    return { x: (dx / dist) * force, y: (dy / dist) * force };
  };

  return (
    <span className={className} aria-label={text} role="text">
      <span
        className={`inline-block align-bottom ${
          entered ? "overflow-visible" : "overflow-hidden"
        }`}
      >
        <motion.span
          className="inline-block"
          initial={reduce ? false : { y: "110%" }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
          aria-hidden="true"
        >
          {letters.map((ch, i) => (
            <motion.span
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              className="inline-block"
              animate={reduce ? undefined : offsetFor(i)}
              transition={{
                type: "spring",
                stiffness: 190,
                damping: 13,
                mass: 0.35,
              }}
            >
              {ch}
            </motion.span>
          ))}
        </motion.span>
      </span>
    </span>
  );
}

/** Staggered word-by-word text reveal for the hero headline. */
export function SplitWords({
  text,
  className = "",
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  return (
    <span className={className} aria-label={text} role="text">
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            initial={reduce ? false : { y: "110%" }}
            animate={{ y: 0 }}
            transition={{
              duration: 0.8,
              delay: delay + i * 0.07,
              ease: [0.21, 0.47, 0.32, 0.98],
            }}
            aria-hidden="true"
          >
            {word}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
