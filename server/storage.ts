import {
  users,
  subscriptions,
  tasks,
  creditTransactions,
  type User,
  type InsertUser,
  type Subscription,
  type Task,
  type InsertTask,
  type CreditTransaction,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [salt, key] = hash.split(":");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return key === derivedKey.toString("hex");
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByStripeCustomerId(customerId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;
  verifyUserPassword(email: string, password: string): Promise<User | null>;
  
  getSubscription(userId: string): Promise<Subscription | undefined>;
  getSubscriptionByStripeCustomerId(customerId: string): Promise<Subscription | undefined>;
  createSubscription(userId: string): Promise<Subscription>;
  updateSubscription(userId: string, data: Partial<Subscription>): Promise<Subscription | undefined>;
  setStripeCustomerId(userId: string, customerId: string): Promise<void>;
  deductCredits(userId: string, amount: number, description: string): Promise<boolean>;
  addCredits(userId: string, amount: number, description: string): Promise<void>;
  
  getTasks(userId: string): Promise<Task[]>;
  getTask(id: string, userId: string): Promise<Task | undefined>;
  createTask(userId: string, task: InsertTask): Promise<Task>;
  updateTask(id: string, userId: string, data: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: string, userId: string): Promise<void>;
  
  getCreditTransactions(userId: string, startDate?: Date, endDate?: Date): Promise<CreditTransaction[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    return user || undefined;
  }

  async getUserByStripeCustomerId(customerId: string): Promise<User | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.stripeCustomerId, customerId));
    
    if (!subscription) return undefined;
    
    return this.getUser(subscription.userId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await hashPassword(insertUser.password);
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        email: insertUser.email.toLowerCase(),
        password: hashedPassword,
      })
      .returning();
    
    await this.createSubscription(user.id);
    
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async verifyUserPassword(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    
    const isValid = await verifyPassword(password, user.password);
    return isValid ? user : null;
  }

  async getSubscription(userId: string): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId));
    return subscription || undefined;
  }

  async getSubscriptionByStripeCustomerId(customerId: string): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.stripeCustomerId, customerId));
    return subscription || undefined;
  }

  async createSubscription(userId: string): Promise<Subscription> {
    const [subscription] = await db
      .insert(subscriptions)
      .values({
        userId,
        plan: "free",
        status: "active",
        credits: 10,
        monthlyCredits: 10,
      })
      .returning();
    return subscription;
  }

  async updateSubscription(userId: string, data: Partial<Subscription>): Promise<Subscription | undefined> {
    const [subscription] = await db
      .update(subscriptions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(subscriptions.userId, userId))
      .returning();
    return subscription || undefined;
  }

  async setStripeCustomerId(userId: string, customerId: string): Promise<void> {
    await db
      .update(subscriptions)
      .set({ stripeCustomerId: customerId, updatedAt: new Date() })
      .where(eq(subscriptions.userId, userId));
  }

  async deductCredits(userId: string, amount: number, description: string): Promise<boolean> {
    const subscription = await this.getSubscription(userId);
    if (!subscription || subscription.credits < amount) {
      return false;
    }

    await db
      .update(subscriptions)
      .set({
        credits: subscription.credits - amount,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.userId, userId));

    await db.insert(creditTransactions).values({
      userId,
      amount: -amount,
      type: "deduction",
      description,
    });

    return true;
  }

  async addCredits(userId: string, amount: number, description: string): Promise<void> {
    const subscription = await this.getSubscription(userId);
    if (!subscription) return;

    await db
      .update(subscriptions)
      .set({
        credits: subscription.credits + amount,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.userId, userId));

    await db.insert(creditTransactions).values({
      userId,
      amount,
      type: "addition",
      description,
    });
  }

  async getTasks(userId: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(desc(tasks.createdAt));
  }

  async getTask(id: string, userId: string): Promise<Task | undefined> {
    const [task] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
    return task || undefined;
  }

  async createTask(userId: string, task: InsertTask): Promise<Task> {
    const [newTask] = await db
      .insert(tasks)
      .values({ ...task, userId })
      .returning();
    return newTask;
  }

  async updateTask(id: string, userId: string, data: Partial<Task>): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();
    return task || undefined;
  }

  async deleteTask(id: string, userId: string): Promise<void> {
    await db.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
  }

  async getCreditTransactions(userId: string, startDate?: Date, endDate?: Date): Promise<CreditTransaction[]> {
    let query = db
      .select()
      .from(creditTransactions)
      .where(eq(creditTransactions.userId, userId));

    if (startDate && endDate) {
      query = db
        .select()
        .from(creditTransactions)
        .where(
          and(
            eq(creditTransactions.userId, userId),
            gte(creditTransactions.createdAt, startDate),
            lte(creditTransactions.createdAt, endDate)
          )
        );
    }

    return await query.orderBy(desc(creditTransactions.createdAt));
  }
}

export const storage = new DatabaseStorage();
