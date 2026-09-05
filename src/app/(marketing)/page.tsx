import Link from "next/link";
import { FileText, Sparkles, Target, Download } from "lucide-react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Sparkles,
    title: "AI that works for you",
    text: "Rewrite bullets, generate summaries, and tailor your resume to any job description — with the AI provider of your choice.",
  },
  {
    icon: Target,
    title: "Beat the ATS",
    text: "A deterministic keyword match score against every job description, with a report of exactly what's missing.",
  },
  {
    icon: Download,
    title: "Pixel-perfect PDFs",
    text: "What you see is what recruiters get. Real text layer, fully parseable by applicant tracking systems.",
  },
];

export default async function LandingPage() {
  const session = await auth();
  const cta = session?.user
    ? { href: "/resumes", label: "Open dashboard" }
    : { href: "/register", label: "Get started free" };

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <FileText className="h-5 w-5" />
          ResumeForge
        </div>
        <div className="flex items-center gap-2">
          {!session?.user && (
            <Button variant="ghost" render={<Link href="/login" />}>
              Sign in
            </Button>
          )}
          <Button render={<Link href={cta.href} />}>{cta.label}</Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6">
        <section className="py-16 text-center sm:py-24">
          <h1 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl">
            The resume builder that gets you interviews
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
            Six professional templates, live preview, AI-powered tailoring, and a job tracker —
            everything you need to run a serious job hunt.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button size="lg" render={<Link href={cta.href} />}>
              {cta.label}
            </Button>
          </div>
        </section>

        <section className="grid gap-8 pb-24 md:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-lg border p-6">
              <Icon className="h-8 w-8" />
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
