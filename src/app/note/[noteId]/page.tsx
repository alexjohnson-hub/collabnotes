
'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { Note } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useDoc } from '@/firebase/firestore/use-doc';

function NoteReadOnlyView({ note }: { note: Note }) {
    const auth = useAuth();

    const handleGoogleSignIn = async () => {
        if (!auth) return;
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in with Google: ", error);
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 sm:p-6 md:p-8">
            <Card className="w-full max-w-4xl mb-4">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>You're viewing a shared note.</CardTitle>
                        <CardDescription>Sign in to collaborate.</CardDescription>
                    </div>
                    <Button onClick={handleGoogleSignIn}>
                        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                            <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 261.8 0 120.5 109.8 8 244 8c66.8 0 126 25.5 169.3 67.5L344.9 161.8C315.1 134.4 282.4 120.5 244 120.5c-82.3 0-149.2 67.1-149.2 149.3s66.9 149.3 149.2 149.3c86.3 0 125.7-65.7 130.2-100.3H244v-73.4h239.5c2.3 12.7 3.8 26.1 3.8 40z"></path>
                        </svg>
                        Sign in with Google
                    </Button>
                </CardHeader>
            </Card>

            <Card className="w-full max-w-4xl">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">{note.title}</CardTitle>
                     {note.versions?.[0]?.timestamp && (
                        <CardDescription>
                            Last updated: {new Date(note.versions[0].timestamp as any).toLocaleString()}
                        </CardDescription>
                     )}
                </CardHeader>
                <CardContent>
                    <div className="prose dark:prose-invert max-w-none">
                        <ReactMarkdown>{note.versions?.[0]?.content || ''}</ReactMarkdown>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}


export default function SharedNotePage({ params }: { params: { noteId: string } }) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const noteRef = useMemoFirebase(
    () => (firestore && !isUserLoading ? doc(firestore, 'notes', params.noteId) : null),
    [firestore, params.noteId, isUserLoading]
  );
  
  const { data: note, isLoading: isNoteLoading } = useDoc<Note>(noteRef);

  useEffect(() => {
    // This effect runs when auth state or note data changes.
    // It is responsible for redirecting or adding the user as an editor.
    if (!noteRef || !note || isUserLoading || !user) {
      return; 
    }

    const isEditor = note.editors.includes(user.uid);
    
    if (isEditor) {
      // User is already an editor, redirect to main app view
      router.push(`/?noteId=${note.id}`);
      return;
    }
    
    if (note.isPublic && !isEditor) {
      // Note is public and the user is not an editor yet, so add them.
      updateDoc(noteRef, {
        editors: arrayUnion(user.uid)
      }).then(() => {
        // After successfully adding user, redirect them to the main app.
        router.push(`/?noteId=${note.id}`);
      }).catch(err => {
        console.error("Failed to add user as editor:", err);
        // If update fails, user will remain on the read-only page.
        // This might happen due to security rules, so it's a good fallback.
      });
    }
  }, [user, note, isUserLoading, router, noteRef]);

  const isLoading = isUserLoading || isNoteLoading;

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading note...</div>;
  }

  // After loading, if there's still no note data, it's not found or not public.
  if (!note) {
    return <div className="flex h-screen items-center justify-center">Note not found or you don't have access.</div>;
  }
  
  // A logged-in user who is an editor should have been redirected.
  // This view is for anonymous users viewing a public note.
  if (note.isPublic && !user) {
      return <NoteReadOnlyView note={note} />;
  }

  // If the user is logged in, but the useEffect hasn't run yet or failed,
  // we show a loading state before final determination.
  if (user && note.isPublic && !note.editors.includes(user.uid)) {
      return <div className="flex h-screen items-center justify-center">Adding you as a collaborator...</div>;
  }

  // If none of the above conditions are met, the user doesn't have access.
  if (!note.isPublic && (!user || !note.editors.includes(user.uid))) {
    return <div className="flex h-screen items-center justify-center">You do not have permission to view this note.</div>;
  }

  // Fallback for any other state (e.g., during the redirect after being added as editor)
  return <div className="flex h-screen items-center justify-center">Loading...</div>;
}
