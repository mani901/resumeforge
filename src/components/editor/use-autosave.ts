"use client";

import { useEffect } from "react";
import { useEditorStore } from "@/lib/stores/editor-store";
import { saveResume } from "@/actions/resume";

const DEBOUNCE_MS = 1500;

export function useAutosave() {
  const saveState = useEditorStore((s) => s.saveState);
  const content = useEditorStore((s) => s.content);
  const settings = useEditorStore((s) => s.settings);
  const title = useEditorStore((s) => s.title);
  const templateId = useEditorStore((s) => s.templateId);

  useEffect(() => {
    if (saveState !== "dirty") return;
    const timer = setTimeout(async () => {
      const state = useEditorStore.getState();
      state.markSaving();
      try {
        await saveResume({
          id: state.resumeId,
          title: state.title,
          content: state.content,
          settings: state.settings,
          templateId: state.templateId,
        });
        state.markSaved();
      } catch {
        state.markError();
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [saveState, content, settings, title, templateId]);

  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (useEditorStore.getState().saveState !== "saved") e.preventDefault();
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);
}
