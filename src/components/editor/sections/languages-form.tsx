"use client";

import { Plus } from "lucide-react";
import { useEditorStore } from "@/lib/stores/editor-store";
import { newLanguageItem } from "@/lib/schemas/resume";
import { Field } from "@/components/editor/fields";
import { ItemCard } from "@/components/editor/item-card";
import { SortableList } from "@/components/editor/sortable-list";
import { Button } from "@/components/ui/button";

export function LanguagesForm() {
  const items = useEditorStore((s) => s.content.sections.languages);
  const { addItem, updateItem, removeItem, moveItem } = useEditorStore.getState();

  return (
    <div className="space-y-2.5">
      <SortableList ids={items.map((i) => i.id)} onMove={(from, to) => moveItem("languages", from, to)}>
        <div className="space-y-2.5">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              id={item.id}
              label={item.name ? `${item.name}${item.level ? ` (${item.level})` : ""}` : "New language"}
              defaultOpen={!item.name}
              onRemove={() => removeItem("languages", item.id)}
            >
              <div className="grid grid-cols-2 gap-2.5">
                <Field
                  label="Language"
                  value={item.name}
                  onChange={(e) => updateItem("languages", item.id, { name: e.target.value })}
                />
                <Field
                  label="Level"
                  placeholder="Native, Fluent, B2…"
                  value={item.level}
                  onChange={(e) => updateItem("languages", item.id, { level: e.target.value })}
                />
              </div>
            </ItemCard>
          ))}
        </div>
      </SortableList>
      <Button variant="outline" size="sm" onClick={() => addItem("languages", newLanguageItem())}>
        <Plus className="mr-1 h-3.5 w-3.5" /> Add language
      </Button>
    </div>
  );
}
