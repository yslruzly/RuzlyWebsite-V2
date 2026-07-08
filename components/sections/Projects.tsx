"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Github, Globe, Folders, X } from "lucide-react";
import { projects, type Project } from "@/lib/data";
import { Reveal } from "@/components/ui/motion-primitives";

function SpotlightCard({
  project,
  onOpen,
}: {
  project: Project;
  onOpen: (p: Project) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: -400, y: -400 });
  const [hover, setHover] = useState(false);
  const { Icon } = project;

  const onMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onOpen(project)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(project);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${project.name}`}
      className="project-card group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-colors duration-300 hover:border-ash focus-visible:border-paper focus-visible:outline-none"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300 motion-reduce:hidden"
        style={{
          opacity: hover ? 1 : 0,
          background: `radial-gradient(420px circle at ${pos.x}px ${pos.y}px, rgba(128,128,128,0.09), transparent 65%)`,
        }}
      />

      {project.image ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-line">
          <Image
            src={project.image}
            alt={`${project.name} screenshot`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover object-top grayscale transition-all duration-500 group-hover:scale-[1.03] group-hover:grayscale-0"
          />
        </div>
      ) : (
        <div className="flex aspect-[16/9] w-full items-center justify-center border-b border-line text-ash">
          <Icon size={32} strokeWidth={1.5} />
        </div>
      )}

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="text-xl font-semibold tracking-tight">
            {project.name}
          </h3>
          <span className="shrink-0 font-mono text-[11px] tracking-widest text-ash uppercase">
            {project.kind}
          </span>
        </div>
        <p className="mt-1 font-mono text-xs tracking-wide text-mist">
          {project.tagline}
        </p>
        <p className="mt-3 flex-1 font-jet text-sm leading-relaxed text-mist">
          {project.description}
        </p>

        <div className="mt-5 flex items-center gap-4 border-t border-line pt-4">
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="relative z-20 flex min-h-11 items-center gap-1.5 font-mono text-xs text-mist transition-colors duration-200 hover:text-paper"
            >
              <Github size={14} /> Code
            </a>
          )}
          {project.live && (
            <a
              href={project.live}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="relative z-20 flex min-h-11 items-center gap-1.5 font-mono text-xs text-mist transition-colors duration-200 hover:text-paper"
            >
              <Globe size={14} /> Live ↗
            </a>
          )}
          <span className="ml-auto font-mono text-[11px] tracking-widest text-ash uppercase transition-colors duration-200 group-hover:text-paper">
            Details →
          </span>
        </div>
      </div>
    </div>
  );
}

function ProjectModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const { Icon } = project;

  // Lock scroll, close on Escape, and focus the close button on open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
      />

      {/* panel */}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.98 }}
        transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="relative flex max-h-[88svh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-line bg-surface"
      >
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-line bg-ink/60 text-mist backdrop-blur transition-colors duration-200 hover:border-paper hover:text-paper"
        >
          <X size={16} />
        </button>

        <div className="overflow-y-auto">
          {/* screenshot */}
          {project.image ? (
            <div className="relative aspect-[16/9] w-full border-b border-line">
              <Image
                src={project.image}
                alt={`${project.name} screenshot`}
                fill
                sizes="(max-width: 768px) 100vw, 640px"
                className="object-cover object-top"
              />
            </div>
          ) : (
            <div className="flex aspect-[16/9] w-full items-center justify-center border-b border-line text-ash">
              <Icon size={44} strokeWidth={1.5} />
            </div>
          )}

          <div className="p-6 sm:p-8">
            <div className="flex items-baseline justify-between gap-4">
              <h3
                id="project-modal-title"
                className="text-2xl font-semibold tracking-tight"
              >
                {project.name}
              </h3>
              <span className="shrink-0 font-mono text-[11px] tracking-widest text-ash uppercase">
                {project.kind}
              </span>
            </div>
            <p className="mt-1 font-mono text-xs tracking-wide text-mist">
              {project.tagline}
            </p>

            {/* about */}
            <p className="mt-5 font-jet text-sm leading-relaxed text-mist">
              {project.description}
            </p>

            {/* tech stack */}
            <p className="mt-7 font-mono text-[11px] tracking-[0.3em] text-ash uppercase">
              Tech stack
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {project.stack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-line px-3 py-1 font-mono text-[11px] text-mist"
                >
                  {tech}
                </span>
              ))}
            </div>

            {/* links */}
            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-line pt-6">
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line px-5 py-2.5 font-mono text-xs text-paper transition-colors duration-200 hover:border-paper"
                >
                  <Github size={15} /> View Code
                </a>
              )}
              {project.live && (
                <a
                  href={project.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-paper px-5 py-2.5 font-mono text-xs text-ink transition-colors duration-200 hover:bg-mist"
                >
                  <Globe size={15} /> Visit Live ↗
                </a>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

const FEATURED_COUNT = 3;

export default function Projects() {
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<Project | null>(null);
  const visible = showAll ? projects : projects.slice(0, FEATURED_COUNT);
  const hiddenCount = projects.length - FEATURED_COUNT;

  return (
    <section id="projects" className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
      <Reveal>
        <p className="flex items-center gap-2 font-mono text-xs tracking-[0.3em] section-eyebrow uppercase">
          <Folders size={14} strokeWidth={1.5} aria-hidden="true" />
          Selected work
        </p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">
          Things I&apos;ve built and shipped.
        </h2>
      </Reveal>

      <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((p, i) => (
          <Reveal key={p.slug} delay={(i % 3) * 0.08} className="h-full">
            <SpotlightCard project={p} onOpen={setSelected} />
          </Reveal>
        ))}
      </div>

      {hiddenCount > 0 && (
        <div className="mt-12 flex justify-center">
          <button
            onClick={() => setShowAll((v) => !v)}
            aria-expanded={showAll}
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-line px-6 py-2.5 font-mono text-xs tracking-widest text-mist uppercase transition-all duration-300 hover:border-paper hover:text-paper"
          >
            {showAll ? "Show fewer projects" : `Show ${hiddenCount} more projects`}
            <span
              className={`transition-transform duration-300 ${showAll ? "rotate-180" : ""}`}
            >
              ↓
            </span>
          </button>
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <ProjectModal project={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}
