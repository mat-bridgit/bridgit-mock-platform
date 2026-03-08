import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, currentPassword, newPassword } = body;

    const [user] = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updates: Record<string, string> = {};

    if (name !== undefined) {
        updates.name = name;
    }

    if (currentPassword && newPassword) {
        const passwordMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!passwordMatch) {
            return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
        }
        updates.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updates).length === 0) {
        return NextResponse.json({ error: "No changes provided" }, { status: 400 });
    }

    await db.update(users).set(updates).where(eq(users.id, session.user.id));

    return NextResponse.json({ success: true });
}
