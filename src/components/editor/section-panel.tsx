"use client";

import { useState } from "react";
import { ChevronDown, Eye, EyeOff } from "lucide-react";
import type { SectionId } from "@/lib/schemas/resume";
import { useEditorStore } from "@/lib/stores/editor-store";
import { SortableHandle } from "@/components/editor/sortable-list";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SectionPanel({
  sectionId,
  title,
  children,
}: {
  sectionId: SectionId;
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  const hidden = useEditorStore((s) => s.content.hiddenSections.includes(sectionId));
  const toggleHidden = useEditorStore((s) => s.toggleSectionHidden);

  return (
    <div className={cn("rounded-lg border bg-background", hidden && "opacity-60")}>
      <div className="flex items-center gap-2 px-3 py-2.5">
        <SortableHandle />
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex flex-1 items-center gap-2 text-left text-sm font-semibold"
        >
          {title}
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", !open && "-rotate-90")} />
        </button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => toggleHidden(sectionId)}
          title={hidden ? "Show section on resume" : "Hide section from resume"}
        >
          {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
      {open && <div className="border-t px-3 py-3">{children}</div>}
    </div>
  );
}
