import { NextRequest } from "next/server";
import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!process.env.STRIPE_PRICE_ID) {
      console.error("STRIPE_PRICE_ID not configured");
      return new Response("Payment system not configured", { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ 
        price: process.env.STRIPE_PRICE_ID, 
        quantity: 1 
      }],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
      metadata: { userId },
      customer_email: req.headers.get("user-email") || undefined,
    });

    return new Response(JSON.stringify({ url: session.url }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response("Failed to create checkout session", { status: 500 });
  }
} 