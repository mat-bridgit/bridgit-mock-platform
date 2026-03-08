import { auth } from "@/auth";
import { db } from "@/db";
import { config } from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const rows = await db.select().from(config);
    const result: Record<string, string | null> = {};
    for (const row of rows) {
        result[row.key] = row.value;
    }

    return NextResponse.json(result);
}

export async function PATCH(request: Request) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    for (const [key, value] of Object.entries(body)) {
        await db
            .insert(config)
            .values({ key, value: value as string, updatedAt: new Date().toISOString() })
            .onConflictDoUpdate({
                target: config.key,
                set: { value: value as string, updatedAt: new Date().toISOString() }
            });
    }

    return NextResponse.json({ success: true });
}
