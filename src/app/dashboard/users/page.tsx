import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { redirect } from "next/navigation";
import { UsersTable } from "./users-table";

export default async function UsersPage() {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "admin") {
        redirect("/dashboard");
    }

    const allUsers = await db
        .select({
            id: users.id,
            email: users.email,
            name: users.name,
            role: users.role,
            createdAt: users.createdAt
        })
        .from(users)
        .orderBy(users.createdAt);

    return (
        <div>
            <h1 className="mb-6 text-2xl font-semibold">User Management</h1>
            <UsersTable
                users={allUsers.map((u) => ({
                    ...u,
                    createdAt: u.createdAt
                }))}
                currentUserId={session.user.id}
            />
        </div>
    );
}
