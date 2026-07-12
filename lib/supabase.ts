import { createClient } from "@supabase/supabase-js";

// Browser client. Uses the public anon key, safe to expose because
// row-level security policies control what it can actually do.
// trim() guards against stray whitespace/newlines pasted into env vars
// (Vercel keeps them and the key silently stops matching).
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim(),
);

export type ChatMessage = {
  id: string;
  name: string;
  message: string;
  city: string | null;
  device: "desktop" | "mobile";
  is_owner: boolean;
  created_at: string;
};
