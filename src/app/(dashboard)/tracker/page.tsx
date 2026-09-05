import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TrackerBoard, type ApplicationRow } from "@/components/tracker/tracker-board";

export const metadata = { title: "Job Tracker" };

export default async function TrackerPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [applications, resumes] = await Promise.all([
    prisma.jobApplication.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: { resume: { select: { title: true } } },
    }),
    prisma.resume.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true },
    }),
  ]);

  const rows: ApplicationRow[] = applications.map((a) => ({
    id: a.id,
    company: a.company,
    role: a.role,
    status: a.status,
    jobUrl: a.jobUrl ?? "",
    jdText: a.jdText ?? "",
    notes: a.notes ?? "",
    resumeId: a.resumeId,
    snapshotId: a.snapshotId,
    appliedAt: a.appliedAt?.toISOString() ?? null,
    resumeTitle: a.resume?.title ?? null,
  }));

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col px-4 py-6 sm:px-8 sm:py-8 md:h-dvh">
      <TrackerBoard applications={rows} resumes={resumes} />
    </div>
  );
}
