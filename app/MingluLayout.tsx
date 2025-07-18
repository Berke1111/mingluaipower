"use client";
import React, { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";

const RED = "#FF0000";

export default function MingluLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<null | "enhance" | "generate">(null);
  const [error, setError] = useState<string | null>(null);

  // Dummy handlers for demonstration
  const handleEnhancePrompt = async () => {
    setLoading("enhance");
    setTimeout(() => setLoading(null), 1000);
  };
  const handleGenerateThumbnail = async () => {
    setLoading("generate");
    setTimeout(() => {
      setImageUrl("https://placehold.co/600x338?text=Generated+Thumbnail");
      setLoading(null);
    }, 1500);
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

  // Sidebar content
  const Sidebar = (
    <aside
      className="flex flex-col h-full w-[300px] bg-white shadow-xl px-6 py-8 gap-6 z-40"
      aria-label="Editing Controls"
    >
      <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ color: RED }}>
        Editor
      </h2>
      <label htmlFor="minglu-prompt" className="text-sm font-medium text-gray-700 mb-1">
        Thumbnail Prompt
      </label>
      <textarea
        id="minglu-prompt"
        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none min-h-[80px]"
        placeholder="Describe your YouTube thumbnail..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        disabled={loading !== null}
        aria-disabled={loading !== null}
      />
      <div className="flex gap-2 mt-2">
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
      {error && <div className="text-red-600 text-sm mt-2" role="alert">{error}</div>}
    </aside>
  );

  // Main content area
  const MainContent = (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl aspect-video bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden mb-6">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Generated thumbnail"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-400 text-lg">No thumbnail generated yet</span>
        )}
      </div>
      <button
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
        onClick={handleDownload}
        disabled={!imageUrl}
        aria-label="Download generated thumbnail"
      >
        Download
      </button>
    </main>
  );

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 w-full h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-50 shadow-sm">
        <span className="text-xl font-bold tracking-tight" style={{ color: RED }}>
          Minglu AI
        </span>
        <button
          className="sm:hidden p-2 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
          aria-label="Open sidebar menu"
          onClick={() => setSidebarOpen(true)}
        >
          <FiMenu size={28} />
        </button>
      </header>
      {/* Layout */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar (desktop) */}
        <div className="hidden sm:block h-[calc(100vh-4rem)] sticky top-16">
          {Sidebar}
        </div>
        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {MainContent}
        </div>
      </div>
      {/* Mobile Sidebar Drawer */}
      <div
        className={`fixed inset-0 z-50 sm:hidden transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ pointerEvents: sidebarOpen ? "auto" : "none" }}
        aria-modal="true"
        role="dialog"
        aria-label="Sidebar Drawer"
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black bg-opacity-30 transition-opacity duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
        {/* Sidebar panel */}
        <div className="relative h-full w-[300px] bg-white shadow-xl flex flex-col z-50">
          <button
            className="absolute top-4 right-4 p-2 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="Close sidebar menu"
            onClick={() => setSidebarOpen(false)}
          >
            <FiX size={24} />
          </button>
          {Sidebar}
        </div>
      </div>
    </div>
  );
} 