import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    email: text("email").notNull().unique(),
    name: text("name"),
    passwordHash: text("password_hash").notNull(),
    role: text("role", { enum: ["user", "admin"] })
        .notNull()
        .default("user"),
    createdAt: text("created_at")
        .notNull()
        .$defaultFn(() => new Date().toISOString()),
});

export const config = sqliteTable("config", {
    key: text("key").primaryKey(),
    value: text("value"),
    updatedAt: text("updated_at")
        .notNull()
        .$defaultFn(() => new Date().toISOString()),
});
