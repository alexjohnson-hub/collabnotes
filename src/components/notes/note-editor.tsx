"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useNotes } from "@/hooks/use-notes";
import { useToast } from "@/hooks/use-toast";
import { EditorToolbar } from "./editor-toolbar";
import { History, Trash2 } from "lucide-react";
import { VersionHistory } from "./version-history";
import { Collaborators } from "./collaborators";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function NoteEditor() {
  const { activeNote, dispatch } = useNotes();
  const { toast } = useToast();

  const [title, setTitle] = React.useState(activeNote?.title || "");
  const [content, setContent] = React.useState(
    activeNote?.versions[0]?.content || ""
  );
  const [isHistoryOpen, setHistoryOpen] = React.useState(false);

  // Update local state when active note changes
  React.useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title);
      setContent(activeNote.versions[0]?.content || "");
    }
  }, [activeNote]);

  // Debounce title updates
  React.useEffect(() => {
    if (!activeNote) return;
    const handler = setTimeout(() => {
      if (title !== activeNote.title) {
        dispatch({
          type: "UPDATE_NOTE_TITLE",
          payload: { id: activeNote.id, title },
        });
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [title, activeNote, dispatch]);

  // Debounce content updates (and create new version)
  React.useEffect(() => {
    if (!activeNote) return;
    const handler = setTimeout(() => {
      if (content !== activeNote.versions[0]?.content) {
        dispatch({
          type: "UPDATE_NOTE_CONTENT",
          payload: { id: activeNote.id, content },
        });
        toast({
            description: "Changes saved as a new version.",
        })
      }
    }, 1500);
    return () => clearTimeout(handler);
  }, [content, activeNote, dispatch, toast]);

  const handleDelete = () => {
    if (activeNote) {
      dispatch({ type: "DELETE_NOTE", payload: activeNote.id });
      toast({
        title: "Note Deleted",
        description: `"${activeNote.title}" has been moved to the trash.`,
        variant: "destructive",
      });
    }
  };

  if (!activeNote) {
    return null;
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
            <div>
                 <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-2xl font-bold font-headline tracking-tight border-none shadow-none focus-visible:ring-0 p-0 h-auto"
                    placeholder="Untitled Note"
                />
                <CardDescription className="mt-1">
                    Last saved: {new Date(activeNote.versions[0].timestamp).toLocaleString()}
                </CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                <Collaborators />
                <Button variant="outline" size="icon" onClick={() => setHistoryOpen(true)}>
                    <History className="h-4 w-4" />
                    <span className="sr-only">Version History</span>
                </Button>
                 <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete Note</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your note.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <EditorToolbar />
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing your note here..."
          className="flex-1 resize-none text-base"
        />
      </CardContent>
      <VersionHistory isOpen={isHistoryOpen} onOpenChange={setHistoryOpen} />
    </Card>
  );
}
