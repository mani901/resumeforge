"use client";

import { useState } from "react";
import { ChevronDown, Trash2 } from "lucide-react";
import { SortableItem, SortableHandle } from "@/components/editor/sortable-list";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ItemCard({
  id,
  label,
  onRemove,
  defaultOpen = true,
  children,
}: {
  id: string;
  label: string;
  onRemove: () => void;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <SortableItem id={id} handle className="rounded-md border bg-muted/30">
      <div className={cn("flex items-center gap-2 px-2.5 py-1.5", open && "border-b")}>
        <SortableHandle />
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
          title={open ? "Collapse" : "Expand"}
        >
          <span className="truncate text-xs font-medium text-muted-foreground">{label}</span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
              !open && "-rotate-90"
            )}
          />
        </button>
        <Button variant="ghost" size="icon-xs" onClick={() => setConfirmOpen(true)} title="Remove">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      {open && <div className="space-y-2.5 p-2.5">{children}</div>}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Remove “${label}”?`}
        description="You can undo with Ctrl+Z while the editor is open."
        confirmLabel="Remove"
        onConfirm={onRemove}
      />
    </SortableItem>
  );
}
