"use client";

import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useEditorStore } from "@/lib/stores/editor-store";
import { TextareaField } from "@/components/editor/fields";
import { useAiStream } from "@/components/editor/use-ai-stream";
import { Button } from "@/components/ui/button";

export function SummaryForm() {
  const summary = useEditorStore((s) => s.content.sections.summary);
  const setSummary = useEditorStore((s) => s.setSummary);
  const { stream, streaming } = useAiStream();

  async function generate() {
    const previous = summary;
    try {
      await stream(
        "/api/ai/summary",
        { content: useEditorStore.getState().content },
        (text) => setSummary(text)
      );
    } catch (error) {
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : "AI generation failed. Check your AI provider settings."
      );
      setSummary(previous);
    }
  }

  return (
    <div className="space-y-2">
      <TextareaField
        rows={4}
        placeholder="2–4 sentences highlighting your experience, strengths, and what you're looking for…"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
      />
      <Button variant="outline" size="xs" onClick={generate} disabled={streaming}>
        <Sparkles className="mr-1 h-3 w-3 text-violet-500" />
        {streaming ? "Generating…" : "Generate with AI"}
      </Button>
    </div>
  );
}
