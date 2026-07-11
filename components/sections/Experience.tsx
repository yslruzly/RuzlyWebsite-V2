"use client";

import { useEffect, useRef, useState } from "react";
import { Coffee } from "lucide-react";
import { EXPERIENCES } from "@/lib/data";
import GitHubHeatmap from "@/components/ui/GitHubHeatmap";

// The "Where I've been" section. The panel pins in place while you scroll
// and the timeline line fills up from 2022 at the bottom to 2026 at the top.
// Once it's full the page lets go and you continue down to Contact.
export default function Experience() {
  const outerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [progress, setProgress] = useState(0);
  // real pixel positions of each dot, so an item lights up exactly when the line touches it
  const [metrics, setMetrics] = useState<{ height: number; dots: number[] }>({
    height: 0,
    dots: [],
  });

  useEffect(() => {
    const measure = () => {
      const el = timelineRef.current;
      if (!el) return;
      setMetrics({
        height: el.offsetHeight,
        // dot center is the item's top plus the dot's own offset (top-1.5 plus half of the 11px square)
        dots: itemRefs.current.map((d) => (d ? d.offsetTop + 11.5 : 0)),
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const outer = outerRef.current;
        if (!outer) {
          ticking = false;
          return;
        }
        const rect = outer.getBoundingClientRect();
        // use the pinned panel's actual height here. on mobile the browser
        // address bar hides while scrolling and window.innerHeight jumps,
        // which made the progress skip around
        const pinnedH = stickyRef.current?.offsetHeight ?? window.innerHeight;
        const scrollable = rect.height - pinnedH;
        const p = scrollable > 0 ? Math.min(Math.max(-rect.top / scrollable, 0), 1) : 1;
        setProgress(p);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const n = EXPERIENCES.length;

  return (
    <section id="experience" className="border-t border-line bg-surface/40">
      {/* this tall wrapper is what gives the section its scroll distance while the panel stays pinned */}
      <div ref={outerRef} className="relative h-[260svh]">
        <div ref={stickyRef} className="sticky top-0 flex h-svh items-center overflow-hidden">
          <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
            <p className="flex items-center gap-2 font-mono text-xs tracking-[0.3em] section-eyebrow uppercase">
              <Coffee size={14} strokeWidth={1.5} aria-hidden="true" />
              Experience
            </p>
            <div className="mt-3 flex items-baseline justify-between gap-6">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Where I&apos;ve been
              </h2>
              <span className="font-mono text-xs text-ash tabular-nums">
                {Math.round(progress * 100)}%
              </span>
            </div>

            <div className="mt-10 grid gap-12 sm:mt-14 lg:grid-cols-2 lg:items-center lg:gap-8">
            <div ref={timelineRef} className="relative pl-8 sm:pl-10">
              {/* track */}
              <div className="absolute top-0 bottom-0 left-[9px] w-px bg-line sm:left-[11px]" />
              {/* the white line that fills up as you scroll */}
              <div
                className="absolute bottom-0 left-[9px] w-px bg-paper sm:left-[11px]"
                style={{ height: `${progress * 100}%` }}
              />

              <div className="space-y-8 sm:space-y-12">
                {EXPERIENCES.map((item, i) => {
                  // light this item up when the rising line reaches its dot,
                  // bottom ones first. before anything is measured, just
                  // estimate evenly
                  const dotCenter = metrics.dots[i];
                  const lit =
                    metrics.height > 0 && dotCenter !== undefined
                      ? progress * metrics.height >= metrics.height - dotCenter
                      : progress >= (n - i - 0.5) / n;
                  return (
                    <div
                      key={item.role}
                      ref={(el) => {
                        itemRefs.current[i] = el;
                      }}
                      className="relative transition-opacity duration-500"
                      style={{ opacity: lit ? 1 : 0.3 }}
                    >
                      <div
                        className={`absolute top-1.5 -left-7 h-[11px] w-[11px] border transition-all duration-300 sm:-left-8.5 ${lit
                          ? "border-paper bg-paper shadow-[0_0_12px_rgba(128,128,128,0.6)]"
                          : "border-ash bg-ink"
                          }`}
                      />
                      <div className="font-mono text-xs tracking-widest text-ash">
                        {item.year}
                      </div>
                      <h3 className="mt-1 text-lg font-semibold tracking-tight">
                        {item.role}
                      </h3>
                      <div className="mt-0.5 font-mono text-xs text-mist">
                        {item.company}
                      </div>
                      <p className="mt-2 max-w-xl font-jet text-sm leading-relaxed text-mist">
                        {item.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

              {/* github heatmap on the right, desktop only */}
              <div className="hidden lg:flex lg:justify-center">
                <GitHubHeatmap username="yslruzly" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
