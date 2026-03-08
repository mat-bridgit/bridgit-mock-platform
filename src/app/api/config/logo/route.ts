import { auth } from "@/auth";
import { db } from "@/db";
import { config } from "@/db/schema";
import { writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("logo") as File | null;

    if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const ext = path.extname(file.name) || ".png";
    const filename = `logo${ext}`;
    const uploadPath = path.join(process.cwd(), "public", "uploads", filename);

    const bytes = await file.arrayBuffer();
    await writeFile(uploadPath, Buffer.from(bytes));

    const logoPath = `/uploads/${filename}`;

    await db
        .insert(config)
        .values({ key: "logo_path", value: logoPath, updatedAt: new Date().toISOString() })
        .onConflictDoUpdate({
            target: config.key,
            set: { value: logoPath, updatedAt: new Date().toISOString() }
        });

    return NextResponse.json({ logoPath });
}
