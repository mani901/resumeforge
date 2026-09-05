import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NewResumeButton } from "@/components/dashboard/new-resume-button";
import { ImportResumeButton } from "@/components/dashboard/import-resume-button";
import { ResumeCard } from "@/components/dashboard/resume-card";
import { FileText } from "lucide-react";

export const metadata = { title: "Resumes" };

export default async function ResumesPage() {
  const session = await auth();
  const resumes = await prisma.resume.findMany({
    where: { userId: session!.user.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, templateId: true, updatedAt: true },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Resumes</h1>
          <p className="text-sm text-muted-foreground">
            {resumes.length === 0 ? "Create your first resume" : `${resumes.length} resume${resumes.length > 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ImportResumeButton />
          <NewResumeButton />
        </div>
      </div>

      {resumes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-24 text-center">
          <FileText className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">No resumes yet. Start blank or import your existing one.</p>
          <div className="flex items-center gap-2">
            <ImportResumeButton />
            <NewResumeButton />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((r) => (
            <ResumeCard key={r.id} resume={{ ...r, updatedAt: r.updatedAt.toISOString() }} />
          ))}
        </div>
      )}
    </div>
  );
}
