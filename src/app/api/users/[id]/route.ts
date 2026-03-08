import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const updates: Record<string, string> = {};

    if (body.role) {
        const role = typeof body.role === "string" ? body.role.toLowerCase() : body.role;
        if (!["user", "admin"].includes(role)) {
            return NextResponse.json({ error: "Invalid role" }, { status: 400 });
        }
        updates.role = role;
    }

    if (body.name !== undefined) {
        updates.name = body.name;
    }

    if (body.password) {
        updates.passwordHash = await bcrypt.hash(body.password, 12);
    }

    if (Object.keys(updates).length === 0) {
        return NextResponse.json({ error: "No changes provided" }, { status: 400 });
    }

    await db.update(users).set(updates).where(eq(users.id, id));

    return NextResponse.json({ success: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    if (id === session.user.id) {
        return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
    }

    await db.delete(users).where(eq(users.id, id));

    return NextResponse.json({ success: true });
}
