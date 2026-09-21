import {
  type User,
  type InsertUser,
  type Subscriber,
  type InsertSubscriber,
  users,
  subscribers,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { eq, isNull } from "drizzle-orm";
import { db, hasDatabase } from "./db";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getSubscriberByEmail(email: string): Promise<Subscriber | undefined>;
  createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber>;
  listSubscribers(): Promise<Subscriber[]>;
  listActiveSubscribers(): Promise<Subscriber[]>;
  unsubscribe(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private subscribers: Map<string, Subscriber>;

  constructor() {
    this.users = new Map();
    this.subscribers = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    const normalized = email.trim().toLowerCase();
    return Array.from(this.subscribers.values()).find(
      (s) => s.email === normalized,
    );
  }

  async createSubscriber(input: InsertSubscriber): Promise<Subscriber> {
    const id = randomUUID();
    const subscriber: Subscriber = {
      id,
      email: input.email.trim().toLowerCase(),
      language: input.language ?? "en",
      createdAt: new Date(),
      unsubscribedAt: null,
    };
    this.subscribers.set(id, subscriber);
    return subscriber;
  }

  async listSubscribers(): Promise<Subscriber[]> {
    return Array.from(this.subscribers.values());
  }

  async listActiveSubscribers(): Promise<Subscriber[]> {
    return Array.from(this.subscribers.values()).filter(
      (s) => !s.unsubscribedAt,
    );
  }

  async unsubscribe(id: string): Promise<void> {
    const sub = this.subscribers.get(id);
    if (sub) sub.unsubscribedAt = new Date();
  }
}

export class DbStorage implements IStorage {
  private get conn() {
    if (!db) throw new Error("Database not configured");
    return db;
  }

  async getUser(id: string): Promise<User | undefined> {
    const rows = await this.conn.select().from(users).where(eq(users.id, id));
    return rows[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const rows = await this.conn
      .select()
      .from(users)
      .where(eq(users.username, username));
    return rows[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    await this.conn.insert(users).values({ ...insertUser, id });
    return { ...insertUser, id };
  }

  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    const normalized = email.trim().toLowerCase();
    const rows = await this.conn
      .select()
      .from(subscribers)
      .where(eq(subscribers.email, normalized));
    return rows[0];
  }

  async createSubscriber(input: InsertSubscriber): Promise<Subscriber> {
    const id = randomUUID();
    const email = input.email.trim().toLowerCase();
    const language = input.language ?? "en";
    await this.conn.insert(subscribers).values({ id, email, language });
    const rows = await this.conn
      .select()
      .from(subscribers)
      .where(eq(subscribers.id, id));
    return rows[0];
  }

  async listSubscribers(): Promise<Subscriber[]> {
    return this.conn.select().from(subscribers);
  }

  async listActiveSubscribers(): Promise<Subscriber[]> {
    return this.conn
      .select()
      .from(subscribers)
      .where(isNull(subscribers.unsubscribedAt));
  }

  async unsubscribe(id: string): Promise<void> {
    await this.conn
      .update(subscribers)
      .set({ unsubscribedAt: new Date() })
      .where(eq(subscribers.id, id));
  }
}

export const storage: IStorage = hasDatabase ? new DbStorage() : new MemStorage();
