"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth-helpers";
import { defaultTemplateSettings, templateSettingsSchema } from "@/lib/schemas/resume";

async function ownedCoverLetter(id: string, userId: string) {
  const letter = await prisma.coverLetter.findUnique({ where: { id } });
  if (!letter || letter.userId !== userId) throw new Error("Cover letter not found");
  return letter;
}

export async function createCoverLetter(applicationId?: string) {
  const userId = await requireUserId();

  let resumeId: string | null = null;
  let title = "Untitled Cover Letter";
  let settings: object = defaultTemplateSettings();
  let templateId = "ats-classic";
  let appId: string | null = null;

  if (applicationId) {
    const app = await prisma.jobApplication.findUnique({ where: { id: applicationId } });
    if (app && app.userId === userId) {
      appId = app.id;
      resumeId = app.resumeId;
      title = `${app.company} — ${app.role}`;
      if (app.resumeId) {
        const resume = await prisma.resume.findUnique({ where: { id: app.resumeId } });
        if (resume) {
          settings = resume.settings as object;
          templateId = resume.templateId;
        }
      }
    }
  }

  const letter = await prisma.coverLetter.create({
    data: { userId, applicationId: appId, resumeId, title, settings, templateId },
  });
  redirect(`/cover-letters/${letter.id}`);
}

export async function saveCoverLetter(data: {
  id: string;
  title: string;
  body: string;
  resumeId: string | null;
  applicationId: string | null;
}) {
  const userId = await requireUserId();
  await ownedCoverLetter(data.id, userId);

  let settingsUpdate: { settings?: object; templateId?: string } = {};
  if (data.resumeId) {
    const resume = await prisma.resume.findUnique({ where: { id: data.resumeId } });
    if (!resume || resume.userId !== userId) data.resumeId = null;
    else settingsUpdate = { settings: resume.settings as object, templateId: resume.templateId };
  }
  if (data.applicationId) {
    const app = await prisma.jobApplication.findUnique({ where: { id: data.applicationId } });
    if (!app || app.userId !== userId) data.applicationId = null;
  }

  await prisma.coverLetter.update({
    where: { id: data.id },
    data: {
      title: data.title,
      body: data.body,
      resumeId: data.resumeId,
      applicationId: data.applicationId,
      ...settingsUpdate,
    },
  });
}

export async function deleteCoverLetter(id: string) {
  const userId = await requireUserId();
  await ownedCoverLetter(id, userId);
  await prisma.coverLetter.delete({ where: { id } });
  revalidatePath("/cover-letters");
}

export async function updateCoverLetterSettings(id: string, settings: unknown) {
  const userId = await requireUserId();
  await ownedCoverLetter(id, userId);
  await prisma.coverLetter.update({
    where: { id },
    data: { settings: templateSettingsSchema.parse(settings) },
  });
}
