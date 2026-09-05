"use client";

import { Plus } from "lucide-react";
import { useEditorStore } from "@/lib/stores/editor-store";
import { newCertificationItem } from "@/lib/schemas/resume";
import { Field } from "@/components/editor/fields";
import { MonthYearField } from "@/components/editor/month-year-field";
import { ItemCard } from "@/components/editor/item-card";
import { SortableList } from "@/components/editor/sortable-list";
import { Button } from "@/components/ui/button";

export function CertificationsForm() {
  const items = useEditorStore((s) => s.content.sections.certifications);
  const { addItem, updateItem, removeItem, moveItem } = useEditorStore.getState();

  return (
    <div className="space-y-2.5">
      <SortableList ids={items.map((i) => i.id)} onMove={(from, to) => moveItem("certifications", from, to)}>
        <div className="space-y-2.5">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              id={item.id}
              label={item.name || "New certification"}
              defaultOpen={!item.name}
              onRemove={() => removeItem("certifications", item.id)}
            >
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <Field
                  label="Name"
                  value={item.name}
                  onChange={(e) => updateItem("certifications", item.id, { name: e.target.value })}
                />
                <Field
                  label="Issuer"
                  value={item.issuer}
                  onChange={(e) => updateItem("certifications", item.id, { issuer: e.target.value })}
                />
                <MonthYearField
                  label="Date"
                  value={item.date}
                  onChange={(date) => updateItem("certifications", item.id, { date })}
                />
                <Field
                  label="Link"
                  value={item.link}
                  onChange={(e) => updateItem("certifications", item.id, { link: e.target.value })}
                />
              </div>
            </ItemCard>
          ))}
        </div>
      </SortableList>
      <Button variant="outline" size="sm" onClick={() => addItem("certifications", newCertificationItem())}>
        <Plus className="mr-1 h-3.5 w-3.5" /> Add certification
      </Button>
    </div>
  );
}
