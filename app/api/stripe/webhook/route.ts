import { NextRequest } from "next/server";
import { buffer } from "micro";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { 
  apiVersion: "2023-08-16" 
});

export const config = { 
  api: { bodyParser: false } 
};

export async function POST(req: NextRequest) {
  try {
    const sig = req.headers.get("stripe-signature");
    const body = await req.text();
    
    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
      return new Response("Missing signature or webhook secret", { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response("Webhook signature verification failed", { status: 400 });
    }

    // Handle successful payments and subscription renewals
    if (event.type === "checkout.session.completed" || event.type === "invoice.payment_succeeded") {
      const session = event.data.object as Stripe.Checkout.Session | Stripe.Invoice;
      const userId = session.metadata?.userId;

      if (!userId) {
        console.error("No userId in session metadata");
        return new Response("No userId found", { status: 400 });
      }

      // Add 1000 credits to user
      const { error } = await supabaseAdmin
        .from("users")
        .update({ credits: supabaseAdmin.rpc("add_credits", { user_id: userId, amount: 1000 }) })
        .eq("id", userId);

      if (error) {
        console.error("Error adding credits:", error);
        return new Response("Failed to add credits", { status: 500 });
      }

      console.log(`Added 1000 credits to user ${userId}`);
    }

    return new Response(JSON.stringify({ received: true }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("Webhook error", { status: 500 });
  }
} 