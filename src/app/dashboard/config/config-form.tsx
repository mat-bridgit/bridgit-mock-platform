"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface ConfigFormProps {
    dashboardTitle: string;
    logoPath: string | null;
    primaryColor: string;
    mutedColor: string;
}

export function ConfigForm({ dashboardTitle, logoPath, primaryColor, mutedColor }: ConfigFormProps) {
    const router = useRouter();
    const [title, setTitle] = useState(dashboardTitle);
    const [savingTitle, setSavingTitle] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [currentLogo, setCurrentLogo] = useState(logoPath);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [primary, setPrimary] = useState(primaryColor);
    const [muted, setMuted] = useState(mutedColor);
    const [savingColors, setSavingColors] = useState(false);

    async function handleSaveTitle(e: React.FormEvent) {
        e.preventDefault();
        setSavingTitle(true);

        const res = await fetch("/api/config", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dashboard_title: title })
        });

        if (res.ok) {
            toast.success("Dashboard title updated. Refresh to see changes in sidebar.");
            router.refresh();
        } else {
            toast.error("Failed to update title");
        }
        setSavingTitle(false);
    }

    async function handleUploadLogo() {
        const file = fileInputRef.current?.files?.[0];
        if (!file) {
            toast.error("Please select a file first");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append("logo", file);

        const res = await fetch("/api/config/logo", {
            method: "POST",
            body: formData
        });

        if (res.ok) {
            const data = await res.json();
            setCurrentLogo(data.logoPath);
            toast.success("Logo uploaded. Refresh to see changes in sidebar.");
            router.refresh();
        } else {
            toast.error("Failed to upload logo");
        }
        setUploading(false);
    }

    async function handleSaveColors(e: React.FormEvent) {
        e.preventDefault();
        setSavingColors(true);

        const res = await fetch("/api/config", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                primary_color: primary || null,
                muted_color: muted || null
            })
        });

        if (res.ok) {
            toast.success("Colors updated. Refresh to see changes.");
            router.refresh();
        } else {
            toast.error("Failed to update colors");
        }
        setSavingColors(false);
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Dashboard Title</CardTitle>
                    <CardDescription>Change the title displayed in the sidebar</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSaveTitle} className="flex items-end gap-3">
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Dashboard title"
                            />
                        </div>
                        <Button type="submit" disabled={savingTitle}>
                            {savingTitle ? "Saving..." : "Save"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Logo</CardTitle>
                    <CardDescription>Upload a logo for the sidebar</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {currentLogo && (
                        <div className="flex items-center gap-3">
                            <span className="text-muted-foreground text-sm">Current logo:</span>
                            <img
                                src={currentLogo}
                                alt="Current logo"
                                width={48}
                                height={48}
                                className="h-12 w-12 rounded object-contain"
                            />
                        </div>
                    )}
                    <div className="flex items-end gap-3">
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="logo">Upload new logo</Label>
                            <Input
                                id="logo"
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                            />
                        </div>
                        <Button type="button" onClick={handleUploadLogo} disabled={uploading}>
                            {uploading ? "Uploading..." : "Upload"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Colors</CardTitle>
                    <CardDescription>Customize light mode colors (leave blank for defaults)</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSaveColors} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="primary-color">Primary Color (charts)</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="primary-color-picker"
                                        type="color"
                                        value={primary || "#1a1a1a"}
                                        onChange={(e) => setPrimary(e.target.value)}
                                        className="h-9 w-12 cursor-pointer p-1"
                                    />
                                    <Input
                                        id="primary-color"
                                        value={primary}
                                        onChange={(e) => setPrimary(e.target.value)}
                                        placeholder="#1a1a1a"
                                        className="flex-1"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="muted-color">Background Color</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="muted-color-picker"
                                        type="color"
                                        value={muted || "#f5f5f5"}
                                        onChange={(e) => setMuted(e.target.value)}
                                        className="h-9 w-12 cursor-pointer p-1"
                                    />
                                    <Input
                                        id="muted-color"
                                        value={muted}
                                        onChange={(e) => setMuted(e.target.value)}
                                        placeholder="#f5f5f5"
                                    />
                                </div>
                            </div>
                        </div>
                        {(primary || muted) && (
                            <div className="flex items-center gap-3 rounded-lg border p-3">
                                <span className="text-muted-foreground text-sm">Preview:</span>
                                {primary && (
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-5 w-5 rounded" style={{ backgroundColor: primary }} />
                                        <span className="text-xs">Primary</span>
                                    </div>
                                )}
                                {muted && (
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-5 w-5 rounded border" style={{ backgroundColor: muted }} />
                                        <span className="text-xs">Background</span>
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Button type="submit" disabled={savingColors}>
                                {savingColors ? "Saving..." : "Save Colors"}
                            </Button>
                            {(primary || muted) && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setPrimary("");
                                        setMuted("");
                                    }}
                                >
                                    Reset to Defaults
                                </Button>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
