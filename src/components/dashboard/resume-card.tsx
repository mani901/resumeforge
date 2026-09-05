"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { FileText, MoreVertical, Pencil, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { renameResume, duplicateResume, deleteResume } from "@/actions/resume";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ResumeSummary = { id: string; title: string; templateId: string; updatedAt: string };

export function ResumeCard({ resume }: { resume: ResumeSummary }) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [title, setTitle] = useState(resume.title);
  const [, startTransition] = useTransition();

  function onRename() {
    setRenameOpen(false);
    startTransition(async () => {
      await renameResume(resume.id, title.trim() || "Untitled Resume");
      toast.success("Resume renamed");
    });
  }

  function onDuplicate() {
    startTransition(async () => {
      await duplicateResume(resume.id);
      toast.success("Resume duplicated");
    });
  }

  function onDelete() {
    setDeleteOpen(false);
    startTransition(async () => {
      await deleteResume(resume.id);
      toast.success("Resume deleted");
    });
  }

  return (
    <>
      <Card className="group relative gap-0 p-0 transition-shadow hover:shadow-md">
        <Link href={`/editor/${resume.id}`} className="block p-5">
          <FileText className="h-8 w-8 text-muted-foreground" />
          <p className="mt-3 truncate font-medium">{resume.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Edited {new Date(resume.updatedAt).toLocaleDateString()}
          </p>
        </Link>
        <div className="absolute right-3 top-3">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100" />
              }
            >
              <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setRenameOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" /> Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="mr-2 h-4 w-4" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename resume</DialogTitle>
          </DialogHeader>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onRename()}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onRename}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{resume.title}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the resume and its version history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
