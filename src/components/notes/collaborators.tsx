
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

  const ownerId = useMemo(
    () => (activeNote?.ownerId ? [activeNote.ownerId] : []),
    [activeNote]
  );

  const ownerQuery = useMemoFirebase(
    () =>
      ownerId.length > 0 && firestore
        ? query(collection(firestore, "users"), where("id", "in", ownerId))
        : null,
    [firestore, ownerId]
  );

  const { data: owner } = useCollection<
    { id: string; email: string; photoURL?: string; displayName?: string }
  >(ownerQuery);

  if (!activeNote || !owner || owner.length === 0) {
    return null;
  }

  const noteOwner = owner[0];

  return (
    <div className="flex items-center -space-x-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Avatar className="border-2 border-background">
            <AvatarImage
              src={noteOwner.photoURL}
              alt={noteOwner.displayName || noteOwner.email}
            />
            <AvatarFallback>
              {noteOwner.displayName?.[0] || noteOwner.email[0]}
            </AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-semibold">Owner</p>
          <p>{noteOwner.displayName || noteOwner.email}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
