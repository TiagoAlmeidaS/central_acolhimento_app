import { getStripeSync } from './stripeClient';
import { storage } from './storage';

const PLAN_CREDITS: Record<string, number> = {
  'free': 10,
  'starter': 50,
  'pro': 200,
  'unlimited': 9999,
};

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string, uuid: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'This usually means express.json() parsed the body before reaching this handler. ' +
        'FIX: Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    const sync = await getStripeSync();
    await sync.processWebhook(payload, signature, uuid);
  }

  static async handleSubscriptionCreated(subscription: any): Promise<void> {
    const customerId = subscription.customer;
    const priceId = subscription.items?.data?.[0]?.price?.id;
    
    const user = await storage.getUserByStripeCustomerId(customerId);
    if (!user) {
      console.error('User not found for customer:', customerId);
      return;
    }

    const plan = await WebhookHandlers.getPlanFromPriceId(priceId);
    const credits = PLAN_CREDITS[plan] || 10;

    await storage.updateSubscription(user.id, {
      plan,
      status: 'active',
      stripeSubscriptionId: subscription.id,
      credits,
      monthlyCredits: credits,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    });

    await storage.addCredits(user.id, credits, `Subscription activated: ${plan} plan`);
  }

  static async handleSubscriptionUpdated(subscription: any): Promise<void> {
    const customerId = subscription.customer;
    const priceId = subscription.items?.data?.[0]?.price?.id;
    
    const user = await storage.getUserByStripeCustomerId(customerId);
    if (!user) return;

    const plan = await WebhookHandlers.getPlanFromPriceId(priceId);
    const credits = PLAN_CREDITS[plan] || 10;

    await storage.updateSubscription(user.id, {
      plan,
      status: subscription.status === 'active' ? 'active' : 'inactive',
      monthlyCredits: credits,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    });
  }

  static async handleSubscriptionDeleted(subscription: any): Promise<void> {
    const customerId = subscription.customer;
    
    const user = await storage.getUserByStripeCustomerId(customerId);
    if (!user) return;

    await storage.updateSubscription(user.id, {
      plan: 'free',
      status: 'active',
      stripeSubscriptionId: null,
      credits: 10,
      monthlyCredits: 10,
    });
  }

  static async handleInvoicePaid(invoice: any): Promise<void> {
    const customerId = invoice.customer;
    const subscriptionId = invoice.subscription;
    
    if (!subscriptionId) return;

    const user = await storage.getUserByStripeCustomerId(customerId);
    if (!user) return;

    const sub = await storage.getSubscription(user.id);
    if (!sub) return;

    await storage.updateSubscription(user.id, {
      credits: sub.monthlyCredits,
    });

    await storage.addCredits(user.id, 0, `Monthly credit renewal: ${sub.monthlyCredits} credits`);
  }

  static async getPlanFromPriceId(priceId: string): Promise<string> {
    return 'starter';
  }
}
