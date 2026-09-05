import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Sidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <Sidebar user={{ name: session.user.name, email: session.user.email }} />
      <main className="min-w-0 flex-1 overflow-x-hidden bg-muted/30">{children}</main>
    </div>
  );
}
