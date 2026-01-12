"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNotes } from "@/hooks/use-notes";
import { useMemo, useState } from "react";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { Button } from "../ui/button";
import { UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { useToast } from "@/hooks/use-toast";

const addCollaboratorSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

export function Collaborators() {
  const { activeNote, dispatch } = useNotes();
  const firestore = useFirestore();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const collaboratorIds = useMemo(
    () => [
      ...(activeNote?.ownerId ? [activeNote.ownerId] : []),
      ...(activeNote?.collaboratorIds || []),
    ],
    [activeNote]
  );

  const collaboratorsQuery = useMemo(
    () =>
      collaboratorIds.length > 0 && firestore
        ? query(
            collection(firestore, "users"),
            where("id", "in", collaboratorIds)
          )
        : null,
    [firestore, collaboratorIds]
  );

  const { data: collaborators } = useCollection<
    { id: string; email: string; photoURL?: string; displayName?: string }
  >(collaboratorsQuery);

  const form = useForm<z.infer<typeof addCollaboratorSchema>>({
    resolver: zodResolver(addCollaboratorSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof addCollaboratorSchema>) => {
    if (!activeNote) return;

    // In a real app, you'd look up the user by email to get their ID
    // For this example, we'll just add the email. This requires rule changes.
    // A better approach is a cloud function to resolve email to ID.
    dispatch({
      type: "ADD_COLLABORATOR",
      payload: { noteId: activeNote.id, collaboratorId: values.email },
    });

    toast({
      title: "Collaborator added",
      description: `${values.email} has been invited to this note.`,
    });
    setDialogOpen(false);
    form.reset();
  };

  return (
    <div className="flex items-center -space-x-2">
      {collaborators?.map((collaborator) => (
        <Tooltip key={collaborator.id}>
          <TooltipTrigger asChild>
            <Avatar className="border-2 border-background">
              <AvatarImage
                src={collaborator.photoURL}
                alt={collaborator.displayName || collaborator.email}
              />
              <AvatarFallback>
                {collaborator.displayName?.[0] || collaborator.email[0]}
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>
            <p>{collaborator.displayName || collaborator.email}</p>
          </TooltipContent>
        </Tooltip>
      ))}
      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" className="rounded-full h-8 w-8 ml-2 bg-background border-dashed">
            <UserPlus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Collaborator</DialogTitle>
            <DialogDescription>
              Enter the email address of the user you want to share this note with.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="name@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Add Collaborator</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
