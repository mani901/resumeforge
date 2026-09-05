"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useEditorStore } from "@/lib/stores/editor-store";
import { newProjectItem } from "@/lib/schemas/resume";
import { Field, GrowInput, TextareaField } from "@/components/editor/fields";
import { BulletsEditor } from "@/components/editor/bullets-editor";
import { ItemCard } from "@/components/editor/item-card";
import { SortableList } from "@/components/editor/sortable-list";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

function TechInput({ initial, onCommit }: { initial: string[]; onCommit: (v: string[]) => void }) {
  const [value, setValue] = useState(initial.join(", "));
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">Tech stack (comma-separated)</Label>
      <GrowInput
        value={value}
        placeholder="Next.js, Prisma, PostgreSQL"
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

export function ProjectsForm() {
  const items = useEditorStore((s) => s.content.sections.projects);
  const { addItem, updateItem, removeItem, moveItem } = useEditorStore.getState();

  return (
    <div className="space-y-2.5">
      <SortableList ids={items.map((i) => i.id)} onMove={(from, to) => moveItem("projects", from, to)}>
        <div className="space-y-2.5">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              id={item.id}
              label={item.name || "New project"}
              defaultOpen={!item.name}
              onRemove={() => removeItem("projects", item.id)}
            >
              <Field
                label="Name"
                value={item.name}
                onChange={(e) => updateItem("projects", item.id, { name: e.target.value })}
              />
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Link</Label>
                <div className="grid grid-cols-[1fr_1.6fr] gap-2">
                  <GrowInput
                    value={item.link.label}
                    placeholder="Display text (e.g. GitHub)"
                    onChange={(e) =>
                      updateItem("projects", item.id, { link: { ...item.link, label: e.target.value } })
                    }
                  />
                  <GrowInput
                    value={item.link.url}
                    placeholder="https://github.com/you/project"
                    onChange={(e) =>
                      updateItem("projects", item.id, { link: { ...item.link, url: e.target.value } })
                    }
                  />
                </div>
              </div>
              <TechInput initial={item.tech} onCommit={(tech) => updateItem("projects", item.id, { tech })} />
              <TextareaField
                label="Description"
                rows={2}
                value={item.description}
                onChange={(e) => updateItem("projects", item.id, { description: e.target.value })}
              />
              <BulletsEditor
                bullets={item.bullets}
                onChange={(bullets) => updateItem("projects", item.id, { bullets })}
              />
            </ItemCard>
          ))}
        </div>
      </SortableList>
      <Button variant="outline" size="sm" onClick={() => addItem("projects", newProjectItem())}>
        <Plus className="mr-1 h-3.5 w-3.5" /> Add project
      </Button>
    </div>
  );
}
