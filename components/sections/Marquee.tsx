import { stackMarquee } from "@/lib/data";
import { TECH_ICONS } from "@/lib/tech-icons";

export default function Marquee() {
  const row = [...stackMarquee, ...stackMarquee];
  return (
    <section
      aria-label="Technology stack"
      className="relative border-y border-line py-5 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"
    >
      <div className="flex w-max animate-marquee motion-reduce:animate-none">
        {row.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex items-center gap-2.5 whitespace-nowrap px-6 font-mono text-sm tracking-widest text-ash uppercase"
          >
            {TECH_ICONS[item] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={TECH_ICONS[item]}
                alt=""
                aria-hidden="true"
                width={18}
                height={18}
                className="h-4.5 w-4.5 shrink-0 object-contain"
              />
            )}
            {item}
            <span className="ml-12 inline-block h-1 w-1 rounded-full bg-line" />
          </span>
        ))}
      </div>
    </section>
  );
}
