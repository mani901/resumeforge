import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPrintToken } from "@/lib/print-token";
import {
  resumeContentSchema,
  templateSettingsSchema,
} from "@/lib/schemas/resume";
import { getTemplate } from "@/templates/registry";

export default async function PrintResumePage({
  params,
  searchParams,
}: {
  params: Promise<{ resumeId: string }>;
  searchParams: Promise<{ token?: string; snapshot?: string }>;
}) {
  const { resumeId } = await params;
  const { token, snapshot: snapshotId } = await searchParams;

  if (!token || !verifyPrintToken(resumeId, token)) notFound();

  let raw: { content: unknown; settings: unknown; templateId: string } | null = null;
  if (snapshotId) {
    const snapshot = await prisma.resumeSnapshot.findUnique({ where: { id: snapshotId } });
    if (snapshot?.resumeId === resumeId) raw = snapshot;
  } else {
    raw = await prisma.resume.findUnique({ where: { id: resumeId } });
  }
  if (!raw) notFound();

  const content = resumeContentSchema.safeParse(raw.content);
  const settings = templateSettingsSchema.safeParse(raw.settings);
  if (!content.success || !settings.success) notFound();

  const Template = getTemplate(raw.templateId).component;
  return (
    <>
      <style>{`@page { size: A4; margin: ${settings.data.pageMargin}mm 0; }`}</style>
      <Template content={content.data} settings={settings.data} mode="print" />
    </>
  );
}
