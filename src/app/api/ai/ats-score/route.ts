import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { auth } from "@/auth";
import { getModel } from "@/lib/ai/provider";
import { logUsage } from "@/lib/ai/usage";
import { extractKeywordsPrompt } from "@/lib/ai/prompts";
import { jdKeywordsSchema } from "@/lib/ai/ats";
import { aiErrorResponse } from "@/lib/ai/errors";

const bodySchema = z.object({ jdText: z.string().min(30) });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
  const userId = session.user.id;

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return new NextResponse("Job description is too short", { status: 400 });
  }

  try {
    const { object, usage } = await generateObject({
      model: getModel(),
      schema: jdKeywordsSchema,
      prompt: extractKeywordsPrompt(parsed.data.jdText),
    });
    await logUsage(userId, "ats_keywords", usage);
    return NextResponse.json(object);
  } catch (error) {
    return aiErrorResponse(error);
  }
}
