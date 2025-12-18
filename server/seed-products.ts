import { getUncachableStripeClient } from './stripeClient';

const PLANS = [
  {
    name: 'Starter',
    description: 'Perfect for getting started with AI-powered task management',
    metadata: { planId: 'starter', credits: '50' },
    price: 999,
  },
  {
    name: 'Pro',
    description: 'For power users who need more AI capabilities',
    metadata: { planId: 'pro', credits: '200' },
    price: 1999,
  },
  {
    name: 'Unlimited',
    description: 'Unlimited AI credits for enterprise users',
    metadata: { planId: 'unlimited', credits: '9999' },
    price: 4999,
  },
];

async function seedProducts() {
  console.log('Starting Stripe product seed...');
  
  const stripe = await getUncachableStripeClient();

  for (const plan of PLANS) {
    console.log(`\nProcessing ${plan.name} plan...`);

    const existingProducts = await stripe.products.search({
      query: `name:'${plan.name}'`,
    });

    let product;
    if (existingProducts.data.length > 0) {
      product = existingProducts.data[0];
      console.log(`  Found existing product: ${product.id}`);
    } else {
      product = await stripe.products.create({
        name: plan.name,
        description: plan.description,
        metadata: plan.metadata,
      });
      console.log(`  Created product: ${product.id}`);
    }

    const existingPrices = await stripe.prices.list({
      product: product.id,
      active: true,
    });

    const hasMatchingPrice = existingPrices.data.some(
      p => p.unit_amount === plan.price && p.recurring?.interval === 'month'
    );

    if (hasMatchingPrice) {
      console.log(`  Price already exists for ${plan.name}`);
    } else {
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.price,
        currency: 'usd',
        recurring: { interval: 'month' },
        metadata: plan.metadata,
      });
      console.log(`  Created price: ${price.id} ($${plan.price / 100}/month)`);
    }
  }

  console.log('\nStripe product seed completed!');
  console.log('\nTo view products, check: https://dashboard.stripe.com/test/products');
}

seedProducts().catch(console.error);
