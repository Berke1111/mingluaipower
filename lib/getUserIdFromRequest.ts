import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function getUserIdFromRequest() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
} 