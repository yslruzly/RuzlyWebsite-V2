import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Stops anyone from flooding the community chat. Everyone gets 5 messages a
// minute, counted per IP, and the counters live in Upstash Redis.

const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

export const ratelimit =
  url && token
    ? new Ratelimit({
        redis: new Redis({ url, token }),
        limiter: Ratelimit.slidingWindow(5, "1 m"),
        prefix: "chat",
        analytics: true,
      })
    : null;


export function ipFrom(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "local";
}
