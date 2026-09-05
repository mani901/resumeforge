"use client";

import { useState } from "react";
import { Download, Printer } from "lucide-react";
import { toast } from "sonner";
import { useEditorStore } from "@/lib/stores/editor-store";
import { Button } from "@/components/ui/button";

export function ExportButtons() {
  const resumeId = useEditorStore((s) => s.resumeId);
  const [exporting, setExporting] = useState(false);

  async function exportPdf() {
    setExporting(true);
    try {
      const res = await fetch(`/api/export/${resumeId}`);
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] ?? "resume.pdf";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF exported");
    } catch {
      toast.error("Export failed. Try again.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="hidden sm:inline-flex"
        onClick={() => window.open(`/api/export/${resumeId}?view=print`, "_blank")}
      >
        <Printer className="mr-1.5 h-4 w-4" /> Print
      </Button>
      <Button size="sm" onClick={exportPdf} disabled={exporting} title="Export PDF">
        <Download className="h-4 w-4 sm:mr-1.5" />
        <span className="hidden sm:inline">{exporting ? "Exporting…" : "Export PDF"}</span>
      </Button>
    </>
  );
}
