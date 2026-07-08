"use client";

import { useState } from "react";
import { FlaskConical } from "lucide-react";
import { SKILLS } from "@/lib/data";
import { TECH_ICONS } from "@/lib/tech-icons";
import { Reveal } from "@/components/ui/motion-primitives";

/**
 * Skills as full-width editorial rows. Hovering a row inverts it
 * (white on black becomes black on white) — pure B&W interaction.
 */
export default function Skills() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section id="skills" className="border-t border-line bg-surface/40">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
        <Reveal>
          <p className="flex items-center gap-2 font-mono text-xs tracking-[0.3em] section-eyebrow uppercase">
            <FlaskConical size={14} strokeWidth={1.5} aria-hidden="true" />
            Skills
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            What I work with
          </h2>
        </Reveal>

        <div className="mt-14 border-t border-line">
          {SKILLS.map(({ name, desc, tags }, i) => {
            const isActive = active === i;
            return (
              <Reveal key={name} delay={i * 0.06}>
                <div
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  className={`group grid gap-4 border-b border-line px-4 py-8 transition-colors duration-300 sm:grid-cols-[auto_1fr_1.4fr] sm:items-baseline sm:gap-8 sm:px-6 sm:py-10 ${
                    isActive ? "bg-paper" : "bg-transparent"
                  }`}
                >
                  <span
                    className={`font-mono text-xs tabular-nums transition-colors duration-300 ${
                      isActive ? "text-ink/50" : "text-ash"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <h3
                    className={`text-2xl font-semibold tracking-tight transition-colors duration-300 sm:text-4xl ${
                      isActive ? "text-ink" : "text-paper"
                    }`}
                  >
                    {name}
                  </h3>

                  <div>
                    <p
                      className={`font-jet text-sm leading-relaxed transition-colors duration-300 ${
                        isActive ? "text-ink/70" : "text-mist"
                      }`}
                    >
                      {desc}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {tags.map((t) => (
                        <span
                          key={t}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] transition-colors duration-300 ${
                            isActive
                              ? "border-ink/25 text-ink/80"
                              : "border-line text-mist"
                          }`}
                        >
                          {TECH_ICONS[t] && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={TECH_ICONS[t]}
                              alt=""
                              aria-hidden="true"
                              loading="lazy"
                              width={14}
                              height={14}
                              className={`h-3.5 w-3.5 transition-[filter] duration-300 ${
                                isActive ? "" : "brightness-0 invert"
                              }`}
                            />
                          )}
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
