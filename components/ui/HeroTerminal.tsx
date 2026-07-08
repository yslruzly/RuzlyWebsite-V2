"use client";

import Image from "next/image";
import ThemeToggle from "./ThemeToggle";

/** Terminal window framing John's photo — hero visual. */
export default function HeroTerminal({ className = "" }: { className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-line bg-surface shadow-[0_16px_48px_rgba(0,0,0,0.6)] ${className}`}
    >
      {/* title bar */}
      <div className="flex items-center gap-2 border-b border-line bg-ink/60 px-4 py-2.5">
        <span className="h-3 w-3 shrink-0 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 shrink-0 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 shrink-0 rounded-full bg-[#28c840]" />
        <span className="ml-2 font-mono text-[11px] tracking-wide text-ash">
          ruzly@portfolio
        </span>
      </div>

      {/* screen: the photo */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#0d0d0d]">
        <Image
          src="/images/pfp.jpg"
          alt="Portrait of Ruzly Macatula"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 448px"
          className="hero-photo object-cover grayscale"
        />
      </div>

      {/* bottom bar: theme controls (dark / light / system) */}
      <div className="flex items-center gap-3 border-t border-line bg-ink/60 px-4 py-2.5">
        <span className="mr-auto hidden font-mono text-[10px] tracking-widest text-ash uppercase sm:inline">
          Theme
        </span>
        <ThemeToggle />
      </div>
    </div>
  );
}
