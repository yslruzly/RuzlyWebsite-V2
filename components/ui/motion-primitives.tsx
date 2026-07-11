"use client";

import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

// Fade-up on scroll. Wrap anything in this and it slides up into view
// the first time you scroll to it.
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

// Button that leans toward your cursor a little while you hover it,
// then springs back to place when you leave.
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

// Typewriter that loops forever: types the text out, waits, deletes it,
// starts again. Takes segments so parts of the sentence can have their own
// styling. There's a hidden copy of the full text underneath keeping the box
// at full size, so the layout doesn't jump around while it types.
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
      {/* the hidden copy that holds the full size */}
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

// Same idea but with rotating phrases: a fixed prefix, then each phrase
// types in, holds for a bit, backspaces out, and the next one starts.
// This is the "I build → ..." line in the hero.
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

// The hero name effect. The word still slides up on load like before, but
// after that every letter runs away from the cursor and springs back when
// you leave. I measure where each letter sits once the intro is done and
// always push from that home spot, not from wherever the letter currently
// is, otherwise they jitter and never settle.
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
  // how close the cursor has to get before a letter reacts (px)
  radius?: number;
  // how far a letter moves when the cursor is right on top of it
  maxPush?: number;
}) {
  const reduce = useReducedMotion();
  const letters = Array.from(text);

  const refs = useRef<(HTMLSpanElement | null)[]>([]);
  const [centers, setCenters] = useState<{ x: number; y: number }[]>([]);
  const [mouse, setMouse] = useState<{ x: number; y: number } | null>(null);
  // the intro clips the letters so they can slide in from below. once it's
  // done we unclip, or letters pushed upward would get cut off
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
    // re-measure when the webfont finishes loading, letters shift when it swaps in
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
    // the closer the cursor, the harder the push
    const force = (1 - dist / radius) * maxPush;
    // cursor exactly on the center: no direction to push, just go straight up
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

// Words slide up one after another. This was the old hero name reveal
// before RepelText replaced it, keeping it around in case I need it.
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
