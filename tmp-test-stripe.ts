import { Stripe } from 'stripe';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2023-10-16' as any });

async function test() {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO, quantity: 1 }],
      mode: 'subscription',
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
      subscription_data: {
        metadata: { userId: 'test' },
        trial_period_days: 3
      }
    });
    console.log("Success:", session.url);
  } catch (err: any) {
    console.error("Stripe Error:", err.message);
  }
}
test();
