"use client";
import React, { useState } from "react";

const PROMPT_MAX = 200;

export default function ThumbnailGenerator() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState<null | "enhance" | "generate">(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enhanceError, setEnhanceError] = useState<string | null>(null);

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    setLoading("enhance");
    setEnhanceError(null);
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
      setEnhanceError("Could not enhance prompt. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const handleGenerateThumbnail = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="flex flex-col items-center justify-center w-full min-h-[60vh] max-w-2xl mx-auto p-6 md:p-10 bg-[#181818] rounded-2xl shadow-2xl border border-[#232323] mt-6 lg:mt-10">
      <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white text-center">YouTube Thumbnail Generator</h2>
      {/* Prompt Input */}
      <form onSubmit={handleGenerateThumbnail} className="w-full flex flex-col items-center">
        <label htmlFor="prompt-input" className="text-base font-semibold text-white self-start mb-2 w-full">Thumbnail Prompt</label>
        <div className="w-full relative mb-4">
          <textarea
            id="prompt-input"
            value={prompt}
            onChange={e => {
              if (e.target.value.length <= PROMPT_MAX) setPrompt(e.target.value);
            }}
            placeholder="Describe your thumbnail in detail (e.g., 'A vibrant YouTube thumbnail for a tech review video, featuring a laptop, neon colors, and bold text')"
            rows={5}
            className="w-full px-6 py-4 text-lg rounded-xl border border-gray-600 bg-[#232323] text-white focus:outline-none focus:ring-4 focus:ring-red-500 transition-all duration-200 shadow-md resize-none"
            aria-label="Prompt"
            maxLength={PROMPT_MAX}
            disabled={loading === "generate" || loading === "enhance"}
          />
          <span className={`absolute bottom-2 right-4 text-xs ${prompt.length === PROMPT_MAX ? 'text-red-400' : 'text-gray-400'}`}>{prompt.length}/{PROMPT_MAX}</span>
        </div>
        {/* Buttons */}
        <div className="flex flex-row gap-4 w-full mb-8">
          <button
            type="button"
            onClick={handleEnhancePrompt}
            className="flex-1 px-6 py-4 text-lg font-bold rounded-xl bg-gradient-to-r from-pink-500 via-red-500 to-yellow-400 text-white shadow-md transition-all duration-200 hover:scale-105 hover:brightness-110 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-pink-500 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading === "enhance" || !prompt.trim()}
          >
            {loading === "enhance" ? "Enhancing..." : "Enhance Prompt"}
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-4 text-lg font-bold rounded-xl bg-gradient-to-r from-red-500 via-pink-500 to-yellow-400 text-white shadow-xl transition-all duration-200 hover:scale-105 hover:brightness-110 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-red-500 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading === "generate" || !prompt.trim()}
          >
            {loading === "generate" ? "Generating..." : "Generate Thumbnail"}
          </button>
        </div>
        {enhanceError && (
          <div className="text-red-400 text-center text-sm w-full mb-2">{enhanceError}</div>
        )}
        {error && (
          <div className="text-red-400 text-center text-base w-full mb-2">{error}</div>
        )}
        {/* Thumbnail Preview */}
        <div className="w-full max-w-2xl aspect-video bg-gray-100 border-4 border-[#232323] rounded-2xl flex items-center justify-center relative overflow-hidden shadow-2xl mt-2">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Generated thumbnail"
              className="w-full h-full object-cover rounded-2xl shadow-xl"
            />
          ) : (
            <span className="text-gray-400 text-xl">No thumbnail generated yet</span>
          )}
        </div>
        {imageUrl && (
          <button
            onClick={handleDownload}
            type="button"
            className="mt-4 px-8 py-3 text-lg font-bold bg-gradient-to-r from-gray-700 via-gray-900 to-gray-800 text-white rounded-xl shadow-lg transition-all duration-200 hover:scale-105 hover:brightness-110 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-gray-500"
          >
            Download
          </button>
        )}
      </form>
    </div>
  );
} 