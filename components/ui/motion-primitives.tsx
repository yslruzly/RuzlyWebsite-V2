"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

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
