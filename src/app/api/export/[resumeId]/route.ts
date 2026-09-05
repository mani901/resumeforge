import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { mintPrintToken } from "@/lib/print-token";
import { renderPageToPdf } from "@/lib/pdf/browser";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ resumeId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const { resumeId } = await params;
  const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
  if (!resume || resume.userId !== session.user.id) {
    return new NextResponse("Not found", { status: 404 });
  }

  const snapshotId = req.nextUrl.searchParams.get("snapshot");
  if (snapshotId) {
    const snapshot = await prisma.resumeSnapshot.findUnique({ where: { id: snapshotId } });
    if (!snapshot || snapshot.resumeId !== resumeId) {
      return new NextResponse("Not found", { status: 404 });
    }
  }

  const token = mintPrintToken(resumeId);
  const printUrl = new URL(`/print/${resumeId}?token=${token}`, req.nextUrl.origin);
  if (snapshotId) printUrl.searchParams.set("snapshot", snapshotId);

  if (req.nextUrl.searchParams.get("view") === "print") {
    return NextResponse.redirect(printUrl);
  }

  const pdf = await renderPageToPdf(printUrl.toString());

  if (!snapshotId) {
    await prisma.resumeSnapshot.create({
      data: {
        resumeId,
        content: resume.content as object,
        settings: resume.settings as object,
        templateId: resume.templateId,
        label: "PDF export",
      },
    });
  }

  const filename = `${resume.title.replace(/[^\w\- ]+/g, "").trim() || "resume"}.pdf`;
  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
