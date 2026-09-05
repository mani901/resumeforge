"use client";

import { useRef, useState } from "react";
import { nanoid } from "nanoid";
import { Plus, X, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RichTextarea } from "@/components/editor/rich-textarea";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SortableList, SortableItem, SortableHandle } from "@/components/editor/sortable-list";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useAiStream } from "@/components/editor/use-ai-stream";
import { useEditorStore } from "@/lib/stores/editor-store";
import { resumeToPlainText, type RewriteStyle } from "@/lib/ai/prompts";

const REWRITE_OPTIONS: { style: RewriteStyle; label: string }[] = [
  { style: "improve", label: "Improve" },
  { style: "concise", label: "Make concise" },
  { style: "quantify", label: "Emphasize impact" },
];

export function BulletsEditor({
  bullets,
  onChange,
  label = "Bullet points",
}: {
  bullets: string[];
  onChange: (bullets: string[]) => void;
  label?: string;
}) {
  const { stream, streaming } = useAiStream();
  const [confirmIndex, setConfirmIndex] = useState<number | null>(null);

  // Bullets are plain strings; keep a parallel list of stable ids for dnd-kit keys.
  const idsRef = useRef<string[]>([]);
  while (idsRef.current.length < bullets.length) idsRef.current.push(nanoid());
  if (idsRef.current.length > bullets.length) {
    idsRef.current = idsRef.current.slice(0, bullets.length);
  }
  const ids = idsRef.current;

  function update(index: number, value: string) {
    const next = [...bullets];
    next[index] = value;
    onChange(next);
  }

  function remove(index: number) {
    idsRef.current = ids.filter((_, i) => i !== index);
    onChange(bullets.filter((_, i) => i !== index));
  }

  function add() {
    idsRef.current = [...ids, nanoid()];
    onChange([...bullets, ""]);
  }

  function move(fromId: string, toId: string) {
    const from = ids.indexOf(fromId);
    const to = ids.indexOf(toId);
    if (from === -1 || to === -1) return;
    const nextIds = [...ids];
    const nextBullets = [...bullets];
    const [id] = nextIds.splice(from, 1);
    const [bullet] = nextBullets.splice(from, 1);
    nextIds.splice(to, 0, id);
    nextBullets.splice(to, 0, bullet);
    idsRef.current = nextIds;
    onChange(nextBullets);
  }

  async function rewrite(index: number, style: RewriteStyle) {
    const bullet = bullets[index];
    if (!bullet.trim()) {
      toast.error("Write a rough bullet first, then let AI improve it");
      return;
    }
    try {
      await stream(
        "/api/ai/rewrite",
        {
          bullet,
          style,
          resumeContext: resumeToPlainText(useEditorStore.getState().content),
        },
        (text) => update(index, text)
      );
    } catch (error) {
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : "AI rewrite failed. Check your AI provider settings."
      );
      update(index, bullet);
    }
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <SortableList ids={ids} onMove={move}>
        <div className="space-y-1.5">
          {bullets.map((bullet, i) => (
            <SortableItem key={ids[i]} id={ids[i]} handle className="flex items-start gap-1">
              <SortableHandle className="mt-2.5 shrink-0" />
              <RichTextarea
                value={bullet}
                onChangeText={(v) => update(i, v)}
                rows={2}
                className="min-h-0 resize-none"
                placeholder="Achievement or responsibility…"
              />
              <div className="mt-1 flex shrink-0 flex-col gap-0.5">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    disabled={streaming}
                    render={<Button variant="ghost" size="icon-xs" title="Rewrite with AI" />}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {REWRITE_OPTIONS.map(({ style, label }) => (
                      <DropdownMenuItem key={style} onClick={() => rewrite(i, style)}>
                        {label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => (bullet.trim() ? setConfirmIndex(i) : remove(i))}
                  title="Remove bullet"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </SortableItem>
          ))}
        </div>
      </SortableList>
      <Button variant="outline" size="xs" onClick={add}>
        <Plus className="mr-1 h-3 w-3" /> Add bullet
      </Button>
      <ConfirmDialog
        open={confirmIndex !== null}
        onOpenChange={(open) => !open && setConfirmIndex(null)}
        title="Remove this bullet point?"
        description="You can undo with Ctrl+Z while the editor is open."
        confirmLabel="Remove"
        onConfirm={() => {
          if (confirmIndex !== null) remove(confirmIndex);
          setConfirmIndex(null);
        }}
      />
    </div>
  );
}
