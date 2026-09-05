"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Briefcase, Mail, LogOut, Menu, X } from "lucide-react";
import { logout } from "@/actions/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/resumes", label: "Resumes", icon: FileText },
  { href: "/tracker", label: "Job Tracker", icon: Briefcase },
  { href: "/cover-letters", label: "Cover Letters", icon: Mail },
];

function NavContent({
  user,
  onNavigate,
}: {
  user: { name?: string | null; email?: string | null };
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      <Link
        href="/resumes"
        onClick={onNavigate}
        className="flex items-center gap-2 px-5 py-5 text-lg font-semibold"
      >
        <FileText className="h-5 w-5" />
        ResumeForge
      </Link>
      <nav className="flex-1 space-y-1 px-3">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname.startsWith(href)
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="border-t p-3">
        <div className="mb-2 px-2">
          <p className="truncate text-sm font-medium">{user.name ?? "Account"}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
        <form action={logout}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </form>
      </div>
    </>
  );
}

export function Sidebar({ user }: { user: { name?: string | null; email?: string | null } }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-3 md:hidden">
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
        <Link href="/resumes" className="flex items-center gap-2 font-semibold">
          <FileText className="h-5 w-5" />
          ResumeForge
        </Link>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-background shadow-xl">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-4"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>
            <NavContent user={user} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-background md:flex">
        <NavContent user={user} />
      </aside>
    </>
  );
}
