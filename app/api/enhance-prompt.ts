// NOTE: This file will NOT work as an API route in the Next.js app directory.
// Next.js app directory requires API routes to be in app/api/[route]/route.ts
// To fix, move this file to app/api/enhance-prompt/route.ts
//
// If you want to use a flat file, use the /pages/api directory instead (pages/api/enhance-prompt.ts)

import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Missing OpenAI API key" }), { status: 500 });
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
          content: prompt,
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
} 