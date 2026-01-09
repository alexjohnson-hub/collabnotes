"use client";

import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Header } from "@/components/common/header";
import { NoteList } from "@/components/notes/note-list";
import { NoteEditor } from "@/components/notes/note-editor";
import { useNotes } from "@/hooks/use-notes";

export function AppLayout() {
  const { activeNote } = useNotes();
  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="icon" className="border-r">
        <NoteList />
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex-1 p-4 md:p-6">
          {activeNote ? <NoteEditor key={activeNote.id} /> : <EmptyState />}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed bg-card/50">
      <div className="text-center">
        <h2 className="text-2xl font-semibold tracking-tight font-headline">No Note Selected</h2>
        <p className="mt-2 text-muted-foreground">
          Create a new note or select one from the list to get started.
        </p>
      </div>
    </div>
  );
}
