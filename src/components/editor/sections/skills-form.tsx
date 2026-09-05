"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useEditorStore } from "@/lib/stores/editor-store";
import { newSkillGroup } from "@/lib/schemas/resume";
import { Field, GrowInput } from "@/components/editor/fields";
import { ItemCard } from "@/components/editor/item-card";
import { SortableList } from "@/components/editor/sortable-list";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

function SkillItemsInput({
  initial,
  onCommit,
}: {
  initial: string[];
  onCommit: (items: string[]) => void;
}) {
  const [value, setValue] = useState(initial.join(", "));

  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">Skills (comma-separated)</Label>
      <GrowInput
        value={value}
        placeholder="React, Node.js, PostgreSQL"
        onChange={(e) => {
          setValue(e.target.value);
          onCommit(
            e.target.value
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          );
        }}
      />
    </div>
  );
}

export function SkillsForm() {
  const items = useEditorStore((s) => s.content.sections.skills);
  const { addItem, updateItem, removeItem, moveItem } = useEditorStore.getState();

  return (
    <div className="space-y-2.5">
      <SortableList ids={items.map((i) => i.id)} onMove={(from, to) => moveItem("skills", from, to)}>
        <div className="space-y-2.5">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              id={item.id}
              label={item.group ? `${item.group}: ${item.items.join(", ")}` : "Skill group"}
              defaultOpen={!item.group && item.items.length === 0}
              onRemove={() => removeItem("skills", item.id)}
            >
              <Field
                label="Group name"
                placeholder="e.g. Frontend, Databases"
                value={item.group}
                onChange={(e) => updateItem("skills", item.id, { group: e.target.value })}
              />
              <SkillItemsInput
                initial={item.items}
                onCommit={(skills) => updateItem("skills", item.id, { items: skills })}
              />
            </ItemCard>
          ))}
        </div>
      </SortableList>
      <Button variant="outline" size="sm" onClick={() => addItem("skills", newSkillGroup())}>
        <Plus className="mr-1 h-3.5 w-3.5" /> Add skill group
      </Button>
    </div>
  );
}
