"use client";

import { useState } from "react";
import { ChevronDown, Eye, EyeOff, Pencil } from "lucide-react";
import type { SectionId } from "@/lib/schemas/resume";
import { useEditorStore } from "@/lib/stores/editor-store";
import { SortableHandle } from "@/components/editor/sortable-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function SectionPanel({
  sectionId,
  title,
  renamable = true,
  children,
}: {
  sectionId: SectionId;
  title: string;
  renamable?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  const [editing, setEditing] = useState(false);
  const hidden = useEditorStore((s) => s.content.hiddenSections.includes(sectionId));
  const customTitle = useEditorStore((s) => s.content.sectionTitles[sectionId]);
  const { toggleSectionHidden, setSectionTitle } = useEditorStore.getState();

  const displayTitle = customTitle ?? title;

  return (
    <div className={cn("rounded-lg border bg-background", hidden && "opacity-60")}>
      <div className="group flex items-center gap-2 px-3 py-2.5">
        <SortableHandle />
        {editing ? (
          <Input
            value={displayTitle}
            autoFocus
            className="h-7 flex-1 text-sm font-semibold"
            onChange={(e) => setSectionTitle(sectionId, e.target.value)}
            onBlur={() => setEditing(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "Escape") setEditing(false);
            }}
            aria-label="Section title"
          />
        ) : (
          <>
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm font-semibold"
            >
              <span className="truncate">{displayTitle}</span>
              <ChevronDown
                className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", !open && "-rotate-90")}
              />
            </button>
            {renamable && (
              <Button
                variant="ghost"
                size="icon-sm"
                className="opacity-0 group-hover:opacity-100"
                onClick={() => setEditing(true)}
                title="Rename section"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
          </>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => toggleSectionHidden(sectionId)}
          title={hidden ? "Show section on resume" : "Hide section from resume"}
        >
          {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
      {open && <div className="border-t px-3 py-3">{children}</div>}
    </div>
  );
}
