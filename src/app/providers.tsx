"use client";

import { NotesProvider } from "@/hooks/use-notes";
import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      <NotesProvider>{children}</NotesProvider>
    </TooltipProvider>
  );
}
