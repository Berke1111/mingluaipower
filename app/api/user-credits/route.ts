import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getUserIdFromRequest } from "@/lib/getUserIdFromRequest";

async function maybeResetCredits(userId: string) {
  const { data: sub } = await supabaseAdmin
    .from("subscriptions")
    .select("renewal_date")
    .eq("user_id", userId)
    .eq("status", "active")
    .single();

  if (!sub) return;

  const now = new Date();
  const renewalDate = new Date(sub.renewal_date);

  if (now > new Date(renewalDate.getTime() + 30 * 24 * 60 * 60 * 1000)) {
    await supabaseAdmin.from("credits").update({ balance: 1000, updated_at: now }).eq("user_id", userId);
    await supabaseAdmin.from("subscriptions").update({ renewal_date: now }).eq("user_id", userId);
  }
}

export async function GET() {
  const userId = await getUserIdFromRequest();
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  await maybeResetCredits(userId);

  const { data: credits, error: creditsError } = await supabaseAdmin
    .from("credits")
    .select("balance")
    .eq("user_id", userId)
    .single();

  const { data: sub } = await supabaseAdmin
    .from("subscriptions")
    .select("status, renewal_date")
    .eq("user_id", userId)
    .eq("status", "active")
    .single();

  if (creditsError || !credits) {
    return new Response(JSON.stringify({ credits: 0, subscriptionActive: false }), { status: 200 });
  }

  return new Response(JSON.stringify({
    credits: credits.balance ?? 0,
    subscriptionActive: !!sub,
  }), { status: 200 });
} 