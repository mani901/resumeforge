"use client";

import { useRef, useState } from "react";
import { Bold, Italic } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// Textarea with a floating Bold/Italic toolbar. Formatting is stored as light
// markup (**bold**, *italic*) and rendered by the templates.
export function RichTextarea({
  value,
  onChangeText,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Textarea>, "value" | "onChange"> & {
  value: string;
  onChangeText: (value: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [hasSelection, setHasSelection] = useState(false);

  function updateSelection() {
    const el = ref.current;
    setHasSelection(!!el && el.selectionStart !== el.selectionEnd);
  }

  function toggleMarker(marker: "**" | "*") {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end } = el;
    if (start === end) return;

    const before = value.slice(0, start);
    const selected = value.slice(start, end);
    const after = value.slice(end);
    const len = marker.length;

    let next: string;
    let selStart: number;
    let selEnd: number;

    if (selected.startsWith(marker) && selected.endsWith(marker) && selected.length >= len * 2) {
      const inner = selected.slice(len, -len);
      next = before + inner + after;
      selStart = start;
      selEnd = start + inner.length;
    } else if (before.endsWith(marker) && after.startsWith(marker)) {
      next = before.slice(0, -len) + selected + after.slice(len);
      selStart = start - len;
      selEnd = selStart + selected.length;
    } else {
      next = before + marker + selected + marker + after;
      selStart = start + len;
      selEnd = selStart + selected.length;
    }

    onChangeText(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(selStart, selEnd);
    });
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!(e.ctrlKey || e.metaKey)) return;
    const key = e.key.toLowerCase();
    if (key === "b") {
      e.preventDefault();
      toggleMarker("**");
    } else if (key === "i") {
      e.preventDefault();
      toggleMarker("*");
    }
  }

  return (
    <div className="relative min-h-0 min-w-0 flex-1">
      {hasSelection && (
        <div className="absolute -top-8 right-0 z-10 flex gap-0.5 rounded-md border bg-background p-0.5 shadow-md">
          <button
            type="button"
            title="Bold (Ctrl+B)"
            className="flex h-6 w-6 items-center justify-center rounded hover:bg-muted"
            onMouseDown={(e) => {
              e.preventDefault();
              toggleMarker("**");
            }}
          >
            <Bold className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Italic (Ctrl+I)"
            className="flex h-6 w-6 items-center justify-center rounded hover:bg-muted"
            onMouseDown={(e) => {
              e.preventDefault();
              toggleMarker("*");
            }}
          >
            <Italic className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      <Textarea
        ref={ref}
        value={value}
        onChange={(e) => onChangeText(e.target.value)}
        onSelect={updateSelection}
        onKeyDown={onKeyDown}
        onBlur={() => setHasSelection(false)}
        className={cn("text-sm", className)}
        {...props}
      />
    </div>
  );
}
