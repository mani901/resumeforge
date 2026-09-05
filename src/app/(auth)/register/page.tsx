import Link from "next/link";
import { googleEnabled } from "@/auth";
import { RegisterForm } from "./register-form";

export const metadata = { title: "Create account — ResumeForge" };

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
        <p className="text-sm text-muted-foreground">Start building your resume in minutes</p>
      </div>
      <RegisterForm googleEnabled={googleEnabled} />
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  );
}
