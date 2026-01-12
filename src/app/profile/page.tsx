'use client';

import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AppLayout } from '@/components/layout/app-layout';

function ProfilePageContent() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName);
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user || !firestore) return;

    const userRef = doc(firestore, 'users', user.uid);
    try {
      await updateDoc(userRef, {
        displayName: displayName,
      });
      toast({
        title: 'Success',
        description: 'Your profile has been updated.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update your profile.',
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>You must be logged in to view your profile.</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>Update your display name.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <Input id="email" value={user.email || ''} disabled />
          </div>
          <div className="space-y-2">
            <label htmlFor="displayName" className="text-sm font-medium">Display Name</label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <Button onClick={handleUpdateProfile}>Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}


export default function ProfilePage() {
    return (
        <AppLayout>
            <ProfilePageContent />
        </AppLayout>
    )
}
