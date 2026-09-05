"use client";

import { useEffect, useMemo, useState } from "react";
import { create } from "zustand";
import { Check, Sparkles, Target, X } from "lucide-react";
import { toast } from "sonner";
import { useEditorStore } from "@/lib/stores/editor-store";
import { resumeToPlainText } from "@/lib/ai/prompts";
import { computeAtsScore, type JdKeywords, type CategoryResult } from "@/lib/ai/ats";
import type { TailorSuggestion } from "@/lib/ai/tailor";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// survives tab switches; not persisted
const useTailorStore = create<{
  jdText: string;
  keywords: JdKeywords | null;
  suggestions: TailorSuggestion[];
  setJdText: (v: string) => void;
  setKeywords: (v: JdKeywords | null) => void;
  setSuggestions: (v: TailorSuggestion[]) => void;
}>((set) => ({
  jdText: "",
  keywords: null,
  suggestions: [],
  setJdText: (jdText) => set({ jdText }),
  setKeywords: (keywords) => set({ keywords }),
  setSuggestions: (suggestions) => set({ suggestions }),
}));

type BulletSection = "experience" | "projects";
const BULLET_SECTIONS: BulletSection[] = ["experience", "projects"];

function norm(s: string) {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

// AI models sometimes mangle ids or paraphrase the original text, so resolve the
// target progressively: exact id → composite "[section/id/index]" id → text match.
function findBulletTarget(
  sections: { experience: { id: string; bullets: string[] }[]; projects: { id: string; bullets: string[] }[] },
  suggestion: { section?: BulletSection; itemId?: string; bulletIndex?: number; original: string }
): { section: BulletSection; itemId: string; index: number } | null {
  const original = norm(suggestion.original);

  let rawId = suggestion.itemId ?? "";
  if (rawId.includes("/")) {
    const parts = rawId.split("/");
    if (parts.length >= 2) rawId = parts[1];
  }

  const preferred = suggestion.section ? [suggestion.section] : BULLET_SECTIONS;
  for (const section of preferred) {
    const item = sections[section].find((i) => i.id === rawId);
    if (item) {
      let index = item.bullets.findIndex((b) => norm(b) === original);
      if (index === -1 && suggestion.bulletIndex != null && suggestion.bulletIndex >= 0 && suggestion.bulletIndex < item.bullets.length) {
        index = suggestion.bulletIndex;
      }
      if (index !== -1) return { section, itemId: item.id, index };
    }
  }

  // exact text match anywhere
  for (const section of BULLET_SECTIONS) {
    for (const item of sections[section]) {
      const index = item.bullets.findIndex((b) => norm(b) === original);
      if (index !== -1) return { section, itemId: item.id, index };
    }
  }

  // partial match (model may truncate the original); require enough text to be unambiguous
  if (original.length > 25) {
    for (const section of BULLET_SECTIONS) {
      for (const item of sections[section]) {
        const index = item.bullets.findIndex((b) => {
          const nb = norm(b);
          return nb.includes(original) || original.includes(nb);
        });
        if (index !== -1) return { section, itemId: item.id, index };
      }
    }
  }

  return null;
}

function scoreColor(score: number) {
  if (score >= 75) return "text-emerald-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-600";
}

function Category({ title, result }: { title: string; result: CategoryResult }) {
  if (result.matched.length + result.missing.length === 0) return null;
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">
        {title} — {result.matched.length}/{result.matched.length + result.missing.length}
      </p>
      <div className="flex flex-wrap gap-1">
        {result.matched.map((t) => (
          <Badge key={t} variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100">
            {t}
          </Badge>
        ))}
        {result.missing.map((t) => (
          <Badge key={t} variant="outline" className="border-red-300 text-red-700 dark:border-red-800 dark:text-red-300">
            {t}
          </Badge>
        ))}
      </div>
    </div>
  );
}

