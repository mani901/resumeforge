import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { z } from "zod";
import { auth } from "@/auth";
import { getModel } from "@/lib/ai/provider";
import { logUsage } from "@/lib/ai/usage";
import { summaryPrompt, resumeToPlainText } from "@/lib/ai/prompts";
import { resumeContentSchema } from "@/lib/schemas/resume";

const bodySchema = z.object({ content: resumeContentSchema });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
  const userId = session.user.id;

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return new NextResponse("Bad request", { status: 400 });

  const result = streamText({
    model: getModel(),
    prompt: summaryPrompt(resumeToPlainText(parsed.data.content)),
    onFinish: ({ usage }) => logUsage(userId, "summary", usage),
  });

  return result.toTextStreamResponse();
}
