import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { z } from "zod";
import { auth } from "@/auth";
import { getModel } from "@/lib/ai/provider";
import { logUsage } from "@/lib/ai/usage";
import { rewriteBulletPrompt, REWRITE_STYLES } from "@/lib/ai/prompts";

const bodySchema = z.object({
  bullet: z.string().min(1),
  style: z.enum(Object.keys(REWRITE_STYLES) as [string, ...string[]]).default("improve"),
  resumeContext: z.string().default(""),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
  const userId = session.user.id;

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return new NextResponse("Bad request", { status: 400 });
  const { bullet, style, resumeContext } = parsed.data;

  const result = streamText({
    model: getModel(),
    prompt: rewriteBulletPrompt(bullet, style as keyof typeof REWRITE_STYLES, resumeContext),
    onFinish: ({ usage }) => logUsage(userId, "bullet_rewrite", usage),
  });

  return result.toTextStreamResponse();
}
