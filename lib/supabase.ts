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
  created_at: string;
};
