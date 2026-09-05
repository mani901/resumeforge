"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ImportResumeButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [pasted, setPasted] = useState("");
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function runImport(form: FormData) {
    setImporting(true);
    try {
      const res = await fetch("/api/import", { method: "POST", body: form });
      if (!res.ok) throw new Error(await res.text());
      const { resumeId } = await res.json();
      toast.success("Resume imported — review every section before sending it anywhere");
      setOpen(false);
      router.push(`/editor/${resumeId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Import failed");
    } finally {
      setImporting(false);
    }
  }

  function importFile() {
    if (!file) {
      toast.error("Choose a file first");
      return;
    }
    const form = new FormData();
    form.append("file", file);
    runImport(form);
  }

  function importText() {
    if (pasted.trim().length < 100) {
      toast.error("Paste your full resume text first");
      return;
    }
    const form = new FormData();
    form.append("text", pasted);
    runImport(form);
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Upload className="mr-1 h-4 w-4" /> Import
      </Button>
      <Dialog open={open} onOpenChange={(v) => !importing && setOpen(v)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import existing resume</DialogTitle>
            <DialogDescription>
              AI extracts your details into the editor. Works best with text-based PDFs (not scans).
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="file">
            <TabsList className="w-full">
              <TabsTrigger value="file" className="flex-1">
                Upload file
              </TabsTrigger>
              <TabsTrigger value="paste" className="flex-1">
                Paste text
              </TabsTrigger>
            </TabsList>

            <TabsContent value="file" className="pt-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                hidden
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-8 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/50"
              >
                <FileUp className="h-6 w-6" />
                {file ? (
                  <span className="font-medium text-foreground">{file.name}</span>
                ) : (
                  <span>Click to choose a PDF, DOCX, or TXT (max 5 MB)</span>
                )}
              </button>
              <DialogFooter className="mt-4">
                <Button onClick={importFile} disabled={importing || !file}>
                  {importing && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                  {importing ? "Importing…" : "Import"}
                </Button>
              </DialogFooter>
            </TabsContent>

            <TabsContent value="paste" className="pt-3">
              <Textarea
                rows={9}
                value={pasted}
                onChange={(e) => setPasted(e.target.value)}
                placeholder="Paste the full text of your resume here…"
                className="text-sm"
              />
              <DialogFooter className="mt-4">
                <Button onClick={importText} disabled={importing || pasted.trim().length < 100}>
                  {importing && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                  {importing ? "Importing…" : "Import"}
                </Button>
              </DialogFooter>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
