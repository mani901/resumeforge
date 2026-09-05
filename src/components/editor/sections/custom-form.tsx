"use client";

import { useState } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { useEditorStore } from "@/lib/stores/editor-store";
import { newCustomSection, newCustomItem, type CustomItem } from "@/lib/schemas/resume";
import { Field, GrowInput } from "@/components/editor/fields";
import { BulletsEditor } from "@/components/editor/bullets-editor";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function CustomItemCard({
  item,
  sectionId,
}: {
  item: CustomItem;
  sectionId: string;
}) {
  const [open, setOpen] = useState(!item.heading);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { updateCustomItem, removeCustomItem } = useEditorStore.getState();

  return (
    <div className="rounded-md border bg-background">
      <div className={cn("flex items-center gap-2 px-2.5 py-1.5", open && "border-b")}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
          title={open ? "Collapse" : "Expand"}
        >
          <span className="truncate text-xs font-medium text-muted-foreground">
            {item.heading || "New entry"}
          </span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
              !open && "-rotate-90"
            )}
          />
        </button>
        <Button variant="ghost" size="icon-xs" onClick={() => setConfirmOpen(true)} title="Remove entry">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Remove “${item.heading || "New entry"}”?`}
        description="You can undo with Ctrl+Z while the editor is open."
        confirmLabel="Remove"
        onConfirm={() => removeCustomItem(sectionId, item.id)}
      />
      {open && (
        <div className="p-2.5">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <Field
              label="Heading"
              value={item.heading}
              onChange={(e) => updateCustomItem(sectionId, item.id, { heading: e.target.value })}
            />
            <Field
              label="Subheading"
              value={item.subheading}
              onChange={(e) => updateCustomItem(sectionId, item.id, { subheading: e.target.value })}
            />
            <Field
              label="Date"
              value={item.date}
              onChange={(e) => updateCustomItem(sectionId, item.id, { date: e.target.value })}
            />
          </div>
          <div className="mt-2.5">
            <BulletsEditor
              bullets={item.bullets}
              onChange={(bullets) => updateCustomItem(sectionId, item.id, { bullets })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function CustomForm() {
  const sections = useEditorStore((s) => s.content.sections.custom);
  const { addItem, removeItem, updateCustomSection, addCustomItem } = useEditorStore.getState();
  const [confirmSectionId, setConfirmSectionId] = useState<string | null>(null);
  const confirmSection = sections.find((cs) => cs.id === confirmSectionId);

  return (
    <div className="space-y-3">
      {sections.map((cs) => (
        <div key={cs.id} className="rounded-md border bg-muted/30 p-2.5">
          <div className="mb-2.5 flex items-center gap-2">
            <GrowInput
              value={cs.title}
              onChange={(e) => updateCustomSection(cs.id, { title: e.target.value })}
              className="font-medium"
              placeholder="Section title (e.g. Volunteering)"
            />
            <Button variant="ghost" size="icon-sm" onClick={() => setConfirmSectionId(cs.id)} title="Remove section">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2.5">
            {cs.items.map((item) => (
              <CustomItemCard key={item.id} item={item} sectionId={cs.id} />
            ))}
            <Button variant="outline" size="xs" onClick={() => addCustomItem(cs.id, newCustomItem())}>
              <Plus className="mr-1 h-3 w-3" /> Add entry
            </Button>
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => addItem("custom", newCustomSection())}>
        <Plus className="mr-1 h-3.5 w-3.5" /> Add custom section
      </Button>
      <ConfirmDialog
        open={confirmSectionId !== null}
        onOpenChange={(open) => !open && setConfirmSectionId(null)}
        title={`Remove section “${confirmSection?.title ?? ""}”?`}
        description="All entries in this section will be removed. You can undo with Ctrl+Z while the editor is open."
        confirmLabel="Remove"
        onConfirm={() => {
          if (confirmSectionId) removeItem("custom", confirmSectionId);
          setConfirmSectionId(null);
        }}
      />
    </div>
  );
}
