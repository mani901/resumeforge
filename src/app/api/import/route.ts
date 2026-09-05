import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getModel } from "@/lib/ai/provider";
import { logUsage } from "@/lib/ai/usage";
import { aiErrorResponse } from "@/lib/ai/errors";
import {
  importedResumeSchema,
  importParsePrompt,
  importedToContent,
} from "@/lib/ai/import";
import { defaultTemplateSettings } from "@/lib/schemas/resume";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

async function extractFileText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const name = file.name.toLowerCase();

  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    const { extractText, getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text } = await extractText(pdf, { mergePages: true });
    return text;
  }
  if (name.endsWith(".docx")) {
    const mammoth = await import("mammoth");
    const { value } = await mammoth.extractRawText({ buffer });
    return value;
  }
  if (name.endsWith(".txt")) {
    return buffer.toString("utf-8");
  }
  throw new Error("Unsupported file type — upload a PDF, DOCX, or TXT file");
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
  const userId = session.user.id;

  let text = "";
  let sourceName = "";
  try {
    const form = await req.formData();
    const file = form.get("file");
    const pasted = form.get("text");

    if (file instanceof File && file.size > 0) {
      if (file.size > MAX_FILE_BYTES) {
        return new NextResponse("File is too large (max 5 MB)", { status: 400 });
      }
      sourceName = file.name.replace(/\.[^.]+$/, "");
      text = await extractFileText(file);
    } else if (typeof pasted === "string") {
      text = pasted;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not read the file";
    return new NextResponse(message, { status: 400 });
  }

  text = text.replace(/\s+\n/g, "\n").trim();
  if (text.length < 100) {
    return new NextResponse(
      "Couldn't extract enough text. If your PDF is a scan/image, paste the text instead.",
      { status: 400 }
    );
  }

  let object, usage;
  try {
    ({ object, usage } = await generateObject({
      model: getModel(),
      schema: importedResumeSchema,
      prompt: importParsePrompt(text.slice(0, 30_000)),
    }));
  } catch (error) {
    return aiErrorResponse(error);
  }
  await logUsage(userId, "import", usage);

  const content = importedToContent(object);
  const base = object.personal.fullName || sourceName;
  const resume = await prisma.resume.create({
    data: {
      userId,
      title: base ? `${base} (Imported)` : "Imported Resume",
      content,
      settings: defaultTemplateSettings(),
    },
  });

  return NextResponse.json({ resumeId: resume.id });
}
