import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  defaultResumeContent,
  defaultTemplateSettings,
  resumeContentSchema,
  templateSettingsSchema,
} from "@/lib/schemas/resume";
import { EditorShell } from "@/components/editor/editor-shell";

export const metadata = { title: "Editor" };

export default async function EditorPage({
  params,
}: {
  params: Promise<{ resumeId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { resumeId } = await params;
  const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
  if (!resume || resume.userId !== session.user.id) notFound();

  const contentResult = resumeContentSchema.safeParse(resume.content);
  const settingsResult = templateSettingsSchema.safeParse(resume.settings);

  return (
    <EditorShell
      initial={{
        resumeId: resume.id,
        title: resume.title,
        templateId: resume.templateId,
        content: contentResult.success ? contentResult.data : defaultResumeContent(),
        settings: settingsResult.success ? settingsResult.data : defaultTemplateSettings(),
      }}
    />
  );
}
