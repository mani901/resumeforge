"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import type { ApplicationStatus } from "@prisma/client";
import { createApplication, updateApplication } from "@/actions/application";
import type { ApplicationRow, ResumeOption } from "@/components/tracker/tracker-board";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: "SAVED", label: "Saved" },
  { value: "APPLIED", label: "Applied" },
  { value: "INTERVIEWING", label: "Interviewing" },
  { value: "OFFER", label: "Offer" },
  { value: "REJECTED", label: "Rejected" },
];

const NONE = "__none__";

const emptyForm = {
  company: "",
  role: "",
  status: "SAVED" as ApplicationStatus,
  jobUrl: "",
  jdText: "",
  notes: "",
  resumeId: NONE,
};

export function ApplicationDialog({
  open,
  onOpenChange,
  application,
  resumes,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: ApplicationRow | null;
  resumes: ResumeOption[];
}) {
  const [form, setForm] = useState(emptyForm);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    setForm(
      application
        ? {
            company: application.company,
            role: application.role,
            status: application.status,
            jobUrl: application.jobUrl,
            jdText: application.jdText,
            notes: application.notes,
            resumeId: application.resumeId ?? NONE,
          }
        : emptyForm
    );
  }, [open, application]);

  function set<K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit() {
    if (!form.company.trim() || !form.role.trim()) {
      toast.error("Company and role are required");
      return;
    }
    const input = { ...form, resumeId: form.resumeId === NONE ? null : form.resumeId };
    startTransition(async () => {
      try {
        if (application) await updateApplication(application.id, input);
        else await createApplication(input);
        onOpenChange(false);
        toast.success(application ? "Application updated" : "Application added");
      } catch {
        toast.error("Failed to save application");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{application ? "Edit application" : "New application"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Company *</Label>
              <Input value={form.company} onChange={(e) => set("company", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Role *</Label>
              <Input value={form.role} onChange={(e) => set("role", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select
                value={form.status}
                onValueChange={(v: unknown) => set("status", v as ApplicationStatus)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Linked resume</Label>
              <Select
                value={form.resumeId}
                onValueChange={(v: unknown) => set("resumeId", v as string)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>None</SelectItem>
                  {resumes.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Job post URL</Label>
            <Input
              value={form.jobUrl}
              placeholder="https://…"
              onChange={(e) => set("jobUrl", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Job description</Label>
            <Textarea
              rows={5}
              value={form.jdText}
              placeholder="Paste the JD — used for ATS scoring, tailoring, and cover letters"
              onChange={(e) => set("jdText", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Notes</Label>
            <Textarea
              rows={2}
              value={form.notes}
              placeholder="Referral, salary range, interview dates…"
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={pending}>
            {pending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
