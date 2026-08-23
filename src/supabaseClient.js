import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://fxfxcdzxbtvugkztrngf.supabase.co";
const supabaseAnonKey = "sb_publishable_R5qebfq0ql2hafaxVNxUrA_0zxzVhhH";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
