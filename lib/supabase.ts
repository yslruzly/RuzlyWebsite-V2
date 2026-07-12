import { createClient } from "@supabase/supabase-js";

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
  // what the avatar is drawn from. name + a per-browser id, so two people
  // called Alex don't share a face. Old rows are null → fall back to name.
  avatar_seed: string | null;
  created_at: string;
};
