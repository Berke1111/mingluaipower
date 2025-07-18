"use client";
import React, { useState } from "react";

// API endpoints (should use environment variables in backend, not here)
const ENHANCE_API = "/api/enhance-prompt";
const GENERATE_API = "/api/generate-thumbnail";

const ThumbnailGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState<null | "enhance" | "generate">(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Enhance prompt handler
  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    setLoading("enhance");
    setError(null);
    try {
      const res = await fetch(ENHANCE_API, {
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

  // Generate thumbnail handler
  const handleGenerateThumbnail = async () => {
    if (!prompt.trim()) return;
    setLoading("generate");
    setError(null);
    setImageUrl(null);
    try {
      const res = await fetch(GENERATE_API, {
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

  // Download image handler
  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "youtube-thumbnail.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="w-full max-w-lg mx-auto bg-white rounded-xl shadow-lg p-6 flex flex-col gap-6 mt-8" aria-label="YouTube Thumbnail Generator">
      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">YouTube Thumbnail Generator</h2>
      <div className="flex flex-col gap-3">
        <label htmlFor="thumbnail-prompt" className="text-sm font-medium text-gray-700">
          Thumbnail Description
        </label>
        <textarea
          id="thumbnail-prompt"
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none min-h-[60px]"
          placeholder="Describe your YouTube thumbnail..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading !== null}
          aria-disabled={loading !== null}
        />
        <div className="flex gap-2 flex-col sm:flex-row">
          <button
            type="button"
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleEnhancePrompt}
            disabled={!prompt.trim() || loading !== null}
            aria-busy={loading === "enhance"}
          >
            {loading === "enhance" ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 mr-1 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                Enhancing...
              </span>
            ) : (
              "Enhance Prompt"
            )}
          </button>
          <button
            type="button"
            className="flex-1 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleGenerateThumbnail}
            disabled={!prompt.trim() || loading !== null}
            aria-busy={loading === "generate"}
          >
            {loading === "generate" ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 mr-1 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                Generating...
              </span>
            ) : (
              "Generate Thumbnail"
            )}
          </button>
        </div>
      </div>
      {error && <div className="text-red-600 text-sm text-center" role="alert">{error}</div>}
      {imageUrl && (
        <div className="flex flex-col items-center gap-3">
          <img
            src={imageUrl}
            alt="Generated YouTube thumbnail"
            className="w-full max-w-xs rounded-lg border border-gray-200 shadow"
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
    </section>
  );
};

export default ThumbnailGenerator; 