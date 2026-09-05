import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getModel } from "@/lib/ai/provider";
import { logUsage } from "@/lib/ai/usage";
import { resumeToPlainText } from "@/lib/ai/prompts";
import { resumeContentSchema } from "@/lib/schemas/resume";

const bodySchema = z.object({ coverLetterId: z.string() });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
  const userId = session.user.id;

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return new NextResponse("Bad request", { status: 400 });

  const letter = await prisma.coverLetter.findUnique({
    where: { id: parsed.data.coverLetterId },
    include: { application: true, resume: true },
  });
  if (!letter || letter.userId !== userId) return new NextResponse("Not found", { status: 404 });

  let resumeText = "";
  if (letter.resume) {
    const content = resumeContentSchema.safeParse(letter.resume.content);
    if (content.success) resumeText = resumeToPlainText(content.data);
  }
  if (!resumeText) {
    return new NextResponse("Link a resume to this cover letter first", { status: 400 });
  }

  const app = letter.application;
  const jobContext = app
    ? `Company: ${app.company}\nRole: ${app.role}\n${app.jdText ? `Job description:\n${app.jdText}` : ""}`
    : "No specific job details available — write a strong general-purpose letter.";

  const result = streamText({
    model: getModel(),
    prompt: `You are an expert cover letter writer. Write a compelling, specific cover letter based on this resume and job. Rules:
- 3-4 short paragraphs, under 300 words total
- Open with genuine interest in the specific role/company, not "I am writing to apply"
- Connect 2-3 concrete achievements from the resume to the job's needs
- Confident, warm, human tone. No clichés ("team player", "fast learner"), no invented experience
- End with a brief call to action and "Best regards," followed by the candidate's name
- Output plain text paragraphs only: start with "Dear Hiring Manager," (or a better greeting if the company is known) — no date, no addresses, no subject line

RESUME:
${resumeText}

JOB:
${jobContext}`,
    onFinish: ({ usage }) => logUsage(userId, "cover_letter", usage),
  });

  return result.toTextStreamResponse();
}
