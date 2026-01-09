"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Bold, Italic, List, ListOrdered, Code, Pilcrow } from "lucide-react";

export function EditorToolbar() {
  return (
    <div className="flex items-center gap-1 rounded-md border p-1 bg-card">
      <Button variant="ghost" size="sm">
        <Bold className="h-4 w-4" />
        <span className="sr-only">Bold</span>
      </Button>
      <Button variant="ghost" size="sm">
        <Italic className="h-4 w-4" />
        <span className="sr-only">Italic</span>
      </Button>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <Button variant="ghost" size="sm">
        <List className="h-4 w-4" />
        <span className="sr-only">Unordered List</span>
      </Button>
      <Button variant="ghost" size="sm">
        <ListOrdered className="h-4 w-4" />
        <span className="sr-only">Ordered List</span>
      </Button>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <Button variant="ghost" size="sm">
        <Pilcrow className="h-4 w-4" />
        <span className="sr-only">Paragraph</span>
      </Button>
      <Button variant="ghost" size="sm">
        <Code className="h-4 w-4" />
        <span className="sr-only">Code Block</span>
      </Button>
    </div>
  );
}
