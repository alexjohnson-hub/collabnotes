"use client";

import { NotesProvider } from "@/hooks/use-notes";
import type { ReactNode } from "react";

export function AppProviders({ children }: { children: ReactNode }) {
  return <NotesProvider>{children}</NotesProvider>;
}
