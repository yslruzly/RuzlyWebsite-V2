import { BookOpenText } from "lucide-react";
import CampusPreview from "@/components/ui/CampusPreview";
import { Reveal, TypewriterLoop } from "@/components/ui/motion-primitives";
import WebMacbookChatbot from "@/components/ui/WebMacbookChatbot";
import MobileMacbookChatbot from "@/components/ui/MobileMacbookChatbot";

export default function About() {
  return (
    <section id="about">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
        <Reveal>
          <p className="flex items-center gap-2 font-mono text-xs tracking-[0.3em] section-eyebrow uppercase">
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
              <p>➜ ~ whoami</p>
              <p>
                I&apos;m John Ruzly Macatula — A
                4th-year BS Computer Science Student at{" "}
                <CampusPreview
                  label="UE - Manila"
                  domain="ue.edu.ph"
                  title="University of the East – Manila"
                  description="where I study computer science."
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
                Try the terminal → ask it about my skills, projects or try typing test!.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="w-full">
              {/* phones get the smaller chat bubble version */}
              <div className="md:hidden">
                <MobileMacbookChatbot />
              </div>
              {/* desktop gets the full macbook terminal */}
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
