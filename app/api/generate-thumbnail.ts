import type { NextRequest } from "next/server";

export const runtime = "edge";

const REPLICATE_MODEL_VERSION = "luma/photon-flash"; // Replace with the latest version hash from Replicate

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();
  const replicateApiToken = process.env.REPLICATE_API_TOKEN;

  if (!replicateApiToken) {
    return new Response(JSON.stringify({ error: "Missing Replicate API token" }), { status: 500 });
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
} 