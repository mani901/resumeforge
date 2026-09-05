import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { auth } from "@/auth";
import { getModel } from "@/lib/ai/provider";
import { logUsage } from "@/lib/ai/usage";
import { aiErrorResponse } from "@/lib/ai/errors";
import { tailorPrompt, resumeToAnnotatedText } from "@/lib/ai/prompts";
import { tailorSuggestionsSchema } from "@/lib/ai/tailor";
import { resumeContentSchema } from "@/lib/schemas/resume";

const bodySchema = z.object({
  content: resumeContentSchema,
  jdText: z.string().min(30),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
  const userId = session.user.id;

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return new NextResponse("Bad request", { status: 400 });

  try {
    const { object, usage } = await generateObject({
      model: getModel(),
      schema: tailorSuggestionsSchema,
      prompt: tailorPrompt(resumeToAnnotatedText(parsed.data.content), parsed.data.jdText),
    });
    await logUsage(userId, "tailor", usage);
    return NextResponse.json(object);
  } catch (error) {
    return aiErrorResponse(error);
  }
}
