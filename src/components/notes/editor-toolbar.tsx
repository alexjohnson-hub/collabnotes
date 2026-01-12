
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
import { Button } from "@/components/ui/button";
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
        cursorPosition = start + (selectedText || 'Heading 1').length + 3;
        break;
      case "h2":
        newContent = `${content.substring(0, start)}## ${selectedText || 'Heading 2'}\n${content.substring(end)}`;
        cursorPosition = start + (selectedText || 'Heading 2').length + 4;
        break;
      case "h3":
        newContent = `${content.substring(0, start)}### ${selectedText || 'Heading 3'}\n${content.substring(end)}`;
        cursorPosition = start + (selectedText || 'Heading 3').length + 5;
        break;
      case "ul":
        newContent = `${content.substring(0, start)}- ${selectedText || 'List item'}\n${content.substring(end)}`;
        cursorPosition = start + (selectedText || 'List item').length + 3;
        break;
      case "ol":
        newContent = `${content.substring(0, start)}1. ${selectedText || 'List item'}\n${content.substring(end)}`;
        cursorPosition = start + (selectedText || 'List item').length + 4;
        break;
      case "quote":
        newContent = `${content.substring(0, start)}> ${selectedText || 'Quote'}\n${content.substring(end)}`;
        cursorPosition = start + (selectedText || 'Quote').length + 3;
        break;
      case "link":
        newContent = `${content.substring(0, start)}[${selectedText || 'Link text'}](url)${content.substring(end)}`;
        cursorPosition = start + (selectedText || 'Link text').length + 3;
        break;
      case "image":
        newContent = `${content.substring(0, start)}![Alt text](image_url)${content.substring(end)}`;
        cursorPosition = start + 2;
        break;
    }
    
    setContent(newContent);
    setTimeout(() => {
        textArea.focus();
        // If there was no selected text, select the placeholder.
        if (selectedText.length === 0) {
            switch(syntax) {
                case 'h1': textArea.setSelectionRange(start + 2, start + 11); break;
                case 'h2': textArea.setSelectionRange(start + 3, start + 12); break;
                case 'h3': textArea.setSelectionRange(start + 4, start + 13); break;
                case 'ul': textArea.setSelectionRange(start + 2, start + 11); break;
                case 'ol': textArea.setSelectionRange(start + 3, start + 12); break;
                case 'quote': textArea.setSelectionRange(start + 2, start + 7); break;
                case 'link': textArea.setSelectionRange(start + 1, start + 10); break;
                case 'image': textArea.setSelectionRange(start + 2, start + 10); break;
                default: textArea.setSelectionRange(cursorPosition, cursorPosition);
            }
        } else {
             textArea.setSelectionRange(cursorPosition, cursorPosition);
        }
    }, 0);
  };

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-md border p-1 bg-card">
      <Button variant="ghost" size="sm" onClick={() => applyMarkdown("bold")} aria-label="Toggle bold"><Bold className="h-4 w-4" /></Button>
      <Button variant="ghost" size="sm" onClick={() => applyMarkdown("italic")} aria-label="Toggle italic"><Italic className="h-4 w-4" /></Button>
      <Button variant="ghost" size="sm" onClick={() => applyMarkdown("strikethrough")} aria-label="Toggle strikethrough"><Strikethrough className="h-4 w-4" /></Button>
      <Button variant="ghost" size="sm" onClick={() => applyMarkdown("code")} aria-label="Toggle code"><Code className="h-4 w-4" /></Button>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <Button variant="ghost" size="sm" onClick={() => applyMarkdown("h1")} aria-label="Heading 1"><Heading1 className="h-4 w-4" /></Button>
      <Button variant="ghost" size="sm" onClick={() => applyMarkdown("h2")} aria-label="Heading 2"><Heading2 className="h-4 w-4" /></Button>
      <Button variant="ghost" size="sm" onClick={() => applyMarkdown("h3")} aria-label="Heading 3"><Heading3 className="h-4 w-4" /></Button>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <Button variant="ghost" size="sm" onClick={() => applyMarkdown("ul")} aria-label="Unordered List"><List className="h-4 w-4" /></Button>
      <Button variant="ghost" size="sm" onClick={() => applyMarkdown("ol")} aria-label="Ordered List"><ListOrdered className="h-4 w-4" /></Button>
      <Button variant="ghost" size="sm" onClick={() => applyMarkdown("quote")} aria-label="Quote"><Quote className="h-4 w-4" /></Button>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <Button variant="ghost" size="sm" onClick={() => applyMarkdown("link")} aria-label="Insert Link"><Link className="h-4 w-4" /></Button>
      <Button variant="ghost" size="sm" onClick={() => applyMarkdown("image")} aria-label="Insert Image"><ImageIcon className="h-4 w-4" /></Button>
    </div>
  );
}
