/**
 * FACADE: Stripe Service
 *
 * This is the facade entry point. The real implementation is in stripeRealService.ts.
 */
export { stripeService } from './stripeRealService';
export type { PaymentIntentResponse, PaymentMethod } from './stripeRealService';
