import Link from "next/link";
import { FileText } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-zinc-950 p-10 text-white lg:flex">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <FileText className="h-6 w-6" />
          ResumeForge
        </Link>
        <div className="space-y-3">
          <p className="text-2xl font-medium leading-snug">
            Build resumes that get past the bots and impress the humans.
          </p>
          <p className="text-sm text-zinc-400">
            Live preview, ATS-parseable PDF export, AI tailoring for every job description.
          </p>
        </div>
        <p className="text-xs text-zinc-500">Your data stays on your machine.</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
