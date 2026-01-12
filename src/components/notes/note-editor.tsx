
"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useNotes } from "@/hooks/use-notes";
import { useToast } from "@/hooks/use-toast";
import { History, Share2, Trash2 } from "lucide-react";
import { VersionHistory } from "./version-history";
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
import { Collaborators } from "./collaborators";
import { EditorToolbar } from "./editor-toolbar";
import { Separator } from "@/components/ui/separator";
import ReactMarkdown from 'react-markdown';

export function NoteEditor() {
  const { activeNote, dispatch } = useNotes();
  const { toast } = useToast();

  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [isHistoryOpen, setHistoryOpen] = React.useState(false);
  const [lastSaved, setLastSaved] = React.useState<string | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title);
      const currentVersion = activeNote.versions[0];
      setContent(currentVersion?.content ?? "");
    } else {
      setTitle("");
      setContent("");
      setLastSaved(null);
    }
    // When note changes, exit editing mode
    setIsEditing(false); 
  }, [activeNote]);

  React.useEffect(() => {
    if (activeNote?.versions[0]?.timestamp) {
      const timestamp = activeNote.versions[0].timestamp;
      const date = (timestamp as any).toDate ? (timestamp as any).toDate() : new Date(timestamp as any);
      setLastSaved(date.toLocaleString());
    }
  }, [activeNote?.versions[0]?.timestamp]);

  React.useEffect(() => {
    if (!activeNote || title === activeNote.title) return;
    const handler = setTimeout(() => {
      dispatch({
        type: "UPDATE_NOTE_TITLE",
        payload: { id: activeNote.id, title },
      });
    }, 500);
    return () => clearTimeout(handler);
  }, [title, activeNote, dispatch]);

  React.useEffect(() => {
    if (!activeNote || !isEditing || content === activeNote.versions[0]?.content) return;
  
    const handler = setTimeout(() => {
      dispatch({
        type: "UPDATE_NOTE_CONTENT",
        payload: { id: activeNote.id, content },
      });
    }, 1500); 
  
    return () => clearTimeout(handler);
  }, [content, activeNote, dispatch, isEditing]);

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

  const handleShare = () => {
    if (activeNote) {
      dispatch({ type: "MAKE_NOTE_PUBLIC", payload: activeNote.id });
      
      const shareLink = `${window.location.origin}/note/${activeNote.id}`;
      navigator.clipboard.writeText(shareLink);
      toast({
        title: "Link Copied",
        description: "A public, shareable link has been copied to your clipboard.",
      });
    }
  };

  const handleContentBlur = () => {
    setIsEditing(false);
    // The useEffect for content update will handle saving.
  }

  if (!activeNote) {
    return null;
  }

  return (
    <Card className="h-full flex flex-col m-4 md:m-6 overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl font-bold font-headline tracking-tight border-none shadow-none focus-visible:ring-0 p-0 h-auto"
              placeholder="Untitled Note"
            />
            {lastSaved && (
              <CardDescription className="mt-1">
                Last saved: {lastSaved}
              </CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="outline" size="icon" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
              <span className="sr-only">Share Note</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setHistoryOpen(true)}
            >
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
                    This action cannot be undone. This will permanently delete
                    your note.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      
      {isEditing && (
        <>
        <div className="px-6 pb-2">
            <EditorToolbar
            textAreaRef={textAreaRef}
            content={content}
            setContent={setContent}
            />
        </div>
        <Separator />
        </>
      )}

      <CardContent className="flex-1 flex flex-col pt-2 overflow-y-auto">
        {isEditing ? (
            <Textarea
            ref={textAreaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleContentBlur}
            placeholder="Start writing your masterpiece..."
            className="flex-1 w-full h-full p-2 border-0 rounded-none resize-none focus-visible:ring-0"
            autoFocus
            />
        ) : (
            <div
            onClick={() => setIsEditing(true)}
            className="prose dark:prose-invert max-w-none w-full h-full p-2 cursor-text"
            >
            {content ? <ReactMarkdown>{content}</ReactMarkdown> : <p className="text-muted-foreground">Tap to edit</p>}
            </div>
        )}
      </CardContent>
      <CardFooter>
        <Collaborators />
      </CardFooter>
      <VersionHistory isOpen={isHistoryOpen} onOpenChange={setHistoryOpen} />
    </Card>
  );
}
