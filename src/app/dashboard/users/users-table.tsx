"use client";

import { useConfirm } from "@/components/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KeyRound, MoreHorizontal, Pencil, Shield, ShieldOff, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface User {
    id: string;
    email: string;
    name: string | null;
    role: string;
    createdAt: string;
}

interface UsersTableProps {
    users: User[];
    currentUserId: string;
}

export function UsersTable({ users, currentUserId }: UsersTableProps) {
    const router = useRouter();
    const { confirm, dialog: confirmDialog } = useConfirm();

    const [newEmail, setNewEmail] = useState("");
    const [newName, setNewName] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newRole, setNewRole] = useState("user");
    const [creating, setCreating] = useState(false);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editRole, setEditRole] = useState("");
    const [editPassword, setEditPassword] = useState("");
    const [saving, setSaving] = useState(false);

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setCreating(true);

        const res = await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: newEmail,
                name: newName || undefined,
                password: newPassword,
                role: newRole
            })
        });

        const data = await res.json();
        if (res.ok) {
            toast.success(`User ${newEmail} created`);
            setNewEmail("");
            setNewName("");
            setNewPassword("");
            setNewRole("user");
            router.refresh();
        } else {
            toast.error(data.error ?? "Failed to create user");
        }
        setCreating(false);
    }

    function startEdit(user: User) {
        setEditingId(user.id);
        setEditName(user.name ?? "");
        setEditRole(user.role);
        setEditPassword("");
    }

    function cancelEdit() {
        setEditingId(null);
        setEditPassword("");
    }

    async function handleSaveEdit(userId: string) {
        setSaving(true);
        const original = users.find((u) => u.id === userId);
        const body: Record<string, string> = {};

        if (editName !== (original?.name ?? "")) body.name = editName;
        if (editRole !== original?.role) body.role = editRole;
        if (editPassword) body.password = editPassword;

        if (Object.keys(body).length === 0) {
            toast.error("No changes to save");
            setSaving(false);
            return;
        }

        const res = await fetch(`/api/users/${userId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        if (res.ok) {
            toast.success("User updated");
            setEditingId(null);
            setEditPassword("");
            router.refresh();
        } else {
            const data = await res.json();
            toast.error(data.error ?? "Failed to update user");
        }
        setSaving(false);
    }

    async function handleToggleRole(userId: string, currentRole: string) {
        const newRole = currentRole === "admin" ? "user" : "admin";
        const res = await fetch(`/api/users/${userId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: newRole })
        });
        if (res.ok) {
            toast.success(`Role changed to ${newRole}`);
            router.refresh();
        } else {
            toast.error("Failed to update role");
        }
    }

    async function handleResetPassword(user: User) {
        const ok = await confirm({
            title: "Reset password",
            description: `Enter edit mode to set a new password for ${user.email}.`,
            confirmLabel: "Edit user"
        });
        if (ok) startEdit(user);
    }

    async function handleDelete(userId: string, email: string) {
        const ok = await confirm({
            title: "Delete user",
            description: `Are you sure you want to delete ${email}? This action cannot be undone.`,
            confirmLabel: "Delete",
            variant: "destructive"
        });
        if (!ok) return;

        const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
        if (res.ok) {
            toast.success("User deleted");
            router.refresh();
        } else {
            toast.error("Failed to delete user");
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Add User</CardTitle>
                    <CardDescription>Create a new dashboard user</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="new-email">Email</Label>
                            <Input
                                id="new-email"
                                type="email"
                                required
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="user@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-name">Name</Label>
                            <Input
                                id="new-name"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Optional"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-password">Password</Label>
                            <Input
                                id="new-password"
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="***********"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-role">Role</Label>
                            <Select value={newRole} onValueChange={setNewRole}>
                                <SelectTrigger id="new-role">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="sm:col-span-2">
                            <Button type="submit" disabled={creating}>
                                {creating ? "Creating..." : "Create User"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Users</CardTitle>
                    <CardDescription>Manage existing dashboard users</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="w-[70px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => {
                                    const isEditing = editingId === user.id;
                                    const isSelf = user.id === currentUserId;

                                    if (isEditing) {
                                        return (
                                            <TableRow key={user.id}>
                                                <TableCell className="text-muted-foreground text-sm">
                                                    {user.email}
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        placeholder="Name"
                                                        className="h-8"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Select value={editRole} onValueChange={setEditRole}>
                                                        <SelectTrigger className="h-8 w-24">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="user">User</SelectItem>
                                                            <SelectItem value="admin">Admin</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="password"
                                                        value={editPassword}
                                                        onChange={(e) => setEditPassword(e.target.value)}
                                                        placeholder="New password (optional)"
                                                        className="h-8"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            size="sm"
                                                            disabled={saving}
                                                            onClick={() => handleSaveEdit(user.id)}
                                                        >
                                                            {saving ? "..." : "Save"}
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={cancelEdit}>
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    }

                                    return (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.email}</TableCell>
                                            <TableCell>{user.name ?? "\u2014"}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={user.role === "admin" ? "default" : "secondary"}
                                                    className="uppercase"
                                                >
                                                    {user.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(user.createdAt).toISOString().slice(0, 10)}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => startEdit(user)}>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleToggleRole(user.id, user.role)}
                                                        >
                                                            {user.role === "admin" ? (
                                                                <>
                                                                    <ShieldOff className="mr-2 h-4 w-4" />
                                                                    Make User
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Shield className="mr-2 h-4 w-4" />
                                                                    Make Admin
                                                                </>
                                                            )}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleResetPassword(user)}
                                                        >
                                                            <KeyRound className="mr-2 h-4 w-4" />
                                                            Reset Password
                                                        </DropdownMenuItem>
                                                        {!isSelf && (
                                                            <DropdownMenuItem
                                                                onClick={() => handleDelete(user.id, user.email)}
                                                                className="text-destructive"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {confirmDialog}
        </div>
    );
}
