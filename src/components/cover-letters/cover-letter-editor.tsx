"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, CloudUpload, Download, Eye, PencilLine, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { saveCoverLetter } from "@/actions/coverLetter";
import { useAiStream } from "@/components/editor/use-ai-stream";
import type { Personal, TemplateSettings } from "@/lib/schemas/resume";
import { CoverLetterDoc } from "@/templates/cover-letter";
import { templateFontClasses } from "@/lib/fonts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextarea } from "@/components/editor/rich-textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const NONE = "__none__";
const A4_WIDTH_PX = 794;

interface LetterData {
  id: string;
  title: string;
  body: string;
  resumeId: string | null;
  applicationId: string | null;
  settings: TemplateSettings;
}

export function CoverLetterEditor({
  letter,
  resumes,
  applications,
  personalByResume,
}: {
  letter: LetterData;
  resumes: { id: string; title: string }[];
  applications: { id: string; company: string; role: string }[];
  personalByResume: Record<string, Personal>;
}) {
  const [title, setTitle] = useState(letter.title);
  const [body, setBody] = useState(letter.body);
  const [resumeId, setResumeId] = useState(letter.resumeId ?? NONE);
  const [applicationId, setApplicationId] = useState(letter.applicationId ?? NONE);
  const [saveState, setSaveState] = useState<"saved" | "dirty" | "saving">("saved");
  const [mobilePreview, setMobilePreview] = useState(false);
  const { stream, streaming } = useAiStream();
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setSaveState("dirty");
    const timer = setTimeout(async () => {
      setSaveState("saving");
      try {
        await saveCoverLetter({
          id: letter.id,
          title,
          body,
          resumeId: resumeId === NONE ? null : resumeId,
          applicationId: applicationId === NONE ? null : applicationId,
        });
        setSaveState("saved");
      } catch {
        toast.error("Failed to save");
        setSaveState("dirty");
      }
    }, 1200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, body, resumeId, applicationId]);

  async function generate() {
    if (resumeId === NONE) {
      toast.error("Link a resume first so AI knows your background");
      return;
    }
    try {
      // persist links before generating so the API sees them
      await saveCoverLetter({
        id: letter.id,
        title,
        body,
        resumeId,
        applicationId: applicationId === NONE ? null : applicationId,
      });
      const previous = body;
      try {
        await stream("/api/ai/cover-letter", { coverLetterId: letter.id }, (text) => setBody(text));
      } catch (error) {
        toast.error(
          error instanceof Error && error.message
            ? error.message
            : "Generation failed. Check your AI provider settings."
        );
        setBody(previous);
      }
    } catch {
      toast.error("Failed to save before generating");
    }
  }

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.55);
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setScale(Math.min((entry.contentRect.width - 48) / A4_WIDTH_PX, 1.1));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const personal = resumeId !== NONE ? (personalByResume[resumeId] ?? null) : null;

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex h-14 shrink-0 items-center gap-1.5 border-b bg-background px-2 sm:gap-3 sm:px-4">
        <Link
          href="/cover-letters"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-8 min-w-0 flex-1 border-transparent font-medium shadow-none hover:border-input focus-visible:border-input sm:max-w-72"
          aria-label="Cover letter title"
        />
        <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
          {saveState === "saved" ? <Check className="h-3.5 w-3.5" /> : <CloudUpload className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">
            {saveState === "saved" ? "Saved" : saveState === "saving" ? "Saving…" : "Unsaved changes"}
          </span>
        </span>
        <div className="ml-auto shrink-0">
          <Button
            size="sm"
            title="Export PDF"
            onClick={() => window.open(`/api/export/cover-letter/${letter.id}`, "_blank")}
          >
            <Download className="h-4 w-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Export PDF</span>
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <div
          className={cn(
            "flex w-full shrink-0 flex-col gap-3 overflow-y-auto border-r bg-muted/30 p-3 sm:p-4 lg:flex lg:w-[460px]",
            mobilePreview && "hidden"
          )}
        >
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Job application</Label>
              <Select value={applicationId} onValueChange={(v: unknown) => setApplicationId(v as string)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>None</SelectItem>
                  {applications.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.company} — {a.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Resume</Label>
              <Select value={resumeId} onValueChange={(v: unknown) => setResumeId(v as string)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>None</SelectItem>
                  {resumes.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={generate} disabled={streaming}>
            <Sparkles className="mr-1.5 h-3.5 w-3.5 text-violet-500" />
            {streaming ? "Writing…" : "Generate with AI"}
          </Button>
          <RichTextarea
            value={body}
            onChangeText={setBody}
            placeholder="Dear Hiring Manager,&#10;&#10;Write or generate your cover letter…"
            className="h-full min-h-0 resize-none leading-relaxed"
          />
        </div>
        <div
          ref={containerRef}
          className={cn(
            "min-w-0 flex-1 overflow-y-auto bg-zinc-200/70 p-3 sm:p-6 lg:block dark:bg-zinc-800",
            !mobilePreview && "hidden"
          )}
        >
          <div className="mx-auto w-fit" style={{ zoom: scale }}>
            <div className={templateFontClasses}>
              <div
                className="bg-white shadow-lg"
                style={{ padding: `${letter.settings.pageMargin * (96 / 25.4)}px 0` }}
              >
                <CoverLetterDoc
                  personal={personal}
                  settings={letter.settings}
                  body={body}
                  date={new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Button
        className="fixed bottom-5 right-5 z-40 shadow-lg lg:hidden"
        onClick={() => setMobilePreview((v) => !v)}
      >
        {mobilePreview ? (
          <>
            <PencilLine className="mr-1.5 h-4 w-4" /> Edit
          </>
        ) : (
          <>
            <Eye className="mr-1.5 h-4 w-4" /> Preview
          </>
        )}
      </Button>
    </div>
  );
}
