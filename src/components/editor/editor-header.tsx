"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useStore } from "zustand";
import { ArrowLeft, Check, CloudUpload, AlertCircle, Undo2, Redo2 } from "lucide-react";
import { useEditorStore } from "@/lib/stores/editor-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function undo() {
  const temporal = useEditorStore.temporal.getState();
  if (!temporal.pastStates.length) return;
  temporal.undo();
  useEditorStore.getState().markDirty();
}

function redo() {
  const temporal = useEditorStore.temporal.getState();
  if (!temporal.futureStates.length) return;
  temporal.redo();
  useEditorStore.getState().markDirty();
}

function UndoRedo() {
  const canUndo = useStore(useEditorStore.temporal, (s) => s.pastStates.length > 0);
  const canRedo = useStore(useEditorStore.temporal, (s) => s.futureStates.length > 0);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!(e.ctrlKey || e.metaKey)) return;
      const key = e.key.toLowerCase();
      if (key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (key === "y" || (key === "z" && e.shiftKey)) {
        e.preventDefault();
        redo();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="flex items-center">
      <Button variant="ghost" size="icon-sm" onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon-sm" onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)">
        <Redo2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

function SaveIndicator() {
  const saveState = useEditorStore((s) => s.saveState);
  const map = {
    saved: { icon: Check, label: "Saved", cls: "text-muted-foreground" },
    dirty: { icon: CloudUpload, label: "Unsaved changes", cls: "text-muted-foreground" },
    saving: { icon: CloudUpload, label: "Saving…", cls: "text-muted-foreground" },
    error: { icon: AlertCircle, label: "Save failed", cls: "text-destructive" },
  } as const;
  const { icon: Icon, label, cls } = map[saveState];
  return (
    <span className={`flex shrink-0 items-center gap-1.5 text-xs ${cls}`} title={label}>
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </span>
  );
}

export function EditorHeader({ children }: { children?: React.ReactNode }) {
  const title = useEditorStore((s) => s.title);
  const setTitle = useEditorStore((s) => s.setTitle);

  return (
    <header className="flex h-14 shrink-0 items-center gap-1.5 border-b bg-background px-2 sm:gap-3 sm:px-4">
      <Link
        href="/resumes"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
      </Link>
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="h-8 min-w-0 flex-1 border-transparent font-medium shadow-none hover:border-input focus-visible:border-input sm:max-w-64"
        aria-label="Resume title"
      />
      <div className="hidden sm:block">
        <UndoRedo />
      </div>
      <SaveIndicator />
      <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">{children}</div>
    </header>
  );
}