export function TailorPanel() {
  const { jdText, keywords, suggestions, setJdText, setKeywords, setSuggestions } = useTailorStore();
  const content = useEditorStore((s) => s.content);
  const [analyzing, setAnalyzing] = useState(false);
  const [suggesting, setSuggesting] = useState(false);

  // JD handed off from the job tracker's "Tailor resume to this JD"
  useEffect(() => {
    if (jdText) return;
    try {
      const handoff = localStorage.getItem("tailor-jd");
      if (handoff) {
        setJdText(handoff);
        localStorage.removeItem("tailor-jd");
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const score = useMemo(
    () => (keywords ? computeAtsScore(resumeToPlainText(content), keywords) : null),
    [content, keywords]
  );

  async function analyze() {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/ai/ats-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jdText }),
      });
      if (!res.ok) throw new Error(await res.text());
      const kw: JdKeywords = await res.json();
      const total =
        kw.hardSkills.length + kw.titles.length + kw.qualifications.length + kw.softSkills.length;
      if (!total) {
        toast.error("Couldn't extract keywords from this job description — try again.");
        return;
      }
      setKeywords(kw);
    } catch (error) {
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : "Keyword analysis failed. Check your AI provider settings."
      );
    } finally {
      setAnalyzing(false);
    }
  }

  async function suggest() {
    setSuggesting(true);
    try {
      const res = await fetch("/api/ai/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: useEditorStore.getState().content, jdText }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSuggestions(data.suggestions ?? []);
      if (!data.suggestions?.length) toast.info("No suggestions — your resume already fits well.");
    } catch (error) {
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : "Tailoring failed. Check your AI provider settings."
      );
    } finally {
      setSuggesting(false);
    }
  }

  function applySuggestion(suggestion: TailorSuggestion) {
    const state = useEditorStore.getState();
    if (suggestion.kind === "summary") {
      state.setSummary(suggestion.proposed);
      dismissSuggestion(suggestion);
      return;
    }

    const target = findBulletTarget(state.content.sections, suggestion);
    if (!target) {
      toast.error("Couldn't locate that bullet anymore — it may have been edited or removed.");
      return;
    }
    const items = state.content.sections[target.section];
    const item = items.find((i) => i.id === target.itemId)!;
    const bullets = [...item.bullets];
    bullets[target.index] = suggestion.proposed;
    state.updateItem(target.section, target.itemId, { bullets });
    dismissSuggestion(suggestion);
  }

  function dismissSuggestion(suggestion: TailorSuggestion) {
    setSuggestions(useTailorStore.getState().suggestions.filter((s) => s !== suggestion));
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-background p-3">
        <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
          <Target className="h-4 w-4" /> Job description
        </p>
        <Textarea
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          rows={7}
          placeholder="Paste the job description here to score your resume against it and get tailored suggestions…"
          className="text-sm"
        />
        <div className="mt-2 flex gap-2">
          <Button size="sm" onClick={analyze} disabled={analyzing || jdText.trim().length < 30}>
            {analyzing ? "Analyzing…" : "Analyze match"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={suggest}
            disabled={suggesting || jdText.trim().length < 30}
          >
            <Sparkles className="mr-1 h-3.5 w-3.5 text-violet-500" />
            {suggesting ? "Thinking…" : "Suggest edits"}
          </Button>
        </div>
      </div>

      {score && (
        <div className="rounded-lg border bg-background p-3">
          <div className="mb-3 flex items-baseline justify-between">
            <p className="text-sm font-semibold">ATS match score</p>
            <p className={cn("text-2xl font-bold tabular-nums", scoreColor(score.score))}>
              {score.score}
              <span className="text-sm font-normal text-muted-foreground">/100</span>
            </p>
          </div>
          <div className="mb-3 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                score.score >= 75 ? "bg-emerald-500" : score.score >= 50 ? "bg-amber-500" : "bg-red-500"
              )}
              style={{ width: `${score.score}%` }}
            />
          </div>
          <p className="mb-3 text-xs text-muted-foreground">
            Updates live as you edit. Add missing keywords where they honestly apply.
          </p>
          <div className="space-y-3">
            <Category title="Hard skills" result={score.hardSkills} />
            <Category title="Titles" result={score.titles} />
            <Category title="Qualifications" result={score.qualifications} />
            <Category title="Soft skills" result={score.softSkills} />
          </div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="space-y-2.5">
          <p className="text-sm font-semibold">Suggested edits ({suggestions.length})</p>
          {suggestions.map((s, i) => (
            <div key={i} className="rounded-lg border bg-background p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {s.kind === "summary" ? "Summary" : s.section}
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground line-through">{s.original}</p>
              <p className="mt-1 text-sm">{s.proposed}</p>
              <p className="mt-1.5 text-xs italic text-muted-foreground">{s.rationale}</p>
              <div className="mt-2 flex gap-1.5">
                <Button size="xs" onClick={() => applySuggestion(s)}>
                  <Check className="mr-1 h-3 w-3" /> Apply
                </Button>
                <Button size="xs" variant="ghost" onClick={() => dismissSuggestion(s)}>
                  <X className="mr-1 h-3 w-3" /> Dismiss
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
