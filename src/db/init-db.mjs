/**
 * Initializes the SQLite database: creates tables and seeds default data.
 * Runs as plain ESM with no transpiler needed — used by the Docker entrypoint.
 */
import Database from "better-sqlite3";
import { createHash, randomUUID } from "crypto";

const DB_PATH = process.env.DATABASE_URL || "./data.db";

const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");

// Create tables if they don't exist
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TEXT NOT NULL
  );
`);

// Seed admin user if no users exist
const userCount = sqlite.prepare("SELECT COUNT(*) as count FROM users").get();
if (userCount.count === 0) {
    const email = process.env.ADMIN_EMAIL || "admin@example.com";
    const password = process.env.ADMIN_PASSWORD || "admin123";

    // bcrypt-compatible hash using sync approach
    // We import bcryptjs dynamically since it's a CJS module
    const bcrypt = await import("bcryptjs");
    const passwordHash = bcrypt.default.hashSync(password, 12);

    sqlite
        .prepare("INSERT OR IGNORE INTO users (id, email, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)")
        .run(randomUUID(), email, "Admin", passwordHash, "admin", new Date().toISOString());

    console.log(`Seeded admin user: ${email}`);
}

// Seed default config
sqlite
    .prepare("INSERT OR IGNORE INTO config (key, value, updated_at) VALUES (?, ?, ?)")
    .run("dashboard_title", "Bridgit Dashboard", new Date().toISOString());

sqlite
    .prepare("INSERT OR IGNORE INTO config (key, value, updated_at) VALUES (?, ?, ?)")
    .run("logo_path", null, new Date().toISOString());

sqlite
    .prepare("INSERT OR IGNORE INTO config (key, value, updated_at) VALUES (?, ?, ?)")
    .run("primary_color", null, new Date().toISOString());

sqlite
    .prepare("INSERT OR IGNORE INTO config (key, value, updated_at) VALUES (?, ?, ?)")
    .run("muted_color", null, new Date().toISOString());

console.log("Database initialized.");
sqlite.close();
