
"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { useUser } from "@/firebase";

export default function Home() {
  const { isUserLoading } = useUser();

  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-2xl font-semibold">Loading...</div>
      </div>
    );
  }

  return <AppLayout />;
}
