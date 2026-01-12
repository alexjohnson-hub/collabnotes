
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNotes } from "@/hooks/use-notes";
import { useMemo } from "react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";

export function Collaborators() {
  const { activeNote } = useNotes();
  const firestore = useFirestore();

  const editorIds = useMemo(
    () => (activeNote?.editors ? activeNote.editors : []),
    [activeNote]
  );

  const editorsQuery = useMemoFirebase(
    () =>
      editorIds.length > 0 && firestore
        ? query(collection(firestore, "users"), where("id", "in", editorIds))
        : null,
    [firestore, editorIds]
  );

  const { data: editors } = useCollection<
    { id: string; email: string; photoURL?: string; displayName?: string }
  >(editorsQuery);

  if (!activeNote || !editors || editors.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center -space-x-2">
      {editors.map(editor => (
        <Tooltip key={editor.id}>
          <TooltipTrigger asChild>
            <Avatar className="border-2 border-background">
              <AvatarImage
                src={editor.photoURL}
                alt={editor.displayName || editor.email}
              />
              <AvatarFallback>
                {editor.displayName?.[0] || editor.email[0]}
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>
            <p>{editor.displayName || editor.email}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
