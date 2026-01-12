
'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ProfilePage() {
    const { user, isUserLoading } = useUser();

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
                            <Input id="displayName" defaultValue={user.displayName || ''} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" defaultValue={user.email || ''} readOnly disabled />
                        </div>
                        <Button>Save Changes</Button>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
