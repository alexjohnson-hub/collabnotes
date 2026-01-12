"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNotes } from "@/hooks/use-notes";
import { useMemo, useState } from "react";
import { useCollection, useFirestore, useUser } from "@/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
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
  const { user } = useUser();
  const firestore = useFirestore();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const isOwner = activeNote?.ownerId === user?.uid;

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
    if (!activeNote || !firestore) return;

    try {
      const usersRef = collection(firestore, "users");
      const q = query(usersRef, where("email", "==", values.email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({
          variant: "destructive",
          title: "User not found",
          description: `No user with email ${values.email} exists.`,
        });
        return;
      }

      const collaboratorUser = querySnapshot.docs[0].data();
      const collaboratorId = collaboratorUser.id;

      if (collaboratorId === activeNote.ownerId || activeNote.collaboratorIds?.includes(collaboratorId)) {
        toast({
          variant: "default",
          title: "Already a collaborator",
          description: `${values.email} is already a collaborator on this note.`,
        });
        return;
      }

      dispatch({
        type: "ADD_COLLABORATOR",
        payload: { noteId: activeNote.id, collaboratorId },
      });

      toast({
        title: "Collaborator added",
        description: `${values.email} has been invited to this note.`,
      });
      setDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error adding collaborator:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not add collaborator. Please try again.",
      });
    }
  };
  
  if (!activeNote) {
    return null;
  }

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
      {isOwner && (
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
      )}
    </div>
  );
}
