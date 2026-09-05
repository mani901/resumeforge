import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  defaultTemplateSettings,
  personalSchema,
  templateSettingsSchema,
  type Personal,
} from "@/lib/schemas/resume";
import { CoverLetterEditor } from "@/components/cover-letters/cover-letter-editor";

export const metadata = { title: "Cover Letter" };

export default async function CoverLetterPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const userId = session!.user.id;
  const { id } = await params;

  const letter = await prisma.coverLetter.findUnique({ where: { id } });
  if (!letter || letter.userId !== userId) notFound();

  const [resumes, applications] = await Promise.all([
    prisma.resume.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, content: true },
    }),
    prisma.jobApplication.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: { id: true, company: true, role: true },
    }),
  ]);

  const personalByResume: Record<string, Personal> = {};
  for (const r of resumes) {
    const parsed = personalSchema.safeParse((r.content as { personal?: unknown })?.personal);
    if (parsed.success) personalByResume[r.id] = parsed.data;
  }

  const settings = templateSettingsSchema.safeParse(letter.settings);

  return (
    <CoverLetterEditor
      letter={{
        id: letter.id,
        title: letter.title,
        body: letter.body,
        resumeId: letter.resumeId,
        applicationId: letter.applicationId,
        settings: settings.success ? settings.data : defaultTemplateSettings(),
      }}
      resumes={resumes.map((r) => ({ id: r.id, title: r.title }))}
      applications={applications}
      personalByResume={personalByResume}
    />
  );
}
