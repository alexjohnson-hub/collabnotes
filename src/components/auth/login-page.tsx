"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/firebase";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import Image from "next/image";

export function LoginPage() {
  const auth = useAuth();
  const loginBg = PlaceHolderImages.find((img) => img.id === "login-background");

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold font-headline">Welcome to CollabNotes</h1>
            <p className="text-balance text-muted-foreground">
              Sign in to start collaborating on your notes in real-time.
            </p>
          </div>
          <div className="grid gap-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
            >
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
      </div>
      <div className="hidden bg-muted lg:block">
        {loginBg && (
            <Image
            src={loginBg.imageUrl}
            alt={loginBg.description}
            width="1920"
            height="1080"
            className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            data-ai-hint={loginBg.imageHint}
            />
        )}
      </div>
    </div>
  );
}
