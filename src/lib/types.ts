import { Timestamp } from "firebase/firestore";

export interface NoteVersion {
  id: string;
  content: string;
  timestamp: Date | Timestamp;
}

export interface Note {
  id: string;
  title: string;
  versions: NoteVersion[];
  createdAt: Date | Timestamp;
  ownerId: string;
}
