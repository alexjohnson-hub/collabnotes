
'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function SettingsPage() {
    return (
        <AppLayout>
            <div className="p-4 md:p-6">
                 <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle>Settings</CardTitle>
                        <CardDescription>Customize your application experience.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                            <Label htmlFor="dark-mode" className="flex flex-col space-y-1">
                                <span>Dark Mode</span>
                                <span className="font-normal leading-snug text-muted-foreground">
                                    Enable or disable the dark theme.
                                </span>
                            </Label>
                            <Switch id="dark-mode" />
                        </div>
                        <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                             <Label htmlFor="notifications" className="flex flex-col space-y-1">
                                <span>Email Notifications</span>
                                <span className="font-normal leading-snug text-muted-foreground">
                                    Receive email updates and notifications.
                                </span>
                            </Label>
                            <Switch id="notifications" defaultChecked/>
                        </div>
                         <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                             <Label htmlFor="real-time" className="flex flex-col space-y-1">
                                <span>Real-time Sync</span>
                                <span className="font-normal leading-snug text-muted-foreground">
                                    Keep your notes synced across all devices instantly.
                                </span>
                            </Label>
                            <Switch id="real-time" defaultChecked disabled />
                        </div>
                        <Button>Save Preferences</Button>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
