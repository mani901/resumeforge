"use client";

import { useEffect, useState } from "react";
import { Eye, PencilLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ResumeContent, TemplateSettings } from "@/lib/schemas/resume";
import { useEditorStore } from "@/lib/stores/editor-store";
import { useAutosave } from "@/components/editor/use-autosave";
import { EditorHeader } from "@/components/editor/editor-header";
import { ExportButtons } from "@/components/editor/export-buttons";
import { PersonalForm } from "@/components/editor/personal-form";
import { SectionList } from "@/components/editor/section-list";
import { PreviewPane } from "@/components/editor/preview-pane";
import { CustomizePanel } from "@/components/editor/customize-panel";
import { TailorPanel } from "@/components/editor/tailor-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EditorInitial {
  resumeId: string;
  title: string;
  templateId: string;
  content: ResumeContent;
  settings: TemplateSettings;
}

export function EditorShell({ initial }: { initial: EditorInitial }) {
  const hydrated = useEditorStore((s) => s.hydrated && s.resumeId === initial.resumeId);
  const [mobilePreview, setMobilePreview] = useState(false);
  useAutosave();

  useEffect(() => {
    useEditorStore.getState().init(initial);
    useEditorStore.temporal.getState().clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial.resumeId]);

  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        Loading editor…
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col">
      <EditorHeader>
        <ExportButtons />
      </EditorHeader>
      <div className="flex min-h-0 flex-1">
        <div
          className={cn(
            "w-full shrink-0 overflow-y-auto border-r bg-muted/30 p-3 sm:p-4 lg:block lg:w-[460px]",
            mobilePreview && "hidden"
          )}
        >
          <Tabs defaultValue="content">
            <TabsList className="mb-3 w-full">
              <TabsTrigger value="content" className="flex-1">
                Content
              </TabsTrigger>
              <TabsTrigger value="design" className="flex-1">
                Design
              </TabsTrigger>
              <TabsTrigger value="tailor" className="flex-1">
                Tailor
              </TabsTrigger>
            </TabsList>
            <TabsContent value="content">
              <div className="space-y-3">
                <PersonalForm />
                <SectionList />
              </div>
            </TabsContent>
            <TabsContent value="design">
              <CustomizePanel />
            </TabsContent>
            <TabsContent value="tailor">
              <TailorPanel />
            </TabsContent>
          </Tabs>
        </div>
        <div className={cn("min-w-0 flex-1 lg:block", !mobilePreview && "hidden")}>
          <PreviewPane />
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
