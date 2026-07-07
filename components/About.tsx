import { BookOpenText } from "lucide-react";
import CampusPreview from "./CampusPreview";
import { Reveal, TypewriterLoop } from "./motion-primitives";
import WebMacbookChatbot from "./WebMacbookChatbot";
import MobileMacbookChatbot from "./MobileMacbookChatbot";

export default function About() {
  return (
    <section id="about" className="border-t border-line">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
        <Reveal>
          <p className="flex items-center gap-2 font-mono text-xs tracking-[0.3em] text-paper uppercase">
            <BookOpenText size={14} strokeWidth={1.5} aria-hidden="true" />
            About
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            <TypewriterLoop
              segments={[
                { text: "Engineering experiences, ", className: "text-mist" },
                { text: "not just interfaces.", className: "italic" },
              ]}
            />
          </h2>
        </Reveal>

        <div className="mt-12 grid items-center gap-10 lg:grid-cols-[1fr_1.45fr]">
          <Reveal>
            <div className="space-y-4 font-jet text-base leading-relaxed text-mist">
              <p>
                I&apos;m John Ruzly Macatula — Aspiring software engineer who
                believes great software is equal parts logic and craft. A
                4th-year BS Computer Science Student at{" "}
                <CampusPreview
                  label="UE - Manila"
                  domain="ue.edu.ph"
                  title="University of the East – Manila"
                  description="University of the East – Manila, where I study computer science."
                  image="/images/UE-manila-campus.png"
                />{" "}
                with a strong passion for technology, designing and
                programming.
              </p>
              <p>
                When I&apos;m not coding, I&apos;m exploring new technologies,
                diving into AI, and constantly looking for ways to sharpen my
                skills.
              </p>
              <p className="font-mono text-xs tracking-wide text-ash">
                Try the terminal → ask it about my skills, projects, or
                experience.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="w-full">
              {/* Mobile (< 768px): compact chat-bubble MacBook */}
              <div className="md:hidden">
                <MobileMacbookChatbot />
              </div>
              {/* Desktop (≥ 768px): full terminal MacBook */}
              <div className="hidden md:block">
                <WebMacbookChatbot />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
