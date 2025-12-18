import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "node:http";
import { storage } from "./storage";
import { loginSchema, registerSchema, createTaskInputSchema } from "@shared/schema";
import OpenAI from "openai";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";

function getFeatures(planId: string): string[] {
  switch (planId) {
    case 'starter':
      return ['50 AI credits/month', 'Voice input', 'Priority categorization', 'Task history'];
    case 'pro':
      return ['200 AI credits/month', 'All Starter features', 'Advanced AI notes', 'Priority support'];
    case 'unlimited':
      return ['Unlimited AI credits', 'All Pro features', 'API access', 'Dedicated support'];
    default:
      return ['10 AI credits/month', 'Basic task management', 'Text input'];
  }
}

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

const sessions = new Map<string, { userId: string; expiresAt: Date }>();

function generateSessionToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.substring(7);
  const session = sessions.get(token);

  if (!session || session.expiresAt < new Date()) {
    sessions.delete(token);
    return res.status(401).json({ error: 'Session expired' });
  }

  req.userId = session.userId;
  next();
}

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

async function parseTaskWithAI(input: string): Promise<{
  title: string;
  description: string;
  category: string;
  priority: string;
  aiNotes: string;
}> {
  if (!openai) {
    const title = input.length > 50 ? input.substring(0, 50) + '...' : input;
    return {
      title,
      description: input,
      category: 'general',
      priority: 'medium',
      aiNotes: 'AI processing unavailable',
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are a task parsing assistant. Analyze the user's input and extract task information.
Return a JSON object with:
- title: A concise task title (max 60 characters)
- description: Detailed description of the task
- category: One of: work, personal, shopping, health, finance, education, general
- priority: One of: high, medium, low (based on urgency words like "urgent", "ASAP", "important")
- aiNotes: Helpful suggestions or context for completing this task

Respond only with valid JSON.`
        },
        {
          role: "user",
          content: input
        }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      title: result.title || input.substring(0, 50),
      description: result.description || input,
      category: result.category || 'general',
      priority: result.priority || 'medium',
      aiNotes: result.aiNotes || '',
    };
  } catch (error) {
    console.error('AI parsing error:', error);
    return {
      title: input.length > 50 ? input.substring(0, 50) + '...' : input,
      description: input,
      category: 'general',
      priority: 'medium',
      aiNotes: 'AI processing failed',
    };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      const user = await storage.createUser(data);
      const token = generateSessionToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      
      sessions.set(token, { userId: user.id, expiresAt });

      const subscription = await storage.getSubscription(user.id);

      res.json({
        user: { id: user.id, email: user.email, displayName: user.displayName, avatarPreset: user.avatarPreset },
        subscription,
        token,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      
      const user = await storage.verifyUserPassword(data.email, data.password);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = generateSessionToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      
      sessions.set(token, { userId: user.id, expiresAt });

      const subscription = await storage.getSubscription(user.id);

      res.json({
        user: { id: user.id, email: user.email, displayName: user.displayName, avatarPreset: user.avatarPreset },
        subscription,
        token,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/api/auth/logout', authMiddleware, (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.substring(7);
      sessions.delete(token);
    }
    res.json({ success: true });
  });

  // User routes
  app.get('/api/user/me', authMiddleware, async (req, res) => {
    try {
      const user = await storage.getUser(req.userId!);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const subscription = await storage.getSubscription(user.id);

      res.json({
        user: { id: user.id, email: user.email, displayName: user.displayName, avatarPreset: user.avatarPreset },
        subscription,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch('/api/user/me', authMiddleware, async (req, res) => {
    try {
      const { displayName, avatarPreset } = req.body;
      const user = await storage.updateUser(req.userId!, { displayName, avatarPreset });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ id: user.id, email: user.email, displayName: user.displayName, avatarPreset: user.avatarPreset });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/user/me', authMiddleware, async (req, res) => {
    try {
      await storage.deleteUser(req.userId!);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Task routes
  app.get('/api/tasks', authMiddleware, async (req, res) => {
    try {
      const tasks = await storage.getTasks(req.userId!);
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/tasks/:id', authMiddleware, async (req, res) => {
    try {
      const task = await storage.getTask(req.params.id, req.userId!);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json(task);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/tasks', authMiddleware, async (req, res) => {
    try {
      const data = createTaskInputSchema.parse(req.body);
      
      // Check and deduct credits
      const hasCredits = await storage.deductCredits(req.userId!, 1, 'Task creation with AI');
      if (!hasCredits) {
        return res.status(402).json({ error: 'Insufficient credits' });
      }

      // Parse task with AI
      const parsedTask = await parseTaskWithAI(data.input);
      
      const task = await storage.createTask(req.userId!, parsedTask);
      
      const subscription = await storage.getSubscription(req.userId!);
      
      res.json({ task, credits: subscription?.credits || 0 });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch('/api/tasks/:id', authMiddleware, async (req, res) => {
    try {
      const { title, description, category, priority, status } = req.body;
      
      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (category !== undefined) updateData.category = category;
      if (priority !== undefined) updateData.priority = priority;
      if (status !== undefined) {
        updateData.status = status;
        if (status === 'completed') {
          updateData.completedAt = new Date();
        }
      }

      const task = await storage.updateTask(req.params.id, req.userId!, updateData);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json(task);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/tasks/:id', authMiddleware, async (req, res) => {
    try {
      await storage.deleteTask(req.params.id, req.userId!);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Subscription routes
  app.get('/api/subscription', authMiddleware, async (req, res) => {
    try {
      const subscription = await storage.getSubscription(req.userId!);
      res.json(subscription);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/subscription/plans', async (req, res) => {
    try {
      const stripe = await getUncachableStripeClient();
      const products = await stripe.products.list({ active: true });
      const prices = await stripe.prices.list({ active: true });

      const priceMap = new Map<string, any>();
      prices.data.forEach(price => {
        if (price.recurring?.interval === 'month') {
          priceMap.set(price.product as string, price);
        }
      });

      const stripePlans = products.data
        .filter(product => priceMap.has(product.id))
        .map(product => {
          const price = priceMap.get(product.id);
          const planId = product.metadata?.planId || product.name.toLowerCase();
          return {
            id: planId,
            name: product.name,
            price: (price?.unit_amount || 0) / 100,
            credits: parseInt(product.metadata?.credits || '0', 10),
            features: getFeatures(planId),
            stripePriceId: price?.id,
          };
        })
        .sort((a, b) => a.price - b.price);

      const plans = [
        {
          id: 'free',
          name: 'Free',
          price: 0,
          credits: 10,
          features: ['10 AI credits/month', 'Basic task management', 'Text input'],
          stripePriceId: null,
        },
        ...stripePlans,
      ];

      res.json(plans);
    } catch (error) {
      res.json([
        {
          id: 'free',
          name: 'Free',
          price: 0,
          credits: 10,
          features: ['10 AI credits/month', 'Basic task management', 'Text input'],
          stripePriceId: null,
        },
        {
          id: 'starter',
          name: 'Starter',
          price: 9.99,
          credits: 50,
          features: ['50 AI credits/month', 'Voice input', 'Priority categorization', 'Task history'],
          stripePriceId: null,
        },
        {
          id: 'pro',
          name: 'Pro',
          price: 19.99,
          credits: 200,
          features: ['200 AI credits/month', 'All Starter features', 'Advanced AI notes', 'Priority support'],
          stripePriceId: null,
        },
        {
          id: 'unlimited',
          name: 'Unlimited',
          price: 49.99,
          credits: 9999,
          features: ['Unlimited AI credits', 'All Pro features', 'API access', 'Dedicated support'],
          stripePriceId: null,
        },
      ]);
    }
  });

  // Credit transactions
  app.get('/api/credits/transactions', authMiddleware, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const transactions = await storage.getCreditTransactions(
        req.userId!,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Stripe routes
  app.get('/api/stripe/publishable-key', async (req, res) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error: any) {
      res.status(500).json({ error: 'Stripe not configured' });
    }
  });

  app.post('/api/stripe/create-checkout-session', authMiddleware, async (req, res) => {
    try {
      const { priceId, planId } = req.body;
      
      if (!priceId || !planId) {
        return res.status(400).json({ error: 'Price ID and Plan ID are required' });
      }

      const stripe = await getUncachableStripeClient();
      const user = await storage.getUser(req.userId!);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      let subscription = await storage.getSubscription(req.userId!);
      let customerId = subscription?.stripeCustomerId;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: { userId: user.id },
        });
        customerId = customer.id;
        await storage.setStripeCustomerId(req.userId!, customerId);
      }

      const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;
      
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/checkout/cancel`,
        metadata: { userId: user.id, planId },
      });

      res.json({ url: session.url, sessionId: session.id });
    } catch (error: any) {
      console.error('Checkout session error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/stripe/create-portal-session', authMiddleware, async (req, res) => {
    try {
      const subscription = await storage.getSubscription(req.userId!);
      
      if (!subscription?.stripeCustomerId) {
        return res.status(400).json({ error: 'No active subscription' });
      }

      const stripe = await getUncachableStripeClient();
      const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;
      
      const session = await stripe.billingPortal.sessions.create({
        customer: subscription.stripeCustomerId,
        return_url: `${baseUrl}/profile`,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error('Portal session error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Payment history - fetch from stripe schema
  app.get('/api/payments/history', authMiddleware, async (req, res) => {
    try {
      const subscription = await storage.getSubscription(req.userId!);
      
      if (!subscription?.stripeCustomerId) {
        return res.json({ invoices: [], charges: [] });
      }

      // Import db to query stripe schema directly
      const { db } = await import('./db');
      const { sql } = await import('drizzle-orm');
      
      // Get invoices for this customer
      const invoices = await db.execute(sql`
        SELECT 
          id,
          number,
          status,
          amount_due,
          amount_paid,
          currency,
          created,
          hosted_invoice_url,
          invoice_pdf,
          billing_reason
        FROM stripe.invoices 
        WHERE customer = ${subscription.stripeCustomerId}
        ORDER BY created DESC
        LIMIT 50
      `);
      
      // Get charges for this customer
      const charges = await db.execute(sql`
        SELECT 
          id,
          amount,
          currency,
          status,
          created,
          description,
          receipt_url,
          paid
        FROM stripe.charges 
        WHERE customer = ${subscription.stripeCustomerId}
        ORDER BY created DESC
        LIMIT 50
      `);

      res.json({
        invoices: invoices.rows || [],
        charges: charges.rows || [],
      });
    } catch (error: any) {
      console.error('Payment history error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Credit analytics
  app.get('/api/credits/analytics', authMiddleware, async (req, res) => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const transactions = await storage.getCreditTransactions(
        req.userId!,
        thirtyDaysAgo,
        new Date()
      );

      const subscription = await storage.getSubscription(req.userId!);

      const totalUsed = transactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      const totalAdded = transactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);

      const dailyUsage: Record<string, number> = {};
      transactions
        .filter(t => t.amount < 0)
        .forEach(t => {
          const date = new Date(t.createdAt).toISOString().split('T')[0];
          dailyUsage[date] = (dailyUsage[date] || 0) + Math.abs(t.amount);
        });

      res.json({
        currentCredits: subscription?.credits || 0,
        monthlyAllocation: subscription?.monthlyCredits || 0,
        totalUsedLast30Days: totalUsed,
        totalAddedLast30Days: totalAdded,
        dailyUsage,
        recentTransactions: transactions.slice(0, 20),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
