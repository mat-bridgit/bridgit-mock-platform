"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { toast } from "sonner";

interface ProfileFormProps {
    user: {
        email: string;
        name: string | null;
        role: string;
    };
}

export function ProfileForm({ user }: ProfileFormProps) {
    const { theme, setTheme } = useTheme();
    const [name, setName] = useState(user.name ?? "");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [saving, setSaving] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);

        const body: Record<string, string> = {};
        if (name !== (user.name ?? "")) {
            body.name = name;
        }
        if (currentPassword && newPassword) {
            body.currentPassword = currentPassword;
            body.newPassword = newPassword;
        }

        if (Object.keys(body).length === 0) {
            toast.error("No changes to save.");
            setSaving(false);
            return;
        }

        const res = await fetch("/api/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        const data = await res.json();
        if (res.ok) {
            toast.success("Profile updated.");
            setCurrentPassword("");
            setNewPassword("");
        } else {
            toast.error(data.error ?? "Failed to update.");
        }
        setSaving(false);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Account Info</CardTitle>
                    <CardDescription>Your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={user.email} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Role</Label>
                        <div>
                            <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Theme</CardTitle>
                    <CardDescription>Choose your preferred appearance</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant={theme === "light" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setTheme("light")}
                        >
                            <Sun className="mr-2 h-4 w-4" />
                            Light
                        </Button>
                        <Button
                            type="button"
                            variant={theme === "dark" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setTheme("dark")}
                        >
                            <Moon className="mr-2 h-4 w-4" />
                            Dark
                        </Button>
                        <Button
                            type="button"
                            variant={theme === "system" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setTheme("system")}
                        >
                            <Monitor className="mr-2 h-4 w-4" />
                            System
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Leave blank to keep your current password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                            id="currentPassword"
                            type="password"
                            placeholder="***********"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                            id="newPassword"
                            placeholder="***********"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
            </Button>
        </form>
    );
}
