
"use client";

import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link,
  Image as ImageIcon,
} from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Separator } from "@/components/ui/separator";

interface EditorToolbarProps {
  textAreaRef: React.RefObject<HTMLTextAreaElement>;
  content: string;
  setContent: (content: string) => void;
}

export function EditorToolbar({
  textAreaRef,
  content,
  setContent,
}: EditorToolbarProps) {
  const applyMarkdown = (
    syntax:
      | "bold"
      | "italic"
      | "strikethrough"
      | "code"
      | "h1"
      | "h2"
      | "h3"
      | "ul"
      | "ol"
      | "quote"
      | "link"
      | "image"
  ) => {
    const textArea = textAreaRef.current;
    if (!textArea) return;

    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    const selectedText = content.substring(start, end);

    let newContent = "";
    let cursorPosition = start;

    switch (syntax) {
      case "bold":
        newContent = `${content.substring(
          0,
          start
        )}**${selectedText}**${content.substring(end)}`;
        cursorPosition = end + 4;
        break;
      case "italic":
        newContent = `${content.substring(
          0,
          start
        )}*${selectedText}*${content.substring(end)}`;
        cursorPosition = end + 2;
        break;
      case "strikethrough":
        newContent = `${content.substring(
          0,
          start
        )}~~${selectedText}~~${content.substring(end)}`;
        cursorPosition = end + 4;
        break;
      case "code":
        newContent = `${content.substring(
          0,
          start
        )}\`${selectedText}\`${content.substring(end)}`;
        cursorPosition = end + 2;
        break;
      case "h1":
        newContent = `${content.substring(0, start)}# ${selectedText || 'Heading 1'}\n${content.substring(end)}`;
        cursorPosition = start + selectedText.length + 3;
        break;
      case "h2":
        newContent = `${content.substring(0, start)}## ${selectedText || 'Heading 2'}\n${content.substring(end)}`;
        cursorPosition = start + selectedText.length + 4;
        break;
      case "h3":
        newContent = `${content.substring(0, start)}### ${selectedText || 'Heading 3'}\n${content.substring(end)}`;
        cursorPosition = start + selectedText.length + 5;
        break;
      case "ul":
        newContent = `${content.substring(0, start)}- ${selectedText || 'List item'}\n${content.substring(end)}`;
        cursorPosition = start + selectedText.length + 3;
        break;
      case "ol":
        newContent = `${content.substring(0, start)}1. ${selectedText || 'List item'}\n${content.substring(end)}`;
        cursorPosition = start + selectedText.length + 4;
        break;
      case "quote":
        newContent = `${content.substring(0, start)}> ${selectedText || 'Quote'}\n${content.substring(end)}`;
        cursorPosition = start + selectedText.length + 3;
        break;
      case "link":
        newContent = `${content.substring(0, start)}[${selectedText || 'Link text'}](url)${content.substring(end)}`;
        cursorPosition = end + 3;
        break;
      case "image":
        newContent = `${content.substring(0, start)}![Alt text](image_url)${content.substring(end)}`;
        cursorPosition = start + 2;
        break;
    }
    
    setContent(newContent);
    setTimeout(() => {
        textArea.focus();
        textArea.setSelectionRange(cursorPosition, cursorPosition);
    }, 0);
  };

  return (
    <div className="flex items-center gap-1 rounded-md border p-1 bg-card">
      <ToggleGroup type="multiple" size="sm">
        <ToggleGroupItem
          value="bold"
          aria-label="Toggle bold"
          onClick={() => applyMarkdown("bold")}
        >
          <Bold className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="italic"
          aria-label="Toggle italic"
          onClick={() => applyMarkdown("italic")}
        >
          <Italic className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="strikethrough"
          aria-label="Toggle strikethrough"
          onClick={() => applyMarkdown("strikethrough")}
        >
          <Strikethrough className="h-4 w-4" />
        </ToggleGroupItem>
         <ToggleGroupItem
          value="code"
          aria-label="Toggle code"
          onClick={() => applyMarkdown("code")}
        >
          <Code className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <ToggleGroup type="single" size="sm">
        <ToggleGroupItem
          value="h1"
          aria-label="Heading 1"
          onClick={() => applyMarkdown("h1")}
        >
          <Heading1 className="h-4 w-4" />
        </ToggleGroupItem>
         <ToggleGroupItem
          value="h2"
          aria-label="Heading 2"
          onClick={() => applyMarkdown("h2")}
        >
          <Heading2 className="h-4 w-4" />
        </ToggleGroupItem>
         <ToggleGroupItem
          value="h3"
          aria-label="Heading 3"
          onClick={() => applyMarkdown("h3")}
        >
          <Heading3 className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
      <Separator orientation="vertical" className="h-6 mx-1" />
       <ToggleGroup type="single" size="sm">
        <ToggleGroupItem
          value="ul"
          aria-label="Unordered List"
          onClick={() => applyMarkdown("ul")}
        >
          <List className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="ol"
          aria-label="Ordered List"
          onClick={() => applyMarkdown("ol")}
        >
          <ListOrdered className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="quote"
          aria-label="Quote"
          onClick={() => applyMarkdown("quote")}
        >
          <Quote className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
       <Separator orientation="vertical" className="h-6 mx-1" />
         <ToggleGroup type="single" size="sm">
        <ToggleGroupItem
          value="link"
          aria-label="Insert Link"
          onClick={() => applyMarkdown("link")}
        >
          <Link className="h-4 w-4" />
        </ToggleGroupItem>
         <ToggleGroupItem
          value="image"
          aria-label="Insert Image"
          onClick={() => applyMarkdown("image")}
        >
          <ImageIcon className="h-4 w-4" />
        </ToggleGroupItem>
        </ToggleGroup>
    </div>
  );
}

