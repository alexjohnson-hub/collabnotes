
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
import { Button } from "@/components/ui/button";
import { useNotes } from "@/hooks/use-notes";
import { useToast } from "@/hooks/use-toast";
import { EditorToolbar } from "./editor-toolbar";
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
import ReactMarkdown from 'react-markdown';
import { Textarea } from "../ui/textarea";

export function NoteEditor() {
  const { activeNote, dispatch } = useNotes();
  const { toast } = useToast();
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [isEditing, setIsEditing] = React.useState(true);

  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [isHistoryOpen, setHistoryOpen] = React.useState(false);
  const [lastSaved, setLastSaved] = React.useState<string | null>(null);

  // Update local state when active note changes
  React.useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title);
      const currentVersion = activeNote.versions[0];
      setContent(currentVersion?.content ?? "");
      setIsEditing(true); // Default to editing mode when a new note is selected
    } else {
      setTitle("");
      setContent("");
      setLastSaved(null);
    }
  }, [activeNote]);

  React.useEffect(() => {
    if (activeNote?.versions[0]?.timestamp) {
      setLastSaved(
        new Date(activeNote.versions[0].timestamp).toLocaleString()
      );
    }
  }, [activeNote?.versions[0]?.timestamp]);

  // Debounce title updates
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

  // Debounce content updates (and create new version)
  React.useEffect(() => {
    if (!activeNote || !isEditing || content === activeNote.versions[0]?.content) return;

    const handler = setTimeout(() => {
      dispatch({
        type: "UPDATE_NOTE_CONTENT",
        payload: { id: activeNote.id, content },
      });
      toast({
        description: "Changes saved as a new version.",
      });
    }, 1500);
    return () => clearTimeout(handler);
  }, [content, activeNote, dispatch, toast, isEditing]);

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

  const handleFormat = (
    format: "bold" | "italic" | "ul" | "ol" | "code" | "p"
  ) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    let newContent;
    let newCursorPos = start;

    switch (format) {
      case "bold":
        newContent = `${content.substring(
          0,
          start
        )}**${selectedText}**${content.substring(end)}`;
        newCursorPos = end + 4;
        break;
      case "italic":
        newContent = `${content.substring(
          0,
          start
        )}*${selectedText}*${content.substring(end)}`;
        newCursorPos = end + 2;
        break;
      case "code":
        newContent = `${content.substring(
          0,
          start
        )}\`\`\`\n${selectedText}\n\`\`\`${content.substring(end)}`;
        newCursorPos = end + 7;
        break;
      case "ul":
        newContent = `${content.substring(0, start)}* ${selectedText}${content.substring(end)}`;
        newCursorPos = end + 2;
        break;
      case "ol":
        newContent = `${content.substring(0, start)}1. ${selectedText}${content.substring(end)}`;
        newCursorPos = end + 3;
        break;
      case "p":
        newContent = `${content.substring(0, start)}\n${selectedText}\n${content.substring(end)}`;
        newCursorPos = end + 2;
        break;
      default:
        newContent = content;
    }

    setContent(newContent);
    setIsEditing(true);

    // Restore focus and cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleShare = () => {
    if (activeNote) {
      const shareLink = `${window.location.origin}/note/${activeNote.id}`;
      navigator.clipboard.writeText(shareLink);
      toast({
        title: "Link Copied",
        description: "A shareable link has been copied to your clipboard.",
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
      <CardContent className="flex-1 flex flex-col gap-4">
        <EditorToolbar onFormat={handleFormat} />
        <div className="relative flex-1">
            {isEditing ? (
                <Textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onBlur={() => setIsEditing(false)}
                    placeholder="Start writing your note here... (Markdown is supported)"
                    className="w-full h-full resize-none text-base absolute inset-0"
                />
            ) : (
                <div 
                    onClick={() => setIsEditing(true)} 
                    className="prose dark:prose-invert max-w-none w-full h-full p-3 rounded-md border border-input cursor-text"
                >
                    {content ? <ReactMarkdown>{content}</ReactMarkdown> : <p className="text-muted-foreground">Start writing your note here...</p>}
                </div>
            )}
        </div>
      </CardContent>
      <VersionHistory isOpen={isHistoryOpen} onOpenChange={setHistoryOpen} />
    </Card>
  );
}
