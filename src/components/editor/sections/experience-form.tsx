"use client";

import { Plus } from "lucide-react";
import { useEditorStore } from "@/lib/stores/editor-store";
import { newExperienceItem } from "@/lib/schemas/resume";
import { Field } from "@/components/editor/fields";
import { MonthYearField } from "@/components/editor/month-year-field";
import { BulletsEditor } from "@/components/editor/bullets-editor";
import { ItemCard } from "@/components/editor/item-card";
import { SortableList } from "@/components/editor/sortable-list";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function ExperienceForm() {
  const items = useEditorStore((s) => s.content.sections.experience);
  const { addItem, updateItem, removeItem, moveItem } = useEditorStore.getState();

  return (
    <div className="space-y-2.5">
      <SortableList ids={items.map((i) => i.id)} onMove={(from, to) => moveItem("experience", from, to)}>
        <div className="space-y-2.5">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              id={item.id}
              label={item.role || item.company || "New position"}
              defaultOpen={!item.role && !item.company}
              onRemove={() => removeItem("experience", item.id)}
            >
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <Field
                  label="Role"
                  value={item.role}
                  onChange={(e) => updateItem("experience", item.id, { role: e.target.value })}
                />
                <Field
                  label="Company"
                  value={item.company}
                  onChange={(e) => updateItem("experience", item.id, { company: e.target.value })}
                />
                <Field
                  label="Location"
                  value={item.location}
                  onChange={(e) => updateItem("experience", item.id, { location: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-2.5">
                  <MonthYearField
                    label="Start"
                    value={item.startDate}
                    onChange={(startDate) => updateItem("experience", item.id, { startDate })}
                  />
                  <MonthYearField
                    label="End"
                    value={item.endDate}
                    disabled={item.current}
                    onChange={(endDate) => updateItem("experience", item.id, { endDate })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={item.current}
                  onCheckedChange={(checked: boolean) => updateItem("experience", item.id, { current: checked })}
                />
                <Label className="text-xs text-muted-foreground">I currently work here</Label>
              </div>
              <BulletsEditor
                bullets={item.bullets}
                onChange={(bullets) => updateItem("experience", item.id, { bullets })}
              />
            </ItemCard>
          ))}
        </div>
      </SortableList>
      <Button variant="outline" size="sm" onClick={() => addItem("experience", newExperienceItem())}>
        <Plus className="mr-1 h-3.5 w-3.5" /> Add position
      </Button>
    </div>
  );
}
