import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    
    if (!userId) {
      return new Response("Missing userId", { status: 400 });
    }

    // Initialize user with 0 credits
    const { error } = await supabaseAdmin
      .from("users")
      .insert([{ id: userId, credits: 0 }]);

    if (error) {
      console.error("Error initializing user credits:", error);
      return new Response("Failed to initialize user", { status: 500 });
    }

    return new Response("User initialized successfully", { status: 200 });
  } catch (error) {
    console.error("Error in user-created webhook:", error);
    return new Response("Internal server error", { status: 500 });
  }
} 