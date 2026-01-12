
'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { updateProfile } from 'firebase/auth';

export default function ProfilePage() {
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const firestore = useFirestore();
    const { toast } = useToast();
    
    const [displayName, setDisplayName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || '');
        }
    }, [user]);

    if (isUserLoading) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center h-full">
                    <p>Loading profile...</p>
                </div>
            </AppLayout>
        );
    }
    
    if (!user) {
        // This should ideally not be reached if routing is protected
        return <AppLayout />;
    }

    const handleSaveChanges = async () => {
        if (!user || !auth.currentUser) return;
        setIsSaving(true);
        try {
            // Update Firebase Auth profile
            await updateProfile(auth.currentUser, { displayName });
            
            // Update Firestore user document
            const userRef = doc(firestore, 'users', user.uid);
            await setDoc(userRef, { displayName }, { merge: true });

            toast({
                title: "Profile Updated",
                description: "Your display name has been successfully updated.",
            });
        } catch (error) {
            console.error("Error updating profile: ", error);
            toast({
                title: "Error",
                description: "Failed to update profile. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };


    return (
        <AppLayout>
            <div className="p-4 md:p-6">
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                        <CardDescription>Manage your account settings.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20">
                                {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />}
                                <AvatarFallback className="text-3xl">
                                    {user.displayName?.[0] || user.email?.[0] || 'U'}
                                </AvatarFallback>
                            </Avatar>
                             <div className="grid gap-1.5">
                                 <h2 className="text-2xl font-bold">{user.displayName}</h2>
                                 <p className="text-muted-foreground">{user.email}</p>
                             </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="displayName">Display Name</Label>
                            <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" defaultValue={user.email || ''} readOnly disabled />
                        </div>
                        <Button onClick={handleSaveChanges} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
