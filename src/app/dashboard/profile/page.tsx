import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
    }

    const [user] = await db
        .select({
            id: users.id,
            email: users.email,
            name: users.name,
            role: users.role
        })
        .from(users)
        .where(eq(users.id, session.user.id))
        .limit(1);

    if (!user) {
        redirect("/login");
    }

    return (
        <div className="max-w-2xl">
            <h1 className="mb-6 text-2xl font-semibold">Profile</h1>
            <ProfileForm user={user} />
        </div>
    );
}
