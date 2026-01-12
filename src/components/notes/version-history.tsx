
"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNotes } from "@/hooks/use-notes";
import { History } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface VersionHistoryProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function VersionHistory({ isOpen, onOpenChange }: VersionHistoryProps) {
  const { activeNote, dispatch } = useNotes();
  const { toast } = useToast();

  const handleRestore = (versionId: string) => {
    if (activeNote) {
      dispatch({
        type: "RESTORE_VERSION",
        payload: { noteId: activeNote.id, versionId },
      });
      toast({
        title: "Version Restored",
        description: "The note has been restored to a previous version.",
      });
      onOpenChange(false);
    }
  };

  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History /> Version History
          </SheetTitle>
          <SheetDescription>
            Review and restore previous versions of your note.
          </SheetDescription>
        </SheetHeader>
        <Separator className="my-4" />
        <ScrollArea className="h-[calc(100%-12rem)]">
          <div className="space-y-4 pr-6">
            {activeNote?.versions.map((version, index) => (
              <div key={version.id} className="p-4 rounded-lg border bg-card">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold text-sm">
                    {formatDistanceToNow(new Date(version.timestamp as any), {
                      addSuffix: true,
                    })}
                  </p>
                  {index !== 0 && (
                     <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRestore(version.id)}
                    >
                      Restore
                    </Button>
                  )}
                  {index === 0 && (
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {stripHtml(version.content) || "Empty note"}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
        <SheetFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
