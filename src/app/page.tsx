"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { useUser } from "@/firebase";
import { LoginPage } from "@/components/auth/login-page";

export default function Home() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-2xl font-semibold">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <AppLayout />;
}
