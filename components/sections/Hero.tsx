"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Copy, Mail } from "lucide-react";
import HeroTerminal from "@/components/ui/HeroTerminal";
import ColorBends from "@/components/ui/ColorBends";
import { MagneticButton, RepelText, TypewriterRotate } from "@/components/ui/motion-primitives";

// The first thing you see: my name (the letters run from your cursor), the
// "I build" typewriter line, the intro paragraph, and the terminal with my
// photo on the right.
export default function Hero() {
  const reduce = useReducedMotion();

  // the color bends pattern squishes together on tall narrow screens, so on
  // phones we zoom it out and drop a band to keep it calm
  const [isSmall, setIsSmall] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsSmall(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <section
      id="top"
      className="relative mx-auto flex min-h-svh max-w-6xl flex-col justify-center px-5 pt-24 pb-16 sm:px-8"
    >
      {/* the flowing color background, hero only. breaks out of the max-w
          container so it covers the full viewport width, and fades near the
          bottom so it doesn't hard-cut at the marquee */}
      <div className="pointer-events-none absolute inset-y-0 left-1/2 -z-10 w-screen -translate-x-1/2 opacity-60 [mask-image:linear-gradient(to_bottom,black_78%,transparent)]">
        <ColorBends
          colors={
            isSmall
              ? ["#0a4531", "#0a4531"]
              : ["#0a4531", "#0a4531", "#0a4531"]
          }
          scale={isSmall ? 1.8 : 1}
          speed={0.15}
          noise={0.08}
        />
      </div>

      <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <h1 className="text-[clamp(2.6rem,7vw,5rem)] leading-[1.02] font-semibold tracking-tight">
            <RepelText text="Ruzly" delay={0.2} />{" "}
            <RepelText text="Macatula" delay={0.35} className="text-mist" />
          </h1>

          <motion.p
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-5 font-jet text-sm tracking-wide text-mist sm:text-base"
          >
            <TypewriterRotate
              prefix="I build → "
              phrases={["Mobile Applications.", "Web Applications.", "Hello World."]}
              phraseClassName="font-bold text-paper"
            />
          </motion.p>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="mt-6 max-w-xl font-jet text-base leading-relaxed text-mist sm:text-lg"
          >
            Building digital experiences where clean code meets thoughtful
            design, specializing in modern web technologies, scalable systems,
            and interfaces that feel alive.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.05 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <MagneticButton href="#projects" rounded="lg">
              <Copy size={15} /> View Projects
            </MagneticButton>
            <MagneticButton href="#contact" variant="outline" rounded="lg">
              <Mail size={15} /> Get In Touch
            </MagneticButton>
          </motion.div>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-95 lg:max-w-sm lg:justify-self-end"
        >
          <HeroTerminal />
        </motion.div>
      </div>

      <motion.div
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="pointer-events-none absolute bottom-8 left-1/2 hidden -translate-x-1/2 font-mono text-[10px] tracking-[0.35em] text-ash sm:block"
        aria-hidden="true"
      >
        SCROLL
      </motion.div>
    </section>
  );
}
