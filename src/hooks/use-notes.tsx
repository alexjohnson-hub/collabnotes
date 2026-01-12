
"use client";

import * as React from "react";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
  useReducer,
  useMemo,
} from "react";
import type { Note, NoteVersion } from "@/lib/types";
import {
  useCollection,
  useFirebase,
  useMemoFirebase,
  useUser,
} from "@/firebase";
import {
  addDocumentNonBlocking,
  deleteDocumentNonBlocking,
  setDocumentNonBlocking,
} from "@/firebase/non-blocking-updates";
import {
  collection,
  doc,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

interface NotesState {
  notes: Note[];
  activeNoteId: string | null;
}

type Action =
  | { type: "SET_NOTES"; payload: Note[] }
  | { type: "ADD_NOTE" }
  | { type: "DELETE_NOTE"; payload: string }
  | { type: "SELECT_NOTE"; payload: string | null }
  | { type: "UPDATE_NOTE_TITLE"; payload: { id: string; title: string } }
  | { type: "UPDATE_NOTE_CONTENT"; payload: { id: string; content: string } }
  | { type: "RESTORE_VERSION"; payload: { noteId: string; versionId: string } }
  | {
      type: "ADD_COLLABORATOR";
      payload: { noteId: string; collaboratorId: string };
    };

const NotesContext = createContext<
  | (NotesState & {
      dispatch: React.Dispatch<Action>;
      activeNote: Note | undefined;
    })
  | null
>(null);

const notesReducer = (state: NotesState, action: Action): NotesState => {
  switch (action.type) {
    case "SET_NOTES": {
        const newNotes = action.payload;
        // If there's no active note, or the active note is no longer in the list,
        // select the first note from the new list.
        const activeNoteExists = newNotes.some(note => note.id === state.activeNoteId);
        return {
          ...state,
          notes: newNotes,
          activeNoteId: activeNoteExists ? state.activeNoteId : (newNotes[0]?.id ?? null),
        };
      }
    case "SELECT_NOTE":
      return { ...state, activeNoteId: action.payload };
    default:
      return state;
  }
};

export const NotesProvider = ({ children }: { children: ReactNode }) => {
  const { firestore } = useFirebase();
  const { user } = useUser();

  const [state, dispatch] = useReducer(notesReducer, {
    notes: [],
    activeNoteId: null,
  });

  // Query for notes where the user is the owner
  const ownedNotesQuery = useMemoFirebase(
    () =>
      user && firestore
        ? query(
            collection(firestore, "notes"),
            where("ownerId", "==", user.uid),
            orderBy("createdAt", "desc")
          )
        : null,
    [firestore, user]
  );
  const { data: ownedNotes } = useCollection<Note>(ownedNotesQuery);

  // Query for notes where the user is a collaborator
  const collaborativeNotesQuery = useMemoFirebase(
    () =>
      user && firestore
        ? query(
            collection(firestore, "notes"),
            where("collaboratorIds", "array-contains", user.uid),
            orderBy("createdAt", "desc")
          )
        : null,
    [firestore, user]
  );
  const { data: collaborativeNotes } = useCollection<Note>(collaborativeNotesQuery);

  useEffect(() => {
    // Combine and deduplicate owned and collaborative notes
    const allNotes = [
      ...(ownedNotes || []),
      ...(collaborativeNotes || []),
    ];

    const uniqueNotes = Array.from(new Map(allNotes.map(note => [note.id, note])).values());
    
    // Sort all notes by creation date
    uniqueNotes.sort((a, b) => {
        const dateA = (a.createdAt as any)?.toDate ? (a.createdAt as any).toDate() : a.createdAt;
        const dateB = (b.createdAt as any)?.toDate ? (b.createdAt as any).toDate() : b.createdAt;
        return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
    });

    const processedNotes = uniqueNotes.map(note => ({
      ...note,
      createdAt: (note.createdAt as any)?.toDate(),
      versions: note.versions.map(v => ({
          ...v,
          timestamp: (v.timestamp as any)?.toDate(),
      }))
    }));
    
    dispatch({ type: "SET_NOTES", payload: processedNotes });

  }, [ownedNotes, collaborativeNotes]);


  const handleAction = (action: Action) => {
    if (!user || !firestore) return;

    const { type, payload } = action;

    switch (type) {
      case "ADD_NOTE": {
        const newNote = {
          title: "Untitled Note",
          ownerId: user.uid,
          collaboratorIds: [],
          createdAt: serverTimestamp(),
          versions: [
            { id: `v-${Date.now()}`, content: "", timestamp: serverTimestamp() },
          ],
        };
        addDocumentNonBlocking(collection(firestore, "notes"), newNote).then(
          (docRef) => {
            if (docRef) {
              dispatch({ type: "SELECT_NOTE", payload: docRef.id });
            }
          }
        );
        break;
      }
      case "DELETE_NOTE": {
        deleteDocumentNonBlocking(doc(firestore, "notes", payload as string));
        break;
      }
      case "UPDATE_NOTE_TITLE": {
        const { id, title } = payload as { id: string; title: string };
        setDocumentNonBlocking(doc(firestore, "notes", id), { title }, { merge: true });
        break;
      }
      case "UPDATE_NOTE_CONTENT": {
        const { id, content } = payload as { id: string; content: string };
        const note = state.notes.find((n) => n.id === id);
        if (note) {
          const newVersion: NoteVersion = {
            id: `v-${Date.now()}`,
            content: content,
            timestamp: serverTimestamp() as any,
          };
          const updatedVersions = [newVersion, ...note.versions].slice(0, 20);
          setDocumentNonBlocking(
            doc(firestore, "notes", id),
            { versions: updatedVersions },
            { merge: true }
          );
        }
        break;
      }
      case "RESTORE_VERSION": {
        const { noteId, versionId } = payload as { noteId: string, versionId: string };
        const note = state.notes.find((n) => n.id === noteId);
        const versionToRestore = note?.versions.find((v) => v.id === versionId);
        if (note && versionToRestore) {
           const newVersion: NoteVersion = {
              id: `v-${Date.now()}`,
              content: versionToRestore.content,
              timestamp: serverTimestamp() as any,
            };
            const updatedVersions = [newVersion, ...note.versions].slice(0, 20);
            setDocumentNonBlocking(doc(firestore, "notes", noteId), { versions: updatedVersions }, { merge: true });
        }
        break;
      }
      case "ADD_COLLABORATOR": {
        const { noteId, collaboratorId } = payload as {noteId: string, collaboratorId: string};
        const note = state.notes.find((n) => n.id === noteId);
        if (note) {
            const newCollaborators = [...(note.collaboratorIds || []), collaboratorId];
            setDocumentNonBlocking(doc(firestore, "notes", noteId), { collaboratorIds: newCollaborators }, { merge: true });
        }
        break;
      }
      case "SELECT_NOTE": {
        dispatch(action);
        break;
      }
    }
  };

  const activeNote = useMemo(() => state.notes.find((note) => note.id === state.activeNoteId), [state.notes, state.activeNoteId]);

  return (
    <NotesContext.Provider value={{ ...state, dispatch: handleAction, activeNote }}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error("useNotes must be used within a NotesProvider");
  }
  return context;
};

    