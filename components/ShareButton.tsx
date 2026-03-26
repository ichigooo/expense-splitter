"use client";

import { useState } from "react";

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted hover:text-charcoal hover:bg-input-bg transition-colors"
    >
      {copied ? (
        <>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M3 7l3 3 5-6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M5.5 8.5l3-3M6 4.5L7.146 3.354a2.5 2.5 0 013.5 3.5L9.5 8M8 9.5l-1.146 1.146a2.5 2.5 0 01-3.5-3.5L4.5 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Share link
        </>
      )}
    </button>
  );
}
