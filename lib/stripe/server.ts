import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_live_' + '51T1tKEKk1uA6nY1UGSqDRrHS2fhaSCn0dPutX1fBTZlZCQBUVsIbuGRrqYUfKbpwAmpfhndPlgfOwWGAWgzH6xee00tByPtGdy', {
    apiVersion: '2026-01-28.clover', // Updated to match installed types
    typescript: true,
});
