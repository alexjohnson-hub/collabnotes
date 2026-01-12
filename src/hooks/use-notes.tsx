
"use client";

import * as React from "react";
import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
  useReducer,
  useMemo,
  useCallback,
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
  updateDocumentNonBlocking,
} from "@/firebase/non-blocking-updates";
import {
  collection,
  doc,
  query,
  serverTimestamp,
  where,
  Timestamp,
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
  | { type: "MAKE_NOTE_PUBLIC"; payload: string };

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
        const activeNoteExists = newNotes.some(note => note.id === state.activeNoteId);
        const newActiveNoteId = activeNoteExists ? state.activeNoteId : (newNotes[0]?.id ?? null);
        return {
          ...state,
          notes: newNotes,
          activeNoteId: newActiveNoteId,
        };
      }
    case "SELECT_NOTE":
      return { ...state, activeNoteId: action.payload };
    default:
      return state;
  }
};

const toDate = (timestamp: Timestamp | Date | undefined | null): Date => {
    if (timestamp instanceof Timestamp) {
        return timestamp.toDate();
    }
    if (timestamp instanceof Date) {
        return timestamp;
    }
    return new Date();
};


export const NotesProvider = ({ children }: { children: ReactNode }) => {
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();

  const [state, dispatch] = useReducer(notesReducer, {
    notes: [],
    activeNoteId: null,
  });

  const notesQuery = useMemoFirebase(
    () =>
      user && firestore && !isUserLoading
        ? query(collection(firestore, "notes"), where("editors", "array-contains", user.uid))
        : null,
    [firestore, user, isUserLoading]
  );
  
  const { data: notesData, isLoading } = useCollection<Note>(notesQuery);

  useEffect(() => {
    if (isLoading || !notesData) {
        return;
    }

    const sortedNotes = [...notesData].sort((a, b) => {
        const dateA = toDate(a.createdAt);
        const dateB = toDate(b.createdAt);
        return dateB.getTime() - dateA.getTime();
    });
    
    const processedNotes = sortedNotes.map(note => ({
      ...note,
      createdAt: toDate(note.createdAt),
      versions: (note.versions || []).map(v => ({
          ...v,
          timestamp: toDate(v.timestamp),
      })).sort((a,b) => toDate(b.timestamp).getTime() - toDate(a.timestamp).getTime()),
    }));
    
    dispatch({ type: "SET_NOTES", payload: processedNotes });

  }, [notesData, isLoading]);


  const handleAction = useCallback((action: Action) => {
    if (!user || !firestore) return;

    const { type, payload } = action;

    switch (type) {
      case "ADD_NOTE": {
        const newVersion: NoteVersion = { id: `v-${Date.now()}`, content: "", timestamp: new Date() };
        const newNote = {
          title: "Untitled Note",
          editors: [user.uid],
          isPublic: false,
          createdAt: serverTimestamp(),
          versions: [ newVersion ],
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
        updateDocumentNonBlocking(doc(firestore, "notes", id), { title });
        break;
      }
      case "UPDATE_NOTE_CONTENT": {
        const { id, content } = payload as { id: string; content: string };
        const note = state.notes.find((n) => n.id === id);

        if (note) {
            const newVersion: NoteVersion = {
                id: `v-${Date.now()}`,
                content: content,
                timestamp: new Date(),
            };
            const updatedVersions = [newVersion, ...note.versions].slice(0, 20); 
            updateDocumentNonBlocking(
                doc(firestore, "notes", id),
                { versions: updatedVersions }
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
              timestamp: new Date(),
            };
            const updatedVersions = [newVersion, ...note.versions].slice(0, 20);
            updateDocumentNonBlocking(doc(firestore, "notes", noteId), { versions: updatedVersions });
        }
        break;
      }
      case "MAKE_NOTE_PUBLIC": {
        const noteId = payload as string;
        updateDocumentNonBlocking(doc(firestore, "notes", noteId), { isPublic: true });
        break;
      }
      default: 
        dispatch(action);
    }
  }, [firestore, user, state.notes]);

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
