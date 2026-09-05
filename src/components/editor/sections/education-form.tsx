"use client";

import { Plus } from "lucide-react";
import { useEditorStore } from "@/lib/stores/editor-store";
import { newEducationItem } from "@/lib/schemas/resume";
import { Field, RichTextareaField } from "@/components/editor/fields";
import { MonthYearField } from "@/components/editor/month-year-field";
import { ItemCard } from "@/components/editor/item-card";
import { SortableList } from "@/components/editor/sortable-list";
import { Button } from "@/components/ui/button";

export function EducationForm() {
  const items = useEditorStore((s) => s.content.sections.education);
  const { addItem, updateItem, removeItem, moveItem } = useEditorStore.getState();

  return (
    <div className="space-y-2.5">
      <SortableList ids={items.map((i) => i.id)} onMove={(from, to) => moveItem("education", from, to)}>
        <div className="space-y-2.5">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              id={item.id}
              label={item.degree || item.institution || "New education"}
              defaultOpen={!item.degree && !item.institution}
              onRemove={() => removeItem("education", item.id)}
            >
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <Field
                  label="Degree"
                  placeholder="BS Computer Science"
                  value={item.degree}
                  onChange={(e) => updateItem("education", item.id, { degree: e.target.value })}
                />
                <Field
                  label="Institution"
                  value={item.institution}
                  onChange={(e) => updateItem("education", item.id, { institution: e.target.value })}
                />
                <Field
                  label="Location"
                  value={item.location}
                  onChange={(e) => updateItem("education", item.id, { location: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-2.5">
                  <MonthYearField
                    label="Start"
                    value={item.startDate}
                    onChange={(startDate) => updateItem("education", item.id, { startDate })}
                  />
                  <MonthYearField
                    label="End"
                    value={item.endDate}
                    onChange={(endDate) => updateItem("education", item.id, { endDate })}
                  />
                </div>
              </div>
              <RichTextareaField
                label="Details"
                placeholder="GPA, honors, relevant coursework…"
                rows={2}
                value={item.details}
                onChangeText={(v) => updateItem("education", item.id, { details: v })}
              />
            </ItemCard>
          ))}
        </div>
      </SortableList>
      <Button variant="outline" size="sm" onClick={() => addItem("education", newEducationItem())}>
        <Plus className="mr-1 h-3.5 w-3.5" /> Add education
      </Button>
    </div>
  );
}
