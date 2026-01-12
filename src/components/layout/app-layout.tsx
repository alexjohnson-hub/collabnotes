
"use client";

import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Header } from "@/components/common/header";
import { NoteList } from "@/components/notes/note-list";
import { useUser, useAuth } from "@/firebase";
import { Button } from "../ui/button";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useState, useEffect, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { useNotes } from "@/hooks/use-notes";

export function AppLayout({ children }: { children?: ReactNode }) {
  const { dispatch } = useNotes();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const searchParams = useSearchParams();
  const noteId = searchParams.get('noteId');

  useEffect(() => {
    if (noteId) {
      dispatch({ type: "SELECT_NOTE", payload: noteId });
    }
  }, [noteId, dispatch]);


  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="icon" className="border-r">
        <NoteList searchQuery={searchQuery} />
      </Sidebar>
      <SidebarInset>
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <main className="flex-1">
          {!user ? (
            <LoginPrompt />
          ) : children ? (
             children
          ) : (
            <EmptyState />
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed bg-card/50 m-4 md:m-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold tracking-tight font-headline">No Note Selected</h2>
        <p className="mt-2 text-muted-foreground">
          Create a new note or select one from the list to get started.
        </p>
      </div>
    </div>
  );
}

function LoginPrompt() {
  const auth = useAuth();

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed bg-card/50 m-4 md:m-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold tracking-tight font-headline">Welcome to CollabNotes</h2>
        <p className="mt-2 text-muted-foreground">
          Sign in to create, edit, and collaborate on your notes.
        </p>
        <Button onClick={handleGoogleSignIn} className="mt-4">
           <svg
                className="mr-2 h-4 w-4"
                aria-hidden="true"
                focusable="false"
                data-prefix="fab"
                data-icon="google"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 488 512"
              >
                <path
                  fill="currentColor"
                  d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 261.8 0 120.5 109.8 8 244 8c66.8 0 126 25.5 169.3 67.5L344.9 161.8C315.1 134.4 282.4 120.5 244 120.5c-82.3 0-149.2 67.1-149.2 149.3s66.9 149.3 149.2 149.3c86.3 0 125.7-65.7 130.2-100.3H244v-73.4h239.5c2.3 12.7 3.8 26.1 3.8 40z"
                ></path>
              </svg>
          Sign in with Google
        </Button>
      </div>
    </div>
  );
}
