import { NextRequest } from "next/server";
export async function POST(req: NextRequest) {
  // TODO: Create Stripe Checkout session for one-time credit purchase
  // On webhook, add purchased credits to user's balance
  return new Response(JSON.stringify({ error: "Not implemented" }), { status: 501 });
} 