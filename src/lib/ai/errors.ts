import { NextResponse } from "next/server";

function statusCodeOf(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const e = error as { statusCode?: number; cause?: unknown };
  return e.statusCode ?? statusCodeOf(e.cause);
}

export function aiErrorResponse(error: unknown): NextResponse {
  console.error("AI request failed:", error);
  const status = statusCodeOf(error);

  if (status === 429) {
    return new NextResponse(
      "AI rate limit reached — your provider's quota is used up (free tiers have small daily limits, e.g. Gemini free tier: 20 requests/day per model). Wait for the quota to reset, or switch AI_MODEL / AI_PROVIDER in .env.",
      { status: 429 }
    );
  }
  if (status === 401 || status === 403) {
    return new NextResponse("The AI provider rejected your API key. Check the key in .env.", {
      status: 502,
    });
  }
  return new NextResponse("AI request failed. Check the server logs and your AI provider settings.", {
    status: 502,
  });
}
