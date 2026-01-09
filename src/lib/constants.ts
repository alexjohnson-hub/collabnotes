import type { Note } from "@/lib/types";

export const INITIAL_NOTES: Note[] = [
  {
    id: "note-1",
    title: "Welcome to CollabNotes!",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    versions: [
      {
        id: "v1-1",
        content:
          "This is your first note. Feel free to edit it.\n\nCollabNotes supports rich text features and real-time collaboration. Start typing to see the magic happen!",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      },
    ],
  },
  {
    id: "note-2",
    title: "Project Ideas",
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    versions: [
      {
        id: "v2-1",
        content:
          "Here are some ideas for our next project:\n\n*   A new mobile app for task management.\n*   A web-based tool for data visualization.\n*   An e-commerce platform for local artists.",
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
      },
      {
        id: "v2-2",
        content:
          "Here are some ideas for our next project:\n\n*   A new mobile app for task management.\n*   A web-based tool for data visualization.\n*   An e-commerce platform for local artisans.",
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
      },
    ],
  },
  {
    id: "note-3",
    title: "Meeting Notes - Q2 Planning",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    versions: [
      {
        id: "v3-1",
        content:
          "**Attendees:** Alice, Bob, Charlie\n\n**Agenda:**\n1.  Review Q1 performance.\n2.  Set goals for Q2.\n3.  Brainstorm new initiatives.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
      },
    ],
  },
];
