export interface NoteVersion {
  id: string;
  content: string;
  timestamp: Date;
}

export interface Note {
  id: string;
  title: string;
  versions: NoteVersion[];
  createdAt: Date;
}
