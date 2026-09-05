import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPrintToken } from "@/lib/print-token";
import {
  defaultTemplateSettings,
  personalSchema,
  templateSettingsSchema,
} from "@/lib/schemas/resume";
import { CoverLetterDoc } from "@/templates/cover-letter";

export default async function PrintCoverLetterPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { id } = await params;
  const { token } = await searchParams;
  if (!token || !verifyPrintToken(`cover-letter:${id}`, token)) notFound();

  const letter = await prisma.coverLetter.findUnique({
    where: { id },
    include: { resume: { select: { content: true } } },
  });
  if (!letter) notFound();

  const personal = letter.resume
    ? personalSchema.safeParse((letter.resume.content as { personal?: unknown })?.personal)
    : null;
  const settings = templateSettingsSchema.safeParse(letter.settings);

  return (
    <CoverLetterDoc
      personal={personal?.success ? personal.data : null}
      settings={settings.success ? settings.data : defaultTemplateSettings()}
      body={letter.body}
      date={new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
    />
  );
}
