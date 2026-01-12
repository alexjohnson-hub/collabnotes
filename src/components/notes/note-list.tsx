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
  const [timeAgo, setTimeAgo] = React.useState("");

  React.useEffect(() => {
    // Check if note.createdAt is a valid date or can be converted to one
    if (note.createdAt) {
      try {
        const date =
          note.createdAt instanceof Date
            ? note.createdAt
            : (note.createdAt as any).toDate();
        if (!isNaN(date.getTime())) {
          setTimeAgo(formatDistanceToNow(date, { addSuffix: true }));
        }
      } catch (error) {
        // console.error("Error formatting date:", error);
        setTimeAgo("a while ago");
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
        <span className="font-medium text-sm w-full truncate">{note.title}</span>
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
      note.title.toLowerCase().includes(searchQuery.toLowerCase())
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
