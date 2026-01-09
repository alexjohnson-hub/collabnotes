"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from "react";
import { INITIAL_NOTES } from "@/lib/constants";
import type { Note, NoteVersion } from "@/lib/types";

interface NotesState {
  notes: Note[];
  activeNoteId: string | null;
}

type Action =
  | { type: "SET_INITIAL_STATE"; payload: NotesState }
  | { type: "ADD_NOTE" }
  | { type: "DELETE_NOTE"; payload: string }
  | { type: "SELECT_NOTE"; payload: string | null }
  | { type: "UPDATE_NOTE_TITLE"; payload: { id: string; title: string } }
  | {
      type: "UPDATE_NOTE_CONTENT";
      payload: { id: string; content: string };
    }
  | { type: "RESTORE_VERSION"; payload: { noteId: string; versionId: string } };

const NotesContext = createContext<
  | (NotesState & {
      dispatch: React.Dispatch<Action>;
      activeNote: Note | undefined;
    })
  | null
>(null);

const notesReducer = (state: NotesState, action: Action): NotesState => {
  switch (action.type) {
    case "SET_INITIAL_STATE":
      return action.payload;
    case "ADD_NOTE": {
      const newNote: Note = {
        id: `note-${Date.now()}`,
        title: "Untitled Note",
        createdAt: new Date(),
        versions: [
          { id: `v-${Date.now()}`, content: "", timestamp: new Date() },
        ],
      };
      return {
        ...state,
        notes: [newNote, ...state.notes],
        activeNoteId: newNote.id,
      };
    }
    case "DELETE_NOTE": {
      const newNotes = state.notes.filter((note) => note.id !== action.payload);
      let newActiveNoteId = state.activeNoteId;
      if (state.activeNoteId === action.payload) {
        newActiveNoteId = newNotes.length > 0 ? newNotes[0].id : null;
      }
      return {
        ...state,
        notes: newNotes,
        activeNoteId: newActiveNoteId,
      };
    }
    case "SELECT_NOTE":
      return { ...state, activeNoteId: action.payload };
    case "UPDATE_NOTE_TITLE": {
      return {
        ...state,
        notes: state.notes.map((note) =>
          note.id === action.payload.id
            ? { ...note, title: action.payload.title }
            : note
        ),
      };
    }
    case "UPDATE_NOTE_CONTENT": {
      return {
        ...state,
        notes: state.notes.map((note) => {
          if (note.id === action.payload.id) {
            const newVersion: NoteVersion = {
              id: `v-${Date.now()}`,
              content: action.payload.content,
              timestamp: new Date(),
            };
            // Keep only the last 20 versions for performance
            const updatedVersions = [newVersion, ...note.versions].slice(0, 20);
            return { ...note, versions: updatedVersions };
          }
          return note;
        }),
      };
    }
    case "RESTORE_VERSION": {
      return {
        ...state,
        notes: state.notes.map((note) => {
          if (note.id === action.payload.noteId) {
            const versionToRestore = note.versions.find(
              (v) => v.id === action.payload.versionId
            );
            if (!versionToRestore) return note;

            const newVersion: NoteVersion = {
              id: `v-${Date.now()}`,
              content: versionToRestore.content,
              timestamp: new Date(),
            };
            const updatedVersions = [newVersion, ...note.versions].slice(0, 20);
            return { ...note, versions: updatedVersions };
          }
          return note;
        }),
      };
    }
    default:
      return state;
  }
};

const getInitialState = (): NotesState => {
  if (typeof window === "undefined") {
    return { notes: INITIAL_NOTES, activeNoteId: INITIAL_NOTES[0]?.id || null };
  }
  try {
    const item = window.localStorage.getItem("collabnotes_data");
    if (item) {
      const parsed = JSON.parse(item);
      // Revive dates
      parsed.notes.forEach((note: Note) => {
        note.createdAt = new Date(note.createdAt);
        note.versions.forEach((v: NoteVersion) => {
          v.timestamp = new Date(v.timestamp);
        });
      });
      return parsed;
    }
  } catch (error) {
    console.error("Error reading from localStorage", error);
  }
  return { notes: INITIAL_NOTES, activeNoteId: INITIAL_NOTES[0]?.id || null };
};

export const NotesProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(notesReducer, getInitialState());

  useEffect(() => {
    try {
      window.localStorage.setItem("collabnotes_data", JSON.stringify(state));
    } catch (error) {
      console.error("Error writing to localStorage", error);
    }
  }, [state]);
  
  const activeNote = state.notes.find((note) => note.id === state.activeNoteId);

  return (
    <NotesContext.Provider value={{ ...state, dispatch, activeNote }}>
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
