"use client";
import React, { useState } from "react";
import { FiMenu, FiX, FiSettings, FiClock, FiZap } from "react-icons/fi";
import { SignedIn, SignedOut, SignIn, UserButton } from "@clerk/nextjs";
import ThumbnailGenerator from "./ThumbnailGenerator";

const SIDEBAR_ITEMS = [
  { key: "generate", label: "Generate", icon: <FiZap /> },
  { key: "history", label: "History", icon: <FiClock /> },
  { key: "settings", label: "Settings", icon: <FiSettings /> },
];

const RED = "#FF0000";
const DARK_BG = "#0f0f0f";
const LIGHT_TEXT = "#e0e0e0";

function GenerateView() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState<null | "enhance" | "generate">(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    setLoading("enhance");
    setError(null);
    try {
      const res = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error("Failed to enhance prompt");
      const data = await res.json();
      setPrompt(data.enhancedPrompt || prompt);
    } catch (e) {
      setError("Could not enhance prompt. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const handleGenerateThumbnail = async () => {
    if (!prompt.trim()) return;
    setLoading("generate");
    setError(null);
    setImageUrl(null);
    try {
      const res = await fetch("/api/generate-thumbnail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error("Failed to generate thumbnail");
      const data = await res.json();
      setImageUrl(data.imageUrl);
    } catch (e) {
      setError("Could not generate thumbnail. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "minglu-thumbnail.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div className="bg-[#181818] rounded-xl shadow-lg p-8 w-full max-w-lg flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-6 text-white">Generate Thumbnail</h2>
        <textarea
          className="w-full border border-[#222] bg-[#232323] text-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none min-h-[80px] mb-4"
          placeholder="Describe your YouTube thumbnail..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading !== null}
          aria-disabled={loading !== null}
        />
        <div className="flex gap-2 w-full mb-4">
          <button
            type="button"
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleEnhancePrompt}
            disabled={!prompt.trim() || loading !== null}
            aria-busy={loading === "enhance"}
          >
            {loading === "enhance" ? "Enhancing..." : "Enhance Prompt"}
          </button>
          <button
            type="button"
            className="flex-1 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleGenerateThumbnail}
            disabled={!prompt.trim() || loading !== null}
            aria-busy={loading === "generate"}
          >
            {loading === "generate" ? "Generating..." : "Generate Thumbnail"}
          </button>
        </div>
        {error && <div className="text-red-500 text-sm mb-2" role="alert">{error}</div>}
        {loading === "generate" && (
          <div className="flex items-center gap-2 text-gray-300 mb-4">
            <svg className="animate-spin h-5 w-5 text-red-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
            Generating thumbnail...
          </div>
        )}
        {imageUrl && (
          <div className="flex flex-col items-center w-full mt-4">
            <img
              src={imageUrl}
              alt="Generated thumbnail"
              className="w-full max-w-xs rounded-lg border border-[#222] shadow mb-4"
            />
            <button
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              onClick={handleDownload}
              aria-label="Download generated thumbnail"
            >
              Download
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryView() {
  // Dummy thumbnails
  const thumbnails = Array.from({ length: 18 }, (_, i) => `https://placehold.co/320x180?text=Thumbnail+${i + 1}`);
  const handleDownload = (url: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = "minglu-thumbnail.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <div className="flex flex-col w-full h-full">
      <h2 className="text-2xl font-bold mb-6 text-white px-4 pt-4">History</h2>
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {thumbnails.map((url, idx) => (
            <div key={idx} className="bg-[#181818] rounded-lg p-3 flex flex-col items-center border border-[#222] shadow">
              <img src={url} alt={`Thumbnail ${idx + 1}`} className="rounded w-full mb-3" />
              <button
                className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition"
                onClick={() => handleDownload(url)}
                aria-label={`Download Thumbnail ${idx + 1}`}
              >
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsView() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div className="bg-[#181818] rounded-xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-white">Settings</h2>
        <div className="flex flex-col gap-4">
          <label className="flex items-center gap-2 text-gray-300">
            <input type="checkbox" className="accent-red-600" /> Enable notifications
          </label>
          <label className="flex items-center gap-2 text-gray-300">
            <input type="checkbox" className="accent-red-600" /> Dark mode (always on)
          </label>
          <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition w-fit">Save Settings</button>
        </div>
      </div>
    </div>
  );
}

export default function MingluDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("generate");

  const renderView = () => {
    switch (activeView) {
      case "generate":
        return <ThumbnailGenerator />;
      case "history":
        return <HistoryView />;
      case "settings":
        return <SettingsView />;
      default:
        return null;
    }
  };

  // Sidebar content
  const Sidebar = (
    <div className="relative h-full">
      {/* Minglu AI Title */}
      <div className="w-full flex items-center justify-center py-4">
        <span className="text-2xl font-extrabold tracking-wide text-white drop-shadow-md">Minglu AI</span>
      </div>
      {/* Top RGB Line */}
      <div className="absolute top-0 left-0 w-full h-[2px] sidebar-rgb-frame z-50" />
      {/* Right RGB Line */}
      <div className="absolute top-0 right-0 h-full w-[2px] sidebar-rgb-frame z-50" />
      {/* Bottom RGB Line */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] sidebar-rgb-frame z-50" />
      <nav
        className="flex flex-col h-full w-[250px] bg-[#181818] border-r border-[#222] py-8 px-4 z-40"
        aria-label="Sidebar Navigation"
      >
        <ul className="flex flex-col gap-2 flex-1">
          {SIDEBAR_ITEMS.map((item) => (
            <li key={item.key}>
              <button
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500
                ${activeView === item.key
                  ? "bg-[#232323] text-white border-l-4 border-red-600 shadow-lg"
                  : "text-gray-300 hover:bg-[#232323] hover:text-white hover:scale-105 hover:brightness-110 hover:shadow-md"}
              `}
                style={activeView === item.key ? { color: RED } : {}}
                onClick={() => {
                  setActiveView(item.key);
                  setSidebarOpen(false);
                }}
                aria-current={activeView === item.key ? "page" : undefined}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
        {/* UserButton at bottom when signed in */}
        <SignedIn>
          <div className="mt-8 flex items-center justify-center">
            <UserButton appearance={{
              elements: {
                avatarBox: "w-10 h-10 border-2 border-red-600 transition-transform duration-200 hover:scale-105 hover:shadow-lg",
              },
            }} />
          </div>
        </SignedIn>
      </nav>
    </div>
  );

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
        <div className="min-h-screen flex bg-[#0f0f0f] text-gray-200">
          {/* Sidebar (desktop) */}
          <div className="hidden md:block h-screen sticky top-0">
            {Sidebar}
          </div>
          {/* Mobile Sidebar Drawer */}
          <div
            className={`fixed inset-0 z-50 md:hidden transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
            style={{ pointerEvents: sidebarOpen ? "auto" : "none" }}
            aria-modal="true"
            role="dialog"
            aria-label="Sidebar Drawer"
          >
            {/* Backdrop */}
            <div
              className={`absolute inset-0 bg-black bg-opacity-40 transition-opacity duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0"}`}
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
            {/* Sidebar panel */}
            <div className="relative h-full w-[250px] bg-[#181818] border-r border-[#222] flex flex-col z-50">
              <button
                className="absolute top-4 right-4 p-2 rounded hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label="Close sidebar menu"
                onClick={() => setSidebarOpen(false)}
              >
                <FiX size={24} />
              </button>
              {Sidebar}
            </div>
          </div>
          {/* Main content area */}
          <div className="flex-1 flex flex-col min-h-screen">
            <main className="flex-1 flex items-center justify-center p-4">
              {renderView()}
            </main>
          </div>
        </div>
      </SignedIn>
    </>
  );
} 