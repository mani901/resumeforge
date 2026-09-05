"use client";

import { useState } from "react";

export function useAiStream() {
  const [streaming, setStreaming] = useState(false);

  async function stream(
    url: string,
    body: unknown,
    onText: (fullText: string) => void
  ): Promise<string> {
    setStreaming(true);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok || !res.body) throw new Error(await res.text());

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        onText(full);
      }
      if (!full.trim()) {
        throw new Error(
          "The AI returned nothing — your provider may be rate-limited (free tiers have small daily quotas). Try again later or switch AI_MODEL / AI_PROVIDER in .env."
        );
      }
      return full.trim();
    } finally {
      setStreaming(false);
    }
  }

  return { stream, streaming };
}
