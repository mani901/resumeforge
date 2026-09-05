import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Mail } from "lucide-react";
import { NewCoverLetterButton } from "@/components/cover-letters/new-cover-letter-button";
import { CoverLetterCard } from "@/components/cover-letters/cover-letter-card";

export const metadata = { title: "Cover Letters" };

export default async function CoverLettersPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [letters, applications] = await Promise.all([
    prisma.coverLetter.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: { application: { select: { company: true, role: true } } },
    }),
    prisma.jobApplication.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: { id: true, company: true, role: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Cover Letters</h1>
          <p className="text-sm text-muted-foreground">
            {letters.length === 0
              ? "Generate letters tailored to each application"
              : `${letters.length} cover letter${letters.length > 1 ? "s" : ""}`}
          </p>
        </div>
        <NewCoverLetterButton applications={applications} />
      </div>

      {letters.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-24 text-center">
          <Mail className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">
            No cover letters yet. Create one from a job application for the best results.
          </p>
          <NewCoverLetterButton applications={applications} />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {letters.map((l) => (
            <CoverLetterCard
              key={l.id}
              letter={{
                id: l.id,
                title: l.title,
                updatedAt: l.updatedAt.toISOString(),
                applicationLabel: l.application ? `${l.application.company} — ${l.application.role}` : null,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
