"use client";

import { Button } from "@/components/ui/button";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useNotes } from "@/hooks/use-notes";
import { cn } from "@/lib/utils";
import { FilePlus, Notebook } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function NoteList() {
  const { notes, activeNoteId, dispatch } = useNotes();

  const handleNewNote = () => {
    dispatch({ type: "ADD_NOTE" });
  };

  const handleSelectNote = (id: string) => {
    dispatch({ type: "SELECT_NOTE", payload: id });
  };

  return (
    <>
      <SidebarHeader>
        <Button onClick={handleNewNote}>
          <FilePlus />
          New Note
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center">
            <Notebook />
            <span className="ml-2">All Notes</span>
          </SidebarGroupLabel>
          <SidebarMenu>
            {notes.map((note) => (
              <SidebarMenuItem key={note.id}>
                <SidebarMenuButton
                  onClick={() => handleSelectNote(note.id)}
                  isActive={note.id === activeNoteId}
                  className="h-auto flex-col items-start p-2"
                >
                  <span className="font-medium text-sm w-full truncate">{note.title}</span>
                  <span className="text-xs text-sidebar-foreground/70 w-full">
                    {formatDistanceToNow(note.createdAt, { addSuffix: true })}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </>
  );
}
