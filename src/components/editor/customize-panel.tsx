"use client";

import { useEditorStore } from "@/lib/stores/editor-store";
import type { TemplateSettings } from "@/lib/schemas/resume";
import { templates } from "@/templates/registry";
import { fontFamilyLabels } from "@/lib/fonts";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const ACCENT_PRESETS = [
  "#2563eb",
  "#0891b2",
  "#059669",
  "#7c3aed",
  "#db2777",
  "#dc2626",
  "#ea580c",
  "#334155",
  "#000000",
];

function SettingSlider({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format?: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <span className="text-xs tabular-nums text-muted-foreground">
          {format ? format(value) : value}
        </span>
      </div>
      <Slider
        value={value}
        min={min}
        max={max}
        step={step}
        onValueChange={(v: number | readonly number[]) => onChange(Array.isArray(v) ? v[0] : (v as number))}
      />
    </div>
  );
}

function TemplatePicker() {
  const templateId = useEditorStore((s) => s.templateId);
  const setTemplate = useEditorStore((s) => s.setTemplate);

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {templates.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => setTemplate(t.id)}
          className={cn(
            "rounded-lg border p-3 text-left transition-colors hover:bg-muted/60",
            t.id === templateId && "border-primary ring-2 ring-primary/30"
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">{t.name}</span>
            <Badge variant="secondary" className="text-[10px] uppercase">
              {t.category}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>
        </button>
      ))}
    </div>
  );
}

export function CustomizePanel() {
  const settings = useEditorStore((s) => s.settings);
  const updateSettings = useEditorStore((s) => s.updateSettings);

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2.5 text-sm font-semibold">Template</p>
        <TemplatePicker />
      </div>

      <div className="rounded-lg border bg-background p-3">
        <p className="mb-3 text-sm font-semibold">Design</p>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Accent color</Label>
            <div className="flex flex-wrap items-center gap-1.5">
              {ACCENT_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => updateSettings({ accentColor: color })}
                  className={cn(
                    "h-6 w-6 rounded-full border transition-transform hover:scale-110",
                    settings.accentColor === color && "ring-2 ring-foreground ring-offset-2"
                  )}
                  style={{ backgroundColor: color }}
                  aria-label={`Accent ${color}`}
                />
              ))}
              <input
                type="color"
                value={settings.accentColor}
                onChange={(e) => updateSettings({ accentColor: e.target.value })}
                className="h-6 w-8 cursor-pointer rounded border bg-transparent"
                aria-label="Custom accent color"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Header alignment</Label>
            <div className="grid grid-cols-2 gap-1.5">
              {(["left", "center"] as const).map((align) => (
                <button
                  key={align}
                  type="button"
                  onClick={() => updateSettings({ headerAlign: align })}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-xs font-medium capitalize transition-colors hover:bg-muted/60",
                    settings.headerAlign === align && "border-primary bg-primary/5 text-primary"
                  )}
                >
                  {align}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Font family</Label>
            <Select
              value={settings.fontFamily}
              onValueChange={(v: unknown) =>
                updateSettings({ fontFamily: v as TemplateSettings["fontFamily"] })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(fontFamilyLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <SettingSlider
            label="Font size"
            value={settings.fontSize}
            min={8}
            max={13}
            step={0.5}
            format={(v) => `${v}pt`}
            onChange={(fontSize) => updateSettings({ fontSize })}
          />
          <SettingSlider
            label="Line spacing"
            value={settings.lineSpacing}
            min={1}
            max={1.8}
            step={0.05}
            format={(v) => v.toFixed(2)}
            onChange={(lineSpacing) => updateSettings({ lineSpacing })}
          />
          <SettingSlider
            label="Page margin"
            value={settings.pageMargin}
            min={8}
            max={30}
            step={1}
            format={(v) => `${v}mm`}
            onChange={(pageMargin) => updateSettings({ pageMargin })}
          />
          <SettingSlider
            label="Section spacing"
            value={settings.sectionSpacing}
            min={4}
            max={24}
            step={1}
            format={(v) => `${v}pt`}
            onChange={(sectionSpacing) => updateSettings({ sectionSpacing })}
          />
        </div>
      </div>
    </div>
  );
}
