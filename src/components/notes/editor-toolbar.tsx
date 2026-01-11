"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Bold, Italic, List, ListOrdered, Code, Pilcrow } from "lucide-react";

interface EditorToolbarProps {
  onFormat: (format: "bold" | "italic" | "ul" | "ol" | "code" | "p") => void;
}

export function EditorToolbar({ onFormat }: EditorToolbarProps) {
  return (
    <div className="flex items-center gap-1 rounded-md border p-1 bg-card">
      <Button variant="ghost" size="sm" onClick={() => onFormat("bold")}>
        <Bold className="h-4 w-4" />
        <span className="sr-only">Bold</span>
      </Button>
      <Button variant="ghost" size="sm" onClick={() => onFormat("italic")}>
        <Italic className="h-4 w-4" />
        <span className="sr-only">Italic</span>
      </Button>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <Button variant="ghost" size="sm" onClick={() => onFormat("ul")}>
        <List className="h-4 w-4" />
        <span className="sr-only">Unordered List</span>
      </Button>
      <Button variant="ghost" size="sm" onClick={() => onFormat("ol")}>
        <ListOrdered className="h-4 w-4" />
        <span className="sr-only">Ordered List</span>
      </Button>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <Button variant="ghost" size="sm" onClick={() => onFormat("p")}>
        <Pilcrow className="h-4 w-4" />
        <span className="sr-only">Paragraph</span>
      </Button>
      <Button variant="ghost" size="sm" onClick={() => onFormat("code")}>
        <Code className="h-4 w-4" />
        <span className="sr-only">Code Block</span>
      </Button>
    </div>
  );
}
