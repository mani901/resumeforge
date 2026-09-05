"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth-helpers";
import {
  defaultResumeContent,
  defaultTemplateSettings,
  resumeContentSchema,
  templateSettingsSchema,
} from "@/lib/schemas/resume";

async function ownedResume(id: string, userId: string) {
  const resume = await prisma.resume.findUnique({ where: { id } });
  if (!resume || resume.userId !== userId) throw new Error("Resume not found");
  return resume;
}

export async function createResume() {
  const userId = await requireUserId();
  const resume = await prisma.resume.create({
    data: {
      userId,
      content: defaultResumeContent(),
      settings: defaultTemplateSettings(),
    },
  });
  redirect(`/editor/${resume.id}`);
}

export async function saveResume(data: {
  id: string;
  title: string;
  content: unknown;
  settings: unknown;
  templateId: string;
}) {
  const userId = await requireUserId();
  await ownedResume(data.id, userId);

  const content = resumeContentSchema.parse(data.content);
  const settings = templateSettingsSchema.parse(data.settings);

  await prisma.resume.update({
    where: { id: data.id },
    data: { title: data.title, content, settings, templateId: data.templateId },
  });
}

export async function renameResume(id: string, title: string) {
  const userId = await requireUserId();
  await ownedResume(id, userId);
  await prisma.resume.update({ where: { id }, data: { title } });
  revalidatePath("/resumes");
}

export async function duplicateResume(id: string) {
  const userId = await requireUserId();
  const resume = await ownedResume(id, userId);
  await prisma.resume.create({
    data: {
      userId,
      title: `${resume.title} (Copy)`,
      content: resume.content as object,
      settings: resume.settings as object,
      templateId: resume.templateId,
    },
  });
  revalidatePath("/resumes");
}

export async function deleteResume(id: string) {
  const userId = await requireUserId();
  await ownedResume(id, userId);
  await prisma.resume.delete({ where: { id } });
  revalidatePath("/resumes");
}
