# Ruzly Portfolio

My personal portfolio website 

**Live:** [macatula-ruzly.vercel.app](https://macatula-ruzly.vercel.app)

![Portfolio preview](public/images/RuzlyPortfolioV2.png)

## What's inside

- **Terminal hero** — a macOS-style terminal that animates through commands.
- **ASCII globe** — a rotating globe rendered entirely in ASCII characters.
- **Chatbot** — a chat widget framed inside a MacBook mockup.
- **Community chat** — a public guestbook with a defended write path (see below).
- **Projects** — featured works like NoteChat, ResearchAI, and PipWise.
- **Widgets** — a music and sports radio player and animated dot field.
- Fully responsive across desktop and mobile.

## How the community chat fights spam

All writes go through a single API route ([app/api/chat/route.ts](app/api/chat/route.ts)) using the Supabase service-role key — the anon key is read-only, so the moderation below can't be bypassed by posting straight to the database.

Spam is handled in layers:

- **Honeypot field** — a decoy input hidden with CSS. Humans never see it; bots fill it in.
- **Submit-speed check** — nobody types a name and message in under a second.
- **Rate limiting** — 5 messages per minute per IP, via Upstash Redis.
- **Profanity and link filtering** — real people get a real error message so they know why their post didn't show up.
- **Owner key** — my own badged messages are verified server-side with a timing-safe comparison, so the secret never reaches the client.

Trapped bots get a fake success response instead of an error, so they never learn they were caught.

## Contact

GitHub: [@yslruzly](https://github.com/yslruzly)
