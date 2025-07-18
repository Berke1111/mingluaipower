"use client";
import React, { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { FiMenu } from "react-icons/fi";
import ThumbnailGenerator from "./ThumbnailGenerator";
import MingluLayout from "./MingluLayout";
import MingluDashboard from "./MingluDashboard";
import { SignedIn, SignedOut, SignIn } from "@clerk/nextjs";

const YOUTUBE_RED = "#FF0000";

const FONT_STYLES = [
  "Arial",
  "Roboto",
  "Montserrat",
  "Oswald",
  "Lobster",
  "Bebas Neue",
];

// Remove or comment out the Home component and export MingluLayout instead
export default function Page() {
  return (
    <>
      <SignedOut>
        <div className="fixed inset-0 flex items-center justify-center min-h-screen bg-black/70 backdrop-blur z-50">
          <SignIn
            routing="hash"
            redirectUrl="/dashboard"
            appearance={{
              elements: {
                card: "bg-[#232323] text-gray-200 border border-[#222]",
                headerTitle: "text-white",
                formButtonPrimary: "bg-red-600 hover:bg-red-700 text-white",
              },
            }}
          />
        </div>
      </SignedOut>
      <SignedIn>
        <MingluDashboard />
      </SignedIn>
    </>
  );
}
