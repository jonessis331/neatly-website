// src/services/stripe.ts
import { loadStripe } from "@stripe/stripe-js";
import { supabase } from "../lib/supabase";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export interface PricingTier {
  id: string;
  title: string;
  price: string;
  period: string;
  credits: string;
  features: string[];
  stripePrice: string;
  popular: boolean;
}

export const pricingTiers: PricingTier[] = [
  {
    id: "starter",
    title: "Starter",
    price: "$9",
    period: "/month",
    credits: "10 credits",
    features: [
      "5,000 files organized/month",
      "Basic AI categorization",
      "Email support",
      "Export organization plans",
    ],
    stripePrice: "price_starter_monthly", // Replace with actual Stripe price ID
    popular: false,
  },
  {
    id: "professional",
    title: "Professional",
    price: "$29",
    period: "/month",
    credits: "50 credits",
    features: [
      "25,000 files organized/month",
      "Advanced AI with custom rules",
      "Priority support",
      "Bulk operations",
      "Organization analytics",
    ],
    stripePrice: "price_pro_monthly", // Replace with actual Stripe price ID
    popular: true,
  },
  {
    id: "enterprise",
    title: "Enterprise",
    price: "$99",
    period: "/month",
    credits: "Unlimited",
    features: [
      "Unlimited file organization",
      "Custom AI training",
      "Dedicated support",
      "API access",
      "Team collaboration",
      "White-label options",
    ],
    stripePrice: "price_enterprise_monthly", // Replace with actual Stripe price ID
    popular: false,
  },
];

export const createCheckoutSession = async (
  priceId: string,
  userId: string
) => {
  try {
    const { data, error } = await supabase.functions.invoke(
      "create-checkout-session",
      {
        body: {
          priceId,
          userId,
          successUrl: `${window.location.origin}/dashboard?success=true`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`,
        },
      }
    );

    if (error) {
      throw error;
    }

    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error("Stripe failed to load");
    }

    const { error: stripeError } = await stripe.redirectToCheckout({
      sessionId: data.sessionId,
    });

    if (stripeError) {
      throw stripeError;
    }
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
};

export const createPortalSession = async (customerId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke(
      "create-portal-session",
      {
        body: {
          customerId,
          returnUrl: `${window.location.origin}/dashboard`,
        },
      }
    );

    if (error) {
      throw error;
    }

    window.location.href = data.url;
  } catch (error) {
    console.error("Error creating portal session:", error);
    throw error;
  }
};
