import { prisma } from "@/lib/prisma";
import { getProviderInfo } from "@/lib/ai/provider";

export async function logUsage(
  userId: string,
  feature: string,
  usage: { inputTokens?: number; outputTokens?: number } | undefined
) {
  const { provider, model } = getProviderInfo();
  try {
    await prisma.aiUsage.create({
      data: {
        userId,
        feature,
        provider,
        model,
        inputTokens: usage?.inputTokens ?? 0,
        outputTokens: usage?.outputTokens ?? 0,
      },
    });
  } catch (error) {
    console.error("Failed to log AI usage", error);
  }
}
