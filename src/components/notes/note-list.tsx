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
import { FilePlus, Notebook } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import * as React from "react";
import { Note } from "@/lib/types";
import { useUser } from "@/firebase";

function NoteListItem({ note }: { note: Note }) {
  const { activeNoteId, dispatch } = useNotes();
  const [timeAgo, setTimeAgo] = React.useState("just now");

  React.useEffect(() => {
    let date: Date | undefined;
    if (note.createdAt) {
      // Check if it's a Firestore Timestamp and convert it
      if (typeof (note.createdAt as any)?.toDate === 'function') {
        date = (note.createdAt as any).toDate();
      } 
      // Check if it's already a Date object
      else if (note.createdAt instanceof Date) {
        date = note.createdAt;
      }
      
      if (date && !isNaN(date.getTime())) {
        setTimeAgo(formatDistanceToNow(date, { addSuffix: true }));
        // Optional: set up an interval to update the time ago
        const interval = setInterval(() => {
          setTimeAgo(formatDistanceToNow(date!, { addSuffix: true }));
        }, 60000); // Update every minute
        return () => clearInterval(interval);
      }
    }
  }, [note.createdAt]);


  const handleSelectNote = (id: string) => {
    dispatch({ type: "SELECT_NOTE", payload: id });
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={() => handleSelectNote(note.id)}
        isActive={note.id === activeNoteId}
        className="h-auto flex-col items-start p-2"
      >
        <span className="font-medium text-sm w-full truncate">{note.title || "Untitled Note"}</span>
        <span className="text-xs text-sidebar-foreground/70 w-full">
          {timeAgo}
        </span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

interface NoteListProps {
  searchQuery: string;
}

export function NoteList({ searchQuery }: NoteListProps) {
  const { notes, dispatch } = useNotes();
  const { user } = useUser();

  const handleNewNote = () => {
    dispatch({ type: "ADD_NOTE" });
  };

  const filteredNotes = React.useMemo(() => {
    if (!searchQuery) {
      return notes;
    }
    return notes.filter((note) =>
      (note.title || "Untitled Note").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [notes, searchQuery]);

  if (!user) {
    return null;
  }


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
            {filteredNotes.map((note) => (
              <NoteListItem key={note.id} note={note} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </>
  );
}
