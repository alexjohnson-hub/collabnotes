
"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { NoteEditor } from "@/components/notes/note-editor";
import { useNotes } from "@/hooks/use-notes";
import { useUser } from "@/firebase";

export default function Home() {
  const { isUserLoading } = useUser();
  const { activeNote } = useNotes();

  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-2xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
     <AppLayout>
      {activeNote ? <NoteEditor key={activeNote.id} /> : undefined}
    </AppLayout>
  );
}
