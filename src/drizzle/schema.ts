import {
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
  pgSchema,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-valibot";
import { number, parse, string } from "valibot";

const schema = pgSchema("bun-hono");

export const users = schema.table(
  "pg_users",
  {
    id: serial("id").primaryKey(),
    password: varchar("password").notNull(),
    fullName: text("full_name").notNull(),
    email: varchar("email").unique().notNull(),
    phone: varchar("phone").notNull(),
    role: text("role", { enum: ["user", "admin"] })
      .default("user")
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (users) => ({
    iemailIdx: uniqueIndex("email_idx").on(users.email),
  })
);

// Schema for inserting a user - can be used to validate API requests
export const insertUserSchema = createInsertSchema(users);

export type NewUser = typeof users.$inferInsert;

export type SelectUser = typeof users.$inferSelect;

export const selectUserSchema = createSelectSchema(users);

// Schema for selecting a user - can be used to validate API responses
export const selectUsersSchema = createSelectSchema(users, {
  id: number(),
  fullName: string(),
  email: string(),
  role: string(),
  phone: string(),
});

// Usage

export const isUserValid = parse(insertUserSchema, {
  fullName: "John Doe",
  email: "johndoe@test.com",
  password: "test",
  role: "admin",
  phone: "99-99-999",
});
