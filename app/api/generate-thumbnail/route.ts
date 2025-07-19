import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getUserIdFromRequest } from "@/lib/getUserIdFromRequest";

async function maybeResetCredits(userId: string) {
  const { data: sub } = await supabaseAdmin
    .from("subscriptions")
    .select("current_period_end")
    .eq("user_id", userId)
    .eq("status", "active")
    .single();

  if (!sub) return;

  const now = new Date();
  const periodEnd = new Date(sub.current_period_end);

  if (now > periodEnd) {
    const newPeriodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    await supabaseAdmin.from("credits").update({ balance: 1000, updated_at: now }).eq("user_id", userId);
    await supabaseAdmin.from("subscriptions").update({ current_period_end: newPeriodEnd }).eq("user_id", userId);
  }
}

export const runtime = "edge";

// Replace with the correct version hash for your chosen model
const REPLICATE_MODEL_VERSION = "luma/photon-flash";

export async function POST(req: NextRequest) {
  const userId = await getUserIdFromRequest();
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  await maybeResetCredits(userId);

  // Check subscription
  const { data: sub } = await supabaseAdmin
    .from("subscriptions")
    .select("status, current_period_end")
    .eq("user_id", userId)
    .eq("status", "active")
    .single();

  if (!sub || new Date(sub.current_period_end) < new Date()) {
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
  await supabaseAdmin
    .from("credits")
    .update({ balance: credits.balance - 50, updated_at: new Date() })
    .eq("user_id", userId);

  try {
    const { prompt } = await req.json();
    const replicateApiToken = process.env.REPLICATE_API_TOKEN;

    if (!replicateApiToken) {
      return new Response(JSON.stringify({ error: "Missing Replicate API token" }), { status: 500 });
    }
    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "Missing or invalid prompt" }), { status: 400 });
    }

    // Start prediction
    const predictionRes = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${replicateApiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: REPLICATE_MODEL_VERSION,
        input: { prompt },
      }),
    });

    if (!predictionRes.ok) {
      const error = await predictionRes.text();
      return new Response(JSON.stringify({ error: "Failed to start prediction", details: error }), { status: 500 });
    }

    const prediction = await predictionRes.json();
    const predictionId = prediction.id;

    // Poll for completion
    let outputUrl = null;
    let status = prediction.status;
    let pollCount = 0;
    while (status !== "succeeded" && status !== "failed" && pollCount < 30) {
      await new Promise((r) => setTimeout(r, 2000)); // 2s delay
      const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          "Authorization": `Token ${replicateApiToken}`,
          "Content-Type": "application/json",
        },
      });
      if (!pollRes.ok) {
        const error = await pollRes.text();
        return new Response(JSON.stringify({ error: "Failed to poll prediction", details: error }), { status: 500 });
      }
      const pollData = await pollRes.json();
      status = pollData.status;
      if (status === "succeeded") {
        outputUrl = Array.isArray(pollData.output) ? pollData.output[0] : pollData.output;
        break;
      }
      pollCount++;
    }

    if (status !== "succeeded" || !outputUrl) {
      return new Response(JSON.stringify({ error: "Thumbnail generation failed or timed out." }), { status: 500 });
    }

    return new Response(JSON.stringify({ imageUrl: outputUrl }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
} 