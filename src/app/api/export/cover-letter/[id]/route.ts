import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { mintPrintToken } from "@/lib/print-token";
import { renderPageToPdf } from "@/lib/pdf/browser";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;
  const letter = await prisma.coverLetter.findUnique({ where: { id } });
  if (!letter || letter.userId !== session.user.id) {
    return new NextResponse("Not found", { status: 404 });
  }

  const token = mintPrintToken(`cover-letter:${id}`);
  const printUrl = new URL(`/print/cover-letter/${id}?token=${token}`, req.nextUrl.origin);

  const pdf = await renderPageToPdf(printUrl.toString());

  const filename = `${letter.title.replace(/[^\w\- ]+/g, "").trim() || "cover-letter"}.pdf`;
  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
