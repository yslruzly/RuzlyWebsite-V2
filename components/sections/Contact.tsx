import { Send, Linkedin, Facebook, Github, Mail } from "lucide-react";
import AsciiGlobe from "@/components/ui/AsciiGlobe";
import { links } from "@/lib/data";
import { MagneticButton, Reveal } from "@/components/ui/motion-primitives";

// Left column (github, email), then right column (linkedin, facebook) —
// filled column-by-column via grid-flow-col + grid-rows-2 below.
const socials = [
  { label: links.githubLabel, href: links.github, Icon: Github },
  { label: links.emailLabel, href: links.email, Icon: Mail },
  { label: links.linkedinLabel, href: links.linkedin, Icon: Linkedin },
  { label: links.facebookLabel, href: links.facebook, Icon: Facebook },
];

export default function Contact() {
  return (
    <section id="contact" className="border-t border-line">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
          <Reveal>
            <p className="flex items-center gap-2 font-mono text-xs tracking-[0.3em] text-paper uppercase">
              <Send size={14} strokeWidth={1.5} aria-hidden="true" />
              Contact
            </p>
            <h2 className="mt-4 max-w-2xl text-[clamp(2.2rem,5.5vw,4rem)] leading-[1.05] font-semibold tracking-tight">
              Let&apos;s build{" "}
              <span className="text-mist">something.</span>
            </h2>
            <p className="mt-6 max-w-md font-jet text-base text-mist">
              Have a project in mind? I&apos;d love to hear about it. Open to
              internships, freelance work, and collaborations.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <MagneticButton href={links.email}>Send an email</MagneticButton>
              <MagneticButton href={links.github} variant="outline">
                github.com/yslruzly ↗
              </MagneticButton>
            </div>
            <div className="mt-8 grid w-fit grid-cols-1 gap-y-2 sm:grid-flow-col sm:grid-rows-2 sm:gap-x-8 sm:gap-y-1">
              {socials.map(({ label, href, Icon }) => {
                const external = href.startsWith("http");
                return (
                  <a
                    key={label}
                    href={href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    className="inline-flex min-h-11 items-center gap-2.5 font-mono text-xs text-ash transition-colors duration-200 hover:text-paper"
                  >
                    <Icon size={16} strokeWidth={1.5} aria-hidden="true" />
                    {label}
                  </a>
                );
              })}
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="relative mx-auto aspect-square w-full max-w-105">
              <AsciiGlobe className="h-full w-full" />
              <p className="pointer-events-none absolute inset-x-0 -bottom-2 text-center font-mono text-[10px] tracking-[0.3em] text-ash">
                LIVE FROM MANILA
              </p>
            </div>
          </Reveal>
        </div>
      </div>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-6 font-mono text-[11px] tracking-widest text-ash sm:flex-row sm:px-8">
          <span>
            © {new Date().getFullYear()}{" "}
            <span className="font-bold text-paper">RUZLY MACATULA.</span> ALL
            RIGHTS RESERVED.
          </span>
        </div>
      </footer>
    </section>
  );
}
