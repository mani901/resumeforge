"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  MoreVertical,
  Pencil,
  FileText,
  Download,
  Trash2,
  ExternalLink,
  Send,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { deleteApplication, markResumeSent } from "@/actions/application";
import { createCoverLetter } from "@/actions/coverLetter";
import { Mail } from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { ApplicationRow, ResumeOption } from "@/components/tracker/tracker-board";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ApplicationCard({
  app,
  onEdit,
}: {
  app: ApplicationRow;
  resumes: ResumeOption[];
  onEdit: (app: ApplicationRow) => void;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function onMarkSent() {
    startTransition(async () => {
      try {
        await markResumeSent(app.id);
        toast.success("Resume version snapshotted for this application");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed");
      }
    });
  }

  function onDelete() {
    startTransition(async () => {
      await deleteApplication(app.id);
      toast.success("Application deleted");
    });
  }

  function tailorInEditor() {
    if (!app.resumeId) {
      toast.error("Link a resume to this application first");
      return;
    }
    try {
      localStorage.setItem("tailor-jd", app.jdText);
    } catch {}
    router.push(`/editor/${app.resumeId}`);
  }

  return (
    <div className="rounded-md border bg-background p-3 shadow-xs">
      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{app.company}</p>
          <p className="truncate text-xs text-muted-foreground">{app.role}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon-xs" className="-mr-1 -mt-1 shrink-0" />}
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(app)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            {app.jobUrl && (
              <DropdownMenuItem onClick={() => window.open(app.jobUrl, "_blank")}>
                <ExternalLink className="mr-2 h-4 w-4" /> Open job post
              </DropdownMenuItem>
            )}
            {app.resumeId && (
              <>
                <DropdownMenuItem onClick={() => router.push(`/editor/${app.resumeId}`)}>
                  <FileText className="mr-2 h-4 w-4" /> Open resume
                </DropdownMenuItem>
                {app.jdText && (
                  <DropdownMenuItem onClick={tailorInEditor}>
                    <Sparkles className="mr-2 h-4 w-4" /> Tailor resume to this JD
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={onMarkSent}>
                  <Send className="mr-2 h-4 w-4" /> Mark resume as sent
                </DropdownMenuItem>
              </>
            )}
            {app.snapshotId && app.resumeId && (
              <DropdownMenuItem
                onClick={() =>
                  window.open(`/api/export/${app.resumeId}?snapshot=${app.snapshotId}`, "_blank")
                }
              >
                <Download className="mr-2 h-4 w-4" /> Download sent version
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => startTransition(() => createCoverLetter(app.id))}>
              <Mail className="mr-2 h-4 w-4" /> Create cover letter
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => setConfirmOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {(app.resumeTitle || app.appliedAt) && (
        <div className="mt-2 space-y-0.5">
          {app.resumeTitle && (
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <FileText className="h-3 w-3" /> {app.resumeTitle}
              {app.snapshotId && <span className="text-emerald-600">• sent</span>}
            </p>
          )}
          {app.appliedAt && (
            <p className="text-xs text-muted-foreground">
              Applied {new Date(app.appliedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Delete application to ${app.company}?`}
        description="This permanently deletes the application, its notes, and its job description."
        onConfirm={onDelete}
      />
    </div>
  );
}
