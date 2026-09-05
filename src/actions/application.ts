"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ApplicationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth-helpers";

const applicationInputSchema = z.object({
  company: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  status: z.nativeEnum(ApplicationStatus).default("SAVED"),
  jobUrl: z.string().default(""),
  jdText: z.string().default(""),
  notes: z.string().default(""),
  resumeId: z.string().nullable().default(null),
});

export type ApplicationInput = z.input<typeof applicationInputSchema>;

async function ownedApplication(id: string, userId: string) {
  const app = await prisma.jobApplication.findUnique({ where: { id } });
  if (!app || app.userId !== userId) throw new Error("Application not found");
  return app;
}

async function validateResumeOwnership(resumeId: string | null, userId: string) {
  if (!resumeId) return null;
  const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
  return resume?.userId === userId ? resumeId : null;
}

export async function createApplication(input: ApplicationInput) {
  const userId = await requireUserId();
  const data = applicationInputSchema.parse(input);
  data.resumeId = await validateResumeOwnership(data.resumeId, userId);

  await prisma.jobApplication.create({
    data: {
      ...data,
      userId,
      appliedAt: data.status === "APPLIED" ? new Date() : null,
    },
  });
  revalidatePath("/tracker");
}

export async function updateApplication(id: string, input: ApplicationInput) {
  const userId = await requireUserId();
  await ownedApplication(id, userId);
  const data = applicationInputSchema.parse(input);
  data.resumeId = await validateResumeOwnership(data.resumeId, userId);

  await prisma.jobApplication.update({ where: { id }, data });
  revalidatePath("/tracker");
}

export async function setApplicationStatus(id: string, status: ApplicationStatus) {
  const userId = await requireUserId();
  const app = await ownedApplication(id, userId);

  await prisma.jobApplication.update({
    where: { id },
    data: {
      status,
      appliedAt: status === "APPLIED" && !app.appliedAt ? new Date() : app.appliedAt,
    },
  });
  revalidatePath("/tracker");
}

export async function markResumeSent(id: string) {
  const userId = await requireUserId();
  const app = await ownedApplication(id, userId);
  if (!app.resumeId) throw new Error("Link a resume first");

  const resume = await prisma.resume.findUnique({ where: { id: app.resumeId } });
  if (!resume || resume.userId !== userId) throw new Error("Resume not found");

  const snapshot = await prisma.resumeSnapshot.create({
    data: {
      resumeId: resume.id,
      content: resume.content as object,
      settings: resume.settings as object,
      templateId: resume.templateId,
      label: `Sent to ${app.company}`,
    },
  });

  await prisma.jobApplication.update({
    where: { id },
    data: {
      snapshotId: snapshot.id,
      status: app.status === "SAVED" ? "APPLIED" : app.status,
      appliedAt: app.appliedAt ?? new Date(),
    },
  });
  revalidatePath("/tracker");
}

export async function deleteApplication(id: string) {
  const userId = await requireUserId();
  await ownedApplication(id, userId);
  await prisma.jobApplication.delete({ where: { id } });
  revalidatePath("/tracker");
}
