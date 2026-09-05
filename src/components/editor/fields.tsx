"use client";

import { useId } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextarea } from "@/components/editor/rich-textarea";
import { cn } from "@/lib/utils";

// Single-line input that wraps and grows to show its full content.
// Enter is disabled so it still behaves like a one-line field.
export function GrowInput({
  className,
  onKeyDown,
  ...props
}: React.ComponentProps<typeof Textarea>) {
  return (
    <Textarea
      rows={1}
      className={cn("min-h-8 resize-none overflow-hidden py-1.5", className)}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.preventDefault();
        onKeyDown?.(e);
      }}
      {...props}
    />
  );
}

export function Field({
  label,
  className,
  ...props
}: { label: string } & React.ComponentProps<typeof Textarea>) {
  const id = useId();
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <GrowInput id={id} {...props} />
    </div>
  );
}

export function RichTextareaField({
  label,
  className,
  ...props
}: { label: string; className?: string } & React.ComponentProps<typeof RichTextarea>) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <RichTextarea {...props} />
    </div>
  );
}

export function TextareaField({
  label,
  className,
  ...props
}: { label?: string } & React.ComponentProps<typeof Textarea>) {
  const id = useId();
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <Label htmlFor={id} className="text-xs text-muted-foreground">
          {label}
        </Label>
      )}
      <Textarea id={id} {...props} />
    </div>
  );
}
