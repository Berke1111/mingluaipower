import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getUserIdFromRequest } from "@/lib/getUserIdFromRequest";

async function maybeResetCredits(userId: string) {
  const { data: sub, error: subError } = await supabaseAdmin
    .from("subscriptions")
    .select("renewal_date")
    .eq("user_id", userId)
    .eq("status", "active")
    .single();

  if (!sub || subError) return;

  const now = new Date();
  const renewalDate = new Date(sub.renewal_date);

  if (now > new Date(renewalDate.getTime() + 30 * 24 * 60 * 60 * 1000)) {
    // Reset credits and update renewal_date
    await supabaseAdmin.from("credits").update({ balance: 1000, updated_at: now }).eq("user_id", userId);
    await supabaseAdmin.from("subscriptions").update({ renewal_date: now }).eq("user_id", userId);
  }
}

export async function POST(req: NextRequest) {
  const userId = await getUserIdFromRequest();
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  await maybeResetCredits(userId);

  // Check subscription
  const { data: sub } = await supabaseAdmin
    .from("subscriptions")
    .select("status")
    .eq("user_id", userId)
    .eq("status", "active")
    .single();

  if (!sub) {
    return new Response(JSON.stringify({ error: "No active subscription" }), { status: 402 });
  }

  // Check credits
  const { data: credits } = await supabaseAdmin
    .from("credits")
    .select("balance")
    .eq("user_id", userId)
    .single();

  if (!credits || credits.balance < 50) {
    return new Response(JSON.stringify({ error: "Insufficient credits" }), { status: 402 });
  }

  // Deduct credits
  const { error: deductError } = await supabaseAdmin
    .from("credits")
    .update({ balance: credits.balance - 50, updated_at: new Date() })
    .eq("user_id", userId);

  if (deductError) {
    return new Response(JSON.stringify({ error: "Failed to deduct credits" }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
} 