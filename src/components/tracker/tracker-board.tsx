"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Briefcase } from "lucide-react";
import { toast } from "sonner";
import type { ApplicationStatus } from "@prisma/client";
import { setApplicationStatus } from "@/actions/application";
import { ApplicationDialog } from "@/components/tracker/application-dialog";
import { ApplicationCard } from "@/components/tracker/application-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ApplicationRow {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  jobUrl: string;
  jdText: string;
  notes: string;
  resumeId: string | null;
  snapshotId: string | null;
  appliedAt: string | null;
  resumeTitle: string | null;
}

export interface ResumeOption {
  id: string;
  title: string;
}

const COLUMNS: { status: ApplicationStatus; label: string; dot: string }[] = [
  { status: "SAVED", label: "Saved", dot: "bg-zinc-400" },
  { status: "APPLIED", label: "Applied", dot: "bg-blue-500" },
  { status: "INTERVIEWING", label: "Interviewing", dot: "bg-amber-500" },
  { status: "OFFER", label: "Offer", dot: "bg-emerald-500" },
  { status: "REJECTED", label: "Rejected", dot: "bg-red-400" },
];

function DraggableCard({
  app,
  resumes,
  onEdit,
}: {
  app: ApplicationRow;
  resumes: ResumeOption[];
  onEdit: (app: ApplicationRow) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: app.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(isDragging && "z-20 opacity-90")}
      {...attributes}
      {...listeners}
    >
      <ApplicationCard app={app} resumes={resumes} onEdit={onEdit} />
    </div>
  );
}

function Column({
  status,
  label,
  dot,
  apps,
  resumes,
  onEdit,
}: {
  status: ApplicationStatus;
  label: string;
  dot: string;
  apps: ApplicationRow[];
  resumes: ResumeOption[];
  onEdit: (app: ApplicationRow) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-0 w-64 shrink-0 flex-col rounded-lg border bg-muted/40 transition-colors",
        isOver && "border-primary/60 bg-primary/5"
      )}
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        <span className={cn("h-2 w-2 rounded-full", dot)} />
        <span className="text-sm font-medium">{label}</span>
        <span className="ml-auto text-xs text-muted-foreground">{apps.length}</span>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto px-2 pb-2">
        {apps.map((app) => (
          <DraggableCard key={app.id} app={app} resumes={resumes} onEdit={onEdit} />
        ))}
      </div>
    </div>
  );
}

export function TrackerBoard({
  applications,
  resumes,
}: {
  applications: ApplicationRow[];
  resumes: ResumeOption[];
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ApplicationRow | null>(null);
  const [optimistic, setOptimistic] = useState<Record<string, ApplicationStatus>>({});
  const [, startTransition] = useTransition();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const appId = String(active.id);
    const status = String(over.id) as ApplicationStatus;
    const app = applications.find((a) => a.id === appId);
    if (!app || app.status === status) return;

    setOptimistic((o) => ({ ...o, [appId]: status }));
    startTransition(async () => {
      try {
        await setApplicationStatus(appId, status);
      } catch {
        toast.error("Failed to update status");
      } finally {
        setOptimistic((o) => {
          const rest = { ...o };
          delete rest[appId];
          return rest;
        });
      }
    });
  }

  function openEdit(app: ApplicationRow) {
    setEditing(app);
    setDialogOpen(true);
  }

  const withStatus = applications.map((a) => ({ ...a, status: optimistic[a.id] ?? a.status }));

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Job Tracker</h1>
          <p className="text-sm text-muted-foreground">
            {applications.length === 0
              ? "Track every application and the exact resume you sent"
              : `${applications.length} application${applications.length > 1 ? "s" : ""}`}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-1 h-4 w-4" /> New application
        </Button>
      </div>

      {applications.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-24 text-center">
          <Briefcase className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">No applications yet. Add the first job you&apos;re eyeing.</p>
        </div>
      ) : (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto pb-2">
            {COLUMNS.map(({ status, label, dot }) => (
              <Column
                key={status}
                status={status}
                label={label}
                dot={dot}
                apps={withStatus.filter((a) => a.status === status)}
                resumes={resumes}
                onEdit={openEdit}
              />
            ))}
          </div>
        </DndContext>
      )}

      <ApplicationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        application={editing}
        resumes={resumes}
      />
    </>
  );
}
