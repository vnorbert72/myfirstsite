import { mysqlTable, varchar, text, timestamp } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const subscribers = mysqlTable("subscribers", {
  id: varchar("id", { length: 36 }).primaryKey(),
  email: varchar("email", { length: 254 }).notNull().unique(),
  language: varchar("language", { length: 5 }).notNull().default("en"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  unsubscribedAt: timestamp("unsubscribed_at"),
});

export const insertSubscriberSchema = createInsertSchema(subscribers)
  .omit({ id: true, createdAt: true, unsubscribedAt: true })
  .extend({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, "Please enter a valid email address")
      .max(254, "Email is too long")
      .email("Please enter a valid email address"),
    language: z.string().min(2).max(5).optional().default("en"),
  });

export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>;
export type Subscriber = typeof subscribers.$inferSelect;
