"use client";

import { useTransition } from "react";
import { Plus } from "lucide-react";
import { createResume } from "@/actions/resume";
import { Button } from "@/components/ui/button";

export function NewResumeButton() {
  const [pending, startTransition] = useTransition();

  return (
    <Button onClick={() => startTransition(() => createResume())} disabled={pending}>
      <Plus className="mr-1 h-4 w-4" />
      {pending ? "Creating…" : "New resume"}
    </Button>
  );
}
