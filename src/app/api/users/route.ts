import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { email, name, password, role } = body;

    if (!email || !password) {
        return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    if (role && !["user", "admin"].includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    try {
        const [user] = await db
            .insert(users)
            .values({
                email,
                name: name || null,
                passwordHash,
                role: role || "user"
            })
            .returning({ id: users.id, email: users.email });

        return NextResponse.json(user, { status: 201 });
    } catch (err: unknown) {
        if (err instanceof Error && err.message.includes("UNIQUE")) {
            return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
        }
        throw err;
    }
}
