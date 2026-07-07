# Ruzly — Portfolio

Black & white single-page portfolio. Next.js 15 · React 19 · TypeScript · Tailwind CSS v4 
## Customize

- **Projects & links** → `lib/data.ts` (edit `projects`, `stackMarquee`, and `links.email`)
- **Colors** → `@theme` block in `app/globals.css`
- **Globe** → `components/DotGlobe.tsx` (dot count, rotation speed, marker coordinates)
- **Copy** → `components/Hero.tsx`, `About.tsx`, `Contact.tsx`

## Features

- Canvas dot globe with a pulsing Manila marker (zero dependencies)
- Live Manila clock in the nav
- Word-by-word hero reveal, scroll-triggered section reveals
- Mouse-spotlight project cards, magnetic buttons, infinite tech marquee
- Responsive down to mobile, keyboard focus styles, `prefers-reduced-motion` respected
