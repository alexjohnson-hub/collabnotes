"use client";

import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const collaborators = [
  { id: "user-avatar-1", name: "You" },
  { id: "user-avatar-2", name: "Alex" },
  { id: "user-avatar-3", name: "Maria" },
];

export function Collaborators() {
  return (
    <TooltipProvider>
      <div className="flex items-center -space-x-2">
        {collaborators.map((collaborator) => {
          const avatarData = PlaceHolderImages.find(
            (img) => img.id === collaborator.id
          );
          return (
            <Tooltip key={collaborator.id}>
              <TooltipTrigger asChild>
                <Avatar className="border-2 border-background">
                  {avatarData && (
                    <AvatarImage
                      src={avatarData.imageUrl}
                      alt={collaborator.name}
                      data-ai-hint={avatarData.imageHint}
                    />
                  )}
                  <AvatarFallback>{collaborator.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>{collaborator.name}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
