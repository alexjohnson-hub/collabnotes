
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
} from "lucide-react";
import * as React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Separator } from "@/components/ui/separator";

interface EditorToolbarProps {
  editorRef: React.RefObject<HTMLTextAreaElement>;
  setContent: (value: string) => void;
}

export function EditorToolbar({ editorRef, setContent }: EditorToolbarProps) {
  const applyFormat = (format: string) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    let newText = "";
    let newCursorPos = start;

    switch (format) {
      case "bold":
        newText = `**${selectedText}**`;
        newCursorPos = end + 2;
        break;
      case "italic":
        newText = `*${selectedText}*`;
        newCursorPos = end + 1;
        break;
      case "strikethrough":
        newText = `~~${selectedText}~~`;
        newCursorPos = end + 2;
        break;
      case "h1":
        newText = `# ${selectedText}`;
        newCursorPos = end + 2;
        break;
       case "h2":
        newText = `## ${selectedText}`;
        newCursorPos = end + 3;
        break;
       case "h3":
        newText = `### ${selectedText}`;
        newCursorPos = end + 4;
        break;
      case "ul":
        newText = `- ${selectedText}`;
        newCursorPos = end + 2;
        break;
      case "ol":
        newText = `1. ${selectedText}`;
        newCursorPos = end + 3;
        break;
      case "quote":
        newText = `> ${selectedText}`;
        newCursorPos = end + 2;
        break;
      case 'code':
        newText = '```\n' + selectedText + '\n```';
        newCursorPos = end + 4;
        break;
      case 'link':
        newText = `[${selectedText}](url)`;
        newCursorPos = start + 1;
        break;
      default:
        newText = selectedText;
        newCursorPos = end;
    }

    const updatedValue =
      textarea.value.substring(0, start) +
      newText +
      textarea.value.substring(end);

    setContent(updatedValue);

    setTimeout(() => {
        textarea.focus();
        if (format === 'link' && selectedText) {
             textarea.setSelectionRange(updatedValue.length - 4, updatedValue.length -1);
        } else if (format === 'link') {
            textarea.setSelectionRange(start + 1, start + 1);
        }
        else if (selectedText.length === 0) {
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }
        else {
            textarea.setSelectionRange(start, start + newText.length);
        }
    }, 0);
  };

  const onToggle = (value: string) => {
    if(value) {
      applyFormat(value);
    }
  }

  return (
    <div className="flex items-center gap-1">
      <ToggleGroup type="single" onValueChange={onToggle} className="flex-wrap justify-start">
        <ToggleGroupItem value="bold" aria-label="Toggle bold">
          <Bold className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Toggle italic">
          <Italic className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="strikethrough" aria-label="Toggle strikethrough">
          <Strikethrough className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
      <Separator orientation="vertical" className="h-6" />
      <ToggleGroup type="single" onValueChange={onToggle} className="flex-wrap justify-start">
        <ToggleGroupItem value="h1" aria-label="Heading 1">
            <Heading1 className="h-4 w-4" />
        </ToggleGroupItem>
         <ToggleGroupItem value="h2" aria-label="Heading 2">
            <Heading2 className="h-4 w-4" />
        </ToggleGroupItem>
         <ToggleGroupItem value="h3" aria-label="Heading 3">
            <Heading3 className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
      <Separator orientation="vertical" className="h-6" />
      <ToggleGroup type="single" onValueChange={onToggle} className="flex-wrap justify-start">
        <ToggleGroupItem value="ul" aria-label="Bulleted List">
            <List className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="ol" aria-label="Numbered List">
            <ListOrdered className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="quote" aria-label="Quote">
            <Quote className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
       <Separator orientation="vertical" className="h-6" />
      <ToggleGroup type="single" onValueChange={onToggle} className="flex-wrap justify-start">
         <ToggleGroupItem value="code" aria-label="Code Block">
            <Code className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="link" aria-label="Link">
            <Link className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}

declare module "react" {
  interface ForwardedRef<T> {
    current: T | null;
  }
}
