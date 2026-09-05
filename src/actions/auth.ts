"use server";

import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/auth";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type AuthResult = { error?: string };

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with this email already exists" };

  await prisma.user.create({
    data: { name, email, passwordHash: await hash(password, 10) },
  });

  return loginUser({ email, password });
}

export async function loginUser(data: {
  email: string;
  password: string;
  callbackUrl?: string;
}): Promise<AuthResult> {
  try {
    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirectTo: data.callbackUrl || "/resumes",
    });
    return {};
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (error instanceof AuthError && error.type === "CredentialsSignin") {
      return { error: "Invalid email or password" };
    }
    return { error: "Something went wrong. Please try again." };
  }
}

export async function loginWithGoogle() {
  await signIn("google", { redirectTo: "/resumes" });
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}
