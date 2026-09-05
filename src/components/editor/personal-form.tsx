"use client";

import { useEditorStore } from "@/lib/stores/editor-store";
import type { LinkField } from "@/lib/schemas/resume";
import { Field, GrowInput } from "@/components/editor/fields";
import { Label } from "@/components/ui/label";

function LinkInput({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: LinkField;
  placeholder: string;
  onChange: (value: LinkField) => void;
}) {
  return (
    <div className="col-span-2 space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="grid grid-cols-[1fr_1.6fr] gap-2">
        <GrowInput
          value={value.label}
          placeholder="Display text"
          onChange={(e) => onChange({ ...value, label: e.target.value })}
        />
        <GrowInput
          value={value.url}
          placeholder={placeholder}
          onChange={(e) => onChange({ ...value, url: e.target.value })}
        />
      </div>
    </div>
  );
}

export function PersonalForm() {
  const personal = useEditorStore((s) => s.content.personal);
  const setPersonal = useEditorStore((s) => s.setPersonal);

  return (
    <div className="rounded-lg border bg-background px-3 py-3">
      <p className="mb-3 text-sm font-semibold">Personal Info</p>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <Field
          label="Full name"
          value={personal.fullName}
          onChange={(e) => setPersonal("fullName", e.target.value)}
          className="col-span-2"
        />
        <Field
          label="Headline"
          placeholder="e.g. MERN Stack Developer"
          value={personal.headline}
          onChange={(e) => setPersonal("headline", e.target.value)}
          className="col-span-2"
        />
        <Field label="Email" value={personal.email} onChange={(e) => setPersonal("email", e.target.value)} />
        <Field label="Phone" value={personal.phone} onChange={(e) => setPersonal("phone", e.target.value)} />
        <Field
          label="Location"
          className="col-span-2"
          value={personal.location}
          onChange={(e) => setPersonal("location", e.target.value)}
        />
        <LinkInput
          label="Website"
          value={personal.website}
          placeholder="https://yoursite.com"
          onChange={(v) => setPersonal("website", v)}
        />
        <LinkInput
          label="LinkedIn"
          value={personal.linkedin}
          placeholder="https://linkedin.com/in/you"
          onChange={(v) => setPersonal("linkedin", v)}
        />
        <LinkInput
          label="GitHub"
          value={personal.github}
          placeholder="https://github.com/you"
          onChange={(v) => setPersonal("github", v)}
        />
      </div>
    </div>
  );
}
