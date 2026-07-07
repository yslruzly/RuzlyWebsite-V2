import { stackMarquee } from "@/lib/data";

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
            className="flex items-center whitespace-nowrap px-6 font-mono text-sm tracking-widest text-ash uppercase"
          >
            {item}
            <span className="ml-12 inline-block h-1 w-1 rounded-full bg-line" />
          </span>
        ))}
      </div>
    </section>
  );
}
