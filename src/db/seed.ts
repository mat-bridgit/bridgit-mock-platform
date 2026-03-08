import bcrypt from "bcryptjs";
import "dotenv/config";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { config, users } from "./schema";

async function seed() {
    const sqlite = new Database(process.env.DATABASE_URL || "./data.db");
    sqlite.pragma("journal_mode = WAL");
    const db = drizzle(sqlite);

    const email = process.env.ADMIN_EMAIL || "admin@example.com";
    const password = process.env.ADMIN_PASSWORD || "admin123";

    const passwordHash = await bcrypt.hash(password, 12);

    db.insert(users)
        .values({
            email,
            name: "Admin",
            passwordHash,
            role: "admin",
        })
        .onConflictDoNothing()
        .run();

    db.insert(config)
        .values({ key: "dashboard_title", value: "Bridgit Dashboard" })
        .onConflictDoNothing()
        .run();

    db.insert(config)
        .values({ key: "logo_path", value: null })
        .onConflictDoNothing()
        .run();

    db.insert(config)
        .values({ key: "primary_color", value: null })
        .onConflictDoNothing()
        .run();

    db.insert(config)
        .values({ key: "muted_color", value: null })
        .onConflictDoNothing()
        .run();

    console.log(`Seeded admin user: ${email}`);
    console.log("Seeded default config entries");

    sqlite.close();
}

seed().catch(console.error);
