"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Mail, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteCoverLetter } from "@/actions/coverLetter";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function CoverLetterCard({
  letter,
}: {
  letter: { id: string; title: string; updatedAt: string; applicationLabel: string | null };
}) {
  const [, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function onDelete() {
    startTransition(async () => {
      await deleteCoverLetter(letter.id);
      toast.success("Cover letter deleted");
    });
  }

  return (
    <Card className="group relative gap-0 p-0 transition-shadow hover:shadow-md">
      <Link href={`/cover-letters/${letter.id}`} className="block p-5">
        <Mail className="h-8 w-8 text-muted-foreground" />
        <p className="mt-3 truncate font-medium">{letter.title}</p>
        <p className="mt-1 truncate text-xs text-muted-foreground">
          {letter.applicationLabel ?? "Not linked to an application"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Edited {new Date(letter.updatedAt).toLocaleDateString()}
        </p>
      </Link>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setConfirmOpen(true)}
        title="Delete"
        className="absolute right-3 top-3 opacity-0 group-hover:opacity-100"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Delete “${letter.title}”?`}
        description="This permanently deletes the cover letter."
        onConfirm={onDelete}
      />
    </Card>
  );
}
