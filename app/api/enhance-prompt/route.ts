import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing OpenAI API key" }), { status: 500 });
    }
    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "Missing or invalid prompt" }), { status: 400 });
    }

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-nano-2025-04-14",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that rewrites and enhances prompts for image generation, making them more detailed and creative for YouTube thumbnails.",
          },
          {
            role: "user",
            content: `Improve and expand this YouTube thumbnail description: ${prompt}`,
          },
        ],
        max_tokens: 200,
        temperature: 0.8,
      }),
    });

    if (!openaiRes.ok) {
      const error = await openaiRes.text();
      return new Response(JSON.stringify({ error: "Failed to enhance prompt", details: error }), { status: 500 });
    }

    const data = await openaiRes.json();
    const enhancedPrompt = data.choices?.[0]?.message?.content?.trim() || prompt;

    return new Response(JSON.stringify({ enhancedPrompt }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
} 